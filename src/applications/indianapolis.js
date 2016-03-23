import Indianapolis from '../containers/indianapolis'
import initializeBrowsochrones from '../utils/initialize-browsochrones'
import mount from '../mount'

const {store} = mount(Indianapolis)

initializeBrowsochrones(store)
