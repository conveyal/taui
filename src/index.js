import mount from '@conveyal/woonerf/build/lib/mount'

import Indianapolis from './containers/indianapolis'
import reducers from './reducers'

mount({
  app: Indianapolis,
  reducers
})
