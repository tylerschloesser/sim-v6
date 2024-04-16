import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { clsx } from 'clsx'
import { useEffect, useMemo } from 'react'
import invariant from 'tiny-invariant'
import { useImmer } from 'use-immer'
import { ItemType, State } from './state.js'

interface RowModel {
  type: ItemType
  count: number
  rate: number
  tbd: string
  machines: number
}

type MachineRecipe = Partial<Record<ItemType, number>>

const MINER_RECIPE: MachineRecipe = {
  [ItemType.IronPlate]: 10,
  [ItemType.Brick]: 10,
}

const FURNACE_RECIPE: MachineRecipe = {
  [ItemType.Stone]: 20,
}

const MACHINE_RECIPES: Record<
  ItemType,
  Partial<Record<ItemType, number>>
> = {
  [ItemType.Stone]: MINER_RECIPE,
  [ItemType.Coal]: MINER_RECIPE,
  [ItemType.IronOre]: MINER_RECIPE,

  [ItemType.Brick]: FURNACE_RECIPE,
  [ItemType.IronPlate]: FURNACE_RECIPE,
}

export function App() {
  const [state, setState] = useImmer<State>({
    level: 0,
    selected: ItemType.Stone,
    items: {
      [ItemType.Stone]: { count: 0, machines: 0 },
      [ItemType.Coal]: { count: 0, machines: 0 },
      [ItemType.Brick]: { count: 0, machines: 0 },
      [ItemType.IronOre]: { count: 0, machines: 0 },
      [ItemType.IronPlate]: { count: 0, machines: 0 },
    },
  })

  const machines = state.items[state.selected].machines
  const recipe = MACHINE_RECIPES[state.selected]
  let available = Number.POSITIVE_INFINITY
  for (const [key, value] of Object.entries(recipe)) {
    available = Math.min(
      available,
      Math.floor(
        state.items[key as ItemType].count / value,
      ),
    )
  }

  invariant(available !== Number.POSITIVE_INFINITY)
  invariant(available >= 0)

  const columnHelper = createColumnHelper<RowModel>()

  const columns = [
    columnHelper.accessor('type', {
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('count', {
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('rate', {
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('tbd', {
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('machines', {
      cell: (info) => info.getValue(),
    }),
  ]

  const data = useMemo(
    () =>
      Object.entries(state.items).map(([type, item]) => ({
        type: type as ItemType,
        rate: 0,
        tbd: 'tbd',
        ...item,
      })),
    [state.items],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

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
        <div>Machine</div>
        <div className="px-2">
          Recipe:
          <div className="px-2">
            {Object.entries(recipe).map(([key, value]) => (
              <div key={key}>
                {key}: {value}
              </div>
            ))}
          </div>
          Available: {available}
        </div>
        <div>Input: ?</div>
        <div>Output: ?</div>
      </div>
      <div className="h-[33dvh] max-w-full overflow-auto">
        <table>
          <colgroup>
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
          </colgroup>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={clsx(
                  'hover:bg-slate-500',
                  state.selected === row.original.type &&
                    'bg-slate-600',
                )}
                onClick={() => {
                  setState((draft) => {
                    draft.selected = row.original.type
                  })
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </td>
                ))}
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
                      ] of Object.entries(recipe)) {
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
                      ] of Object.entries(recipe)) {
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
