const canvasSize = {height: 512, width: 512}

function getCoordinates (map) {
  const bounds = map.getBounds()

  return [
    bounds.getNorthWest().toArray(),
    bounds.getNorthEast().toArray(),
    bounds.getSouthEast().toArray(),
    bounds.getSouthWest().toArray()
  ]
}

function long2tile (lon, zoom) { return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom))) }
function lat2tile (lat, zoom) { return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))) }

function useCanvas (map, grids, drawOpportunityDatasets) {
  const canvasRef = React.useRef(null)

  useIfExists(() => {
    grids.forEach(grid => {
      const id = `grid-${grid.name}`
      const source = map.getSource(id)

      if (!source) {
        map.showTileBoundaries = true

        map.on('move', () => {
          const nw = map.getBounds()
          const z = map.getZoom()
        })

        map.addSource(id, {
          animate: false,
          type: 'canvas',
          canvas: canvasRef.current,
          coordinates: getCoordinates(map),
          dimensions: [0, 0, canvasSize.height, canvasSize.width]
        })

        map.addLayer({
          id,
          type: 'raster',
          source: id,
          paint: {
            'raster-fade-duration': 0
          }
        })
      }
    })
  }, [map, grids])

  return [canvasRef]
}
