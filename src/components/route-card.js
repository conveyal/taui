// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import React from 'react'

type Props = {
  active: boolean,
  alternate: boolean,
  children?: any,
  onClick(): void,
  title: string
}

export default class RouteCard extends React.PureComponent<Props> {
  render () {
    const {
      active,
      alternate,
      children,
      onClick,
      title
    } = this.props
    return (
      <div
        className={
          'Card' +
            (alternate ? ' Card-alternate' : '') +
            (active ? ' Card-active' : '')
        }
      >
        <a
          className='CardTitle'
          onClick={onClick}
          tabIndex={0}
          title='Set network active'
        >
          {title}
          <span className='pull-right'>
            {active ? <Icon type='map' /> : message('Systems.Show')}
          </span>
        </a>
        <div className='CardContent'>{children}</div>
      </div>
    )
  }
}
