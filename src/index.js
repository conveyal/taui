import 'babel-core/polyfill'
import Browsochrones from 'browsochrones'
import React from 'react'
import {render} from 'react-dom'

window.Browsochrones = Browsochrones

import Root from './root'
import Site from './containers/site-analysis'

render(<Root><Site /></Root>, document.getElementById('root'))
