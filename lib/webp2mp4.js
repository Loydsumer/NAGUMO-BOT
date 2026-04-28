import { convert } from './ezgif-convert.js'
import { Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import crypto from 'crypto'

const randomBytes = crypto.randomBytes(5).toString('hex')
const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/

async function webp2mp4(source) {
    const isUrl = typeof source === 'string' && urlRegex.test(source)
    for (const type of ['webp-mp4', 'webp-avif', 'webp-gif']) {
        try {
            return await convert({
                type,
                ...(isUrl ? { url: source } : {
                    file: new Blob([source]),
                    filename: randomBytes + '.' + (await fileTypeFromBuffer(source)).ext
                })
            })
        } catch (e) { console.error(`Error converting ${type}:`, e.message) }
    }
    throw new Error('All webp conversion types failed')
}

async function webp2png(source) {
    const isUrl = typeof source === 'string' && urlRegex.test(source)
    for (const type of ['webp-png', 'webp-jpg']) {
        try {
            return await convert({
                type,
                ...(isUrl ? { url: source } : {
                    file: new Blob([source]),
                    filename: randomBytes + '.' + (await fileTypeFromBuffer(source)).ext
                })
            })
        } catch (e) { console.error(`Error converting ${type}:`, e.message) }
    }
    throw new Error('All webp-png conversion types failed')
}

export { webp2mp4, webp2png }
