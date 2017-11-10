// @flow
import mount from '@conveyal/woonerf/mount'

import Application from './containers/application'
import reducers from './reducers'
import messages from './utils/messages'

// Set the title
document.title = messages.Title

// Mount the app
mount({
  app: Application,
  reducers
})
