import { useState } from 'react'

export function App() {
  const [count, setCount] = useState(0)
  return (
    <div className="h-dvh flex flex-col-reverse p-4">
      <button
        onClick={() => setCount(count + 1)}
        className="rounded bg-neutral-500 p-4 font-bold"
      >
        Mine Stone
      </button>
      <span className="flex-1 flex flex-col justify-center text-center">
        <span className="uppercase">Stone</span>
        <span className="text-2xl">{count}</span>
      </span>
      <div className="text-center border-2 rounded border-neutral-500 p-4 relative">
        <span
          className="absolute left-0 top-0 bottom-0 right-0 bg-green-900 origin-top-left transition-transform"
          style={{
            transform: `scaleX(${Math.min(count / 20, 1)})`,
          }}
        ></span>
        <span className="relative">
          Goal: Mine 20 Stone
        </span>
      </div>
    </div>
  )
}
