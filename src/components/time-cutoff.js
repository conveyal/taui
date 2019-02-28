import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'

import message from '../message'

// Delay in animating the time cutoff
const DELAY = 50

export default function TimeCutoff (p) {
  const [animating, setAnimating] = React.useState(false)

  React.useEffect(() => {
    if (!animating) return
    if (p.cutoff < 120) {
      setTimeout(() => p.setCutoff(p.cutoff + 1), 50)
    } else {
      setAnimating(false)
    }
  }, [animating, p.cutoff])

  return <>
    <div className='heading'>
      {message('Strings.HighlightAreaAccessibleWithin')}
      {animating ||
        <a className='pull-right' onClick={() => {
          setAnimating(true)
          p.setCutoff(10)
        }}>
          <Icon type='play' />
        </a>}
    </div>
    <div className='TimeCutoff'>
      <div className='Time'>{p.cutoff} {message('Units.Minutes')}</div>
      <input
        disabled={animating}
        onChange={e =>
          p.setCutoff(parseInt(e.currentTarget.value, 10))}
        type='range'
        min={10}
        max={120}
        step={1}
        value={p.cutoff}
      />
    </div>
  </>
}
