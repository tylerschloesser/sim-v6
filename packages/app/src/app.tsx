import { useEffect } from 'react'
import { useImmer } from 'use-immer'

type Inventory = {
  stone: number
  brick: number
}

type InventoryKey = keyof Inventory

interface State {
  level: number
  inventory: Inventory
}

export function App() {
  const [state, setState] = useImmer<State>({
    level: 0,
    inventory: {
      stone: 0,
      brick: 0,
    },
  })

  useEffect(() => {
    if (state.level === 0 && state.inventory.stone >= 20) {
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
                transform: `scaleX(${Math.min(state.inventory.stone / 20, 1)})`,
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
          label="stone"
          value={state.inventory['stone']}
          mine={() =>
            setState((draft) => {
              draft.inventory['stone'] += 1
            })
          }
        />
        {state.level > 0 && (
          <Row
            label="brick"
            value={state.inventory['brick']}
            modify={{
              increment: {
                disabled: true,
                handle: () => {},
              },

              decrement: {
                disabled: false,
                handle: () => {},
              },
            }}
          />
        )}
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  mine,
  modify,
}: {
  label: InventoryKey
  value: number
  mine?: () => void
  modify?: {
    increment: {
      disabled: boolean
      handle: () => void
    }
    decrement: {
      disabled: boolean
      handle: () => void
    }
  }
}) {
  return (
    <div className="rounded border-neutral-500 border-2 p-2 flex flex-row justify-between items-center">
      <span className="uppercase">{label}</span>
      <span className="">{value}</span>
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
            disabled={true}
            onClick={
              modify.decrement.disabled
                ? undefined
                : modify.decrement.handle
            }
            className="rounded bg-neutral-500 p-2 font-bold text-center disabled:opacity-50"
          >
            &#xFF0D;
          </button>
          <button
            onClick={
              modify.increment.disabled
                ? undefined
                : modify.increment.handle
            }
            className="rounded bg-neutral-500 p-2 font-bold text-center disabled:opacity-50"
          >
            &#xFF0B;
          </button>
        </div>
      )}
    </div>
  )
}
