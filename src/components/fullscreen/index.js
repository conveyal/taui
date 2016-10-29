import React from 'react'

import {pure} from '../deep-equal'

const Fullscreen = (props) => <div className='Fullscreen'>{props.children}</div>

export default pure(Fullscreen)
