import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faBus,
  faCompass,
  faClock,
  faDownload,
  faExclamationCircle,
  faHome,
  faLevelUpAlt,
  faMap,
  faMapMarkerAlt,
  faPlay,
  faStar,
  faStreetView,
  faSubway,
  faWrench
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faBus,
  faCompass,
  faClock,
  faDownload,
  faExclamationCircle,
  faHome,
  faLevelUpAlt,
  faMap,
  faMapMarkerAlt,
  faPlay,
  faStar,
  faStreetView,
  faSubway,
  faWrench
)

export default function Icon(p) {
  return <FontAwesomeIcon {...p} />
}
