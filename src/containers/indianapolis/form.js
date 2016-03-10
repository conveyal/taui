import React from 'react'
import Geocoder from 'react-select-geocoder'
import toCapitalCase from 'to-capital-case'

import TimeCutoffSelect from '../../components/timecutoff-select'

const Form = ({accessibility, geocoder, onChangeEnd, onChangeStart, onTimeCutoffChange}) => {
  const accessibilityKeys = Object.keys(accessibility.base)
  const comparisonAccessibilityKeys = Object.keys(accessibility.comparison)

  let access = null
  if (comparisonAccessibilityKeys.length > 0) {
    access = showDiff(accessibilityKeys, accessibility)
  } else if (accessibilityKeys.length > 0) {
    access = showAccess(accessibilityKeys, accessibility.base)
  }

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
      {access}
    </form>
  )
}

function showAccess (keys, base) {
  return (
    <fieldset className='form-group'>
      <label>Access to:
        {keys.map(k => {
          return <span key={k}><br /><strong>{(base[k] | 0).toLocaleString()} {toCapitalCase(k)}</strong></span>
        })}
      </label>
    </fieldset>
  )
}

function showDiff (keys, {base, comparison}) {
  return (
    <fieldset className='form-group'>
      <label>Access to:
        {keys.map(k => {
          let diff = parseInt((base[k] - comparison[k]) / base[k] * 100, 10)

          if (diff > 0) diff = diff.toLocaleString() + '% increase'
          else if (diff === 0) diff = 'no change'
          else diff = (diff * -1).toLocaleString() + '% decrease'

          return <span key={k}><br /><strong>{(base[k] | 0).toLocaleString()} ({diff}) {toCapitalCase(k)}</strong></span>
        })}
      </label>
    </fieldset>
  )
}

export default Form
