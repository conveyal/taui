import React from 'react'
import Geocoder from 'react-select-geocoder'

// import DestinationsSelect from '../../components/destinations-select'
import TimeCutoffSelect from '../../components/timecutoff-select'

const Form = ({accessibility, geocoder, onChangeEnd, onChangeStart, onTimeCutoffChange}) => {
  return (
    <form>
      <fieldset className='form-group'>
        <Geocoder
          {...geocoder}
          name='start-address'
          onChange={onChangeStart}
          placeholder='Search for a start address'
          value={geocoder.origin}
          />
      </fieldset>
      <fieldset className='form-group'>
        <Geocoder
          {...geocoder}
          name='end-address'
          onChange={onChangeEnd}
          placeholder='Search for an end address'
          value={geocoder.destination}
          />
      </fieldset>
      <fieldset className='form-group'>
        <label>Isoline Time Cutoff</label>
        <TimeCutoffSelect
          className='form-control'
          onChange={onTimeCutoffChange}
          />
      </fieldset>
      <fieldset className='form-group'>
        <label>Access to:
          {Object.keys(accessibility).map(k => {
            return <span><br /><strong>{(accessibility[k] | 0).toLocaleString()} {k.toLowerCase()}</strong></span>
          })}
        </label>
      </fieldset>
    </form>
  )
}

export default Form
