import Prando from 'prando'
import { CellType, World } from './types.js'

const rng = new Prando(0)

export function getCellColor(type: CellType): string {
  switch (type) {
    case CellType.enum.Stone: {
      const hue = 0
      const saturation = 0
      const lightness = 20 + rng.next() * 20
      return `hsl(${hue}, ${saturation.toFixed(2)}%, ${lightness.toFixed(2)}%)`
    }
    case CellType.enum.Grass: {
      const hue = 120
      const saturation = 40 + rng.next() * 10
      const lightness = 20 + rng.next() * 10
      return `hsl(${hue}, ${saturation.toFixed(2)}%, ${lightness.toFixed(2)}%)`
    }
    case CellType.enum.Tree: {
      const hue = 25
      const saturation = 45 + rng.next() * 10
      const lightness = 25 + rng.next() * 10
      return `hsl(${hue}, ${saturation.toFixed(2)}%, ${lightness.toFixed(2)}%)`
    }
  }
}

export function initWorld(): World {
  const cells: World['cells'] = {}
  return { cells }
}
