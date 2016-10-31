import React from 'react'
import Geocoder from 'react-select-geocoder'

import DeepEqual from '../../components/deep-equal'
import featureToLabel from '../../utils/feature-to-label'
import {search} from '../../utils/mapbox-geocoder'
import messages from '../../utils/messages'

export default class Form extends DeepEqual {
  render () {
    const {
      geocoder,
      onChangeEnd,
      onChangeStart,
      onTimeCutoffChange,
      selectedTimeCutoff
    } = this.props
    return (
      <div>
        <div className='heading'>{messages.Geocoding.StartTitle}</div>
        <div className='Geocoder'>
          <Geocoder
            apiKey={process.env.MAPZEN_SEARCH_KEY}
            {...geocoder}
            featureToLabel={featureToLabel}
            featureToValue={(f) => f.id}
            name='start-address'
            onChange={onChangeStart}
            placeholder={messages.Geocoding.StartPlaceholder}
            search={search}
            searchPromptText={messages.Geocoding.PromptText}
            value={geocoder.origin}
            />
        </div>
        {geocoder.origin &&
          <div>
            <div className='heading'>{messages.Geocoding.EndTitle}</div>
            <div className='Geocoder'>
              <Geocoder
                apiKey={process.env.MAPZEN_SEARCH_KEY}
                {...geocoder}
                featureToLabel={featureToLabel}
                featureToValue={(f) => f.id}
                name='end-address'
                onChange={onChangeEnd}
                placeholder={messages.Geocoding.EndPlaceholder}
                search={search}
                searchPromptText={messages.Geocoding.PromptText}
                value={geocoder.destination}
                />
            </div>
            <div className='heading'>{messages.Strings.HighlightAreaAccessibleWithin}</div>
            <div className='TimeCutoff'>
              <div className='Time'>{selectedTimeCutoff} {messages.Units.Minutes}</div>
              <input
                defaultValue={selectedTimeCutoff}
                onChange={onTimeCutoffChange}
                type='range'
                min={10}
                max={120}
                step={10}
                />
            </div>
          </div>
        }
      </div>
    )
  }
}
