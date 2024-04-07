import React from 'react'
import { World } from './types.js'

export interface IAppContext {
  world: World
}

export const AppContext = React.createContext<IAppContext>(
  null!,
)
