// @flow
import createStore from '@conveyal/woonerf/store'
import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'

export function create ({
  app,
  reducers
}) {
  const store = createStore(reducers)
  return React.createElement(Provider, {store},
    React.createElement(app, {store}))
}

export default function mount ({
  app,
  id = 'root',
  reducers
}) {
  return render(
    create({app, reducers}),
    document.getElementById(id)
  )
}
