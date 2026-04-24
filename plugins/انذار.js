import fs from 'fs'
import path from 'path'
import baileys from '@whiskeysockets/baileys'
const { jidDecode } = baileys
const { generateWAMessageFromContent, proto } = baileys

let handler = async (m, { conn, text, args, usedPrefix, command }) => {

  // 🧠 إنشاء المجلد لو مش موجود
  const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    return dir
  }

  // 🔹 تحديد المجلد والملف
  let dirPath = ensureDir(path.join(process.cwd(), 'Warnings', m.chat))
  const filePath = path.join(dirPath, 'users.json')

  // 🔹 تحميل البيانات
  let data = {}
  if (fs.existsSync(filePath)) {
    try {
      data = JSON.parse(fs.readFileSync(filePath))
    } catch {
      data = {}
    }
  }

  // 🔹 تحديد العضو الهدف
  let who = m.mentionedJid?.[0] || (m.quoted && m.quoted.sender)
  if (command !== 'انذارات' && !who)
    return conn.reply(m.chat, `*◞⚠️‟⌝╎يُرجى تحديد العضو بالمنشن أو الرد عليه ⸃⤹*`, m)

  // ✅ استخراج الرقم الحقيقي من jid
  const getNumber = (jid) => {
    const decoded = jidDecode(jid)
    return decoded?.user || jid.split('@')[0]
  }

  const id = who ? getNumber(who) : null
  if (id && !data[id]) data[id] = { warns: 0 }

  // ──────── أوامر الإنذار ────────
  if (command === 'انذار') {
    data[id].warns++

    // 🔹 حفظ فوري بعد التعديل
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    if (data[id].warns >= 5) {
      await conn.reply(m.chat, `*◞🚫‟⌝╎${await conn.getName(who)} تم طرده لأن إنذاراته وصلت 5/5 ⸃⤹*`, m)
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
      data[id].warns = 0
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2)) // تحديث بعد الطرد
    } else {
      await conn.reply(m.chat,
        `*◞🚨‟⌝╎تم إنذار ${await conn.getName(who)} ⸃⤹*\n*⌝⚙️╎عدد الإنذارات:* ${data[id].warns}/5*`,
        m
      )
    }
  }

  else if (command === 'الغاء-الانذار') {
    if (data[id] && data[id].warns > 0) {
      data[id].warns--  // 👈 تقليل الإنذار
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2)) // ✅ حفظ فورًا بعد التعديل

      let whoJid = id.includes('@') ? id : id + '@s.whatsapp.net'
      await conn.reply(m.chat,
        `*◞✅‟⌝╎تم تقليل إنذارات @${id} ⸃⤹*\n*⌝⚙️╎العدد الآن:* ${data[id].warns}/5*`,
        m,
        { mentions: [whoJid] } // ✅ منشن المستخدم
      )
    } else {
      let whoJid = id.includes('@') ? id : id + '@s.whatsapp.net'
      await conn.reply(m.chat,
        `*◞🟢‟⌝╎@${id} ليس لديه أي إنذارات ليتم تقليلها ⸃⤹*`,
        m,
        { mentions: [whoJid] } // ✅ منشن المستخدم
      )
    }
  }

  // ──────── عرض الإنذارات ────────
  else if (command === 'انذارات') {
    const rows = await Promise.all(
      Object.entries(data)
        .filter(([_, info]) => info.warns > 0)
        .map(async ([num, info]) => {
          let jidUser = num.includes('@') ? num : num + '@s.whatsapp.net'
          return {
            title: `👤 @${num}`, // يظهر المنشن بدل الاسم أو الرقم
            description: `⚠️ إنذارات: ${info.warns}/5`,
            id: `${usedPrefix}الغاء-الانذار ${num}`,
            mentions: [jidUser] // ✅ منشن لكل عضو
          }
        })
    )

    if (!rows.length)
      return conn.reply(m.chat, `*◞🧠‟⌝╎لا يوجد أي عضو عليه إنذارات حاليًا ⸃⤹*`, m)

    const image = 'https://files.catbox.moe/ort5rq.jpg'
    const caption = `*⚠️ قائمة الأعضاء المنذرين في المجموعة*\n━━━━━━━━━━━━━━━\n📋 *عدد الأعضاء:* ${rows.length}\n🕒 *آخر تحديث:* ${new Date().toLocaleString('ar-EG')}`

    await conn.sendMessage(m.chat, {
      product: {
        productImage: { url: image },
        title: '⚠️ قائمة الإنذارات',
        description: 'اضغط الزر لعرض التفاصيل',
        currencyCode: 'USD',
        priceAmount1000: '20',
        retailerId: 'Radio-Demon'
      },
      businessOwnerJid: '967738512629@s.whatsapp.net',
      caption,
      footer: '⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐',
      mentions: [m.sender, ...rows.flatMap(r => r.mentions)], // منشن كل الأعضاء
      interactiveButtons: [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '⌝⚠️╎الأعضاء المنذرون: ⌞',
            sections: [{ title: '⌝👥╎قائمة الأعضاء: ⌞', rows }]
          })
        }
      ]
    }, { quoted: m })
  }
}

handler.help = ['انذار', 'الغاء-الانذار', 'انذارات']
handler.tags = ['group']
handler.command = /^(انذار|الغاء-الانذار|انذارات)$/i
handler.admin = true
handler.group = true

export default handler