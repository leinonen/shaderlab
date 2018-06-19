export const loadState = () => {
  let item = localStorage.getItem('state')
  if (item) {
    return JSON.parse(item)
  } else {
    return undefined
  }
}

export const saveState = (state) => {
  try {
    let serializedState = JSON.stringify(state)
    localStorage.setItem('state', serializedState)
  } catch(err) {
    console.log('Unable to save state')
  }
}
