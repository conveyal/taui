import Pure from '@conveyal/woonerf/components/pure'
import React from 'react'

export default class Icon extends Pure {
  render () {
    const {
      className = '',
      type,
      ...props
    } = this.props

    return <i
      className={`fa fa-${type} fa-fw ${className}`}
      {...props}
      />
  }
}
