// @flow
import React from 'react'

type Props = {
  className?: string,
  type: string,
  props?: any
}

export default ({className = '', type, ...props}: Props) =>
  <i className={`fa fa-${type} fa-fw ${className}`} {...props} />
