// @flow
const PATHS_GRID_TYPE = 'PATHGRID'

type Leg = [number, number, number] // boardStopId, patternId, alightStopId
type Path = Leg[]
type Targets = any

type PathsData = {
  paths: Path[],
  targets: Targets
}

type TransitiveStop = {
  stop_id: string
}

type TransitivePattern = {
  pattern_id: string,
  stops: TransitiveStop[]
}

type TransitiveData = {
  patterns: TransitivePattern[],
  stops: TransitiveStop[]
}

/**
 * Parse the ArrayBuffer of a `*_paths.dat` file for a point in a network.
 */
export function parsePathsData (ab: ArrayBuffer): PathsData {
  const headerData = new Int8Array(ab.slice(0, PATHS_GRID_TYPE.length))
  const headerType = String.fromCharCode(...headerData)
  if (headerType !== PATHS_GRID_TYPE) {
    throw new Error(`Retrieved grid header ${headerType} !== ${PATHS_GRID_TYPE}. Please check your data.`)
  }

  const data = new Int32Array(ab.slice(PATHS_GRID_TYPE.length))
  let offset = 0
  const next = () => data[offset++]
  const nDestinations = next()
  const nIterations = next()
  const nPaths = next()
  console.log(`nDestinationss`, nDestinations)
  console.log('nIterations', nIterations)
  console.log('nPaths', nPaths)

  const paths = []
  for (let i = 0; i < nPaths; i++) {
    const nLegs = next()
    const legList = []
    for (let j = 0; j < nLegs; j++) {
      legList.push([next(), next(), next()]) // boardStopId, patternId, alightStopId
    }
    paths.push(legList)
  }

  const targets = []
  for (let i = 0; i < nDestinations; i++) {
    const pathIndexes = []
    let previousValue = 0
    for (let j = 0; j < nIterations; j++) {
      const delta = next()
      const pathIndex = delta + previousValue
      pathIndexes.push(pathIndex)
      previousValue = pathIndex
    }
    targets.push(pathIndexes)
  }

  return {paths, targets}
}

/**
 * Checks each leg of a path ensuring that the pattern exists and the
 * stops in the leg are in the pattern.
 */
export function warnForInvalidPaths (paths: Path[], td: TransitiveData) {
  const stopInAllData = (id) => hasStop(id, td.stops)
  paths.forEach(path => {
    path.forEach(leg => {
      const [boardStopId, patternId, alightStopId] = leg
      const pattern = td.patterns.find(p => p.pattern_id === `${patternId}`)
      if (!pattern) {
        console.error(`Pattern ${patternId} not in transitive data.`)
        return
      }

      const stopInPattern = (id) => hasStop(id, pattern.stops)

      if (!stopInPattern(boardStopId)) {
        console.error(`Board stop ${boardStopId} not found in pattern`)
        if (!stopInAllData(boardStopId)) {
          console.error(`Board stop ${boardStopId} not found in all data`)
        }
      }

      if (!stopInPattern(alightStopId)) {
        console.error(`Alight stop ${alightStopId} not found in pattern`)
        if (!stopInAllData(alightStopId)) {
          console.error(`Alight stop ${alightStopId} not found in all data`)
        }
      }
    })
  })
}

const hasStop = (stopId, stops) => !!stops.find(s => s.stop_id === `${stopId}`)
