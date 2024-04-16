import { useEffect } from 'react'
import { useImmer } from 'use-immer'

type Inventory = {
  stone: 0
  brick: 0
}

type InventoryKey = keyof Inventory

export function App() {
  const [state, setState] = useImmer({
    level: 0,
    stone: 0,
    brick: 0,
  })

  useEffect(() => {
    if (state.level === 0 && state.stone >= 20) {
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
                transform: `scaleX(${Math.min(state.stone / 20, 1)})`,
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
      <Row
        label="stone"
        value={state.stone}
        mine={() =>
          setState((draft) => {
            draft.stone += 1
          })
        }
      />
    </div>
  )
}

function Row({
  label,
  value,
  mine,
}: {
  label: InventoryKey
  value: number
  mine?: () => void
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
    </div>
  )
}
