// plugins/profile.js

let handler = async (m, { conn, args, text, participants, groupMetadata }) => {

    // ─── تحديد الشخص المطلوب (مُحسّن) ───────────────
    let who

    // 🔍 طباعة تشخيصية عشان نفهم المشكلة
    console.log('📌 mentionedJid:', JSON.stringify(m.msg?.contextInfo?.mentionedJid))
    console.log('📌 m.mentionedJid:', JSON.stringify(m.mentionedJid))
    console.log('📌 quoted sender:', m.quoted?.sender)
    console.log('📌 args:', args)
    console.log('📌 text:', text)
    console.log('📌 m.sender:', m.sender)

    // ✅ طريقة 1: لو رد على رسالة شخص (أولوية أولى)
    if (m.quoted && m.quoted.sender) {
        who = m.quoted.sender

    // ✅ طريقة 2: لو منشن من contextInfo مباشرة
    } else if (m.msg?.contextInfo?.mentionedJid?.length > 0) {
        who = m.msg.contextInfo.mentionedJid[0]

    // ✅ طريقة 3: لو mentionedJid موجود في m
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0]

    // ✅ طريقة 4: لو كتب رقم في النص
    } else if (text) {
        let number = text.replace(/[^0-9]/g, '')
        if (number && number.length >= 7) {
            // نتأكد إن الرقم موجود على واتساب
            let [result] = await conn.onWhatsApp(number + '@s.whatsapp.net').catch(() => [])
            if (result?.exists) {
                who = result.jid
            } else {
                who = number + '@s.whatsapp.net'
            }
        } else {
            who = m.sender
        }

    // ✅ طريقة 5: فولباك - المرسل نفسه
    } else {
        who = m.sender
    }

    // تنظيف الـ JID
    who = conn.decodeJid(who)

    console.log('✅ النتيجة النهائية - who:', who)
    console.log('✅ هل who === m.sender ؟', who === m.sender)

    // ─── جلب صورة البروفايل ──────────────────────────
    let pp = null
    let ppHD = null

    try {
        pp = await conn.profilePictureUrl(who, 'image')
    } catch {
        pp = null
    }

    try {
        ppHD = await conn.profilePictureUrl(who, 'image', 5000)
    } catch {
        ppHD = pp
    }

    // ─── جلب الاسم ──────────────────────────────────
    let name = 'غير معروف'
    try {
        const contact = conn.contacts?.[who] ||
                        conn.contacts?.[conn.decodeJid(who)] || {}

        name = contact.name ||
               contact.notify ||
               contact.vname ||
               contact.pushName ||
               contact.verifiedName ||
               contact.short ||
               global.db?.data?.users?.[who]?.name ||
               ''

        if (!name && who === m.sender) {
            name = m.pushName || ''
        }

        if (!name) {
            name = who.split('@')[0]
        }
    } catch {
        name = who.split('@')[0]
    }

    // ─── جلب الحالة (About) ─────────────────────────
    let status = 'غير متوفر'
    try {
        const s = await conn.fetchStatus(who)
        if (s?.status) status = s.status
    } catch {
        status = 'غير متوفر'
    }

    // ─── JID ────────────────────────────────────────
    let jid = who || 'غير متوفر'

    // ─── جلب LID ────────────────────────────────────
    let lid = 'غير متوفر'
    try {
        if (m.isGroup && participants && participants.length > 0) {
            const participant = participants.find(p => {
                const decodedJid = conn.decodeJid(p.jid || p.id || '')
                return decodedJid === who ||
                       p.id === who ||
                       (p.jid && conn.decodeJid(p.jid) === who)
            })
            if (participant?.lid) {
                lid = participant.lid
            }
        }

        if (lid === 'غير متوفر') {
            const contact = conn.contacts?.[who] ||
                            conn.contacts?.[conn.decodeJid(who)] || {}
            if (contact.lid) lid = contact.lid
        }

        if (lid === 'غير متوفر' && m.isGroup && groupMetadata?.participants) {
            const p = groupMetadata.participants.find(p =>
                conn.decodeJid(p.jid || p.id || '') === who || p.id === who
            )
            if (p?.lid) lid = p.lid
        }

        if (lid === 'غير متوفر' && who === m.sender && m.key?.participant) {
            const pJid = m.key.participant
            if (pJid.includes('@lid')) lid = pJid
        }
    } catch {
        lid = 'غير متوفر'
    }

    // ─── بيانات من قاعدة البيانات ────────────────────
    const userData = global.db?.data?.users?.[who] || {}
    const userLevel = userData.level || 0
    const userExp = userData.exp || 0
    const userCoin = userData.coin || 0
    const userBank = userData.bank || 0
    const isPremium = userData.premium || false
    const isBanned = userData.banned || false
    const userWarn = userData.warn || 0
    const userCommands = userData.commands || 0

    // ─── الرتبة ─────────────────────────────────────
    let rank = '🌱 مبتدئ'
    if (userLevel >= 100) rank = '👑 أسطوري'
    else if (userLevel >= 80) rank = '💎 ماسي'
    else if (userLevel >= 60) rank = '🏆 ذهبي'
    else if (userLevel >= 40) rank = '🥈 فضي'
    else if (userLevel >= 20) rank = '🥉 برونزي'
    else if (userLevel >= 10) rank = '⭐ متقدم'
    else if (userLevel >= 5) rank = '📗 عادي'

    // ─── الصلاحية ───────────────────────────────────
    let role = '👤 عضو'
    const ownerNumbers = [
        ...global.owner,
        ...(global.ownerLid || [])
    ].map(v => v.replace(/[^0-9]/g, ''))
    const whoNumber = who.replace(/[^0-9]/g, '')

    if (ownerNumbers.includes(whoNumber)) {
        role = '👨‍💻 المطور'
    } else if (isPremium) {
        role = '💫 مميز'
    } else if (m.isGroup) {
        const userInGroup = participants?.find(p => {
            const decodedJid = conn.decodeJid(p.jid || p.id || '')
            return decodedJid === who || p.id === who
        })
        if (userInGroup?.admin === 'superadmin') role = '🛡️ مؤسس المجموعة'
        else if (userInGroup?.admin === 'admin') role = '⚔️ أدمن'
    }

    // ─── بناء الرسالة ───────────────────────────────
    const botName = global.botName || '𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊'
    const number = who.split('@')[0]

    let caption = `╔═══════════════════════════╗
║    ⚡ ${botName} ⚡
║    📱 بروفايل المستخدم
╠═══════════════════════════╣
║
║ 📛 الاسم: ${name}
║ 📱 الرقم: @${number}
║ 📝 الحالة: ${status}
║
╠═══「 🆔 المعرفات 」═══╣
║
║ 🔑 JID:
║ ${jid}
║
║ 🔗 LID:
║ ${lid}
║
╠═══「 📊 الإحصائيات 」═══╣
║
║ 🏅 المستوى: ${userLevel}
║ ✨ الخبرة: ${userExp}
║ 💰 الكوينز: ${userCoin}
║ 🏦 البنك: ${userBank}
║ 📋 الأوامر: ${userCommands}
║ ⚠️ التحذيرات: ${userWarn}/3
║
╠═══「 🎖️ المعلومات 」═══╣
║
║ 🏷️ الرتبة: ${rank}
║ 👤 الصلاحية: ${role}
║ 💎 مميز: ${isPremium ? '✅ نعم' : '❌ لا'}
║ 🚫 محظور: ${isBanned ? '✅ نعم' : '❌ لا'}
║
╚═══════════════════════════╝`

    // ─── إرسال ──────────────────────────────────────
    if (pp) {
        await conn.sendMessage(m.chat, {
            image: { url: ppHD || pp },
            caption: caption,
            mentions: [who]
        }, { quoted: m })
    } else {
        await conn.sendMessage(m.chat, {
            text: caption,
            mentions: [who]
        }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
        react: { text: '⚡', key: m.key }
    })
}

handler.help = ['بروفايل [@منشن/رد]']
handler.tags = ['tools']
handler.command = /^(بروفايل|بروف|profile|prof|me)$/i

handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.premium = false
handler.owner = false

handler.fail = null
handler.exp = 15

export default handler