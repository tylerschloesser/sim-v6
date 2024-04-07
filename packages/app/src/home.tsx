import { Fragment, useContext } from 'react'
import { AppContext } from './app-context.js'
import { EntityType } from './types.js'

export function Home() {
  const { world } = useContext(AppContext)
  return (
    <div>
      {Object.values(world.entities).map((entity) => (
        <Fragment key={entity.id}>
          {(() => {
            switch (entity.type) {
              case EntityType.enum.Town: {
                return (
                  <>
                    <div>Town</div>
                    <div>
                      Population: {entity.population}
                    </div>
                  </>
                )
              }
            }
          })()}
        </Fragment>
      ))}
    </div>
  )
}
