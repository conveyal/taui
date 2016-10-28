import mount from 'mastarm/react/mount'

import reducers from './reducers'
import router from './router'

mount({
  app: router,
  reducers
})
