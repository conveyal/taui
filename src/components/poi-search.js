import React from 'react'

import message from '../message'

import PoiSelect from './poi-select'

export default function PoiSearch (p) {
  return (
    <>
      <PoiSelect
        clearable={false}
        options={p.poi}
        onChange={p.updateStart}
        placeholder={message('Geocoding.StartPlaceholder')}
        value={p.start}
      />
      {p.start && (
        <PoiSelect
          options={p.poi}
          onChange={p.updateEnd}
          placeholder={message('Geocoding.EndPlaceholder')}
          value={p.end}
        />
      )}
    </>
  )
}
