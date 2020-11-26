const { join } = require('path')
const fs = require('fs')
const { exec, spawn } = require('child_process')
const {
  getRandomInt,
  killTree
} = require(join(__dirname, 'helper'))
const FfmpegCommand = require('fluent-ffmpeg')

const DURATION = 2
const FPS = 20
const ANALYZEDURATION = 1000000
const PROBESIZE = 1000000
const STIMEOUT = 12000000
const BITRATE = 357564416
const PATH = join(__dirname, '../.recording')
const CRF = 23
const SEGMENT_WRAP = 8
const SEGMENT_LIST_SIZE = 4

module.exports = class {
  constructor (cam) {
    this._camId = cam.id
    this._src = cam.rtsp

    this._process = null
    this.status = false
  }

  run (options = {}) {
    if (!this.status) {
      this._duration = options.duration || DURATION
      this._fps = options.fps || FPS
      this._analyzeduration = options.analyzeduration || ANALYZEDURATION
      this._probesize = options.probesize || PROBESIZE
      this._stimeout = options.stimeout || STIMEOUT
      this._bitrate = options.bitrate || BITRATE
      this._path = options.path || PATH
      this._crf = options.crf || CRF
      this._segmentWrap = options.segmentWrap || SEGMENT_WRAP
      this._segmentListSize = options.segmentListSize || SEGMENT_LIST_SIZE
      this._segmentListPath = join(this._path, this._camId, 'list.m3u8')
      this._segmentsPath = join(this._path, this._camId, 's%d.ts')

      this._genDir()

      this._process = FfmpegCommand()
      	.input(this._src)
        .inputFPS(25)
      	.inputFormat('rtsp')
        .addInputOption('-rtsp_transport tcp')
        .addInputOption(`-stimeout ${this._stimeout}`)
        .addInputOption(`-analyzeduration ${this._analyzeduration}`)
      	.addInputOption(`-probesize ${this._probesize}`)
      	.noAudio()
      	.format('segment')
      	.videoCodec('copy')
      	.videoBitrate(this._bitrate)
        .addOutputOption('-copyts')
        .addOutputOption(`-crf ${this._crf}`)
        .addOutputOption('-movflags frag_keyframe+empty_moov')
      	.addOutputOption([
      		'-hls_flags delete_segments+append_list',
      		'-segment_format mpegts',
      		`-segment_wrap ${this._segmentWrap}`,
      		'-segment_list_flags live',
      		`-segment_list ${this._segmentListPath}`,
      		`-segment_time ${this._duration}`,
      		`-segment_list_size ${this._segmentListSize}`,
      		'-segment_list_type m3u8'
      	])
      	.output(this._segmentsPath)

        .on('start', (cmd) => {
          // ..
        })
        .on('codecData', (data) => {
          // ..
        })
        .on('progress', (progress) => {
          // ..
        })
        .on('stderr', (stderrLine) => {
          // ..
        })
        .on('error', (err, stdout, stderr) => {
          this.status = false
        })
        .on('end', (stdout, stderr) => {
          this.status = false
        })

      this._process.run()
      this.status = true
    } else {
      throw 'Процесс уже запущен!'
    }
  }

  stop () {
    /*
    if (this.status) {
      let attempt = 12
      do {
          this._process.stdin.pause()
          this._process.stdout.pause()
          this._process.stderr.pause()
          this._process.kill()
          if (!this._process.killed) {
            killTree(this._process.pid)
          }

          if (!attempt--) throw 'Не удалось остановить процесс'
      } while (!this._process.killed)

      this.status = false
      this._rmDir()
    } else {
      this._rmDir()

      throw new Error('Процесс не был запущен!')
    }
    */
  }

  _genDir () {
    try {
      fs.mkdirSync(join(this._segmentListPath, '..'), {recursive: true})
    } catch(e) {
      if (e.code !== 'EEXIST') {
        throw e
      }
    }

    try {
      fs.mkdirSync(join(this._segmentsPath, '..'), {recursive: true})
    } catch(e) {
      if (e.code !== 'EEXIST') {
        throw e
      }
    }
  }

  _rmDir () {
    try {
      fs.rmdirSync(join(this._segmentListPath, '..'), {recursive: true})
    } catch(e) {
      if (e.code !== 'ENOENT') {
        throw e
      }
    }

    try {
      fs.rmdirSync(join(this._segmentsPath, '..'), {recursive: true})
    } catch(e) {
      if (e.code !== 'ENOENT') {
        throw e
      }
    }
  }
}
