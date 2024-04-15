import { createRoot } from 'react-dom/client'
import invariant from 'tiny-invariant'
import { App } from './app.js'

const container = document.getElementById('app')
invariant(container)
const root = createRoot(container)
root.render(<App />)
