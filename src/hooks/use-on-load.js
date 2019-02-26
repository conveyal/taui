import React from 'react'

/**
 * Watch a value for a `load` event.
 */
export default function useOnLoad (effect, emitter) {
  return React.useEffect(() => {
    if (!emitter) return
    emitter.on('load', effect)
    return () => emitter.off('load', effect)
  }, [emitter])
}
