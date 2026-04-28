import fs from "fs"
import path from "path"
import archiver from "archiver"

let handler = async (m, { conn }) => {
    try {
        const tempDir = "./tmp"
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

        for (let file of fs.readdirSync(tempDir)) {
            try { fs.unlinkSync(`${tempDir}/${file}`) } catch {}
        }

        await m.reply("📦 *جاري نسخ جميع ملفات السيرفر...*")

        const backupName = "Yoru-Bot-Full-Backup"
        const backupPath = `${tempDir}/${backupName}.zip`

        // ━━━ مجلدات وملفات يتم تجاهلها ━━━
        const excluded = [
            'node_modules',
            '.git',
            'tmp',
            backupPath,
            '.env',
        ]

        const isExcluded = (name) => excluded.some(e => name === e || name.startsWith(e + '/'))

        await new Promise((resolve, reject) => {
            const output  = fs.createWriteStream(backupPath)
            const archive = archiver("zip", { zlib: { level: 9 } })

            output.on("close", resolve)
            archive.on("error", reject)
            archive.pipe(output)

            // ━━━ أضف كل حاجة في الـ root ━━━
            const root = process.cwd()
            const items = fs.readdirSync(root)

            for (const item of items) {
                if (isExcluded(item)) continue

                const fullPath = path.join(root, item)
                const stat     = fs.statSync(fullPath)

                if (stat.isDirectory()) {
                    archive.directory(fullPath, item)
                } else {
                    archive.file(fullPath, { name: item })
                }
            }

            archive.finalize()
        })

        const sizeMB = (fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)

        // لو الحجم أكبر من 1.9GB — تقسيم مش ممكن في واتساب
        if (parseFloat(sizeMB) > 1900) {
            fs.unlinkSync(backupPath)
            return m.reply(`❌ الملف كبير جداً (${sizeMB} MB)\nاستخدم \`.backup\` للملفات المهمة فقط`)
        }

        await conn.sendMessage(m.sender, {
            document: fs.readFileSync(backupPath),
            fileName: `${backupName}.zip`,
            mimetype: "application/zip",
            caption: [
                `📦 *نسخة كاملة - 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓*`,
                ``,
                `📊 الحجم: ${sizeMB} MB`,
                ``,
                `⚠️ *الملفات المستثناة:*`,
                `• node_modules`,
                `• .git`,
                `• tmp`,
                ``,
                `⚠️ *تعليمات التشغيل:*`,
                `1. فك الضغط`,
                `2. npm install`,
                `3. اربط رقمك`,
            ].join("\n")
        }, { quoted: m })

        try { fs.unlinkSync(backupPath) } catch {}

        if (m.chat !== m.sender) m.reply("✅ *تم إرسال النسخة الكاملة للخاص!*")

    } catch (e) {
        console.error(e)
        m.reply("❌ *فشل النسخ!*\n" + e.message)
    }
}

handler.help    = ["fullbackup"]
handler.tags    = ["owner"]
handler.command = /^(سك|fullbackup|fb|نسخ_كامل)$/i
handler.owner   = true

export default handler