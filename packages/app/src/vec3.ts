import invariant from 'tiny-invariant'

export class Vec3 {
  x: number
  y: number
  z: number

  constructor(x: number, y: number, z: number) {
    invariant(!Number.isNaN(x))
    invariant(!Number.isNaN(y))
    invariant(!Number.isNaN(z))
    this.x = x
    this.y = y
    this.z = z
  }

  add(v: Vec3): Vec3 {
    return new Vec3(
      this.x + v.x,
      this.y + v.y,
      this.z + v.z,
    )
  }

  sub(v: Vec3): Vec3 {
    return new Vec3(
      this.x - v.x,
      this.y - v.y,
      this.z - v.z,
    )
  }

  len(): number {
    return Math.sqrt(
      this.x ** 2 + this.y ** 2 + this.z ** 2,
    )
  }

  mul(s: number): Vec3 {
    return new Vec3(this.x * s, this.y * s, this.z * s)
  }

  div(s: number): Vec3 {
    invariant(s !== 0)
    return new Vec3(this.x / s, this.y / s, this.z / s)
  }

  norm(): Vec3 {
    return this.div(this.len())
  }
}
