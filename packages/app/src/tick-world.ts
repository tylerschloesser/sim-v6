import invariant from 'tiny-invariant'
import { EntityType, TownEntity, World } from './types.js'

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

console.log({
  INDIVIDUAL_FOOD_CONSUMPTION_PER_TICK,
})

function tickTown(entity: TownEntity, world: World): void {
  const foodConsumption =
    entity.population * INDIVIDUAL_FOOD_CONSUMPTION_PER_TICK

  invariant(entity.storage.food >= foodConsumption)

  entity.storage.food -= foodConsumption
}
