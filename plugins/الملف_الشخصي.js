// 📌 ملف عرض الملف الشخصي (profile.js)
// ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻

import moment from 'moment-timezone'

let handler = async (m, { conn, command }) => {
  try {
    await global.loading(m, conn)

    let now = new Date(Date.now() + 3600000)
    let date = now.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
    let wib = now.toLocaleTimeString('ar-EG', { hour12: false, timeZone: 'Asia/Jakarta' })

    let who = m.mentionedJid && m.mentionedJid.length
      ? m.mentionedJid[0]
      : m.fromMe ? conn.user.jid : m.sender

    let user = global.db.data.users[who]
    if (!user) return m.reply(`
👻 ⚠️ المستخدم غير موجود في قاعدة البيانات!  
💡 مثال: \`.${command}\`  
ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`.trim())

    let isMods = [conn.decodeJid(conn.user.id), ...global.config.owner.filter(([num, _, dev]) => num && dev).map(([num]) => num)].map(v => v.replace(/\D/g, '') + '@s.whatsapp.net').includes(who)
    let isOwner = m.fromMe || isMods || [conn.decodeJid(conn.user.id), ...global.config.owner.filter(([num]) => num).map(([num]) => num)].map(v => v.replace(/\D/g, '') + '@s.whatsapp.net').includes(who)
    let isPrems = isOwner || new Date() - user.premiumTime < 0

    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://cloudkuimages.guru/uploads/images/wTGHCxNj.jpg')
    let bio = await conn.fetchStatus(who).catch(_ => ({ status: '👻 لا يوجد وصف' }))
    let name = user.registered ? user.name : await conn.getName(who)
    let datePacaran = user.pacar ? dateTime(user.pacaranTime) : null

    let caption = `
👻 🌸 *الملف الشخصي للمستخدم* 🌸
──────────────────────
🧚‍♀️ *الاسم:* ${name}
🎀 *العمر:* ${user.registered ? user.age : '👻 لم يتم التحديد'}
👑 *الحالة:* ${isMods ? '✨ مطور' : isOwner ? '👑 مالك' : isPrems ? '💎 بريميوم' : user.level > 999 ? '🔥 نجم' : '👤 مستخدم عادي'}
📝 *الوصف:* ${bio.status || '👻 لا يوجد وصف'}
💞 *الحب:* ${user.pacar ? `❤️ @${user.pacar.split('@')[0]} (${datePacaran})` : '💔 لا يوجد'}
🔗 *رابط واتساب:* wa.me/${who.split('@')[0]}
──────────────────────
👻 🍡 *معلومات RPG* 🍡
──────────────────────
🗡️ *المستوى:* ${toRupiah(user.level)}
🎭 *الدور:* ${user.role}
✨ *الخبرة:* ${toRupiah(user.exp)}
🍰 *النقود:* ${toRupiah(user.money)}
🏦 *البنك:* ${toRupiah(user.bank || 0)}
📜 *مسجل:* ${user.registered ? 'نعم (منذ ' + dateTime(user.regTime) + ')' : 'لا'}
💡 مثال: \`.${command}\`  
ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`.trim()

    await conn.sendFile(m.chat, pp, 'pp.jpg', caption, m, false, {
      contextInfo: { mentionedJid: [who, user.pacar].filter(Boolean) }
    })

  } catch (e) {
    throw e
  } finally {
    await global.loading(m, conn, true)
  }
}

// 📝 أوامر إنجليزية + عربية
handler.help = ['profile', 'الملف']
handler.tags = ['xp']
handler.command = /^(profile|profil|الملف)$/i
handler.register = true

export default handler

function dateTime(ts) {
  let d = new Date(ts)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

const toRupiah = n => parseInt(n || 0).toLocaleString('ar-EG')