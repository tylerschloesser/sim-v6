import React from 'react'
import { Updater } from 'use-immer'
import { World } from './types.js'

export interface IAppContext {
  world: World
  setWorld: Updater<World>
  tickRate: number
  setTickRate: React.Dispatch<React.SetStateAction<number>>
}

export const AppContext = React.createContext<IAppContext>(
  null!,
)
