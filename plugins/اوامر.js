import { existsSync } from 'fs'
import { join } from 'path'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { performance } from 'perf_hooks'

// ═══════════════════════════════════════════════════
// تعريف أقسام البوت
// ═══════════════════════════════════════════════════
const menuCategories = {
  الذكاء: 'الذكاء الاصطناعي & الدردشة',
  التحميلات: 'البحث وتنزيل',
  الالعاب: 'ألعاب & تسلية',
  الصور: 'تنزيل صور & خلفيات',
  المجموعات: 'المجموعات & الإدارة',
  البنك: 'البنك & الاقتصاد',
  الحماية: 'الحماية & الأمان',
  المطور: 'المالك & المطور',
}

// ═══════════════════════════════════════════════════
// توليد صفوف القائمة من الأقسام
// ═══════════════════════════════════════════════════
const rows = Object.entries(menuCategories).map(([id, title]) => ({
  title: `🗂️ ${title}`,
  description: `انقر لفتح قسم ${title}`,
  id: `.قسم_${id}`
}))

// ═══════════════════════════════════════════════════
// المعالج الرئيسي
// ═══════════════════════════════════════════════════
let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // ─── حساب البنج ───
    let old = performance.now()
    let neww = performance.now()
    let speed = (neww - old).toFixed(4)

    // ─── معلومات المستخدم ───
    const user = m.pushName || await conn.getName(m.sender) || 'المستخدم'
    const fecha = new Date().toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const hora = new Date().toLocaleTimeString('ar-SA')

    // ─── إعدادات البوت ───
    const botName = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'
    const botDev = global.botDev || '♡Jana♡'
    const menuImageUrl = global.images?.menu || 'https://files.catbox.moe/jyqut4.jpg'
    const channel = global.links?.channel || 'https://whatsapp.com/channel/0029VbCJtCILI8YQz9VFQQ2w'
    const developerNumber = global.botNumber?.replace(/[^0-9]/g, '') || '201002435496'
    const developerContact = global.links?.dev || `https://wa.me/${developerNumber}`

    // ─── بيانات المستخدم من قاعدة البيانات ───
    const userData = global.db?.data?.users?.[m.sender] || {}
    const { level = 0, role = 'مواطن 👨🏻‍💼', exp = 0 } = userData

    // ─── عدد الأوامر ───
    let commandCount = 0
    for (const name in (global.plugins || {})) {
      if (global.plugins[name]?.command) commandCount++
    }

    // ═══════════════════════════════════════════════
    // بناء نص القائمة
    // ═══════════════════════════════════════════════
    let menuText = `*╭━━𝐖𝐄𝐋𝐂𝐎𝐌𝐄━━━°⃟𑁁⚡*\n`
    menuText += `> °⃟𑁁⚡ *الاسم:* ${user}\n`
    menuText += `> °⃟𑁁⚡ *الرقم:* ${m.sender.split('@')[0]}\n`
    menuText += `> °⃟𑁁⚡ *البينق:* ${speed}ms\n`
    menuText += `> °⃟𑁁⚡ *التشغيل:* ${await getUptime()}\n`
    menuText += `> °⃟𑁁⚡ *التاريخ:* ${fecha}\n`
    menuText += `> °⃟𑁁⚡ *الوقت:* ${hora}\n`
    menuText += `> °⃟𑁁⚡ *الأوامر:* ${commandCount}\n`
    menuText += `> °⃟𑁁⚡ *المستوى:* ${level} | *الرتبة:* ${role}\n`
    menuText += `*╰━━${botName} 𝐕2━━°⃟𑁁⚡*\n`
    menuText += `> *𝐎𝐰𝐧𝐞𝐫: ${botDev}*\n`
    menuText += `*╭━━━━━━━━━━°⃟𑁁⚡*\n`
    menuText += ` *〔 مــــرحبا بيڪ في ${botName} 〕*\n`
    menuText += `*╰━━━━━━━━━━°⃟𑁁⚡*`

    // ─── إرسال ريأكشن ───
    await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })

    // ═══════════════════════════════════════════════
    // بناء الرسالة التفاعلية (nativeFlowPayload)
    // ═══════════════════════════════════════════════
    const nativeFlowPayload = {
      body: { text: menuText },
      footer: { text: `⚡ ${botName} بواسطة ${botDev}` },
      nativeFlowMessage: {
        buttons: [
          // ─── زر قائمة الأقسام ───
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '📂 أقسام البوت',
              sections: [
                {
                  title: 'اختار قسم الأوامر التي تحتاج',
                  highlight_label: ` ◡̈⃝${botName}ꨄ︎ఌ`,
                  rows
                }
              ]
            })
          },
          // ─── أزرار سريعة ───
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: '📋 تنصيب البوت',
              id: `${_p}تنصيب`
            })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: '💰 شراء البوت',
              id: `${_p}شرا`
            })
          },
          // ─── زر القناة الرسمية ───
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '📢 القناة الرسمية',
              url: channel,
              merchant_url: channel
            })
          },
          // ─── زر التواصل مع المطور ───
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '👑 التواصل مع المطور',
              url: developerContact,
              merchant_url: developerContact
            })
          }
        ],
        // ─── إعدادات متقدمة للرسالة ───
        messageParamsJson: JSON.stringify({
          limited_time_offer: {
            text: `⚡ ${speed}ms`,
            url: developerContact,
            copy_code: `المطور: +${developerNumber}`,
            expiration_time: Date.now() + 86400000
          },
          bottom_sheet: {
            in_thread_buttons_limit: 1,
            divider_indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 999],
            list_title: '📂 قائمة أقسام البوت',
            button_title: `『⚡┃القوائـ🗒️ـم┃⚡』`
          },
          tap_target_configuration: {
            description: botName,
            canonical_url: developerContact,
            domain: developerContact,
            button_index: 0
          }
        })
      }
    }

    // ═══════════════════════════════════════════════
    // تحميل صورة القائمة
    // ═══════════════════════════════════════════════
    try {
      const media = await prepareWAMessageMedia(
        { image: { url: menuImageUrl } },
        { upload: conn.waUploadToServer }
      )
      nativeFlowPayload.header = {
        hasMediaAttachment: true,
        subtitle: 'بوت متعدد الوظائف',
        imageMessage: media.imageMessage
      }
    } catch (e) {
      console.error('خطأ في تحميل صورة القائمة:', e)
      nativeFlowPayload.header = {
        hasMediaAttachment: false,
        subtitle: 'بوت متعدد الوظائف'
      }
    }

    // ═══════════════════════════════════════════════
    // إرسال الرسالة التفاعلية
    // ═══════════════════════════════════════════════
    const interactiveMessage = proto.Message.InteractiveMessage.fromObject(nativeFlowPayload)
    const fkontak = await makeFkontak()
    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, {
      userJid: conn.user.jid,
      quoted: fkontak
    })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    // ═══════════════════════════════════════════════
    // معالجة الخطأ - إرسال قائمة بسيطة
    // ═══════════════════════════════════════════════
    console.error('خطأ في القائمة:', e)
    const botName = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'
    const menuImageUrl = global.images?.menu

    const fallbackText = [
      `⚡ ${botName}`,
      '',
      `• ${_p}اوامر - القائمة الرئيسية`,
      `• ${_p}بينق - اختبار البوت`,
      '',
      '⚠️ خطأ في تحميل القائمة التفاعلية'
    ].join('\n')

    if (menuImageUrl) {
      await conn.sendMessage(m.chat, {
        image: { url: menuImageUrl },
        caption: fallbackText
      }, { quoted: m }).catch(() => m.reply(fallbackText))
    } else {
      await conn.sendMessage(m.chat, { text: fallbackText }, { quoted: m })
    }
  }
}

