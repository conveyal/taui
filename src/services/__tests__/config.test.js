import configure from '../config'

describe('Services > Config', () => {
  it('should work with no data', async () => {
    await configure()
  })

  it('should correctly load all data', async () => {
    const data = await configure({}, {}, {
      networks: [{
        url: '' // add test data
      }],
      grids: [{
        url: '' // add test data
      }]
    })

    console.log(data)
  })
})
