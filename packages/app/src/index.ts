import { html } from 'htm/preact'
import { render } from 'preact'

function App() {
  return html`<div class="h-dvh">TODO<//>`
}

render(html`<${App} />`, document.body)

console.log('done')
