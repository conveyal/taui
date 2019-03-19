import React from 'react'
import Modal from 'react-modal'

import {darkBlue} from '../constants'

import Icon from './icon'

Modal.setAppElement('body')

const modalStyle = {
  overlay: {
    zIndex: 100
  },
  content: {
    borderRadius: '8px',
    padding: '20px 30px',
    left: '50%',
    lineHeight: '1.5rem',
    marginLeft: '-400px',
    width: '800px'
  }
}

const imgStyle = {
  boxSizing: 'border-box',
  padding: '0 5rem',
  width: '100%'
}

const linkStyle = {
  border: `1px solid ${darkBlue}`,
  borderRadius: '10rem',
  color: darkBlue,
  cursor: 'pointer',
  display: 'inline-block',
  padding: '1rem 2rem',
  margin: '1rem 0'
}

const closeButton = {
  position: 'absolute',
  right: '30px',
  top: '20px',
  cursor: 'pointer',
  opacity: '0.8'
}

export default function InfoModal(props) {
  return (
    <Modal
      isOpen={true}
      onRequestClose={props.onRequestClose}
      style={modalStyle}
    >
      <a onClick={props.onRequestClose} style={closeButton}>
        <Icon icon='times' />
      </a>
      {props.title && <h1>{props.title}</h1>}
      {props.subtitle && <h4>{props.subtitle}</h4>}
      {props.image && <img style={imgStyle} src={props.image} />}
      <p style={{whiteSpace: 'pre-line'}}>{props.text}</p>
      <div style={{width: '100%', textAlign: 'center'}}>
        <a style={linkStyle} onClick={props.onRequestClose}>
          Back to the map
        </a>
      </div>
    </Modal>
  )
}
