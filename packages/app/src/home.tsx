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
import {
  getCurrentYield,
  getFoodPriority,
  getWoodPriority,
} from './world.js'

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
                          {`Food: ${entity.storage.food.count.toFixed(2)} (${(entity.storage.food.delta * 10).toFixed(2)}/s)`}
                        </div>
                        <div>
                          {`Wood: ${entity.storage.wood.count.toFixed(2)}`}
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
                            {getFoodPriority(
                              entity,
                            ).toFixed(2)}
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
                            {getWoodPriority(
                              entity,
                            ).toFixed(2)}
                          </label>
                        </div>
                      </div>
                      <div>Connections</div>
                      <div className={styles.indent}>
                        {Object.keys(entity.connections)
                          .length === 0 && <>None</>}
                        {Object.keys(
                          entity.connections,
                        ).map((targetId) => (
                          <ShowConnection
                            key={targetId}
                            sourceId={entity.id}
                            targetId={targetId}
                          />
                        ))}
                        <div>
                          <AddConnectionButton
                            entity={entity}
                          />
                        </div>
                      </div>
                      <div>Builds</div>
                      <div className={styles.indent}>
                        {Object.values(entity.builds)
                          .length === 0 && <div>None</div>}
                        {Object.values(entity.builds).map(
                          (build, i) => (
                            <Fragment key={i}>
                              <div>{build.type}</div>
                              <div
                                key={i}
                                className={styles.indent}
                              >
                                <div>
                                  Source: {build.sourceId}
                                </div>
                                <div>
                                  Target: {build.targetId}
                                </div>
                                <div>
                                  Progress:{' '}
                                  {build.progress.toFixed(
                                    2,
                                  )}
                                </div>
                              </div>
                            </Fragment>
                          ),
                        )}
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
                        ).map((targetId) => (
                          <ShowConnection
                            key={targetId}
                            sourceId={entity.id}
                            targetId={targetId}
                          />
                        ))}
                        <div>
                          <AddConnectionButton
                            entity={entity}
                          />
                        </div>
                      </div>
                      Yield:{' '}
                      {getCurrentYield(entity).toFixed(2)}
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

function addConnection(
  world: World,
  sourceId: EntityId,
  targetId: EntityId,
): void {
  invariant(sourceId !== targetId)

  const source = world.entities[sourceId]
  invariant(source)

  const target = world.entities[targetId]
  invariant(target)

  invariant(!source.connections[targetId])
  invariant(!target.connections[sourceId])

  source.connections[targetId] = true
  target.connections[sourceId] = true
}

interface AddConnectionButtonProps {
  entity: Entity
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
    (peer) => {
      if (peer.id === entity.id) {
        return false
      }
      if (peer.connections[entity.id]) {
        return false
      }
      return true
    },
  )

  const disabled = options.length === 0

  return (
    <>
      <button onClick={onClick} disabled={disabled}>
        Add Connection
      </button>
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

interface ShowConnectionProps {
  sourceId: EntityId
  targetId: EntityId
}

function deleteConnection(
  world: World,
  sourceId: EntityId,
  targetId: EntityId,
): void {
  const source = world.entities[sourceId]
  invariant(source)

  const target = world.entities[targetId]
  invariant(target)

  invariant(source.connections[targetId])
  invariant(target.connections[sourceId])

  delete source.connections[targetId]
  delete target.connections[sourceId]
}

function ShowConnection({
  sourceId,
  targetId,
}: ShowConnectionProps) {
  const { world, setWorld } = useContext(AppContext)

  const source = world.entities[sourceId]
  invariant(source)

  const target = world.entities[targetId]
  invariant(target)

  invariant(source.connections[targetId])
  invariant(target.connections[sourceId])

  return (
    <>
      ID: {targetId}
      <button
        onClick={() =>
          setWorld((draft) =>
            deleteConnection(draft, sourceId, targetId),
          )
        }
      >
        Delete
      </button>
    </>
  )
}
