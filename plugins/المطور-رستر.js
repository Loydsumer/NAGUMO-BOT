// plugins/restart.js
import { spawn } from 'child_process'

// Hook يُركّب مرة واحدة لكل عملية، ليرسل "تم إعادة التشغيل" بعد الإقلاع
;(function installRestartHook() {
  if (global.__restartHookInstalled) return
  global.__restartHookInstalled = true

  const attach = () => {
    if (!global.conn || !global.conn.ev) return false

    const onConnUpdate = async (update) => {
      if (!update || update.connection !== 'open') return
      const db = global.db
      try {
        // تأكد من وجود البيانات
        if (!db || !db.data || !db.data.settings || !db.data.settings.restartReply) return

        // خُذ نسخة ثم احذف المفتاح قبل الإرسال لمنع التكرار
        const rr = { ...db.data.settings.restartReply }
        delete db.data.settings.restartReply
        await db.write()

        // حضّر الاقتباس إن وُجدت الرسالة
        let quoted = undefined
        if (rr.quotedMessage) {
          quoted = {
            key: {
              remoteJid: rr.chat,
              id: rr.id,
              fromMe: false,
              participant: rr.participant
            },
            message: rr.quotedMessage
          }
        }

        const replyText = '✅ تم إعادة تشغيل البوت بنجاح\n\n👻 بوت اوغامي عاد للعمل\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻'

        // جرّب بالإقتباس أولًا، ولو فشل أرسل بدون اقتباس
        try {
          if (quoted) {
            await global.conn.sendMessage(
              rr.chat,
              { text: replyText, mentions: rr.sender ? [rr.sender] : [] },
              { quoted }
            )
          } else {
            await global.conn.sendMessage(
              rr.chat,
              { text: replyText, mentions: rr.sender ? [rr.sender] : [] }
            )
          }
        } catch {
          await global.conn.sendMessage(
            rr.chat,
            { text: replyText, mentions: rr.sender ? [rr.sender] : [] }
          )
        }
      } catch (e) {
        console.error('restart post-reply failed:', e)
      }
    }

    global.conn.ev.on('connection.update', onConnUpdate)
    return true
  }

  // نحاول الربط الآن، وإن لم يكن conn جاهزًا نعيد المحاولة
  if (!attach()) {
    const t = setInterval(() => { if (attach()) clearInterval(t) }, 500)
  }
})()

let handler = async (m, { conn, command }) => {
  // ردّ فوري على نفس الرسالة (بدون السطر المطلوب حذفه)
  await m.reply(
    '👻 جاري إعادة تشغيل بوت اوغامي...\n\n' +
    'ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻'
  )

  // احفظ بيانات الرسالة لِمَا بعد الإقلاع + معرّف فريد
  const db = global.db
  db.data.settings = db.data.settings || {}
  const restartId = Date.now() + '-' + Math.random().toString(36).slice(2, 10)
  db.data.settings.restartReply = {
    id: m.key?.id,
    chat: m.chat,
    participant: m.key?.participant || m.sender,
    sender: m.sender,
    quotedMessage: m.message?.message || null,
    restartId,
    ts: Date.now()
  }
  await db.write()

  // المحاولة (1): IPC عبر index.js إن متاح
  try {
    if (typeof process.send === 'function') {
      process.send('reset')
      return // اترك index.js يتولى الإقلاع
    }
  } catch {
    // نكمل للخطة (2)
  }

  // المحاولة (2): Self-Restart موثوق (بدون الاعتماد على index.js)
  try {
    const node = process.argv[0]       // مسار node
    const script = process.argv[1]     // السكربت الجاري (main.js غالبًا)
    const args = process.argv.slice(2)

    const child = spawn(node, [script, ...args], {
      detached: true,
      stdio: 'ignore'
    })
    child.unref()

    // أخرج من العملية الحالية ليفسح المجال للنسخة الجديدة
    process.exit(0)
  } catch (e) {
    console.error('self-restart failed:', e)
    return m.reply('❌ تعذّر إعادة التشغيل.')
  }
}

handler.help = ['restart', 'اعاده-تشغيل', 'رستر']
handler.tags = ['owner']
handler.command = /^(res(tart)?|اعاده-تشغيل|رستر)$/i
handler.owner = true

export default handler