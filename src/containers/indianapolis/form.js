import React from 'react'
import Geocoder from 'react-select-geocoder'

import TimeCutoffSelect from '../../components/timecutoff-select'
import featureToLabel from '../../utils/feature-to-label'
import {search} from '../../utils/mapbox-geocoder'
import messages from '../../utils/messages'

const Form = ({geocoder, onChangeEnd, onChangeStart, onTimeCutoffChange}) => {
  return (
    <form>
      <fieldset className='form-group'>
        <Geocoder
          apiKey={process.env.MAPZEN_SEARCH_KEY}
          {...geocoder}
          featureToLabel={featureToLabel}
          featureToValue={(f) => f.id}
          name='start-address'
          onChange={onChangeStart}
          placeholder={messages.Strings.SearchForStartAddress}
          search={search}
          value={geocoder.origin}
          />
      </fieldset>
      <fieldset className='form-group'>
        <Geocoder
          apiKey={process.env.MAPZEN_SEARCH_KEY}
          {...geocoder}
          featureToLabel={featureToLabel}
          featureToValue={(f) => f.id}
          name='end-address'
          onChange={onChangeEnd}
          placeholder={messages.Strings.SearchForEndAddress}
          search={search}
          value={geocoder.destination}
          />
      </fieldset>
      <fieldset className='form-group'>
        <label>{messages.Strings.HighlightAreaAccessibleWithin}</label>
        <TimeCutoffSelect
          className='form-control'
          onChange={onTimeCutoffChange}
          />
      </fieldset>
    </form>
  )
}

export default Form
