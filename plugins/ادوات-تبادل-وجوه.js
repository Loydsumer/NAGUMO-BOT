/*
BY : OBITO
https://whatsapp.com/channel/0029VaDZKjd4Crfr1QOOlJ2D
*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*
https://www.facebook.com/share/p/5ZMC5eo7VuKMvH8Z/
*/

import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import fetch from 'node-fetch'

let tempLinks = [] 

let handler = async (m) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime) return conn.reply(m.chat, '*ميزة تبادل الوجوه شخصيات 🌙😁،المرجو رد على صوره التي تريد تبادل وجها ومن بعد اختيار صوره اعمل رد على صوره بالامر صوره الثانيه التي تريد تبادل اليها وستم تبادل الوجوه🤭⚜*\nBY OBITO', m)

    await m.react('⏳')
    try {
        let media = await q.download()
        let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)
        let link = await (isTele ? uploadImage : uploadFile)(media)
        
        tempLinks.push(link) 

        if (tempLinks.length === 2) {

            let buttons = [
                {
                    buttonId: `.اختر-وجه ${tempLinks.join(' ')}`, 
                    buttonText: { displayText: '⌝ تبادل الوجوه ┋🪽⌞ ' },
                    type: 1
                }
            ]

            let txt = `*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*تم اختيار صورتين التين تريد تبادل وجوههم، المرجو ضغط على زر ادناه لي بدأ تبادل 📣😶*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*`
            
            await conn.sendMessage(m.chat, { text: txt, buttons: buttons, footer: '𝑀𝐼𝑁𝐴𝑇𝛩 𝐵𝛩𝑇' }, { quoted: m })

            tempLinks = [] 
        } else {

            await conn.reply(m.chat, `*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*تم اختيار صورة الاولا،المرجو رد على صوره ثانيه بالامر لي يتم تبادل الوجوه 💛⚜*\nBY : OBITO\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*`, m)
        }

        await m.react('✅') 
    } catch (error) {
        console.error(error)
        await conn.reply(m.chat, '❌ حدث خطأ أثناء محاولة تحويل الصورة إلى رابط.', m)
        await m.react('❌') 
    }
}

handler.help = ['اوبيتو']
handler.tags = ['اوبيتو']
handler.command = ['تبادل', 'وجوه']

export default handler


function formatBytes(bytes) {
    if (bytes === 0) {
        return '0 B';
    }
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}