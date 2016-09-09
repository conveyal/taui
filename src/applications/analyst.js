import React, {Component} from 'react'

import {lock} from '../utils/auth0'
import mount from '../mount'

class App extends Component {
  render () {
    return (
      <div>
        <h1>Auth0</h1>
        <button onClick={this.onClick}>Log in</button>
      </div>
    )
  }

  onClick = (e) => {
    lock.show((err, profile, idToken) => {
      if (err) {
        console.error(err)
      } else {
        console.log(profile, idToken)
      }
    })
  }
}

mount(App)
