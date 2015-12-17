import React from 'react'
import {createDevTools} from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'

export default createDevTools(
  <DockMonitor
    changePositionKey='ctrl-w'
    defaultPosition='left'
    defaultIsVisible={false}
    toggleVisibilityKey='ctrl-h'
    >
    <LogMonitor />
  </DockMonitor>
)
