import {format} from 'd3-format'
import toSpaceCase from 'lodash/lowerCase'
import get from 'lodash/get'
import React from 'react'

import {darkBlue} from '../constants'
import message from '../message'

import Alert from './tr-alert'
import Icon from './icon'

const roundToSI = format('.2~s')

export default function RouteAccess(p) {
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
      <tr>
        <td>
          <Icon icon='map-marker-alt' style={{color: darkBlue}} />
        </td>
        <td>From start</td>
      </tr>
      {p.grids.map((grid, i) => (
        <Opportunity grid={grid} key={grid.name}>
          <strong> {roundToSI(p.accessibility[i])} </strong>
          {toSpaceCase(grid.name)}
          {p.showComparison && (
            <DiffPercentage
              current={p.accessibility[i]}
              old={p.oldAccessibility[i]}
            />
          )}
        </Opportunity>
      ))}
    </tbody>
  )
}

function Opportunity({children, grid}) {
  return (
    <tr className='Opportunity' key={grid.name}>
      <td>Access to</td>
      <td>{children}</td>
    </tr>
  )
}

function DiffPercentage({current, old}) {
  const diff = ((current - old) / old) * 100

  // only show if the diff is >= 1%
  if (Math.abs(diff) < 1 || isNaN(diff)) return null

  if (diff > 0) {
    return (
      <span className='increase'>
        &nbsp;&nbsp;<strong>{Math.floor(diff)}</strong>%
        <Icon icon='level-up-alt' />
      </span>
    )
  }

  return (
    <span className='decrease'>
      &nbsp;&nbsp;<strong>{Math.floor(diff)}</strong>%
      <Icon icon='level-up-alt' rotation={180} />
    </span>
  )
}
