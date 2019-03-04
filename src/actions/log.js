// @flow
export const logError = text =>
  addActionLogItem({
    level: 'error',
    text
  })

export const addActionLogItem = item => {
  const payload = typeof item === 'string' ? {text: item} : item

  return {
    type: 'add action log item',
    payload: {
      createdAt: new Date(),
      level: 'info',
      ...payload
    }
  }
}
