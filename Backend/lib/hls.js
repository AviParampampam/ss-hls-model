const { join } = require('path')
const fs = require('fs')
const { exec, spawn } = require('child_process')
const { getRandomInt, killTree } = require(join(__dirname, 'helper'))
const FfmpegCommand = require('fluent-ffmpeg')

const DURATION = 2
const FPS = 20
const ANALYZEDURATION = 1000000
const PROBESIZE = 1000000
const STIMEOUT = 12000000
const BITRATE = 357564416
const PATH = join(__dirname, '../.recording')
const CRF = 18
const SEGMENT_WRAP = 8
const SEGMENT_LIST_SIZE = 3

class Hls {
  constructor (cam) {
    this.cam = cam

    this._ffmpeg = null
    this.status = false
  }

  /*
   * Запуск процесса ретрансляции
   *
   * Для начала из аругмента options определяются параметры для запуска
   * процесса ретрансляции. В случае, если каике-то параметры
   * не были заданы - берется значения по умолчанию
   */
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
      this._segmentListPath = join(this._path, this.cam.id, 'list.m3u8')
      this._segmentsPath = join(this._path, this.cam.id, 's%d.ts')

      this._mkDir()

      // Конфигурация процесса ретрансляции стрима
      this._ffmpeg = FfmpegCommand()
      	.input(this.cam.rtsp)
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
          this.status = true
        })
        .on('codecData', (data) => {
        })
        .on('progress', (progress) => {
        })
        .on('stderr', (stderrLine) => {
        })
        .on('error', (err, stdout, stderr) => {
          this.status = false
          this._rmDir()
        })
        .on('end', (stdout, stderr) => {
          this.status = false
          this._rmDir()
        })

      this._ffmpeg.run()
    } else {
      throw 'Процесс уже запущен!'
    }
  }

  /*
   * Остановка ретрансляции
   *
   * Убийство процесса c ретрансляцией. Последующие
   * действия выполняются после получения сигнала об остановке
   * самом процессом.
   */
  stop () {
    return this._ffmpeg.ffmpegProc.kill()
  }

  /**
   * Создание директории для ретрансляции
   *
   * Сначала происходит попытка создать директорию для
   * хранения списка сегментов, далее происходит попытка
   * создать директорию для самих сегментов.
   * Если директория уже создана - она удаляется.
   * Допускается случай, когда эти директории объединены в одну.
   */
  _mkDir () {
    this._rmDir()
    try {
      fs.mkdirSync(join(this._segmentListPath, '..'), {recursive: true})
    } catch(e) {
      if (e.code !== 'EEXIST') throw e
    }
    try {
      fs.mkdirSync(join(this._segmentsPath, '..'), {recursive: true})
    } catch(e) {
      if (e.code !== 'EEXIST') throw e
    }
  }

  /**
   * Удаление директории с ретрансляцией
   *
   * Сначала происходит попытка удаления директории, в которой
   * хранится список сегментов, далее попытка удаления директории
   * с самими сегментами.
   * Допускается случай, когда эти директории объединены в одну.
   */
  _rmDir () {
    try {
      fs.rmdirSync(join(this._segmentListPath, '..'), {recursive: true})
    } catch(e) {
      if (e.code !== 'ENOENT') throw e
    }
    try {
      fs.rmdirSync(join(this._segmentsPath, '..'), {recursive: true})
    } catch(e) {
      if (e.code !== 'ENOENT') throw e
    }
  }
}

module.exports = Hls
