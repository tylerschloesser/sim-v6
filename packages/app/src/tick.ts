import { State } from './state.js'

export function tick(state: State): void {
  state.tick += 1

  for (const item of Object.values(state.items)) {
    if (item.machines === 0) {
      continue
    }

    item.count += item.machines * 0.1
  }
}
