const allowedNumbers = [
  '201115546207@s.whatsapp.net', // الرقم الأول
  '963969829657@s.whatsapp.net'  // الرقم الثاني
]

let handler = async (m, { conn, text, usedPrefix, command }) => {

    // التحقق من أن المستخدم مسموح له باستخدام الأمر
    if (!allowedNumbers.includes(m.sender)) {
        return m.reply(`🚫┊✦ 𝑮𝑶 𝑩𝑨𝑪𝑲 ✦┊🚫
            
✦ عـذراً أيها المجهول، هـذا الأمـر ليس لك ❌`)
    }

    try {
        // تحديد الرسالة أو المقتبسة
        let cc = text ? m : m.quoted ? await m.getQuotedObj() : m
        let teks = text ? text : cc.text
        if (!cc) return m.reply('💔┊✦ لا يوجد رسالة لإرسالها')

        // جمع كل المجموعات والقنوات
        let allChats = Object.entries(conn.chats).filter(([jid]) => jid.endsWith('@g.us') || jid.endsWith('@broadcast'))
        let totalChats = allChats.length
        let targets = []
        let blacklisted = 0

        for (let [jid, chat] of allChats) {
            let isBlocked = !chat.isChats || chat.metadata?.read_only || chat.metadata?.announce || global.db.data.chats[jid]?.blpromosi
            if (isBlocked) {
                blacklisted++
                continue
            }
            targets.push(jid)
        }

        if (!targets.length) return m.reply('🚫┊✦ لا توجد مجموعات أو قنوات صالحة للبث')

        // رسالة استخدام
        let usage = `
✦━━━『 𝑩𝑹𝑶𝑨𝑫𝑪𝑨𝑺𝑻 』━━━✦

يمكنك إرسال رسالة جماعية لكل:
✔️ المجموعات
✔️ القنوات

استخدم:
\`${usedPrefix + command} رسالتك هنا\`

🅥🅘🅣🅞 🅒🅞🅡🅛🅔🅞🅝🅔  
✦ 𝑻𝒂𝒊𝒃 ┊ الـمـطـور ✦
`.trim()
        await m.reply(usage)

        // إرسال ملخص قبل البث
        await m.reply(`✦━━━『 📊 𝑺𝑻𝑨𝑻𝑼𝑺 』━━━✦

📦 إجمالي: ${totalChats}  
🔒 محجوبة: ${blacklisted}  
📡 سيتم الإرسال إلى: ${targets.length}`)

        // تجهيز اقتباس مزخرف
        const imageUrl = 'https://files.catbox.moe/l0c3c2.jpg'
        const getBufferFromUrl = async (url) => {
            let res = await fetch(url)
            let arrayBuffer = Buffer.from(await res.arrayBuffer())
            return Buffer.from(arrayBuffer)
        }
        const jpegThumbnail = await getBufferFromUrl(imageUrl)
        const qtoko = {
            key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
            message: { productMessage: { product: { productImage: { mimetype: 'image/jpeg', jpegThumbnail }, title: "🅥🅘🅣🅞 🅒🅞🅡🅛🅔🅞🅝🅔", description: null, currencyCode: 'USD', priceAmount1000: '1', retailerId: `© 𝑻𝒂𝒊𝒃`, productImageCount: 1 }, businessOwnerJid: '0@s.whatsapp.net' } }
        }

        // تنسيق الرسالة النهائي
        let finalText = `✦━━━『 𝑩𝑹𝑶𝑨𝑫𝑪𝑨𝑺𝑻 』━━━✦

${teks}

━━━━━━━━━━━━━━
🅥🅘🅣🅞 🅒🅞🅡🅛🅔🅞🅝🅔  
✦ 𝑻𝒂𝒊𝒃 ┊ الـمـطـور ✦`

        // إرسال الرسالة
        let success = 0
        let failed = 0
        for (let id of targets) {
            try {
                let type = cc.mtype || ''
                let content = cc.msg || {}
                let quoted = qtoko

                if (type === 'imageMessage') {
                    await conn.sendMessage(id, { image: await cc.download(), caption: finalText }, { quoted })
                } else if (type === 'videoMessage') {
                    await conn.sendMessage(id, { video: await cc.download(), caption: finalText }, { quoted })
                } else if (type === 'documentMessage') {
                    await conn.sendMessage(id, { document: await cc.download(), fileName: content.fileName || 'document', mimetype: content.mimetype || 'application/octet-stream', caption: finalText }, { quoted })
                } else if (type === 'audioMessage') {
                    let audioBuffer = await cc.download()
                    let isPTT = content.ptt === true
                    let mime = content.mimetype || (isPTT ? 'audio/ogg; codecs=opus' : 'audio/mpeg')
                    await conn.sendMessage(id, { audio: audioBuffer, mimetype: mime, ptt: isPTT, seconds: content.seconds || 60 }, { quoted })
                } else if (type === 'stickerMessage') {
                    await conn.sendMessage(id, { sticker: await cc.download() }, { quoted })
                } else {
                    await conn.sendMessage(id, { text: finalText }, { quoted })
                }

                success++
                await delay()
            } catch (err) {
                console.error(`[ERROR BCHT ${id}]:`, err)
                failed++
            }
        }

        // تقرير النهاية
        await m.reply(`✦━━━『 ✅ 𝑫𝑶𝑵𝑬 』━━━✦

📡 ناجحة: ${success}  
⚠️ فاشلة: ${failed}  
📦 المرسلة: ${targets.length}`)
    } catch (e) {
        console.error(e)
        m.reply(`❌ حدث خطأ أثناء البث`)
    }
}

handler.help = ['bcht', 'نشر']
handler.tags = ['owner']
handler.command = /^(bcht|نشر)$/i
handler.owner = true

export default handler

function delay() {
    return new Promise(resolve => setTimeout(resolve, 5500))
}