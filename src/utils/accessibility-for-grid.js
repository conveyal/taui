// @flow
import type {Grid, Query} from '../types'

/**
 * Get the cumulative accessibility number for a cutoff from a travel time
 * surface. This function always calculates _average_ accessibility. Calculating
 * best or worst case accessibility is computationally complex because you must
 * individually calculate accessibility for every minute, save all of those
 * values, and then take a minumum. (Saving the worst-case travel time to each
 * pixel allows you to calculate a bound, but does not allow calculation of the
 * true minimum, because it is possible that all the worst-case travel times
 * cannot appear simultaneously. Of course this comes back to the definition of
 * your measure, and how fungible you consider opportunities to be.)
 *
 * The cutoff used is the cutoff that was specified in the surface generation.
 * If you want a different cutoff you must regenerate the surface. The reason
 * for this is that we need to know at every minute whether each destination was
 * reached within a certain amount of time. Storing this for every possible
 * cutoff is not feasible (the data become too large), so we only store it for a
 * single cutoff during surface generation. However, calculating accessibility
 * for additional grids should only take milliseconds.
 *
 * TODO in OTP/R5 we have a sigmoidal cutoff here to avoid "echoes" of high
 * density locations at 60 minutes travel time from their origins. But maybe
 * also we just want to not represent these things as hard edges since
 * accessibility is a continuous phenomenon. No one is saying "ah, rats, it
 * takes 60 minutes and 10 seconds to get work, I have to find a job that's 20
 * meters closer to home..."
 *
 * @param {Number} cutoff
 * @param {Grid} grid
 * @param {Query} query
 * @param {Uint8Array} surface
 * @returns {Number} accessibility
 */
export default function accessibilityForGrid ({
  cutoff = 60,
  grid,
  network,
  surface
}: {
  cutoff: number,
  grid: Grid,
  network: Query,
  surface: Uint8Array
}): number {
  let accessibility = 0
  for (let pixel = 0, y = 0; y < network.height; y++) {
    for (let x = 0; x < network.width; x++, pixel++) {
      const travelTime = surface[pixel]

      // ignore unreached locations
      if (travelTime <= cutoff) {
        const gridx = x + network.west - grid.west
        const gridy = y + network.north - grid.north
        accessibility += grid.valueAtPoint(gridx, gridy)
      }
    }
  }

  return accessibility
}
