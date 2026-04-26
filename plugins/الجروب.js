// معلومات المجموعة — عربي كامل بدون ملفات ترجمة
const handler = async (m, { conn, participants, groupMetadata }) => {
  // صورة المجموعة (مع بديل محلي)
  let pp = null
  try { pp = await conn.profilePictureUrl(m.chat, 'image') } catch {}
  const avatar = pp || './src/avatar_contact.png'

  // قراءة إعدادات الدردشة (مع قيم افتراضية لو ناقصة)
  const chat = global.db.data.chats[m.chat] || {}
  const {
    antiToxic = false,
    antiTraba = false,
    antidelete = false,
    antiviewonce = false,
    isBanned = false,
    welcome = false,
    detect = false,
    detect2 = false,
    sWelcome = '',
    sBye = '',
    sPromote = '',
    sDemote = '',
    antiLink = false,
    antiLink2 = false,
    modohorny = false,
    autosticker = false,
    modoadmin = false,
    audios = false
  } = chat

  // المشرفون والمالك
  const groupAdmins = participants.filter(p => p.admin)
  const listAdmin = groupAdmins.length
    ? groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n')
    : 'لا يوجد مشرفون'

  let ownerJid =
    groupMetadata.owner ||
    groupMetadata.ownerJid ||
    (groupAdmins[0] && groupAdmins[0].id) ||
    ''
  const ownerTag = ownerJid ? `@${ownerJid.split('@')[0]}` : 'غير محدد'

  const desc = groupMetadata.desc?.toString() || 'لا يوجد وصف.'

  const text = `*معلومات المجموعة*\n
المعرّف:
${groupMetadata.id}

الاسم:
${groupMetadata.subject}

الوصف:
${desc}

عدد الأعضاء:
${participants.length} عضوًا

المالك:
${ownerTag}

المشرفون:
${listAdmin}

الإعدادات:
- الترحيب (welcome): ${welcome ? '✅' : '❌'}
- الكشف (detect): ${detect ? '✅' : '❌'}
- الكشف 2 (detect2): ${detect2 ? '✅' : '❌'}
- منع الروابط (antilink): ${antiLink ? '✅' : '❌'}
- منع الروابط 2 (antilink2): ${antiLink2 ? '✅' : '❌'}
- وضع +18 (modohorny): ${modohorny ? '✅' : '❌'}
- ملصق تلقائي (autosticker): ${autosticker ? '✅' : '❌'}
- ردود صوتية (audios): ${audios ? '✅' : '❌'}
- تعطيل عرض مرّة (antiviewonce): ${antiviewonce ? '✅' : '❌'}
- إبطال الحذف (antidelete): ${antidelete ? '✅' : '❌'}
- مكافحة السميّة (antitoxic): ${antiToxic ? '✅' : '❌'}
- مكافحة traba: ${antiTraba ? '✅' : '❌'}
- وضع المشرف (modoadmin): ${modoadmin ? '✅' : '❌'}
- حظر المحادثة (isBanned): ${isBanned ? '✅' : '❌'}
`.trim()

  await conn.sendFile(
    m.chat,
    avatar,
    'group.jpg',
    text,
    m,
    false,
    { mentions: [...groupAdmins.map(v => v.id), ownerJid].filter(Boolean) }
  )
}

handler.help = ['الجروب', 'المجموعه']
handler.tags = ['group']
handler.command = /^(الجروب|المجموعه)$/i
handler.group = true
export default handler