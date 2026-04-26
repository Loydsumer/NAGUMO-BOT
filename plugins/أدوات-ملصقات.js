import { sticker, addExif } from '../lib/sticker.js'
import axios from 'axios'
import fetch from 'node-fetch'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const fetchSticker = async (text, attempt = 1) => {
    try {
        const response = await axios.get(`https://skyzxu-brat.hf.space/brat`, { params: { text }, responseType: 'arraybuffer' })
        return response.data
    } catch (error) {
        if (error.response?.status === 429 && attempt <= 3) {
            const retryAfter = error.response.headers['retry-after'] || 5
            await delay(retryAfter * 1000)
            return fetchSticker(text, attempt + 1)
        }
        throw error
    }
}

const fetchStickerVideo = async (text) => {
    const response = await axios.get(`https://skyzxu-brat.hf.space/brat-animated`, { params: { text }, responseType: 'arraybuffer' })
    if (!response.data) throw new Error('👻 مشكلة في السيرفر يا رفيقي.')
    return response.data
}

const handler = async (m, { conn, text, args, command, usedPrefix }) => {
    try {
        let userId = m.sender
        let packstickers = global.db.data.users[userId] || {}
        let texto1 = packstickers.text1 || global.packsticker
        let texto2 = packstickers.text2 || global.packsticker2
        
        // 👻 تحديد الرسالة بناء على الأمر المستخدم
        let commandInfo = {
            'brat': { name: 'ملصق', desc: 'صنع ملصق من نص' },
            'ملصق': { name: 'ملصق', desc: 'صنع ملصق من نص' },
            'bratv': { name: 'ملصق_متحرك', desc: 'صنع ملصق متحرك من نص' },
            'ملصق_متحرك': { name: 'ملصق_متحرك', desc: 'صنع ملصق متحرك من نص' },
            'qc': { name: 'اقتباس', desc: 'صنع ملصق اقتباس' },
            'اقتباس': { name: 'اقتباس', desc: 'صنع ملصق اقتباس' },
            'take': { name: 'حقوق', desc: 'حقوق بيانات الملصق' },
            'wm': { name: 'حقوق', desc: 'حقوق بيانات الملصق' },
            'حقوق': { name: 'حقوق', desc: 'حقوق بيانات الملصق' },
            'robar': { name: 'حقوق', desc: 'حقوق بيانات الملصق' }
        }

        let currentCommand = commandInfo[command] || { name: command, desc: 'صنع ملصق' }

        switch (command) {
            case 'brat':
            case 'ملصق': {
                text = m.quoted?.text || text
                if (!text) return conn.sendMessage(m.chat, { 
                    text: `👻 *يا رفيقي* ❌\n\nرد على رسالة نصية أو اكتب نص عشان أصنع لك ملصق\n\n👻 *مثال:*\n*${usedPrefix}ملصق* اوغامي بوت` 
                }, { quoted: m })
                
                await m.react('🕒')
                const buffer = await fetchSticker(text)
                const stiker = await sticker(buffer, false, texto1, texto2)
                if (!stiker) throw new Error('👻 ما قدرت أصنع الملصق يا رفيقي')
                
                await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
                await m.react('✅')
                break
            }

            case 'bratv':
            case 'ملصق_متحرك': {
                text = m.quoted?.text || text
                if (!text) return conn.sendMessage(m.chat, { 
                    text: `👻 *يا رفيقي* ❌\n\nرد على رسالة نصية أو اكتب نص عشان أصنع لك ملصق متحرك\n\n👻 *مثال:*\n*${usedPrefix}ملصق_متحرك* اوغامي بوت` 
                }, { quoted: m })
                
                await m.react('🕒')
                const videoBuffer = await fetchStickerVideo(text)
                const stickerBuffer = await sticker(videoBuffer, null, texto1, texto2)
                await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
                await m.react('✅')
                break
            }

            case 'qc':
            case 'اقتباس': {
                let textFinal = args.join(' ') || m.quoted?.text
                if (!textFinal) return conn.reply(m.chat, 
                    `👻 *يا رفيقي* 📝\n\nاكتب النص الي تبي تعمله اقتباس\n\n👻 *مثال:*\n*${usedPrefix}اقتباس* كلمتي قانون`
                , m)
                
                let target = m.quoted ? await m.quoted.sender : m.sender
                const pp = await conn.profilePictureUrl(target).catch((_) => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
                const nombre = await (async () => global.db.data.users[target].name || (async () => { 
                    try { 
                        const n = await conn.getName(target); 
                        return typeof n === 'string' && n.trim() ? n : target.split('@')[0] 
                    } catch { 
                        return target.split('@')[0] 
                    } 
                })())()
                
                const mentionRegex = new RegExp(`@${target.split('@')[0]}`, 'g')
                let frase = textFinal.replace(mentionRegex, '')
                
                if (frase.length > 30) return await m.react('❌'), conn.reply(m.chat, 
                    `👻 *يا رفيقي* ⚠️\n\nالنص ما يقدر يكون أكثر من 30 حرف\n\nالنص الحالي: *${frase.length}* حرف`
                , m)
                
                await m.react('🕒')
                const quoteObj = { 
                    type: 'quote', 
                    format: 'png', 
                    backgroundColor: '#000000', 
                    width: 512, 
                    height: 768, 
                    scale: 2, 
                    messages: [{ 
                        entities: [], 
                        avatar: true, 
                        from: { 
                            id: 1, 
                            name: nombre, 
                            photo: { url: pp } 
                        }, 
                        text: frase, 
                        replyMessage: {} 
                    }]
                }
                
                const json = await axios.post('https://bot.lyo.su/quote/generate', quoteObj, { headers: { 'Content-Type': 'application/json' }})
                const buffer = Buffer.from(json.data.result.image, 'base64')
                const stiker = await sticker(buffer, false, texto1, texto2)
                
                if (stiker) {
                    await m.react('✅')
                    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
                }
                break
            }

            case 'take': 
            case 'wm': 
            case 'حقوق': 
            case 'robar': {
                if (!m.quoted) return m.reply(
                    `👻 *يا رفيقي* 🎭\n\nرد على الملصق الي تبي تغير بياناته\n\n👻 *مثال:*\n*${usedPrefix}حقوق* اوغامي_بوت|اوغامي`
                )
                
                await m.react('🕒')
                const stickerData = await m.quoted.download()
                if (!stickerData) return await m.react('❌'), m.reply('👻 ما قدرت أحمل الملصق يا رفيقي')
                
                const parts = text.split(/[\u2022|]/).map(p => p.trim())
                const nuevoPack = parts[0] || texto1
                const nuevoAutor = parts[1] || texto2
                const exif = await addExif(stickerData, nuevoPack, nuevoAutor)
                
                await conn.sendMessage(m.chat, { sticker: exif }, { quoted: m })
                await m.react('✅')
                break
            }
        }
    } catch (e) {
        await m.react('❌')
        conn.sendMessage(m.chat, { 
            text: `👻 *يا رفيقي* ⚠️\n\nصارت مشكلة في النظام\nاستخدم *${usedPrefix}بلاغ* عشان تبلغ عنها\n\n${e.message}` 
        }, { quoted: m })
    }
}

// 👻 الأوامر العربية والإنجليزية (تم إزالة دمج)
handler.tags = ['sticker']
handler.help = [
    'brat', 'bratv', 'qc', 'take', 'wm', 'robar',
    'ملصق', 'ملصق_متحرك', 'اقتباس', 'حقوق'
]
handler.command = [
    'brat', 'bratv', 'qc', 'take', 'wm', 'robar',
    'ملصق', 'ملصق_متحرك', 'اقتباس', 'حقوق'
]

export default handler