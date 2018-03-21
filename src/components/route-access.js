// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import toSpaceCase from 'lodash/lowerCase'

export default function RouteAccess (props) {
  return <div className='CardAccess'>
    <div className='heading'>
      {message('Systems.AccessTitle')}
    </div>
    {props.hasStart
      ? props.showComparison
        ? <ShowDiff
          accessibility={props.accessibility}
          comparison={props.oldAccessibility}
          grids={props.grids}
        />
        : <ShowAccess accessibility={props.accessibility} grids={props.grids} />
      : <span>{message('Systems.SelectStart')}</span>}
  </div>
}

function ShowAccess ({
  accessibility,
  grids
}: {
  accessibility: number[],
  grids: any[]
}) {
  return (
    <div>
      {grids.map((grid, i) => (
        <div className='Metric' key={grid.name}>
          <div>
            <Icon type={grid.icon} />
            <strong> {(accessibility[i] | 0).toLocaleString()} </strong>{' '}
            {toSpaceCase(grid.name)}
          </div>
        </div>
      ))}
    </div>
  )
}

function AccessDiffPercentage ({newAccess, originalAccess}) {
  const actualDiff = newAccess - originalAccess
  const nume = actualDiff > 0
    ? newAccess - originalAccess
    : originalAccess - newAccess
  const diff = parseInt((nume / originalAccess * 100).toFixed(1))
  if (diff === 0 || isNaN(diff)) return <span />
  else if (actualDiff > 0) {
    return (
      <div className='increase'>
        <strong>{diff}</strong>%<Icon type='level-up' />
      </div>
    )
  } else {
    return (
      <div className='decrease'>
        <strong>{diff * -1}</strong>
        %
        <Icon className='fa-rotate-180' type='level-up' />
      </div>
    )
  }
}

function ShowDiff ({accessibility, comparison, grids}) {
  return (
    <div>
      {grids.map((grid, i) => (
        <div className='Metric' key={grid.name}>
          <div>
            <Icon type={grid.icon} />
            <strong> {(accessibility[i] | 0).toLocaleString()} </strong>{' '}
            {toSpaceCase(grid.name)}
          </div>
          <AccessDiffPercentage
            newAccess={accessibility[i]}
            originalAccess={comparison[i]}
          />
        </div>
      ))}
    </div>
  )
}
