/* global jest */
const ReactLeaflet = require.requireActual('react-leaflet')
const ReactLeafletMock = jest.genMockFromModule('react-leaflet')

ReactLeaflet.ZoomControl = ReactLeafletMock.ZoomControl

module.exports = ReactLeaflet
