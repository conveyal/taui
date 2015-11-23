import 'babel-core/polyfill'
import React from 'react'
import {render} from 'react-dom'

import Root from './root'
import Site from './containers/indianapolis'

render(<Root><Site /></Root>, document.getElementById('root'))
