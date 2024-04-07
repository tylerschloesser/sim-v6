import { Fragment, useContext } from 'react'
import { AppContext } from './app-context.js'
import styles from './home.module.scss'
import { EntityType } from './types.js'

export function Home() {
  const { world } = useContext(AppContext)
  return (
    <div>
      <div>Tick: {world.tick}</div>
      {Object.values(world.entities).map((entity) => (
        <Fragment key={entity.id}>
          {(() => {
            switch (entity.type) {
              case EntityType.enum.Town: {
                return (
                  <>
                    <div>Town</div>
                    <div className={styles.indent}>
                      <div>
                        Population: {entity.population}
                      </div>
                      <div>Storage</div>
                      <div className={styles.indent}>
                        <div>
                          {`Food: ${entity.storage.food.toFixed(2)}`}
                        </div>
                        <div>
                          {`Wood: ${entity.storage.wood.toFixed(2)}`}
                        </div>
                      </div>
                      <div>Priority</div>
                      <div className={styles.indent}>
                        <div>
                          <label>
                            Food
                            <input type="range"></input>
                          </label>
                        </div>
                        <div>
                          <label>
                            Wood
                            <input type="range"></input>
                          </label>
                        </div>
                      </div>
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
