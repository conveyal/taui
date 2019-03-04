import React from 'react'

/**
 * Watch a value for a `load` event.
 */
export default function useOnLoad(effect, emitter, watch = []) {
  return React.useEffect(() => {
    if (!emitter) return

    function onLoad() {
      effect(emitter, ...watch)
    }

    emitter.on('load', onLoad)
    return () => {
      emitter.off('load', onLoad)
    }
  }, [emitter, ...watch])
}
