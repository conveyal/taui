import toSpaceCase from 'lodash/lowerCase'
import get from 'lodash/get'

import message from '../message'

import Alert from './tr-alert'
import Icon from './icon'

export default function RouteAccess (p) {
  if (p.grids.length === 0) {
    return <Alert>{message('Systems.NoGrids')}</Alert>
  }

  if (!p.hasStart) {
    return <Alert>{message('Systems.SelectStart')}</Alert>
  }

  if (get(p, 'accessibility[0]') === -1) {
    return <Alert>{message('Systems.NoAccess')}</Alert>
  }

  return (
    <tbody className='Opportunities'>
      {p.grids.map((grid, i) =>
        <Opportunity grid={grid} key={grid.name}>
          <strong> {(p.accessibility[i] | 0).toLocaleString()} </strong>
          {toSpaceCase(grid.name)}&nbsp;
          {p.showComparison &&
            <DiffPercentage
              current={p.accessibility[i]}
              old={p.oldAccessibility[i]}
            />}
        </Opportunity>)}
    </tbody>
  )
}

function Opportunity ({children, grid}) {
  return (
    <tr className='Opportunity' key={grid.name}>
      <td><Icon icon={grid.icon} /></td>
      <td>
        <span>Access to</span> {children}
      </td>
    </tr>
  )
}

function DiffPercentage ({current, old}) {
  const diff = (current - old) / old * 100

  // only show if the diff is >= 0.1%
  if (Math.abs(diff) < 0.1 || isNaN(diff)) return null

  if (diff > 0) {
    return (
      <span className='increase'>
        (<strong>{diff.toFixed(1)}</strong>% <Icon icon='level-up-alt' />)
      </span>
    )
  }

  return (
    <span className='decrease'>
      (<strong>{diff.toFixed(1)}</strong>% <Icon icon='level-up-alt' rotation={180} />)
    </span>
  )
}
