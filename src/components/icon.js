import React from 'react'

import {pure} from './deep-equal'

const Icon = ({
  className = '',
  type,
  ...props
}) =>
  <i
    className={`fa fa-${type} fa-fw ${className}`}
    {...props}
    />

export default pure(Icon)
