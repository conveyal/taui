import merge from 'lodash/merge'
import omit from 'lodash/omit'
import App, {Container} from 'next/app'
import Head from 'next/head'
import nextCookies from 'next-cookies'
import React from 'react'
import {Provider} from 'react-redux'

import emptyStore from '../empty-store.json'
import {getOrCreateStore} from '../src/with-redux-store'

function tryParse(v, backup) {
  try {
    return JSON.parse(v)
  } catch (e) {
    console.error('Error parsing JSON.')
    console.error(v)
    return backup
  }
}

const iconLink = 'https://d2f1n6ed3ipuic.cloudfront.net/conveyal-128x128.png'

function parseCookie(ctx) {
  // Get the configuration from the cookies
  const {tauiConfig} = nextCookies(ctx)
  const cookieConfig =
    typeof tauiConfig === 'string' ? tryParse(tauiConfig, {}) : tauiConfig || {}

  return omit(cookieConfig, ['allowChangeConfig'])
}

export default class TauiApp extends App {
  static async getInitialProps({ctx}) {
    const store = tryParse(process.env.STORE, {})
    const defaultStore = merge({}, emptyStore, store)

    // Ignore cookie config if customization is not allowed
    const cookieConfig = defaultStore.allowChangeConfig ? parseCookie(ctx) : {}

    // Get the query string parameters
    const queryConfig =
      typeof ctx.query.search === 'string' ? tryParse(ctx.query.search, {}) : {}

    // Create the store with the initial state prioritizing:
    // query string > cookie config > store.json
    const configs = [{}, defaultStore, cookieConfig, queryConfig]
    const reduxStore = getOrCreateStore(merge(...configs))

    return {
      cookieConfig,
      initialReduxState: reduxStore.getState()
    }
  }

  constructor(props) {
    super(props)
    this.reduxStore = getOrCreateStore(props.initialReduxState)
  }

  render() {
    const {Component, ...appProps} = this.props
    return (
      <>
        <Head>
          <title>{appProps.initialReduxState.title}</title>
          <link rel='shortcut icon' href={iconLink} type='image/x-icon' />
        </Head>
        <Container>
          <Provider store={this.reduxStore}>
            <Component {...appProps} />
          </Provider>
        </Container>
      </>
    )
  }
}
