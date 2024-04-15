import { useState } from 'react'

export function App() {
  const [count, setCount] = useState(0)
  return (
    <div className="h-dvh flex flex-col-reverse p-4">
      <button
        onClick={() => setCount(count + 1)}
        className="rounded bg-neutral-500 p-2 font-bold text-center"
      >
        Mine Stone
      </button>
      <span className="flex-1 flex flex-col justify-center text-center">
        <span className="uppercase text-lg">Stone</span>
        <span className="text-4xl">{count}</span>
      </span>
      <div className="text-center border-2 rounded border-neutral-500 p-2 relative">
        <span
          className="absolute w-full h-full top-0 left-0 bg-green-900 origin-top-left transition-transform"
          style={{
            transform: `scaleX(${Math.min(count / 20, 1)})`,
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
    </div>
  )
}
