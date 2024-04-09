import classNames from 'classnames'
import { capitalize } from 'lodash-es'
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import invariant from 'tiny-invariant'
import { Updater } from 'use-immer'
import { AppContext } from './app-context.js'
import styles from './home.module.scss'
import {
  BuildType,
  ConnectionBuild,
  Entity,
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

function Diff({ diff }: { diff: number }) {
  const fixed = Math.abs(diff).toFixed(2)
  if (fixed === '0.00') {
    return <span></span>
  }

  const color = `var(--${diff < 0 ? 'red' : 'green'})`
  return (
    <span style={{ color }}>
      {diff > 0 ? '+' : '-'}
      {fixed}/s
    </span>
  )
}

interface StorageValueProps {
  value: number
}

function StorageValue({ value }: StorageValueProps) {
  const [diff, setDiff] = useState(0)
  const cache = useRef([value])

  useEffect(() => {
    cache.current.push(value)
  }, [value])

  useEffect(() => {
    const intervalId = self.setInterval(() => {
      invariant(cache.current.length > 0)
      const head = cache.current.at(0)
      invariant(head !== undefined)
      const tail = cache.current.at(-1)
      invariant(tail !== undefined)

      setDiff(tail - head)
      cache.current = [tail]
    }, 1000)
    return () => {
      self.clearInterval(intervalId)
    }
  }, [])

  return (
    <>
      <span>{value.toFixed(2)}</span> <Diff diff={diff} />
    </>
  )
}

function useSetPriority(setWorld: Updater<World>) {
  return useCallback(
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
}

interface ShowTownEntityProps {
  entity: TownEntity
}

function ShowTownEntity({ entity }: ShowTownEntityProps) {
  const { setWorld } = useContext(AppContext)
  const setPriority = useSetPriority(setWorld)
  return (
    <>
      <div>Town</div>
      <div className={styles.indent}>
        <div>
          Population: {entity.population}
          <div className={styles.indent}>
            Average Age: {entity.averageAge.toFixed(1)}
          </div>
        </div>
        <div>
          <div>
            Houses: {entity.houses}{' '}
            <BuildHouseButton entityId={entity.id} />
          </div>
          <div className={styles.indent}>
            People/House (avg):{' '}
            {entity.houses === 0
              ? 'n/a'
              : (entity.population / entity.houses).toFixed(
                  1,
                )}
          </div>
        </div>
        <div>Storage</div>
        <div
          className={classNames(
            styles.indent,
            styles.storage,
          )}
        >
          <span>Food</span>
          <StorageValue value={entity.storage.food} />
          <span>Wood</span>
          <StorageValue value={entity.storage.wood} />
        </div>
        <div>Priority</div>
        <div className={styles.indent}>
          {Array.from(iteratePriorities(entity)).map(
            ({ key, value }) => (
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
                        parseFloat(ev.target.value),
                      )
                    }}
                  ></input>
                  {getFinalPriority(key, entity).toFixed(2)}
                </label>
              </div>
            ),
          )}
        </div>
        <div>Connections</div>
        <div className={styles.indent}>
          {Object.keys(entity.connections).length === 0 && (
            <>None</>
          )}
          {Object.keys(entity.connections).map(
            (targetId) => (
              <ShowConnection
                key={targetId}
                sourceId={entity.id}
                targetId={targetId}
              />
            ),
          )}
          <div>
            <AddConnectionButton entity={entity} />
          </div>
        </div>
        <div>Builds</div>
        <div className={styles.indent}>
          {Object.values(entity.builds).length === 0 && (
            <div>None</div>
          )}
          {Object.values(entity.builds).map((build, i) => (
            <Fragment key={i}>
              <div>
                {build.type}{' '}
                <CancelBuildButton
                  entityId={entity.id}
                  index={i}
                />
              </div>
              <div key={i} className={styles.indent}>
                {(() => {
                  switch (build.type) {
                    case BuildType.enum.Connection: {
                      return (
                        <>
                          <div>
                            Source: {build.sourceId}
                          </div>
                          <div>
                            Target: {build.targetId}
                          </div>
                          <div>
                            Progress:{' '}
                            <BuildProgress
                              progress={build.progress}
                            />
                          </div>
                        </>
                      )
                    }
                    case BuildType.enum.House: {
                      return (
                        <div>
                          Progress:{' '}
                          <BuildProgress
                            progress={build.progress}
                          />
                        </div>
                      )
                    }
                  }
                })()}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  )
}

interface ShowEntityProps {
  entity: Entity
}

function ShowEntity({ entity }: ShowEntityProps) {
  switch (entity.type) {
    case EntityType.enum.Town: {
      return <ShowTownEntity entity={entity} />
    }
    case EntityType.enum.FoodSource:
    case EntityType.enum.WoodSource: {
      return (
        <>
          <div>{entity.type}</div>
          <div className={styles.indent}>
            <div>Connections</div>
            <div className={styles.indent}>
              {Object.keys(entity.connections).length ===
                0 && <>None</>}
              {Object.keys(entity.connections).map(
                (targetId) => (
                  <ShowConnection
                    key={targetId}
                    sourceId={entity.id}
                    targetId={targetId}
                  />
                ),
              )}
            </div>
            Yield: {getCurrentYield(entity).toFixed(2)}
          </div>
        </>
      )
    }
  }
}

function EditTickRate() {
  const { tickRate, setTickRate } = useContext(AppContext)
  const options = [100, 10]
  invariant(options.find((value) => value === tickRate))
  return (
    <div>
      Tick Rate:
      {[
        options.map((value) => (
          <label key={value}>
            <input
              type="radio"
              value={value}
              checked={value === tickRate}
              onChange={() => setTickRate(value)}
            />
            {value}
          </label>
        )),
      ]}
    </div>
  )
}

export function Home() {
  const { world } = useContext(AppContext)
  return (
    <>
      <EditTickRate />
      <div>
        <div>Tick: {world.tick}</div>
        <div>Year: {Math.floor(world.tick / 3000)}</div>
        <div>
          Day: {Math.floor((world.tick % 3000) / 50)}
        </div>
        {Object.values(world.entities).map((entity) => (
          <ShowEntity key={entity.id} entity={entity} />
        ))}
      </div>
    </>
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

interface BuildProgressProps {
  progress: number
}

function BuildProgress({ progress }: BuildProgressProps) {
  const [eta, setEta] = useState<null | number>(null)

  const now = self.performance.now()

  const cache = useRef([{ time: now, value: progress }])

  useEffect(() => {
    cache.current.push({ time: now, value: progress })
  }, [progress])

  useEffect(() => {
    const intervalId = self.setInterval(() => {
      invariant(cache.current.length > 0)
      const head = cache.current.at(0)
      invariant(head !== undefined)
      const tail = cache.current.at(-1)
      invariant(tail !== undefined)

      if (head === tail) {
        setEta(null)
      } else {
        const elapsed = tail.time - head.time
        const speed = (tail.value - head.value) / elapsed

        setEta((1 - tail.value) / speed)

        cache.current = [tail]
      }
    }, 1000)
    return () => {
      self.clearInterval(intervalId)
    }
  }, [])

  return (
    <span>
      {formatProgress(progress)} (ETA: {formatEta(eta)})
    </span>
  )
}

function formatEta(eta: null | number) {
  if (eta === null) {
    return <span></span>
  }

  const seconds = eta / 1000
  if (seconds < 60) {
    return <span>{Math.round(seconds)}s</span>
  }
  const minutes = seconds / 60
  return <span>{Math.round(minutes)}m</span>
}

function formatProgress(progress: number) {
  invariant(progress >= 0)
  invariant(progress <= 1)

  return <>{Math.round(progress * 100)}%</>
}
