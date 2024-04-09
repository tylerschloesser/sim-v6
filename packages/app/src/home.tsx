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
  Entity,
  EntityId,
  EntityType,
  HouseBuild,
  ResourceEntity,
  Technology,
  TownEntity,
  World,
} from './types.js'
import {
  HOUSE_BUILD_WOOD,
  canBuildHouse,
  getCurrentYield,
  getNormalizedPriority,
} from './world.js'

function* iteratePriorities(
  priority: TownEntity['priority'],
): Generator<{
  key: keyof TownEntity['priority']
  value: number
}> {
  for (const [key, value] of Object.entries(priority)) {
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

interface DiffProps {
  value: number
  diff: number
}

function Diff({ value, diff }: DiffProps) {
  const fixed = Math.abs(diff).toFixed(2)
  if (fixed === '0.00') {
    return (
      <>
        <span />
        <span />
      </>
    )
  }

  const color = `var(--${diff < 0 ? 'red' : 'green'})`

  const eta = diff >= 0 ? null : value / diff

  return (
    <>
      <span style={{ color }}>
        {diff > 0 ? '+' : '-'}
        {fixed}/s
      </span>
      <span className={styles.eta}>
        {eta && <>ETA: {formatStorageEta(eta)}</>}
      </span>
    </>
  )
}

function formatStorageEta(eta: number) {
  eta = Math.abs(eta)
  if (eta > 60) {
    return `${Math.ceil(eta / 60)}m`
  }
  return `${Math.floor(eta)}s`
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
      <span>{value.toFixed(2)}</span>{' '}
      <Diff value={value} diff={diff} />
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
  const priority = getNormalizedPriority(entity.priority)
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
        <div
          className={classNames(
            styles.indent,
            styles.priority,
          )}
        >
          {Array.from(iteratePriorities(priority)).map(
            ({ key, value: normalized }) => (
              <Fragment key={key}>
                <div>{capitalize(key)}</div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={entity.priority[key]}
                  onChange={(ev) => {
                    setPriority(
                      entity.id,
                      key,
                      parseFloat(ev.target.value),
                    )
                  }}
                ></input>
                <div>{normalized.toFixed(2)}</div>
              </Fragment>
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
        <div>Research</div>
        <div className={styles.indent}>
          {entity.researchQueue.map((research, i) => (
            <div key={i}>
              {research.technology}:{' '}
              {formatProgress(research.progress)}
            </div>
          ))}
          <div>
            <QueueResearchButton entity={entity} />
          </div>
        </div>
        <div>Technology</div>
        <div className={styles.indent}>
          {Object.keys(entity.technologies).length ===
            0 && <>None</>}
          {Object.keys(entity.technologies).map(
            (technology) => (
              <div key={technology}>{technology}</div>
            ),
          )}
        </div>
      </div>
    </>
  )
}

function queueResearch(
  draft: World,
  entityId: EntityId,
  technology: Technology,
): void {
  const entity = draft.entities[entityId]
  invariant(entity?.type === EntityType.enum.Town)

  invariant(!entity.technologies[technology])

  invariant(
    !entity.researchQueue.find(
      (research) => research.technology === technology,
    ),
  )

  entity.researchQueue.push({
    technology,
    progress: 0,
  })
}

interface QueueResearchButtonProps {
  entity: TownEntity
}

function QueueResearchButton({
  entity,
}: QueueResearchButtonProps) {
  const { setWorld } = useContext(AppContext)
  const dialog = useRef<HTMLDialogElement>(null)
  const onClick = useCallback(() => {
    invariant(dialog.current)
    dialog.current.showModal()
  }, [])
  const close = useCallback(() => {
    invariant(dialog.current)
    dialog.current.close()
  }, [])

  const available = Object.values(Technology.enum).filter(
    (technology) => {
      return (
        !entity.technologies[technology] &&
        !entity.researchQueue.find(
          (research) => research.technology === technology,
        )
      )
    },
  )

  return (
    <>
      <button onClick={onClick}>Queue Research</button>
      <dialog ref={dialog}>
        <div>
          {available.length === 0 && (
            <>No Research Available</>
          )}
          {available.map((technology) => (
            <button
              key={technology}
              onClick={() => {
                setWorld((draft) =>
                  queueResearch(
                    draft,
                    entity.id,
                    technology,
                  ),
                )
                close()
              }}
            >
              {technology}
            </button>
          ))}
        </div>
        <div>
          <button onClick={close}>Close</button>
        </div>
      </dialog>
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
  }
  return null
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
  invariant(target?.type === EntityType.enum.Resource)

  invariant(!source.connections[targetId])
  invariant(!target.connections[sourceId])

  source.connections[targetId] = true
  target.connections[sourceId] = true
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

  const options = Object.values(world.entities)
    .filter(
      (peer): peer is ResourceEntity =>
        peer.type === EntityType.enum.Resource,
    )
    .filter((peer) => {
      if (peer.id === entity.id) {
        return false
      }
      if (peer.connections[entity.id]) {
        return false
      }
      return true
    })

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
              {peer.id}: {peer.resourceType}
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
  invariant(source?.type === EntityType.enum.Town)

  const target = world.entities[targetId]
  invariant(target?.type === EntityType.enum.Resource)

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
