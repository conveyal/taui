export default function featureToLabel (opts) {
  let {label, localadmin, locality} = opts.properties
  if (label && localadmin && locality) {
    if (locality === 'Indianapolis city (balance)') {
      locality = 'Indianapolis'
    }
    return label.replace(localadmin, locality)
  }
  return opts.place_name || label
}
