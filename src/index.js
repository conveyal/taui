import mount from '@conveyal/woonerf/mount'

import Application from './containers/application'
import reducers from './reducers'

mount({
  app: Application,
  reducers
})
