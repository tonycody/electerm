/**
 * fs through ws
 */

import { generate } from 'shortid'
import initWs from './ws'

const fsFunctions = window.getGlobal('fsFunctions')
const id = generate()
let ws
let wsOpened = false

export const initFS = async () => {
  ws = await initWs('fs', id)
  wsOpened = true
  ws.onclose = () => {
    wsOpened = false
  }
}

export default fsFunctions.reduce((prev, func) => {
  prev[func] = async (...args) => {
    const uid = func + ':' + id
    if (!wsOpened) {
      await initFS()
    }
    return new Promise((resolve, reject) => {
      ws.s({
        id,
        func,
        args
      })
      ws.once((arg) => {
        if (arg.error) {
          log.error('fs error', arg.error.message)
          return reject(new Error(arg.error.message))
        }
        resolve(arg.data)
      }, uid)
    })
  }
  return prev
}, {})
