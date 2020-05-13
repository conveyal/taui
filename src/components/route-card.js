import {Box, Flex, Switch} from '@chakra-ui/core'
import React from 'react'
import {useDispatch} from 'react-redux'

import {setNetwork} from '../actions/network'

export default function RouteCard(p) {
  const dispatch = useDispatch()
  const [showOnMap, setShowOnMap] = React.useState(p.network.showOnMap)

  function onSwitchChange(e) {
    setShowOnMap(e.target.checked)
    dispatch(setNetwork({...p.network, showOnMap: e.target.checked}))
  }

  return (
    <div className='Card'>
      <Flex
        justify='space-between'
        backgroundColor={p.cardColor}
        color='white'
        p='1rem'
        roundedTop='4px'
      >
        <Box>{p.title}</Box>
        <Switch color='gray' onChange={onSwitchChange} isChecked={showOnMap} />
      </Flex>
      <table className='CardContent'>{p.children}</table>
    </div>
  )
}
