import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'

import Place from './containers/place'
import store from './store'

render(<Provider store={store}><Place /></Provider>, document.getElementById('root'))
