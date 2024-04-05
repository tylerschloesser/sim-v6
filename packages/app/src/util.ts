import { Vec2 } from './vec2.js'

export function svgTranslate({ x, y }: Vec2): string {
  return `translate(${x.toFixed(2)} ${y.toFixed(2)})`
}

export function svgScale({ x, y }: Vec2): string {
  return `scale(${x.toFixed(2)} ${y.toFixed(2)})`
}

export function svgTransform({
  translate,
  scale,
}: {
  translate: Vec2
  scale: Vec2
}): string {
  return `${svgTranslate(translate)} ${svgScale(scale)}`
}
