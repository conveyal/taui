import 'bootstrap/dist/css/bootstrap.css'
import 'react-select/dist/react-select.css'
import deepAssign from 'deep-assign'
import React from 'react'
import {render} from 'react-dom'

import Root from './containers/root'
import configureStore from './store'

export default function (Container) {
  const settings = process.env.SETTINGS
  const initialStore = process.env.STORE
  const messages = process.env.MESSAGES

  const fakeStore = configureStore()
  const store = configureStore(deepAssign(fakeStore.getState(), initialStore))

  render(
    <Root store={store}>
      <Container
        messages={messages}
        settings={settings}
        />
    </Root>,
    document.getElementById('mount')
  )

  return {messages, settings, store}
}
