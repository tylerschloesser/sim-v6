import { State } from './state.js'

export function tick(state: State): void {
  state.tick += 1
}
