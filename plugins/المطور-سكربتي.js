import fs from "fs"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

// 📌 قائمة الأرقام المسموح لها بتنفيذ الأمر
const allowedNumbers = [
  '201115546207@s.whatsapp.net', // الرقم الأول
  '201148308758@s.whatsapp.net'  // الرقم الثاني
]

let handler = async (m, { conn }) => {
  try {
    // التحقق من الأرقام المسموح لها
    if (!allowedNumbers.includes(m.sender)) {
      await conn.sendMessage(m.chat, { text: `🛑 *غير مسموح لك يا عبد* 🐉\n\n𝐁𝐀𝐍𝐃𝐑 𝐁𝐎𝐓 🐉` }, { quoted: m })
      return
    }

    const tempDir = "./tmp"
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

    // حذف الملفات المؤقتة القديمة
    let files = fs.readdirSync(tempDir)
    if (files.length > 0) {
      for (let file of files) {
        try {
          fs.unlinkSync(path.join(tempDir, file))
        } catch (e) {
          // تجاهل الأخطاء في حذف الملفات
        }
      }
    }

    const command = m.text.split(' ')[0].toLowerCase()
    const isArabicCommand = /^(?:\.?نسخ|\.?سكربتي)$/i.test(command)

    // رسالة البداية فقط
    const startMessage = await m.reply("⏳ *| يتم الآن إنشاء نسخة احتياطية للبوت...* 🐉\n\n*بندر °` يعمل بجد، قد يستغرق بعض الوقت...* 🕶️")

    const backupName = "Bndar-V2-Bot"
    const backupPath = `${tempDir}/${backupName}.zip`

    // قائمة الملفات/المجلدات المستبعدة
    const excludedItems = [
      "node_modules",
      "auth", 
      "Sessions",
      "tmp",
      "*.log",
      "database.json",
      "package-lock.json",
      "yarn.lock", 
      "pnpm-lock.yaml",
      "npm-debug.log*",
      ".git"
    ]

    // بناء أمر zip مع استبعاد جميع العناصر غير المرغوبة
    const excludeArgs = excludedItems.map(item => `-x "${item}/*" "${item}"`).join(' ')
    
    // تنفيذ أمر الضغط بدون رسائل وسيطة
    try {
      await execAsync(
        `zip -r "${backupPath}" . ${excludeArgs} -q`,
        { 
          maxBuffer: 1024 * 1024 * 50, // 50MB buffer
          cwd: process.cwd()
        }
      )
    } catch (zipError) {
      // إذا فشل الضغط الكامل، نجرب طريقة بديلة
      // إنشاء قائمة بالملفات المراد تضمينها (بدلاً من استبعادها)
      const includeItems = fs.readdirSync(".").filter(item => {
        return !excludedItems.includes(item) && 
               !item.startsWith('.') && 
               item !== 'node_modules' &&
               item !== 'auth' &&
               item !== 'Sessions' &&
               item !== 'tmp'
      })
      
      if (includeItems.length === 0) {
        throw new Error("لم يتم العثور على ملفات للضغط")
      }
      
      // ضغط الملفات المحددة فقط
      await execAsync(
        `zip -r "${backupPath}" ${includeItems.join(' ')} -q`,
        { 
          maxBuffer: 1024 * 1024 * 50,
          cwd: process.cwd()
        }
      )
    }

    // التحقق من وجود الملف المضغوط
    if (!fs.existsSync(backupPath)) {
      throw new Error("فشل في إنشاء ملف الضغط")
    }

    // الحصول على حجم الملف
    const stats = fs.statSync(backupPath)
    const fileSize = (stats.size / (1024 * 1024)).toFixed(2)

    // إرسال النسخة الاحتياطية
    await conn.sendMessage(
      m.sender,
      {
        document: fs.readFileSync(backupPath),
        fileName: `${backupName}.zip`,
        mimetype: "application/zip",
      },
      { quoted: m }
    )

    // تنظيف الملف المؤقت
    try {
      fs.unlinkSync(backupPath)
    } catch (cleanError) {
      // تجاهل أخطاء التنظيف
    }

    // رسالة النجاح النهائية فقط
    const successMessage = isArabicCommand ? 
      `🎉 *| تم إرسال نسخة البوت بنجاح!* 🐉\n\n*الملفات المستبعدة:*\n📁 node_modules\n📁 auth\n📁 Sessions\n📁 tmp\n📄 database.json\n📄 package-lock.json\n\n*الحجم النهائي:* ${fileSize} MB\n\n𝐁𝐀𝐍𝐃𝐑 𝐁𝐎𝐓 🐉` :
      `🎉 *| Backup sent successfully!* 🐉\n\n*Excluded items:*\n📁 node_modules\n📁 auth\n📁 Sessions\n📁 tmp\n📄 database.json\n📄 package-lock.json\n\n*Final size:* ${fileSize} MB\n\n𝐁𝐀𝐍𝐃𝐑 𝐁𝐎𝐓 🐉`

    // تعديل الرسالة الأصلية بدلاً من إرسال رسالة جديدة
    await conn.sendMessage(m.chat, { 
      text: successMessage,
      edit: startMessage.key 
    })

  } catch (e) {
    console.error('Backup Error:', e)
    const command = m.text.split(' ')[0].toLowerCase()
    const isArabicCommand = /^(?:\.?نسخ|\.?سكربتي)$/i.test(command)

    const errorMessage = isArabicCommand ?
      `❌ *| فشل في إنشاء النسخة الاحتياطية!* 🐉\n\n*السبب:* ${e.message || 'حجم البيانات كبير جدًا'}\n\n*حاول مجددًا أو استخدم طريقة بديلة...* 🕶️\n\n𝐁𝐀𝐍𝐃𝐑 𝐁𝐎𝐓 🐉` :
      `❌ *| Backup creation failed!* 🐉\n\n*Reason:* ${e.message || 'Data size too large'}\n\n*Try again or use alternative method...* 🕶️\n\n𝐁𝐀𝐍𝐃𝐑 𝐁𝐎𝐓 🐉`

    await m.reply(errorMessage)
  }
}

handler.help = ["سكربتي", "backup"]
handler.tags = ["owner"]
handler.command = /^(سكربتي|\.سكربتي|نسخ|\.نسخ|backup)$/i
handler.mods = true

export default handler