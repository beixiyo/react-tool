/* eslint-disable */
// importScripts('https://cdn.jsdelivr.net/npm/fflate@0.7.4/umd/index.min.js')
import { isLikelyText, detectFileType } from '@jl-org/tool'
// import * as fflate from 'fflate'

/**
 * 临时演示，不安装
 */
const fflate = { unzip: () => { } }

/**
 * @param {MessageEvent<any>} e
 */
self.onmessage = async (e) => {
  const { type, arrayBuffer } = e.data

  if (type === 'unzip') {
    try {
      const result = await unzip(arrayBuffer)
      self.postMessage({
        type: 'result',
        data: result
      })
    }
    catch (error) {
      self.postMessage({
        type: 'error',
        data: error.message
      })
    }
  }
}

/**
 * @typedef {Object} UnzippedFile
 * @property {string} name - 文件名
 * @property {string} data - 文件内容(Base64或文本)
 * @property {boolean} isText - 是否为文本文件
 * @property {boolean} [isImage] - 是否为图片文件(可选)
 * @property {string | null} [mimeType] - MIME类型(可选)
 * @property {number} originalSize - 原始文件大小(字节)
 */

/**
 * 使用 fflate 库解压 ZIP 文件
 * @param {ArrayBuffer} arrayBuffer - ZIP 文件的 ArrayBuffer
 * @returns {Promise<UnzippedFile[]>} 解压后的文件数组
 */
async function unzip(arrayBuffer) {
  return new Promise(async (resolve, reject) => {
    const files = []
    let processed = 0
    let totalFiles = 0

    fflate.unzip(new Uint8Array(arrayBuffer), async (err, unzipped) => {
      if (err) return reject(err)

      totalFiles = Object.keys(unzipped).length

      for (const [name, data] of Object.entries(unzipped)) {
        const fileInfo = await processFile(name, data)
        files.push(fileInfo)

        processed++

        if (processed % 5 === 0 || processed === totalFiles) {
          const progress = Math.round((processed / totalFiles) * 100)
          self.postMessage({
            type: 'progress',
            data: progress
          })
        }
      }

      resolve(files)
    })
  })
}

/**
* 处理单个文件，自动检测文件类型
* @param {string} name - 文件名
* @param {Uint8Array} uint8Array - 文件数据
* @returns {Promise<UnzippedFile>} 处理后的文件信息
*/
async function processFile(name, uint8Array) {
  let { isText, isImage, mimeType } = await detectFileType(uint8Array)
  const originalSize = uint8Array.length

  let data
  if (isText) {
    // 尝试解码为UTF-8文本
    const decoder = new TextDecoder('utf-8', { fatal: false })
    data = decoder.decode(uint8Array)

    // 如果解码后大部分是控制字符，可能不是真正的文本文件
    if (!isLikelyText(data)) {
      data = arrayBufferToBase64(uint8Array.buffer)
      isText = false
    }
  }
  else {
    data = arrayBufferToBase64(uint8Array.buffer)
  }

  return {
    name,
    data,
    isText,
    isImage,
    mimeType,
    originalSize
  }
}

/**
* 将 ArrayBuffer 转为 Base64
* @param {ArrayBuffer} buffer - 二进制数据
* @returns {string} Base64编码字符串
*/
function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return self.btoa(binary)
}
