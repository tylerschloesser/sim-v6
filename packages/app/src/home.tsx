import {
  Fragment,
  useCallback,
  useContext,
  useRef,
} from 'react'
import invariant from 'tiny-invariant'
import { AppContext } from './app-context.js'
import styles from './home.module.scss'
import {
  Entity,
  EntityId,
  EntityType,
  TownEntity,
  World,
} from './types.js'

export function Home() {
  const { world, setWorld } = useContext(AppContext)

  const setPriority = useCallback(
    (
      entityId: EntityId,
      key: keyof TownEntity['priority'],
      value: number,
    ) => {
      invariant(value >= 0)
      invariant(value <= 1)
      setWorld((draft) => {
        const entity = draft.entities[entityId]
        invariant(entity?.type === EntityType.enum.Town)
        entity.priority[key] = value
      })
    },
    [setWorld],
  )

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
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              value={entity.priority.food}
                              onChange={(ev) => {
                                setPriority(
                                  entity.id,
                                  'food',
                                  parseFloat(
                                    ev.target.value,
                                  ),
                                )
                              }}
                            ></input>
                          </label>
                        </div>
                        <div>
                          <label>
                            Wood
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              value={entity.priority.wood}
                              onChange={(ev) => {
                                setPriority(
                                  entity.id,
                                  'wood',
                                  parseFloat(
                                    ev.target.value,
                                  ),
                                )
                              }}
                            ></input>
                          </label>
                        </div>
                      </div>
                      <div>Connections</div>
                      <div className={styles.indent}>
                        {Object.keys(entity.connections)
                          .length === 0 && <>None</>}
                        {Object.keys(
                          entity.connections,
                        ).map((id) => (
                          <div key={id}>ID: {id}</div>
                        ))}
                        <div>
                          <AddConnectionButton
                            entity={entity}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )
              }
              case EntityType.enum.FoodSource: {
                return (
                  <>
                    <div>FoodSource</div>
                    <div className={styles.indent}>
                      <div>Connections</div>
                      <div className={styles.indent}>
                        {Object.keys(entity.connections)
                          .length === 0 && <>None</>}
                        {Object.keys(
                          entity.connections,
                        ).map((id) => (
                          <div key={id}>ID: {id}</div>
                        ))}
                        <div>
                          <AddConnectionButton
                            entity={entity}
                          />
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

interface AddConnectionButtonProps {
  entity: Entity
}

function addConnection(
  world: World,
  sourceId: EntityId,
  targetId: EntityId,
): void {
  invariant(sourceId !== targetId)
}

function AddConnectionButton({
  entity,
}: AddConnectionButtonProps) {
  const { world, setWorld } = useContext(AppContext)
  const dialog = useRef<HTMLDialogElement>(null)
  const onClick = useCallback(() => {
    invariant(dialog.current)
    dialog.current.showModal()
  }, [])

  const close = useCallback(() => {
    invariant(dialog.current)
    dialog.current.close()
  }, [])

  const options = Object.values(world.entities).filter(
    (peer) =>
      peer.id !== entity.id && !peer.connections[entity.id],
  )

  return (
    <>
      <button onClick={onClick}>Add Connection</button>
      <dialog ref={dialog}>
        {options.map((peer) => (
          <div key={peer.id}>
            <button
              onClick={() => {
                setWorld((draft) =>
                  addConnection(draft, entity.id, peer.id),
                )
                close()
              }}
            >
              {peer.id} ({peer.type})
            </button>
          </div>
        ))}
        <div>
          <button onClick={close}>Close</button>
        </div>
      </dialog>
    </>
  )
}
