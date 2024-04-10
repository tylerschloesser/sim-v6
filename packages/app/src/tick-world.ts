import { flow } from 'lodash-es'
import invariant from 'tiny-invariant'
import {
  BuildType,
  EntityType,
  ResourceEntity,
  ResourceType,
  TownEntity,
  World,
} from './types.js'
import {
  getCurrentYield,
  getNormalizedPriority,
} from './world.js'

export function tickWorld(world: World): void {
  world.tick += 1

  for (const entity of Object.values(world.entities)) {
    switch (entity.type) {
      case EntityType.enum.Town:
        tickTown(entity, world)
        break
    }
  }
}

enum Unit {
  Tick = 'tick',
  Millisecond = 'millisecond',
  Second = 'second',
  Minute = 'minute',
}

const TO_TICKS: Record<Unit, number> = {
  [Unit.Tick]: 1,
  [Unit.Millisecond]: 1 / 100,
  [Unit.Second]: 10,
  [Unit.Minute]: 60 * 10,
}

function convert(
  value: number,
  from: Unit,
  to: Unit,
): number {
  const ticks = value / TO_TICKS[from]
  return ticks * TO_TICKS[to]
}

const INDIVIDUAL_FOOD_CONSUMPTION_PER_TICK = convert(
  1,
  Unit.Minute,
  Unit.Tick,
)

const INDIVIDUAL_FOOD_PRODUCTION_PER_TICK = convert(
  2,
  Unit.Minute,
  Unit.Tick,
)

const INDIVIDUAL_WOOD_PRODUCTION_PER_TICK = convert(
  2,
  Unit.Minute,
  Unit.Tick,
)

const INDIVIDUAL_BUILD_PRODUCTION_PER_TICK = convert(
  0.1,
  Unit.Minute,
  Unit.Tick,
)

const INDIVIDUAL_RESEARCH_PRODUCTION_PER_TICK = convert(
  0.1,
  Unit.Minute,
  Unit.Tick,
)

function tickTown(entity: TownEntity, world: World): void {
  entity.averageAge += 1 / 3000

  //
  // Food Consumption
  //

  const foodConsumption =
    entity.population * INDIVIDUAL_FOOD_CONSUMPTION_PER_TICK

  if (foodConsumption > entity.storage.food) {
    entity.storage.food = 0
    entity.population = 0
    entity.averageAge = 0
  } else {
    entity.storage.food -= foodConsumption
  }

  if (entity.population === 0) {
    return
  }

  invariant(entity.nextChildTicks > 0)
  entity.nextChildTicks -= 1
  if (entity.nextChildTicks === 0) {
    entity.averageAge *=
      entity.population / (entity.population + 1)
    entity.population += 1
    entity.nextChildTicks = Math.floor(
      10 * 60 * (1 + Math.random()),
    )
  }

  const priority = getNormalizedPriority(entity.priority)

  //
  // Food Production
  //

  const foodSource = getConnectedResource(
    entity,
    world,
    ResourceType.enum.Food,
  )
  if (priority.food > 0 && foodSource) {
    const currentYield = getCurrentYield(foodSource)

    const foodProduction =
      entity.population *
      INDIVIDUAL_FOOD_PRODUCTION_PER_TICK *
      priority.food *
      currentYield

    foodSource.tick = Math.min(
      foodSource.tick + 1,
      foodSource.maxYieldTicks,
    )

    entity.storage.food += foodProduction
  } else if (foodSource) {
    foodSource.tick = Math.max(foodSource.tick - 1, 0)
  }

  //
  // Wood Production
  //

  const woodSource = getConnectedResource(
    entity,
    world,
    ResourceType.enum.Wood,
  )
  if (priority.wood > 0 && woodSource) {
    const currentYield = getCurrentYield(woodSource)

    const woodProduction =
      entity.population *
      INDIVIDUAL_WOOD_PRODUCTION_PER_TICK *
      priority.wood *
      currentYield

    woodSource.tick = Math.min(
      woodSource.tick + 1,
      woodSource.maxYieldTicks,
    )

    entity.storage.wood += woodProduction
  } else if (woodSource) {
    woodSource.tick = Math.max(woodSource.tick - 1, 0)
  }

  //
  // Build
  //

  if (priority.build > 0 && entity.builds.length > 0) {
    const build = entity.builds.at(0)
    invariant(build)

    invariant(build.progress < 1)

    switch (build.type) {
      case BuildType.enum.House: {
        build.progress +=
          entity.population *
          priority.build *
          INDIVIDUAL_BUILD_PRODUCTION_PER_TICK

        if (build.progress >= 1) {
          entity.builds.shift()
          entity.houses += 1
        }
        break
      }
    }
  }

  //
  // Research
  //
  if (
    priority.research > 0 &&
    entity.researchQueue.length > 0
  ) {
    const head = entity.researchQueue.at(0)
    invariant(head)

    head.progress +=
      entity.population *
      priority.research *
      INDIVIDUAL_RESEARCH_PRODUCTION_PER_TICK

    if (head.progress >= 1) {
      entity.researchQueue.shift()

      invariant(!entity.technologies[head.technology])
      entity.technologies[head.technology] = true
    }
  }
}

function getConnectedResource(
  entity: TownEntity,
  world: World,
  resourceType: ResourceType,
): ResourceEntity | null {
  const matches = Object.keys(entity.connections)
    .map((peerId) => {
      const peer = world.entities[peerId]
      invariant(peer)
      return peer
    })
    .filter(
      (peer): peer is ResourceEntity =>
        peer.type === EntityType.enum.Resource,
    )
    .filter((peer) => peer.resourceType === resourceType)

  invariant(matches.length <= 1)

  return matches.at(0) ?? null
}
