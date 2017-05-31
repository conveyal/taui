// @flow
export default function rafPromise () {
  return new Promise((resolve, reject) => window.requestAnimationFrame(resolve))
}
