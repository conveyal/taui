// @flow
import React from 'react'

import LogItem from '../log-item'

import type {LogItems} from '../../types'

type Props = {
  items: LogItems
}

export default (props: Props) =>
  <div className='Log'>
    {props.items.map((item, index) => <LogItem {...item} key={index} />)}
  </div>
