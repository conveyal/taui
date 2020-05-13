import {
  Box,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
} from '@chakra-ui/core'
import React from 'react'

import message from '../message'

import Icon from './icon'

// Delay in animating the time cutoff
const DELAY = 50

export default function TimeCutoff(p) {
  const [animating, setAnimating] = React.useState(false)
  const {cutoff, setCutoff} = p

  React.useEffect(() => {
    if (!animating) return
    if (cutoff < 120) {
      setTimeout(() => setCutoff(cutoff + 1), DELAY)
    } else {
      setAnimating(false)
    }
  }, [animating, cutoff, setCutoff])

  const onClickAnimate = () => {
    setAnimating(true)
    setCutoff(10)
  }

  return (
    <>
      <div className='heading'>
        {message('Strings.HighlightAreaAccessibleWithin')}
        {!animating ? (
          <a className='pull-right' onClick={onClickAnimate}>
            <Icon icon='play' />
          </a>
        ) : (
          <a className='pull-right' onClick={() => setAnimating(false)}>
            <Icon icon='stop' />
          </a>
        )}
      </div>
      <Flex>
        <Box color='white' fontWeight={500} mr={4} whiteSpace='nowrap'>
          {`${p.cutoff} ${message('Units.Minutes')}`}
        </Box>
        <Slider
          disabled={animating}
          max={120}
          min={10}
          onChange={setCutoff}
          step={1}
          value={cutoff}
        >
          <SliderTrack />
          <SliderFilledTrack />
          <SliderThumb />
        </Slider>
      </Flex>
    </>
  )
}
