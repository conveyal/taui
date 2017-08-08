// @flow
import L from 'leaflet'

type IconOptions = {
  iconSize?: [number, number],
  iconAnchor?: [number, number],
  popupAnchor?: [number, number],
  shadowAnchor?: [number, number],
  shadowSize?: [number, number],
  className?: string,
  prefix?: string,
  spinClass?: string,
  extraClasses?: string,
  icon?: string,
  markerColor?: string,
  iconColor?: string
}

const Icon = L.Icon.extend({
  options: {
    iconSize: [35, 45],
    iconAnchor: [17, 42],
    popupAnchor: [1, -32],
    shadowAnchor: [10, 12],
    shadowSize: [36, 16],
    className: 'awesome-marker',
    prefix: 'fa',
    spinClass: 'fa-spin',
    extraClasses: '',
    icon: 'home',
    markerColor: 'blue',
    iconColor: 'white'
  },

  initialize: function (options) {
    options = L.Util.setOptions(this, options)
  },

  createIcon: function () {
    const div = document.createElement('div')
    const options = this.options

    if (options.icon) {
      div.innerHTML = this._createInner()
    }

    if (options.bgPos) {
      div.style.backgroundPosition =
        -options.bgPos.x + 'px ' + -options.bgPos.y + 'px'
    }

    this._setIconStyles(div, 'icon-' + options.markerColor)
    return div
  },

  _createInner: function () {
    let iconClass
    let iconSpinClass = ''
    let iconColorClass = ''
    let iconColorStyle = ''
    const options = this.options

    if (
      options.icon.slice(0, options.prefix.length + 1) ===
      options.prefix + '-'
    ) {
      iconClass = options.icon
    } else {
      iconClass = options.prefix + '-' + options.icon
    }

    if (options.spin && typeof options.spinClass === 'string') {
      iconSpinClass = options.spinClass
    }

    if (options.iconColor) {
      if (options.iconColor === 'white' || options.iconColor === 'black') {
        iconColorClass = 'icon-' + options.iconColor
      } else {
        iconColorStyle = "style='color: " + options.iconColor + "' "
      }
    }

    return `<i ${iconColorStyle} class="${options.extraClasses} ${options.prefix} ${iconClass} ${iconSpinClass} ${iconColorClass}"></i>`
  },

  _setIconStyles: function (img, name) {
    const options = this.options
    const size = L.point(options[name === 'shadow' ? 'shadowSize' : 'iconSize'])
    let anchor

    if (name === 'shadow') {
      anchor = L.point(options.shadowAnchor || options.iconAnchor)
    } else {
      anchor = L.point(options.iconAnchor)
    }

    if (!anchor && size) {
      anchor = size.divideBy(2, true)
    }

    img.className = 'awesome-marker-' + name + ' ' + options.className

    if (anchor) {
      img.style.marginLeft = -anchor.x + 'px'
      img.style.marginTop = -anchor.y + 'px'
    }

    if (size) {
      img.style.width = size.x + 'px'
      img.style.height = size.y + 'px'
    }
  },

  createShadow: function () {
    const div = document.createElement('div')

    this._setIconStyles(div, 'shadow')
    return div
  }
})

export default function (options: IconOptions) {
  if (process.env.NODE_ENV === 'test') {
    return {}
  }
  return new Icon(options)
}
