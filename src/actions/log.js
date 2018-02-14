// @flow
export const addActionLogItem = (item: string) => {
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
