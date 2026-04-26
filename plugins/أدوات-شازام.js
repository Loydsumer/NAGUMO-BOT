import acrcloud from "acrcloud"

const acr = new acrcloud({ 
    host: "identify-ap-southeast-1.acrcloud.com", 
    access_key: "ee1b81b47cf98cd73a0072a761558ab1", 
    access_secret: "ya9OPe8onFAnNkyf9xMTK8qRyMGmsghfuHrIMmUI" 
})

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    
    if (!q.mimetype || (!q.mimetype.includes("audio") && !q.mimetype.includes("video"))) {
        return m.reply("👻 *يا رفيقي* ❌\n\nالرد على رسالة صوتية أو فيديو عشان أعرف الأغنية لك")
    }
    
    let buffer = await q.download()
    
    try {
        await m.react('🕒')
        let data = await whatmusic(buffer)
        
        if (!data.length) {
            await m.react('❌')
            return m.reply("👻 *ما لقيت شي* 🎵\n\nما قدرت أعرف الأغنية، جرب مرة ثانية أو غير الصوت")
        }
        
        // تحديد الرسالة التوضيحية بناء على الأمر المستخدم
        let commandName = command
        let headerText = ""
        
        switch(commandName) {
            case "whatmusic":
            case "تعرف":
                headerText = "ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻 *التعرف على الموسيقى* 🎵"
                break
            case "shazam":
            case "شازام":
                headerText = "ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻 *نمط شازام* 🔊"
                break
            default:
                headerText = "ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻 *نتيجة البحث* 🎶"
        }
        
        let cap = `${headerText}\n\n`
        
        for (let result of data) {
            const enlaces = Array.isArray(result.url) ? result.url.filter(x => x) : []
            cap += `👻 *العنوان* » ${result.title}\n`
            cap += `🎤 *الفنان* » ${result.artist}\n`
            cap += `⏱ *المدة* » ${result.duration}\n`
            
            if (enlaces.length) {
                cap += `🔗 *الروابط* »\n${enlaces.map(i => `   ╰─⊶ ${i}`).join("\n")}\n`
                cap += "┅─────┅\n"
            }
        }
        
        cap += `\n👻 *طريقة الاستخدام*:\n` +
               `╰─⊶ رد على أي صوت واستخدم الأمر *${usedPrefix}تعرف*`
        
        await conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: cap,
                contextInfo: {
                    externalAdReply: {
                        title: '🅥🅘🅣🅞 🅒🅞🅡🅛🅔🅞🅝🅔 👻',
                        body: 'تعرف على أي أغنية بسهولة',
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnail: await (await fetch('https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742781294508.jpeg')).buffer(),
                        sourceUrl: 'https://whatsapp.com/channel/0029Va9m8m1D+1m+1m+1m+1m'
                    }
                }
            }
        }, { quoted: m })
        
        await m.react('✅')
        
    } catch (error) {
        await m.react('❌')
        m.reply(`👻 *يا رفيقي* ⚠️\n\nفي مشكلة بالسيستم\nاستخدم *${usedPrefix}بلاغ* عشان تبلغ عن المشكلة\n\n${error.message}`)
    }
}

// 👻 أوامر العربية مضافة بجانب الإنجليزية
handler.help = ["whatmusic", "تعرف", "shazam", "شازام"]
handler.tags = ["tools", "أدوات"]
handler.command = ["whatmusic", "shazam", "تعرف", "شازام"]
handler.group = true

export default handler

async function whatmusic(buffer) {
    let res = await acr.identify(buffer)
    let data = res?.metadata
    if (!data || !Array.isArray(data.music)) return []
    return data.music.map(a => ({ 
        title: a.title, 
        artist: a.artists?.[0]?.name || "مجهول", 
        duration: toTime(a.duration_ms), 
        url: Object.keys(a.external_metadata || {}).map(i => 
            i === "youtube" ? "https://youtu.be/" + a.external_metadata[i].vid : 
            i === "deezer" ? "https://www.deezer.com/us/track/" + a.external_metadata[i].track.id : 
            i === "spotify" ? "https://open.spotify.com/track/" + a.external_metadata[i].track.id : 
            "").filter(Boolean) 
    }))
}

function toTime(ms) {
    if (!ms || typeof ms !== "number") return "00:00"
    let m = Math.floor(ms / 60000)
    let s = Math.floor((ms % 60000) / 1000)
    return [m, s].map(v => v.toString().padStart(2, "0")).join(":")
}