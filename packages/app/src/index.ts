import { html } from 'htm/preact'
import { render } from 'preact'

function App() {
  return html`<h1 class="text-3xl font-bold underline">
    TODO
  </h1>`
}

render(html`<${App} />`, document.body)

console.log('done')