// ═══════════════════════════════════════════════════
// معالج الأزرار التفاعلية (handler.before)
// ═══════════════════════════════════════════════════
handler.before = async (m, { conn }) => {
  if (m.type === 'interactive_response') {
    try {
      const response = JSON.parse(m.response)
      const buttonId = response.id || response.buttonId

      if (menuCategories[buttonId]) {
        await conn.sendMessage(m.chat, {
          text: [
            `╔══════════════════╗`,
            `║  ${menuCategories[buttonId]}  ║`,
            `╚══════════════════╝`
          ].join('\n')
        }, { quoted: m })
        return true
      }
    } catch {}
  }
  return false
}

// ═══════════════════════════════════════════════════
// دالة الاقتباس المخصص
// ═══════════════════════════════════════════════════
async function makeFkontak() {
  try {
    const res = await fetch('https://cdn.russellxz.click/64bba973.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: {
        participants: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        fromMe: false,
        id: 'Halo'
      },
      message: {
        locationMessage: {
          name: global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓',
          jpegThumbnail: thumb2
        }
      },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return undefined
  }
}

// ═══════════════════════════════════════════════════
// دالة حساب وقت التشغيل
// ═══════════════════════════════════════════════════
async function getUptime() {
  let totalSeconds = process.uptime()
  let days = Math.floor(totalSeconds / 86400)
  let hours = Math.floor((totalSeconds % 86400) / 3600)
  let minutes = Math.floor((totalSeconds % 3600) / 60)
  let seconds = Math.floor(totalSeconds % 60)

  let parts = []
  if (days > 0) parts.push(`${days}ي`)
  parts.push(`${hours.toString().padStart(2, '0')}س`)
  parts.push(`${minutes.toString().padStart(2, '0')}د`)
  parts.push(`${seconds.toString().padStart(2, '0')}ث`)

  return parts.join(' ')
}

// ═══════════════════════════════════════════════════
// تعريف الأمر
// ═══════════════════════════════════════════════════
handler.help = ['اوامر', 'menu', 'القائمة']
handler.tags = ['main']
handler.command = /^(اوامر|قائمه|قائمة|menu|help|مساعدة|مينيو|مهام)$/i

export default handler