import {faCog} from '@fortawesome/free-solid-svg-icons'
import Cookies from 'js-cookie'
import React from 'react'

import Icon from './icon'

// Example config
const exampleConfigLink =
  'https://github.com/conveyal/taui/blob/aa9e6285002d59b4b6ae38890229569311cc4b6d/config.json.tmp'

export default function ConfigCard(p) {
  const ref = React.useRef(null)
  const onClick = React.useCallback(() => {
    try {
      const json = JSON.parse(ref.current.value)
      Cookies.set('tauiConfig', json)
      window.location.reload(true)
    } catch (e) {
      console.error(e)
      window.alert('Invalid JSON!')
    }
  })
  const defaultValue = JSON.stringify(p.cookieConfig || {}, null, '  ')

  return (
    <div className="Card">
      <div className="CardTitle">
        <Icon icon={faCog} /> Configure
        <div className="CardLinks">
          <a onClick={onClick} title="Update config and reload the page">
            save config
          </a>
        </div>
      </div>
      <div className="CardContent">
        <br />
        <a href={exampleConfigLink} target="_blank">
          See example config
        </a>
      </div>
      <textarea ref={ref} defaultValue={defaultValue} />
    </div>
  )
}
