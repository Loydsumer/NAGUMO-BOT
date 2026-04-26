import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) {
await conn.reply(m.chat, `👻 يرجى إدخال ما تريد البحث عنه في ويكيبيديا.\n\nمثال: ${usedPrefix}${command} اوغامي كورليوني`, m)
return
}
try {
await m.react('🕒')
const link = await axios.get(`https://ar.wikipedia.org/wiki/${encodeURIComponent(text)}`)
const $ = cheerio.load(link.data)
let wik = $('#firstHeading').text().trim()
let resulw = $('#mw-content-text > div.mw-parser-output').find('p').text().trim().substring(0, 1000) + '...'
await m.reply(`▢ *ويكيبيديا*\n\n‣ البحث: ${wik}\n\n${resulw}\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
await m.react('✔️')
} catch (e) {
await m.react('✖️')
await m.reply(`👻 حدث خطأ في البحث.\n> استخدم *${usedPrefix}ابلاغ* للإبلاغ عن المشكلة.\n\n${e.message}\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`, m)
}}

handler.help = ['wiki', 'wikipedia', 'ويكيبيديا']
handler.tags = ['tools']
handler.command = ['wiki', 'wikipedia', 'ويكيبيديا'] 
handler.group = true

export default handler