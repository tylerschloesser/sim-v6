import { capitalize } from 'lodash-es'
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
  BuildType,
  ConnectionBuild,
  EntityId,
  EntityType,
  HouseBuild,
  TownEntity,
  World,
} from './types.js'
import {
  HOUSE_BUILD_WOOD,
  canBuildHouse,
  getCurrentYield,
  getFinalPriority,
} from './world.js'

function* iteratePriorities(entity: TownEntity): Generator<{
  key: keyof TownEntity['priority']
  value: number
}> {
  for (const [key, value] of Object.entries(
    entity.priority,
  )) {
    yield {
      key: key as keyof TownEntity['priority'],
      value,
    }
  }
}

interface BuildHouseButtonProps {
  entityId: EntityId
}

function buildHouse(
  world: World,
  entityId: EntityId,
): void {
  const entity = world.entities[entityId]
  invariant(entity?.type === EntityType.enum.Town)

  invariant(entity.storage.wood >= HOUSE_BUILD_WOOD)
  entity.storage.wood -= HOUSE_BUILD_WOOD

  const build: HouseBuild = {
    type: BuildType.enum.House,
    entityId,
    progress: 0,
  }

  entity.builds.push(build)
}

function BuildHouseButton({
  entityId,
}: BuildHouseButtonProps) {
  const { world, setWorld } = useContext(AppContext)
  const entity = world.entities[entityId]
  invariant(entity?.type === EntityType.enum.Town)

  const disabled = !canBuildHouse(entity)

  return (
    <button
      disabled={disabled}
      onClick={() => {
        setWorld((draft) => buildHouse(draft, entityId))
      }}
    >
      Build House
    </button>
  )
}

interface DynamicValueProps {
  value: number
}

function DynamicValue({ value }: DynamicValueProps) {
  return <>{value.toFixed(2)}</>
}

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
                      <div>
                        Houses: {entity.houses}{' '}
                        <BuildHouseButton
                          entityId={entity.id}
                        />
                      </div>
                      <div>Storage</div>
                      <div className={styles.indent}>
                        <div>
                          Food:{' '}
                          <DynamicValue
                            value={entity.storage.food}
                          />
                        </div>
                        <div>
                          Wood:{' '}
                          <DynamicValue
                            value={entity.storage.wood}
                          />
                        </div>
                      </div>
                      <div>Priority</div>
                      <div className={styles.indent}>
                        {Array.from(
                          iteratePriorities(entity),
                        ).map(({ key, value }) => (
                          <div key={key}>
                            <label>
                              {capitalize(key)}
                              <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={value}
                                onChange={(ev) => {
                                  setPriority(
                                    entity.id,
                                    key,
                                    parseFloat(
                                      ev.target.value,
                                    ),
                                  )
                                }}
                              ></input>
                              {getFinalPriority(
                                key,
                                entity,
                              ).toFixed(2)}
                            </label>
                          </div>
                        ))}
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
                              <div>
                                {build.type}{' '}
                                <CancelBuildButton
                                  entityId={entity.id}
                                  index={i}
                                />
                              </div>
                              <div
                                key={i}
                                className={styles.indent}
                              >
                                {(() => {
                                  switch (build.type) {
                                    case BuildType.enum
                                      .Connection: {
                                      return (
                                        <>
                                          <div>
                                            Source:{' '}
                                            {build.sourceId}
                                          </div>
                                          <div>
                                            Target:{' '}
                                            {build.targetId}
                                          </div>
                                          <div>
                                            Progress:{' '}
                                            {build.progress.toFixed(
                                              2,
                                            )}
                                          </div>
                                        </>
                                      )
                                    }
                                    case BuildType.enum
                                      .House: {
                                      return (
                                        <div>
                                          Progress:{' '}
                                          {build.progress.toFixed(
                                            2,
                                          )}
                                        </div>
                                      )
                                    }
                                  }
                                })()}
                              </div>
                            </Fragment>
                          ),
                        )}
                      </div>
                    </div>
                  </>
                )
              }
              case EntityType.enum.FoodSource:
              case EntityType.enum.WoodSource: {
                return (
                  <>
                    <div>{entity.type}</div>
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

interface CancelBuildButtonProps {
  entityId: EntityId
  index: number
}

function CancelBuildButton({
  entityId,
  index,
}: CancelBuildButtonProps) {
  const { setWorld } = useContext(AppContext)
  return (
    <button
      onClick={() => {
        setWorld((draft) => {
          const entity = draft.entities[entityId]
          invariant(entity?.type === EntityType.enum.Town)

          const build = entity.builds.at(index)
          invariant(build)

          switch (build.type) {
            case BuildType.enum.House: {
              entity.storage.wood += HOUSE_BUILD_WOOD
              break
            }
          }

          entity.builds.splice(index, 1)
        })
      }}
    >
      Cancel
    </button>
  )
}

function addConnection(
  world: World,
  sourceId: EntityId,
  targetId: EntityId,
): void {
  invariant(sourceId !== targetId)

  const source = world.entities[sourceId]
  invariant(source?.type === EntityType.enum.Town)

  const target = world.entities[targetId]
  invariant(target)

  invariant(!source.connections[targetId])
  invariant(!target.connections[sourceId])

  invariant(
    !source.builds
      .filter(
        (build): build is ConnectionBuild =>
          build.type === BuildType.enum.Connection,
      )
      .find(
        (build) =>
          build.sourceId === sourceId &&
          build.targetId === targetId,
      ),
  )

  source.builds.push({
    type: BuildType.enum.Connection,
    sourceId,
    targetId,
    progress: 0,
  })
}

interface AddConnectionButtonProps {
  entity: TownEntity
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
      if (
        entity.builds
          .filter(
            (build): build is ConnectionBuild =>
              build.type === BuildType.enum.Connection,
          )
          .find(
            (build) =>
              (build.sourceId === peer.id &&
                build.targetId === entity.id) ||
              (build.sourceId === entity.id &&
                build.targetId === peer.id),
          )
      ) {
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
    <div>
      ID: {targetId}{' '}
      <button
        onClick={() =>
          setWorld((draft) =>
            deleteConnection(draft, sourceId, targetId),
          )
        }
      >
        Delete
      </button>
    </div>
  )
}
