import fs from 'fs'

async function handler(m, { usedPrefix }) {
const emoji = '🎶';
const emoji2 = '🎶';
  const user = m.sender.split('@')[0]
  if (fs.existsSync(`./${jadi}/` + user + '/creds.json')) {
    let token = Buffer.from(fs.readFileSync(`./${jadi}/` + user + '/creds.json'), 'utf-8').toString('base64')    

    await conn.reply(m.chat, `${emoji} هذا الـ *توكن* يسمح لك بتسجيل الدخول في بوتات أخرى، نوصي بعدم مشاركته مع أي شخص.\n\n*توكنك هو:*`, m)
    await conn.reply(m.chat, token, m)
  } else {
    await conn.reply(m.chat, `${emoji2} لا يوجد لديك أي توكن نشط حاليًا، استخدم الأمر #jadibot لإنشاء واحد.`, m)
  }

}

handler.help = ['token']
handler.command = ['رمزي']
handler.tags = ['serbot']
handler.private = true

export default handler