// @flow
import React from 'react'

export default function TrAlert (props) {
  return <tbody><tr className='alert'>
    <td><span className='fa fa-exclamation-circle' /></td>
    <td>{props.children}</td>
  </tr></tbody>
}
