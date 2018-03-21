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
    return (
      <div className='Log'>
        {this.props.items.map((item, index) => (
          <LogItem {...item} key={index} />
        ))}
      </div>
    )
  }
}
