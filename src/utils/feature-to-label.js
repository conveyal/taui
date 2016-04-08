export default function featureToLabel ({properties}) {
  let {label, localadmin, locality} = properties
  if (localadmin && locality) {
    if (locality === 'Indianapolis city (balance)') {
      locality = 'Indianapolis'
    }
    return label.replace(localadmin, locality)
  }
  return label
}
