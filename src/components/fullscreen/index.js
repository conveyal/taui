import Pure from '@conveyal/woonerf/components/pure'
import React from 'react'

export default class Fullscreen extends Pure {
  render () {
    return <div className='Fullscreen'>{this.props.children}</div>
  }
}
