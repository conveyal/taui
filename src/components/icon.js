import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faBus,
  faCompass,
  faClock,
  faDownload,
  faExclamationCircle,
  faHome,
  faInfoCircle,
  faLevelUpAlt,
  faMap,
  faMapMarkerAlt,
  faPlay,
  faStar,
  faStreetView,
  faSubway,
  faTimes,
  faWrench
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faBus,
  faCompass,
  faClock,
  faDownload,
  faExclamationCircle,
  faHome,
  faInfoCircle,
  faLevelUpAlt,
  faMap,
  faMapMarkerAlt,
  faPlay,
  faStar,
  faStreetView,
  faSubway,
  faTimes,
  faWrench
)

export default function Icon(p) {
  return <FontAwesomeIcon {...p} />
}
