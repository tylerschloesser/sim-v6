import invariant from 'tiny-invariant'
import {
  BuildType,
  EntityType,
  FoodSourceEntity,
  TownEntity,
  World,
} from './types.js'
import {
  getCurrentYield,
  getFinalPriority,
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

const INDIVIDUAL_BUILD_PRODUCTION_PER_TICK = convert(
  0.1,
  Unit.Minute,
  Unit.Tick,
)

function tickTown(entity: TownEntity, world: World): void {
  entity.storage.food.delta = 0
  entity.storage.wood.delta = 0

  //
  // Food Consumption
  //

  const foodConsumption =
    entity.population * INDIVIDUAL_FOOD_CONSUMPTION_PER_TICK

  entity.storage.food.count -= foodConsumption
  invariant(entity.storage.food.count >= 0)

  entity.storage.food.delta += -foodConsumption

  //
  // Food Production
  //

  const foodPriority = getFinalPriority('food', entity)
  // const woodPriority = getWoodPriority(entity)

  const foodSource = getFoodSource(entity, world)

  if (foodPriority > 0 && foodSource) {
    const currentYield = getCurrentYield(foodSource)

    const foodProduction =
      entity.population *
      INDIVIDUAL_FOOD_PRODUCTION_PER_TICK *
      foodPriority *
      currentYield

    foodSource.tick = Math.min(
      foodSource.tick + 1,
      foodSource.maxYieldTicks,
    )

    entity.storage.food.count += foodProduction
    entity.storage.food.delta += foodProduction
  } else if (foodSource) {
    foodSource.tick = Math.max(foodSource.tick - 1, 0)
  }

  //
  // Build
  //

  const buildPriority = getFinalPriority('build', entity)
  if (buildPriority > 0 && entity.builds.length > 0) {
    const build = entity.builds.at(0)
    invariant(build)

    invariant(build.progress < 1)

    switch (build.type) {
      case BuildType.enum.Connection: {
        build.progress +=
          entity.population *
          buildPriority *
          INDIVIDUAL_BUILD_PRODUCTION_PER_TICK

        if (build.progress >= 1) {
          entity.builds.shift()

          invariant(build.sourceId === entity.id)
          const target = world.entities[build.targetId]
          invariant(target)

          invariant(!entity.connections[target.id])
          invariant(!target.connections[entity.id])

          entity.connections[target.id] = true
          target.connections[entity.id] = true
        }
        break
      }
    }
  }
}

function getFoodSource(
  entity: TownEntity,
  world: World,
): FoodSourceEntity | null {
  const matches: FoodSourceEntity[] = []

  for (const peerId of Object.keys(entity.connections)) {
    const peer = world.entities[peerId]
    invariant(peer)
    if (peer.type === EntityType.enum.FoodSource) {
      matches.push(peer)
    }
  }

  invariant(matches.length <= 1)

  return matches.at(0) ?? null
}
