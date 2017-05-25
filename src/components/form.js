import Pure from '@conveyal/woonerf/components/pure'
import React from 'react'
import Geocoder from 'react-select-geocoder'
import messages from '../utils/messages'

export default class Form extends Pure {
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
            name='start-address'
            onChange={onChangeStart}
            placeholder={messages.Geocoding.StartPlaceholder}
            searchPromptText={messages.Geocoding.PromptText}
            value={geocoder.start}
          />
        </div>
        {geocoder.start &&
          <div>
            <div className='heading'>{messages.Geocoding.EndTitle}</div>
            <div className='Geocoder'>
              <Geocoder
                apiKey={process.env.MAPZEN_SEARCH_KEY}
                {...geocoder}
                name='end-address'
                onChange={onChangeEnd}
                placeholder={messages.Geocoding.EndPlaceholder}
                searchPromptText={messages.Geocoding.PromptText}
                value={geocoder.end}
              />
            </div>
            <div className='heading'>
              {messages.Strings.HighlightAreaAccessibleWithin}
            </div>
            <div className='TimeCutoff'>
              <div className='Time'>
                {selectedTimeCutoff} {messages.Units.Minutes}
              </div>
              <input
                defaultValue={selectedTimeCutoff}
                onChange={onTimeCutoffChange}
                type='range'
                min={10}
                max={120}
                step={5}
              />
            </div>
          </div>}
      </div>
    )
  }
}
