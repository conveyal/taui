import React from 'react'

import Icon from './icon'

export default function TrAlert(props) {
  return (
    <tbody>
      <tr className="alert">
        <td>
          <Icon icon="exclamation-circle" />
        </td>
        <td>{props.children}</td>
      </tr>
    </tbody>
  )
}
