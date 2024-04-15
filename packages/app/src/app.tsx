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
      <div className="text-center">Goal: Mine 20 Stone</div>
    </div>
  )
}
