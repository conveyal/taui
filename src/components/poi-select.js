import memoize from 'lodash/memoize'
import React from 'react'
import Select from 'react-virtualized-select'
import createFilterOptions from 'react-select-fast-filter-options'

import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'

const cfo = memoize(o => createFilterOptions({options: o}))

export default function PoiSelect(p) {
  return (
    <Select
      {...p} // clearable, onChange, options, placeholder, value
      filterOptions={cfo(p.options)}
    />
  )
}
