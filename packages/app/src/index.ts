import { html } from 'htm/preact'
import { render } from 'preact'
import { useState } from 'preact/hooks'

function App() {
  const [count, setCount] = useState(0)

  return html`<div class="h-dvh flex flex-col-reverse p-4">
    <button
      onclick=${() => setCount((prev) => prev + 1)}
      class="rounded bg-neutral-500 p-4 font-bold"
    >
      Mine Stone
    <//>
    <span
      class="flex-1 flex flex-col justify-center text-center"
    >
      <span class="uppercase">Stone<//>
      <span class="text-2xl">${count}<//>
    <//>
    <div class="text-center">Goal: Mine 20 Stone<//>
  <//>`
}

render(html`<${App} />`, document.body)

console.log('done')
