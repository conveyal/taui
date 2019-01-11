import get from 'lodash/get'
import getConfig from 'next/config'

const configs = getConfig()

export default get(configs, 'publicRuntimeConfig', {})
