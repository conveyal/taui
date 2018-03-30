// @flow
import React from 'react'

import type {LogItems} from '../../types'

import LogItem from './item'

type Props = {
  items: LogItems
}

export default class Log extends React.PureComponent {
  props: Props

  render () {
    const {items} = this.props
    const hasError = items[0] && items[0].level === 'error' ? 'hasError' : ''
    return (
      <div className={`Log ${hasError}`}>
        {this.props.items.map((item, index) => (
          <LogItem {...item} key={index} />
        ))}
      </div>
    )
  }
}
