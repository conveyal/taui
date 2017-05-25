/* global describe, expect, it */
import multi from '@conveyal/woonerf/store/multi'
import promise from '@conveyal/woonerf/store/promise'
import {middleware as fetchMiddleware} from '@conveyal/woonerf/fetch'
import {mount} from 'enzyme'
import {mountToJson} from 'enzyme-to-json'
import React from 'react'
import {Provider} from 'react-redux'
import configureStore from 'redux-mock-store'

import Application from '../application'

const makeMockStore = configureStore([multi, promise, fetchMiddleware])

describe('Taui', () => {
  it('render the application container', () => {
    const store = makeMockStore(JSON.parse(process.env.STORE))
    const component = mount(
      <Provider store={store}>
        <Application
          store={store}
          />
      </Provider>
    )
    expect(mountToJson(component)).toMatchSnapshot()
  })
})
