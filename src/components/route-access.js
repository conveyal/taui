// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import toSpaceCase from 'lodash/lowerCase'

export default function RouteAccess (props) {
  if (props.grids.length === 0) {
    return <div className='alert'>{message('Systems.NoGrids')}</div>
  }

  if (!props.hasStart) {
    return <div className='alert'>{message('Systems.SelectStart')}</div>
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
    <div className='Opportunities'>
      {grids.map((grid, i) => (
        <div className='Opportunity' key={grid.name}>
          <span className={`fa fa-${grid.icon}`} />
          <span> Access to</span>
          <strong> {(accessibility[i] | 0).toLocaleString()} </strong>
          {toSpaceCase(grid.name)}&nbsp;
          {showComparison &&
            <DiffPercentage
              current={accessibility[i]}
              old={oldAccessibility[i]}
            />}
        </div>
      ))}
    </div>
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
      (<strong>diff.toFixed(1)</strong>% <span className='fa fa-level-up fa-rotate-180' />)
    </span>
  )
}
