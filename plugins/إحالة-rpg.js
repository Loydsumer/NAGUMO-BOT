import crypto from 'crypto'

const xp_first_time = 2500
const xp_link_creator = 15000
const xp_bonus = {
  5: 40000,
  10: 100000,
  20: 250000,
  50: 1000000,
  100: 10000000,
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  let users = global.db.data.users
  if (text) {
    if ('ref_count' in users[m.sender]) return m.reply('👻 لا يمكنك استخدام كود الإحالة مرتين يا صديقي... 🕶️')
    let link_creator = (Object.entries(users).find(([, { ref_code }]) => ref_code === text.trim()) || [])[0]
    if (!link_creator) return m.reply('👻 الكود الذي أدخلته غير صالح، كأنك دخلت لعبة بلا مفاتيح 🕶️')
    
    let count = users[link_creator].ref_count++
    let extra = xp_bonus[count] || 0
    users[link_creator].exp += xp_link_creator + extra
    users[m.sender].exp += xp_first_time
    users[m.sender].ref_count = 0

    // رسالة للشخص الذي استخدم الكود
    m.reply(`
👻 مبروك يا ولدي! 
لقد حصلت على +${toRupiah(xp_first_time)} XP

🕶️ "في هذا العالم، لا أحد ينسى الجميل..."
ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`.trim())

    // رسالة لصاحب الكود
    m.reply(`
👻 شخص استخدم كودك يا رجل العائلة...
+${xp_link_creator + extra} XP دخل رصيدك.

🕶️ "القوة تأتي من الولاء... وأنت اليوم ربحت ولاء جديد."
ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`.trim(), link_creator)

  } else {
    let code = users[m.sender].ref_code = users[m.sender].ref_code || new Array(11).fill().map(() => [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'][crypto.randomInt(62)]).join('')
    users[m.sender].ref_count = users[m.sender].ref_count ? users[m.sender].ref_count : 0
    let command_text = `${usedPrefix}ref ${code}`
    let command_link = `wa.me/${conn.user.jid.split('@')[0]}?text=${encodeURIComponent(command_text)}`
    let share_text = `
👻 خذ ${toRupiah(xp_first_time)} XP إن استخدمت الكود أدناه

كود الإحالة: *${code}*

${command_link}
`.trim()

    m.reply(`
👻 استمع جيدًا يا صديقي... 
🕶️ كل من يستخدم كودك، يضع لك +${toRupiah(xp_link_creator)} XP في جيبك.  
حتى الآن ${users[m.sender].ref_count} أشخاص وثقوا بك.  

🎩 كودك الشخصي: ${code}

📩 شارك الرابط مع أصدقائك:  
${command_link}

🔗 أو أرسل لهم مباشرة:  
wa.me/?text=${encodeURIComponent(share_text)}

📜 المكافآت الإضافية:  
${Object.entries(xp_bonus).map(([count, xp]) => `${count} أشخاص = ${xp} XP 👻`).join('\n')}

━━━━━━━━━━━━━━
🕶️ مثال على الاستخدام:  
*${usedPrefix}${command} ${code}*
━━━━━━━━━━━━━━

🕶️ "في العائلة، كل خطوة محسوبة... وهذا الكود هو خطوتك الأولى نحو المجد."
ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`.trim())
  }
}

handler.help = ['ref', 'إحالة']
handler.tags = ['main', 'xp']
handler.command = ['ref', 'إحالة']
handler.register = true

export default handler

const toRupiah = number => parseInt(number).toLocaleString().replace(/,/gi, ".")