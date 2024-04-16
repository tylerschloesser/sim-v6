import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
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
  items: Record<ItemType, Item>
}

export function App() {
  const [state, setState] = useImmer<State>({
    level: 0,
    items: {
      [ItemType.Stone]: { count: 0, machines: 0 },
      [ItemType.Coal]: { count: 0, machines: 0 },
      [ItemType.Brick]: { count: 0, machines: 0 },
    },
  })

  const columnHelper = createColumnHelper<Item>()

  const columns = [
    columnHelper.accessor('count', {
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('machines', {
      cell: (info) => info.getValue(),
    }),
  ]

  const data = useMemo(
    () => Object.values(state.items),
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
    <div className="h-dvh">
      <table>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
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
  )
}
