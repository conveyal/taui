// @flow
import message from '@conveyal/woonerf/message'
import toSpaceCase from 'lodash/lowerCase'
import get from 'lodash/get'

import Alert from './tr-alert'

export default function RouteAccess (props) {
  if (props.grids.length === 0) {
    return <Alert>{message('Systems.NoGrids')}</Alert>
  }

  if (!props.hasStart) {
    return <Alert>{message('Systems.SelectStart')}</Alert>
  }

  if (get(props, 'accessibility[0]') === -1) {
    return <Alert>{message('Systems.NoAccess')}</Alert>
  }

  return <ShowAccess {...props} />
}

function ShowAccess ({
  accessibility,
  grids,
  oldAccessibility,
  showComparison
}) {
  return (
    <tbody className='Opportunities'>
      {grids.map((grid, i) => (
        <tr className='Opportunity' key={grid.name}>
          <td><span className={`fa fa-${grid.icon}`} /></td>
          <td>
            <span>Access to</span>
            <strong> {(accessibility[i] | 0).toLocaleString()} </strong>
            {toSpaceCase(grid.name)}&nbsp;
            {showComparison &&
              <DiffPercentage
                current={accessibility[i]}
                old={oldAccessibility[i]}
              />}
          </td>
        </tr>
      ))}
    </tbody>
  )
}

function DiffPercentage ({current, old}) {
  const diff = (current - old) / old * 100

  // only show if the diff is >= 0.1%
  if (Math.abs(diff) < 0.1 || isNaN(diff)) return null

  if (diff > 0) {
    return (
      <span className='increase'>
        (<strong>{diff.toFixed(1)}</strong>% <span className='fa fa-level-up' />)
      </span>
    )
  }

  return (
    <span className='decrease'>
      (<strong>{diff.toFixed(1)}</strong>% <span className='fa fa-level-up fa-rotate-180' />)
    </span>
  )
}
