// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ⚡ وضع المطور / وضع العام
//  owner-mode.js
//  🤖 𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let handler = async (m, { conn, command, isROwner }) => {

    // ─── للمالك فقط ────────────────────────
    if (!isROwner) return

    const settings = global.db.data.settings[conn.user.jid]
    if (!settings) return

    const H = t  => `╔═══「 ⚡ ${t} 」═══╗`
    const T =     `╚══════════════════════╝`

    // ─── وضع المطور: البوت يسمع للمالك بس ─
    if (['وضع_المطور', 'selfmode', 'مطور', 'self'].includes(command)) {
        settings.self = true
        await conn.sendMessage(m.chat, {
            react: { text: '🔒', key: m.key }
        })
        return conn.sendMessage(m.chat, {
            text: [
                H('🔒 وضع المطور'),
                '│',
                '│ ✅ تم التفعيل',
                '│ 🔒 البوت يسمع للمطور فقط',
                '│ 👥 باقي المستخدمين لا يقدروا',
                '│    يستخدموا أي أمر دلوقتي',
                '│',
                `│ ⚡ لإلغاؤه: ${m.prefix}وضع_العام`,
                T
            ].join('\n')
        }, { quoted: m })
    }

    // ─── وضع العام: البوت يسمع للكل ────────
    if (['وضع_العام', 'publicmode', 'عام', 'public'].includes(command)) {
        settings.self = false
        await conn.sendMessage(m.chat, {
            react: { text: '🌐', key: m.key }
        })
        return conn.sendMessage(m.chat, {
            text: [
                H('🌐 وضع العام'),
                '│',
                '│ ✅ تم التفعيل',
                '│ 🌐 البوت يسمع للجميع',
                '│ 👥 كل المستخدمين يقدروا',
                '│    يستخدموا الأوامر دلوقتي',
                '│',
                `│ ⚡ لإلغاؤه: ${m.prefix}وضع_المطور`,
                T
            ].join('\n')
        }, { quoted: m })
    }

    // ─── عرض الحالة الحالية ─────────────────
    if (['وضع', 'mode', 'حالة_البوت'].includes(command)) {
        const isSelf = settings.self
        return conn.sendMessage(m.chat, {
            text: [
                H('⚡ وضع البوت الحالي'),
                '│',
                `│ الوضع: ${isSelf ? '🔒 مطور' : '🌐 عام'}`,
                `│ الحالة: ${isSelf ? 'يسمع للمطور فقط' : 'يسمع للجميع'}`,
                '│',
                `│ 🔒 وضع مطور: ${m.prefix}وضع_المطور`,
                `│ 🌐 وضع عام:  ${m.prefix}وضع_العام`,
                T
            ].join('\n')
        }, { quoted: m })
    }
}

handler.help    = ['وضع_المطور', 'وضع_العام', 'وضع']
handler.tags    = ['owner']
handler.command = ['وضع_المطور', 'selfmode', 'mo', 'self',
                   'وضع_العام',  'publicmode', 'عام', 'public',
                   'وضع', 'mode', 'حالة_البوت']

export default handler