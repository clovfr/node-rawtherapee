const fs = require('fs')
const readline = require('readline')

const paramParser = (line) => {
  switch (true) {
    case line === 'true': return true
    case line === 'false': return false
    case line === 'null': return null
    case /^[0-9-]+\.?[0-9]*$/.test(line): return Number(line)
    case /;/.test(line):
      line = line.split(';')
      line.pop()
      return line.map(l => paramParser(l))
    default: return line
  }
}

const paramReducer = (acc, cur, idx, src) => {
  if (/^_/.test(cur)) return acc
  switch (typeof src[cur]) {
    case 'object':
      if (Array.isArray(src[cur])) acc += `${cur}=${src[cur].join(';')};\n`
      else {
        acc += `\n[${cur}]\n`
        acc += Object.keys(src[cur]).reduce((acc0, cur0, idx0) => paramReducer(acc0, cur0, idx0, src[cur]), '')
      }
      break
    default:
      acc = `${cur}=${String(src[cur])}\n` + acc
  }
  return acc
}

class PP3 {
  static load (file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('Filename is mandatory.'))
      if (!fs.existsSync(file)) return reject(new Error(`${file} didn't exists.`))
      if (!/\.pp3$/i.test(file)) return reject(new Error('Filename have a bad extension.'))
      const rl = readline.createInterface({
        input: fs.createReadStream(file),
        output: process.stdout,
        terminal: false
      })
      let rub
      const tree = {}
      rl.on('line', (line) => {
        const isRub = /^\[(.+)\]$/.exec(line)
        if (isRub) {
          rub = isRub[1]
          tree[rub] = {}
        }
        const isParam = /^(.+)=(.+)$/.exec(line)
        if (isParam) {
          const p = paramParser(isParam[2].trim())
          if (rub) tree[rub][isParam[1].trim()] = p
          else tree[isParam[1].trim()] = p
        }
      })
      rl.on('close', () => {
        const out = new PP3(tree)
        out._pp3 = {
          source: {
            url: file,
            date: new Date()
          }
        }
        resolve(out)
      })
    })
  }

  constructor (tree) {
    if (tree) {
      Object.keys(tree).forEach(k => {
        this[k] = tree[k]
      })
    }
  }

  toString () {
    return Object.keys(this).reduce((acc, cur, idx) => paramReducer(acc, cur, idx, this), '')
  }

  save (file) {
    return new Promise((resolve, reject) => {
      if (!file && (!this._pp3 || this._pp3.source || this._pp3.source.url)) return reject(new Error('You need to specify an output destination.'))
      if (!file) file = this._pp3.source.url
      const out = this.toString()
      fs.writeFileSync(file, out, 'utf8')
      if (!this._pp3) this._pp3 = {}
      if (!this._pp3.saved) this._pp3.saved = []
      this._pp3.saved.push({
        url: file,
        date: new Date()
      })
      resolve(out)
    })
  }
}

module.exports = PP3
