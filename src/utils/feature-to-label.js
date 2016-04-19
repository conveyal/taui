export default function featureToLabel ({place_name, properties}) {
  let {label, localadmin, locality} = properties
  if (label && localadmin && locality) {
    if (locality === 'Indianapolis city (balance)') {
      locality = 'Indianapolis'
    }
    return label.replace(localadmin, locality)
  }
  return place_name || label
}
