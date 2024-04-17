import { clsx } from 'clsx'
import { useEffect } from 'react'
import invariant from 'tiny-invariant'
import { useImmer } from 'use-immer'
import { ITEM_RECIPE, MACHINE_RECIPES } from './recipe.js'
import { ItemType, State } from './state.js'
import { tick } from './tick.js'

function initItem(type: ItemType) {
  const recipe = ITEM_RECIPE[type]
  const buffer: Partial<Record<ItemType, number>> = {}
  for (const key of Object.keys(recipe.input)) {
    buffer[key as ItemType] = 0
  }

  return {
    count: 0,
    machines: 0,
    production: 0,
    consumption: 0,
    satisfaction: 0,
    buffer,
  }
}

export function App() {
  const [state, setState] = useImmer<State>({
    tick: 0,
    level: 0,
    selected: ItemType.Stone,
    items: {
      [ItemType.Stone]: initItem(ItemType.Stone),
      [ItemType.Coal]: initItem(ItemType.Coal),
      [ItemType.Brick]: initItem(ItemType.Brick),
      [ItemType.Power]: initItem(ItemType.Power),
      [ItemType.IronOre]: initItem(ItemType.IronOre),
      [ItemType.IronPlate]: initItem(ItemType.IronPlate),
    },
  })

  useEffect(() => {
    const handle = self.setInterval(
      () => setState(tick),
      100,
    )
    return () => {
      self.clearInterval(handle)
    }
  }, [])

  const machines = state.items[state.selected].machines

  const machineRecipe = MACHINE_RECIPES[state.selected]
  const itemRecipe = ITEM_RECIPE[state.selected]

  let available = Number.POSITIVE_INFINITY
  for (const [key, value] of Object.entries(
    machineRecipe,
  )) {
    invariant(value !== 0)
    available = Math.min(
      available,
      Math.floor(
        state.items[key as ItemType].count / value,
      ),
    )
  }

  invariant(available !== Number.POSITIVE_INFINITY)
  invariant(available >= 0)

  const rows = Object.entries(state.items).map(
    ([key, item]) => {
      const type = key as ItemType
      return {
        type,
        ...item,
      }
    },
  )

  useEffect(() => {
    if (
      state.level === 0 &&
      state.items.stone.count >= 20
    ) {
      setState((draft) => {
        draft.level = 1
      })
    }
  }, [state])

  const mineable = [
    ItemType.Stone,
    ItemType.IronOre,
    ItemType.Coal,
  ].includes(state.selected)

  return (
    <div className="min-h-dvh p-2 flex flex-col justify-end">
      <div className="flex-1">
        <h2 className="capitalize text-4xl text-center">
          {state.selected}
        </h2>
        <div className="flex">
          <div className="flex-1">
            <div>
              <div>Input:</div>
              {Object.entries(itemRecipe.input).map(
                ([key, value]) => (
                  <div key={key} className="px-2">
                    {`${key}: ${formatRate(value * 10)}/s`}
                  </div>
                ),
              )}
            </div>
            <div>
              <div>Output:</div>
              {Object.entries(itemRecipe.output).map(
                ([key, value]) => (
                  <div key={key} className="px-2">
                    {`${key}: ${formatRate(value * 10)}/s`}
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="flex-1">
            <div>Machine</div>
            <div className="px-2">
              Recipe:
              <div className="px-2">
                {Object.entries(machineRecipe).map(
                  ([key, value]) => (
                    <div key={key}>
                      {key}: {value}
                    </div>
                  ),
                )}
              </div>
              Available: {available}
            </div>
          </div>
        </div>
      </div>
      <div className="h-[33dvh] max-w-full overflow-auto">
        <table>
          <colgroup>
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
          </colgroup>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.type}
                className={clsx(
                  'hover:bg-slate-500',
                  state.selected === row.type &&
                    'bg-slate-600',
                )}
                onClick={() => {
                  setState((draft) => {
                    draft.selected = row.type
                  })
                }}
              >
                <td className="p-2">{row.type}</td>
                <td className="p-2">
                  {row.count > 0 && row.count < 1
                    ? '<1'
                    : Math.floor(row.count)}
                </td>
                <td className="p-2">{row.machines}</td>
                <td className="p-2">
                  {row.production.toFixed(2)}/t
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <div className="flex">
          <button
            disabled={machines === 0}
            className="flex-1 p-2 bg-slate-700 disabled:bg-slate-800"
            onClick={
              machines > 0
                ? () => {
                    setState((draft) => {
                      for (const [
                        key,
                        value,
                      ] of Object.entries(machineRecipe)) {
                        draft.items[
                          key as ItemType
                        ].count += value
                      }
                      draft.items[
                        state.selected
                      ].machines -= 1
                    })
                  }
                : undefined
            }
          >
            &#xFF0D;
          </button>
          <div className="flex-1 text-center">
            <div className="text-xs">Machines</div>
            <div>{machines}</div>
          </div>
          <button
            className="flex-1 p-2 bg-slate-700 disabled:bg-slate-800"
            disabled={available === 0}
            onClick={
              available > 0
                ? () => {
                    setState((draft) => {
                      for (const [
                        key,
                        value,
                      ] of Object.entries(machineRecipe)) {
                        invariant(
                          draft.items[key as ItemType]
                            .count >= value,
                        )
                        draft.items[
                          key as ItemType
                        ].count -= value
                      }
                      draft.items[
                        state.selected
                      ].machines += 1
                    })
                  }
                : undefined
            }
          >
            &#xFF0B;
          </button>
        </div>
        <button
          disabled={!mineable}
          className="bg-green-800 w-full p-2 capitalize disabled:opacity-50"
          onClick={
            mineable
              ? () => {
                  setState((draft) => {
                    draft.items[state.selected].count += 1
                  })
                }
              : undefined
          }
        >
          Mine {state.selected}
        </button>
      </div>
    </div>
  )
}

function formatRate(rate: number): string {
  if (rate === Math.floor(rate)) {
    return `${rate}`
  }
  return rate.toFixed(1)
}
