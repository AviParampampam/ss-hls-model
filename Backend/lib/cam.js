const { join } = require('path')
const Hls = require(join(__dirname, 'hls'))

class Camera {
  constructor (options) {
    if (options.id && options.key && options.title && options.rtsp) {
      this.id = options.id
      this.key = options.key
      this.title = options.title
      this.rtsp = options.rtsp

      this.hls = new Hls(this, options)
    } else {
      throw new Error('Не указан необходимый список опций')
    }
  }
}

module.exports = Camera
