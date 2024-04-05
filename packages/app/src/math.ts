export function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}
