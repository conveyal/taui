// @flow
import React from 'react'

import LogItem from './item'

import type {LogItems} from '../../types'

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
