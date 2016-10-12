import React from 'react'

const Icon = ({
  className = '',
  type,
  ...props
}) =>
  <i
    className={`fa fa-${type} fa-fw ${className}`}
    {...props}
    />

export default Icon
