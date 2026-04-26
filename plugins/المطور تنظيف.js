import { readdirSync, unlinkSync, existsSync, promises as fs, statSync } from 'fs'
import { tmpdir } from 'os'
import path, { join } from 'path'

const handler = async (m, { conn, __dirname, usedPrefix, command, isMods, isROwner }) => {
  const developer = '201115546207@s.whatsapp.net'
  
  // التحقق من الصلاحيات
  if (m.sender !== developer && !isMods) {
    await m.react('❌')
    return conn.reply(
      m.chat,
      `╭•─•─•─•─•─•─•─•─•╮
│ 🚫 *عذرًا! هذا الأمر للمطور فقط* │
│                      │
│ 🔒 لا يمكنك استخدامه │
│ ⚙️ المطور الوحيد المصرح له │
│ 📞 ${developer.replace('@s.whatsapp.net', '')} │
╰•─•─•─•─•─•─•─•─•╯`,
      m
    )
  }

  // 📁 عرض الجلسات
  if (command === 'sessions') {
    try {
      const subBotPath = './Sessions/SubBot/'
      if (!existsSync(subBotPath)) {
        return conn.reply(
          m.chat,
          `╭•─•─•─•─•─•─•─•─•╮
│ 📁 *مافي أي جلسات حالياً!* │
│ 💤 النظام نظيف تماماً │
╰•─•─•─•─•─•─•─•─•╯`,
          m
        )
      }

      const folders = readdirSync(subBotPath).filter(f => /^\d+$/.test(f))
      if (folders.length === 0) {
        return conn.reply(
          m.chat,
          `╭•─•─•─•─•─•─•─•─•╮
│ 📁 *مافي أي جلسات حالياً!* │
│ 💤 النظام نظيف تماماً │
╰•─•─•─•─•─•─•─•─•╯`,
          m
        )
      }

      const sessionsList = folders.map((f, i) => `🔹 *${i + 1}.* ${f}`).join('\n')
      return conn.reply(
        m.chat,
        `╭•─•─•─•─•─•─•─•─•╮
│ 📂 *الجلسات الحالية (${folders.length})* │
│────────────────────│
${sessionsList}
╰•─•─•─•─•─•─•─•─•╯`,
        m
      )
    } catch (err) {
      console.error(err)
      return conn.reply(m.chat, `⚠️ حدث خطأ أثناء عرض الجلسات:\n${err.message}`, m)
    }
  }

  // 🧹 أمر التنظيف الموحد - يجمع كل الوظائف
  if (command === 'تنظيف') {
    try {
      await m.react('🕒')
      let totalDeleted = 0
      let totalFolders = 0
      let sessionFilesDeleted = 0
      let tmpFilesDeleted = 0
      let mainSessionFilesDeleted = 0
      let subBotFilesDeleted = 0

      // 🔹 الجزء 1: تنظيف جلسات البوت الفرعي (Sessions/SubBot/)
      const subBotPath = './Sessions/SubBot/'
      if (existsSync(subBotPath)) {
        const userFolders = await fs.readdir(subBotPath)
        for (const userFolder of userFolders) {
          const userFolderPath = join(subBotPath, userFolder)
          if (statSync(userFolderPath).isDirectory() && /^\d+$/.test(userFolder)) {
            totalFolders++
            const files = await fs.readdir(userFolderPath)
            for (const file of files) {
              const filePath = join(userFolderPath, file)
              const fileStats = statSync(filePath)
              if (fileStats.isFile() && file !== 'creds.json' && file !== 'creds.json.0' && !file.includes('creds')) {
                await fs.unlink(filePath)
                totalDeleted++
                sessionFilesDeleted++
                subBotFilesDeleted++
              }
            }
          }
        }
      }

      // 🔹 الجزء 2: تنظيف الجلسات الرئيسية (delai/dsowner) - المسار الصحيح
      const mainSessionPath = './Sessions/Principal/'
      if (existsSync(mainSessionPath) && global.conn.user.jid === conn.user.jid) {
        const files = await fs.readdir(mainSessionPath)
        for (const file of files) {
          if (file !== 'creds.json') {
            await fs.unlink(path.join(mainSessionPath, file))
            totalDeleted++
            sessionFilesDeleted++
            mainSessionFilesDeleted++
          }
        }
      }

      // 🔹 الجزء 3: تنظيف الملفات المؤقتة (cleartmp/vaciartmp)
      const tmpPaths = [tmpdir(), join(__dirname, '../tmp')]
      for (const dirname of tmpPaths) {
        if (existsSync(dirname)) {
          const files = readdirSync(dirname)
          for (const file of files) {
            const fullPath = join(dirname, file)
            const stats = statSync(fullPath)
            if (stats.isDirectory()) continue
            unlinkSync(fullPath)
            totalDeleted++
            tmpFilesDeleted++
          }
        }
      }

      await m.react('✔️')

      // 📊 تقرير التنظيف
      let reportMessage = `
╭•─•─•─•─•─•─•─•─•─•─•─•╮
│       🧹 *التنظيف الشامل*       │
│                              │
│ 🤖 *جلسات البوت الفرعي:*     │
│    • تم تنظيف: *${totalFolders}* مجلد │
│    • محذوفات: *${subBotFilesDeleted}* ملف │
│                              │
│ 💾 *الجلسات الرئيسية:*       │
│    • محذوفات: *${mainSessionFilesDeleted}* ملف │
│                              │
│ 🗂️ *الملفات المؤقتة:*         │
│    • محذوفات: *${tmpFilesDeleted}* ملف │
│                              │
│ 📊 *الإجمالي الكلي:*          │
│    • إجمالي المحذوفات: *${totalDeleted}* │
│    • تم الحفاظ على ملفات الجلسة │
╰•─•─•─•─•─•─•─•─•─•─•─•╯
`

      // إذا لم يتم حذف أي ملفات
      if (totalDeleted === 0) {
        reportMessage = `
╭•─•─•─•─•─•─•─•─•╮
│       🧹 *التنظيف الشامل*       │
│                              │
│ ✅ *النظام نظيف بالفعل!*     │
│                              │
│ 💤 لا توجد ملفات للحذف      │
│ 🎯 كل شيء منظم ومُحكم       │
╰•─•─•─•─•─•─•─•─•╯
`
      }

      await conn.sendMessage(
        m.chat,
        {
          image: { url: 'https://files.catbox.moe/lghl0z.jpg' },
          caption: reportMessage.trim(),
          footer: '⚙️ 𝖵𝗂𝗍𝗈 𝖡𝖮𝖳 𝖵2 | نظام الإدارة الذكي'
        },
        { quoted: m }
      )

    } catch (err) {
      await m.react('✖️')
      await conn.reply(
        m.chat,
        `╭•─•─•─•─•─•─•─•─•╮
│ ⚠️ *حدث خطأ أثناء التنظيف!* │
│ ${err.message} │
╰•─•─•─•─•─•─•─•─•╯`,
        m
      )
    }
  }
}

// 🎯 الأمر الوحيد المدعوم الآن هو "تنظيف"
handler.help = ['تنظيف', 'sessions']
handler.tags = ['owner']
handler.command = ['تنظيف', 'sessions']

export default handler