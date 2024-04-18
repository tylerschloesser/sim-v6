import { clsx } from 'clsx'
import { useEffect, useMemo } from 'react'
import invariant from 'tiny-invariant'
import { useImmer } from 'use-immer'
import { ZodError } from 'zod'
import { ITEM_RECIPE, MACHINE_RECIPES } from './recipe.js'
import { Item, ItemType, State } from './state.js'
import { tick } from './tick.js'

function initItem(type: ItemType): Item {
  const recipe = ITEM_RECIPE[type]
  const buffer: Partial<Record<ItemType, number>> = {}
  for (const key of Object.keys(recipe.input)) {
    buffer[ItemType.parse(key)] = 0
  }

  return {
    count: 0,
    machines: 0,
    production: 0,
    consumption: 0,
    satisfaction: 0,
    efficiency: 0,
    buffer,
  }
}

export function App() {
  const initialState = useMemo<State>(() => {
    const json = localStorage.getItem('state')
    if (json) {
      try {
        return State.parse(JSON.parse(json))
      } catch (e) {
        if (
          !(
            e instanceof ZodError &&
            self.confirm('Failed to parse state, reset?')
          )
        ) {
          throw e
        }
      }
    }
    return {
      tick: 0,
      level: 0,
      selected: ItemType.enum.Stone,
      items: {
        [ItemType.enum.Stone]: initItem(
          ItemType.enum.Stone,
        ),
        [ItemType.enum.Coal]: initItem(ItemType.enum.Coal),
        [ItemType.enum.Brick]: initItem(
          ItemType.enum.Brick,
        ),
        [ItemType.enum.Power]: initItem(
          ItemType.enum.Power,
        ),
        [ItemType.enum.IronOre]: initItem(
          ItemType.enum.IronOre,
        ),
        [ItemType.enum.IronPlate]: initItem(
          ItemType.enum.IronPlate,
        ),
      },
    }
  }, [])

  const [state, setState] = useImmer<State>(initialState)

  useEffect(() => {
    localStorage.setItem('state', JSON.stringify(state))
  }, [state])

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
      state.items[ItemType.enum.Stone].count >= 20
    ) {
      setState((draft) => {
        draft.level = 1
      })
    }
  }, [state])

  const mineable = isMineable(state.selected)

  return (
    <div className="min-h-dvh flex flex-col justify-end">
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
                    {key}: {formatRate(value)}
                  </div>
                ),
              )}
            </div>
            <div>
              <div>Output:</div>
              {Object.entries(itemRecipe.output).map(
                ([key, value]) => (
                  <div key={key} className="px-2">
                    {key}: {formatRate(value)}
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
      <div className="h-[40dvh] w-full overflow-auto">
        <table>
          <thead>
            <tr>
              <th className="p-2 sticky top-0 left-0 bg-gray-900 z-20">
                Item
              </th>
              <th className="p-2 sticky top-0 bg-gray-900 z-10">
                #
              </th>
              <th className="p-2 sticky top-0 bg-gray-900 z-10">
                M
              </th>
              <th className="p-2 sticky top-0 bg-gray-900 z-10">
                P
              </th>
              <th className="p-2 sticky top-0 bg-gray-900 z-10">
                C
              </th>
              <th className="p-2 sticky top-0 bg-gray-900 z-10">
                P-C
              </th>
              <th className="p-2 sticky top-0 bg-gray-900 z-10">
                S
              </th>
            </tr>
          </thead>
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
                <td className="p-2 sticky left-0 bg-gray-900">
                  {row.type}
                </td>
                <td className="p-2 text-right">
                  {formatCount(row.count)}
                </td>
                <td className="p-2 text-right font-mono">
                  {row.machines}
                </td>
                <td className="p-2 text-right">
                  {formatRate(row.production)}
                </td>
                <td className="p-2 text-right">
                  {formatRate(row.consumption)}
                </td>
                <td className="p-2 text-right">
                  {formatDiff(
                    row.production,
                    row.consumption,
                  )}
                </td>
                <td className="p-2 text-right">
                  {formatSatisfaction(row.satisfaction)}
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

function formatRate(rate: number): JSX.Element {
  return (
    <span
      className={clsx(
        'font-mono',
        rate === 0 && 'text-gray-600',
      )}
    >
      {`${(rate * 10).toFixed(2)}/s`}
    </span>
  )
}

function formatCount(count: number): JSX.Element {
  invariant(count >= 0)
  let formatted: string
  if (count < Number.EPSILON * 1e10) {
    formatted = '0'
  } else if (count > 0 && count < 1) {
    formatted = '<1'
  } else {
    formatted = `${Math.floor(count)}`
  }
  return <span className="font-mono">{formatted}</span>
}

function formatDiff(
  production: number,
  consumption: number,
): JSX.Element {
  const diff = production - consumption
  return (
    <span
      className={clsx(
        diff < 0 ? 'text-red-400' : 'text-green-400',
        'font-mono',
      )}
    >
      {formatRate(diff)}
    </span>
  )
}

function formatSatisfaction(
  satisfaction: number,
): JSX.Element {
  return (
    <span
      className={clsx(
        satisfaction === 0 && 'text-gray-600',
      )}
    >
      {Math.floor(satisfaction * 100)}%
    </span>
  )
}

function isMineable(type: ItemType): boolean {
  switch (type) {
    case ItemType.enum.Stone:
    case ItemType.enum.IronOre:
    case ItemType.enum.Coal:
      return true
  }
  return false
}
