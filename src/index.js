import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'

import Site from './containers/site-analysis'
import store from './store'

render(<Provider store={store}><Site /></Provider>, document.getElementById('root'))
