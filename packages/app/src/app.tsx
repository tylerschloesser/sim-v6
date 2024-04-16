import { useEffect } from 'react'
import { useImmer } from 'use-immer'

export function App() {
  const [state, setState] = useImmer({
    level: 0,
    stone: 0,
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
      <div className="rounded border-neutral-500 border-2 p-2 flex flex-row justify-between items-center">
        <span className="uppercase">Stone</span>
        <span className="">{state.stone}</span>
        <button
          onClick={() =>
            setState((draft) => {
              draft.stone += 1
            })
          }
          className="rounded bg-neutral-500 p-2 font-bold text-center"
        >
          Mine
        </button>
      </div>
    </div>
  )
}
