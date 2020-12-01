const fs = require('fs')
const { spawn } = require('child_process')

const defaultOptions = {
  replace: false,
  allFormats: false,
  presets: ['default'],
  ignoreBadPreset: false,
  output: '.',
  format: 'jpg',
  depth: 8,
  compression: 90,
  subSampling: 2,
  zip: false,
  onChange: () => {}
}

const o2cli = (options) => {
  const params = ['-q']
  const {
    replace,
    allFormats,
    presets,
    ignoreBadPreset,
    output,
    format,
    compression,
    subSampling,
    zip,
    depth
  } = options
  if (replace) params.push('-Y')
  if (allFormats) params.push('-a')
  if (presets || presets.length) {
    presets.forEach((preset) => {
      switch (preset) {
        case 'default':
          return params.push('-d')
        case 'sidecar':
          return params.push('-s')
        case 'sidecar-strict':
          return params.push('-S')
        default:
          if (!fs.existsSync(preset)) {
            const err = new Error(`Preset '${preset}' not found.`)
            if (!ignoreBadPreset) throw err
            else if (process.env.DEBUG) console.error(err)
          } else {
            params.push('-p')
            params.push(preset)
          }
      }
    })
  }
  if (format) {
    switch (format.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        params.push(`-j${compression || ''}`)
        if (subSampling) {
          switch (subSampling) {
            case '4:2:0':
            case 1:
              params.push('-js1')
              break
            case '4:2:2':
            case 2:
              params.push('-js2')
              break
            case '4:4:4':
            case 3:
              params.push('-js3')
              break
            default:
              console.warn(
                `Warning: subSampling '${subSampling}' is unknown. Option is ignored, 'rawtherapee-cli' will use his own default (4:2:2).`
              )
          }
        }
        break
      case 'png':
        params.push('-n')
        break
      case 'tif':
      case 'tiff':
        params.push(`-t${zip && 'z'}`)
        break
    }
  }
  if (depth) params.push(`-b${depth}`)
  if (output) {
    params.push('-o')
    params.push(output)
  }
  return params
}

const rawtherapee = (file, options = {}) => {
  options = { ...defaultOptions, ...options }
  const { onChange } = options
  return new Promise((resolve, reject) => {
    let ckf = file
    let filename
    if (!Array.isArray(file)) ckf = [file]
    if ((filename = ckf.find((fl) => !fs.existsSync(fl)))) {
      return reject(new Error(`File ${filename} not found`))
    }
    const params = o2cli(options)
    params.push('-c')
    params.push(file)
    const rwtp = spawn('rawtherapee-cli', params)

    const files = []

    rwtp.stdout.on('data', (buf) => {
      const data = buf.toString('utf8')
      let ipath = /Processing: (.+)$/im.exec(data)
      if (ipath) {
        if (files.length) {
          onChange({
            status: 'complete',
            file: files[files.length - 1]
          })
        }
        files.push(ipath[1])
        onChange({
          status: 'processing',
          file: ipath[1]
        })
      }
      if (!ipath) {
        ipath = /^RawTherapee, version ([0-9.]+), command line./im.exec(data)
        if (ipath) {
          onChange({
            status: 'start',
            version: ipath[1]
          })
        }
      }
      if (!ipath) {
        ipath = /^"(.+)".*image skipped/im.exec(data)
        if (ipath) {
          onChange({
            status: 'skipped',
            file: ipath[1]
          })
        }
      }
      if (!ipath && process.env.DEBUG) console.warn('not handled', data)
    })

    rwtp.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`)
      reject(new Error(data))
    })
    rwtp.on('error', (data) => {
      console.error(`error: ${data}`)
      reject(new Error(data))
    })

    rwtp.on('close', (code) => {
      if (code > 0) return reject(new Error(`rawtherapee-cli process exited with code ${code}`))
      if (files.length) {
        onChange({
          status: 'complete',
          file: files[files.length - 1]
        })
      }
      onChange({ status: 'idle', code })
      resolve(files)
    })
  })
}

module.exports = rawtherapee
module.exports.PP3 = require('./src/lib/pp3.js')
