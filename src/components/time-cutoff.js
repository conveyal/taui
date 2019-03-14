import React from 'react'

import message from '../message'

import Icon from './icon'

// Delay in animating the time cutoff
const DELAY = 50

export default function TimeCutoff(p) {
  const [animating, setAnimating] = React.useState(false)

  React.useEffect(() => {
    if (!animating) return
    if (p.cutoff < 120) {
      setTimeout(() => p.setCutoff(p.cutoff + 1), DELAY)
    } else {
      setAnimating(false)
    }
  }, [animating, p.cutoff])

  const onClickAnimate = React.useCallback(() => {
    setAnimating(true)
    p.setCutoff(10)
  }, [p.setCutoff, setAnimating])

  return (
    <>
      <div className="heading">
        {message('Strings.HighlightAreaAccessibleWithin')}
        {animating || (
          <a
            className="pull-right"
            onClick={onClickAnimate}
          >
            <Icon icon="play" />
          </a>
        )}
      </div>
      <div className="TimeCutoff">
        <div className="Time">
          {p.cutoff} {message('Units.Minutes')}
        </div>
        <input
          disabled={animating}
          onChange={e => p.setCutoff(parseInt(e.currentTarget.value, 10))}
          type="range"
          min={10}
          max={120}
          step={1}
          value={p.cutoff}
        />
      </div>
    </>
  )
}
