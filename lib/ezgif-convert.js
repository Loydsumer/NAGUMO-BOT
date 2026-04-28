import { FormData } from 'formdata-node'
import axios from 'axios'

const linksConvert = {"video-gif":{"url":"https://ezgif.com/video-to-gif","params":{"start":0,"end":10,"size":"original","fps":10,"method":"ffmpeg"},"req_params":[],"split":{"start":"<img src=\"","end":"\" style=\"width:"},"either_params":[]},"gif-mp4":{"url":"https://ezgif.com/gif-to-mp4","params":{"convert":"Convert GIF to MP4!"},"req_params":[],"split":{"start":"\" controls><source src=\"","end":"\" type=\"video/mp4\">Your browser"},"either_params":[]},"webp-mp4":{"url":"https://ezgif.com/webp-to-mp4","params":{},"req_params":[],"split":{"start":"\" controls><source src=\"","end":"\" type=\"video/mp4\">Your browser"},"either_params":[]},"webp-png":{"url":"https://ezgif.com/webp-to-png","params":{},"req_params":[],"split":{"start":"<img src=\"","end":"\" style=\"width:"},"either_params":[]},"webp-jpg":{"url":"https://ezgif.com/webp-to-jpg","params":{},"req_params":[],"split":{"start":"\"small button danger\" href=\"","end":"\">Download all files as ZIP archive"},"either_params":[]},"webp-gif":{"url":"https://ezgif.com/webp-to-gif","params":{},"req_params":[],"split":{"start":"<img src=\"","end":"\" style=\"width:"},"either_params":[]},"webp-avif":{"url":"https://ezgif.com/webp-to-avif","params":{},"req_params":[],"split":{"start":"<img src=\"","end":"\" style=\"width:"},"either_params":[]}}

async function convert(fields) {
    if (typeof fields === 'string' && fields?.toLowerCase() === 'list') return Object.keys(linksConvert)
    let type = linksConvert?.[fields?.type]
    if (!type) throw new Error(`Invalid conversion type "${fields?.type}"`)
    let form = new FormData()
    if (fields?.file) {
        if (!fields.filename) throw new Error('filename must be provided')
        form.append('new-image', fields.file, { filename: fields.filename })
    } else if (fields?.url) {
        form.append('new-image-url', fields.url)
    } else throw new Error('Either file or url field is required.')
    delete fields.type; delete fields.file; delete fields.filename; delete fields.url
    let link = await axios({ method: 'post', url: type.url, headers: { 'Content-Type': 'multipart/form-data' }, data: form })
        .catch(e => { throw new Error(e.response ? JSON.stringify({ statusCode: e.response.status, data: e.response.data }) : 'Unknown error') })
    let redir = String(link?.request?.res?.responseUrl)
    if (!redir) throw new Error('Oops! Something unknown happened!')
    let id = redir.split('/')[redir.split('/').length - 1]
    type.params.file = id
    let image = await axios({ method: 'post', url: `${redir}?ajax=true`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: new URLSearchParams({ ...type.params, ...fields }) })
        .catch(e => { throw new Error(e.response ? JSON.stringify({ statusCode: e.response.status, data: e.response.data }) : 'Unknown error') })
    let img_url = `https:${(image?.data?.toString()?.split(type.split.start)?.[1]?.split(type.split.end)?.[0])?.replace('https:', '')}`
    if (img_url.includes('undefined')) throw new Error('Something unknown happened')
    return img_url
}

export { convert }
