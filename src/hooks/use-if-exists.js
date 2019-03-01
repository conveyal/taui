import React from 'react'

const arrayIsTruthy = a => a.reduce((m, c) => m && c != null, true)

export default function useIfExists (effect, exists, watch = []) {
  React.useEffect(
    () => {
      if (arrayIsTruthy(exists)) {
        return effect()
      }
    },
    [...exists, ...watch]
  )
}
