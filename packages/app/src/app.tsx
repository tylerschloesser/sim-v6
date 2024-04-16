import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { clsx } from 'clsx'
import { useEffect, useMemo } from 'react'
import { useImmer } from 'use-immer'

enum ItemType {
  Stone = 'stone',
  Coal = 'coal',
  Brick = 'brick',
}

interface Item {
  count: number
  machines: number
}

interface State {
  level: number
  selected: ItemType
  items: Record<ItemType, Item>
}

interface RowModel {
  type: ItemType
  count: number
  rate: number
  tbd: string
  machines: number
}

export function App() {
  const [state, setState] = useImmer<State>({
    level: 0,
    selected: ItemType.Stone,
    items: {
      [ItemType.Stone]: { count: 0, machines: 0 },
      [ItemType.Coal]: { count: 0, machines: 0 },
      [ItemType.Brick]: { count: 0, machines: 0 },
    },
  })

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

  return (
    <div className="min-h-dvh p-2 flex flex-col justify-end">
      <div className="flex-1">
        <h2 className="capitalize text-4xl text-center">
          {state.selected}
        </h2>
        <div>Production: ?</div>
        <div>Input: ?</div>
        <div>Output: ?</div>
      </div>
      <div className="h-[33dvh]">
        <table>
          <colgroup>
            <col className="w-min" />
            <col className="w-dvw" />
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
                  <td key={cell.id} className="p-0 py-2">
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
      <button
        className="bg-green-800 w-full p-2 capitalize"
        onClick={() => {
          setState((draft) => {
            draft.items[state.selected].count += 1
          })
        }}
      >
        Mine {state.selected}
      </button>
    </div>
  )
}
