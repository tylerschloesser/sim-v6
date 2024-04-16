import { useEffect } from 'react'
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
    <div className="h-dvh flex flex-col p-4 justify-between">
      <div>
        {state.level === 0 && (
          <div className="text-center border-2 rounded border-neutral-500 p-2 relative">
            <span
              className="absolute w-full h-full top-0 left-0 bg-green-900 origin-top-left transition-transform"
              style={{
                transform: `scaleX(${Math.min(state.items.stone.count / 20, 1)})`,
              }}
            ></span>
            <span className="relative flex flex-col">
              <span className="font-bold">
                Goal: Mine 20 Stone
              </span>
              <span className="text-xs">
                Tap to see unlocks
              </span>
            </span>
          </div>
        )}
      </div>
      <div>
        <Row
          label={ItemType.Stone}
          item={state.items.stone}
          mine={() =>
            setState((draft) => {
              draft.items.stone.count += 1
            })
          }
        />
        {state.level > 0 && (
          <Row
            label={ItemType.Coal}
            item={state.items.coal}
            mine={() =>
              setState((draft) => {
                draft.items.coal.count += 1
              })
            }
          />
        )}
        {state.level > 0 && (
          <Row
            label={ItemType.Brick}
            item={state.items.brick}
            modify={{
              decrement:
                state.items.brick.machines > 0
                  ? () => {
                      setState((draft) => {
                        draft.items.stone.count += 20
                        draft.items.brick.machines -= 1
                      })
                    }
                  : undefined,
              increment:
                state.items.stone.count >= 20
                  ? () => {
                      setState((draft) => {
                        draft.items.stone.count -= 20
                        draft.items.brick.machines += 1
                      })
                    }
                  : undefined,
            }}
          />
        )}
      </div>
    </div>
  )
}

function Row({
  label,
  item,
  mine,
  modify,
}: {
  label: ItemType
  item: Item
  mine?: () => void
  modify?: {
    increment?: () => void
    decrement?: () => void
  }
}) {
  return (
    <div className="p-2 border-b-2 border-neutral-500 last:border-b-0">
      <div className="flex flex-row justify-between items-center">
        <span className="uppercase">{label}</span>
        <span className="">{item.count}</span>
        <div>
          {mine && (
            <button
              onClick={mine}
              className="rounded bg-neutral-500 p-2 font-bold text-center"
            >
              Mine
            </button>
          )}
          {modify && (
            <div className="flex gap-2">
              <button
                disabled={modify.decrement === undefined}
                onClick={modify.decrement}
                className="rounded bg-neutral-500 p-2 font-bold text-center disabled:opacity-50"
              >
                &#xFF0D;
              </button>
              <div>{item.machines}</div>
              <button
                disabled={modify.increment === undefined}
                onClick={modify.increment}
                className="rounded bg-neutral-500 p-2 font-bold text-center disabled:opacity-50"
              >
                &#xFF0B;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
