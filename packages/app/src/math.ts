export function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

export function dist(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}
