import React from 'react'
import {render} from 'react-dom'

import Root from './containers/root'
import configureStore from './store'

export default function (Container) {
  const settings = parse(process.env.SETTINGS)
  const initialStore = parse(process.env.STORE)
  const messages = parse(process.env.MESSAGES)

  const fakeStore = configureStore()
  const store = configureStore({
    ...fakeStore.getState(),
    ...initialStore
  })

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

function parse (p) {
  try {
    return JSON.parse(p) || {}
  } catch (e) {
    return {}
  }
}
