import React from 'react'
import Geocoder from 'react-select-geocoder'

import TimeCutoffSelect from '../../components/timecutoff-select'

const Form = ({geocoder, onChangeEnd, onChangeStart, onTimeCutoffChange}) => {
  return (
    <form>
      <fieldset className='form-group'>
        <Geocoder
          apiKey={process.env.MAPZEN_SEARCH_KEY}
          {...geocoder}
          name='start-address'
          onChange={onChangeStart}
          placeholder='Search for a start address'
          value={geocoder.origin}
          />
      </fieldset>
      <fieldset className='form-group'>
        <Geocoder
          apiKey={process.env.MAPZEN_SEARCH_KEY}
          {...geocoder}
          name='end-address'
          onChange={onChangeEnd}
          placeholder='Search for an end address'
          value={geocoder.destination}
          />
      </fieldset>
      <fieldset className='form-group'>
        <label>Highlight area accessible within</label>
        <TimeCutoffSelect
          className='form-control'
          onChange={onTimeCutoffChange}
          />
      </fieldset>
    </form>
  )
}

export default Form
