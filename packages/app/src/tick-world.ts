import invariant from 'tiny-invariant'
import { EntityType, TownEntity, World } from './types.js'
import { getFoodPriority } from './world.js'

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

function tickTown(entity: TownEntity, world: World): void {
  //
  // Food Consumption
  //

  const foodConsumption =
    entity.population * INDIVIDUAL_FOOD_CONSUMPTION_PER_TICK

  invariant(entity.storage.food >= foodConsumption)

  entity.storage.food -= foodConsumption

  //
  // Food Production
  //

  const foodPriority = getFoodPriority(entity)
  // const woodPriority = getWoodPriority(entity)

  if (foodPriority > 0 && hasFoodSource(entity, world)) {
    const foodProduction =
      entity.population *
      INDIVIDUAL_FOOD_PRODUCTION_PER_TICK *
      foodPriority

    entity.storage.food += foodProduction
  }
}

function hasFoodSource(
  entity: TownEntity,
  world: World,
): boolean {
  return !!Object.keys(entity.connections).find(
    (peerId) => {
      const peer = world.entities[peerId]
      invariant(peer)
      return peer.type === EntityType.enum.FoodSource
    },
  )
}
