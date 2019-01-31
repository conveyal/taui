// For usage with MapboxGL
export default (svg) => {
  const image = new Image(512, 512)
  image.src = 'data:image/svg+xml;charset=utf-8;base64,' + btoa(svg)
  return image
}
