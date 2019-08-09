import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faBus,
  faCaretRight,
  faCompass,
  faClock,
  faDotCircle,
  faDownload,
  faExclamationCircle,
  faEye,
  faHandPointer,
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
import React from 'react'

library.add(
  faBus,
  faCaretRight,
  faCompass,
  faClock,
  faDotCircle,
  faDownload,
  faExclamationCircle,
  faEye,
  faHandPointer,
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
  return <FontAwesomeIcon {...p} fixedWidth />
}
