import fs from "fs"
import path from "path"
import archiver from "archiver"

let handler = async (m, { conn, command }) => {
    const tempDir = "./tmp"
    const backupName = "Yoru-Bot-Full-Backup"
    const backupPath = `${tempDir}/${backupName}.zip`

    try {
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

        for (let file of fs.readdirSync(tempDir)) {
            try { fs.unlinkSync(`${tempDir}/${file}`) } catch {}
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ⚡ مجلدات وملفات يتم تجاهلها بالكامل
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const excludedDirs = new Set([
            'node_modules',
            '.git',
            'tmp',
            'session',
            'sessions',
            'jadibts',
            '.cache',
            '.npm',
            '.config',
            'dist',
            'build',
        ])

        // أضف مجلد الجلسة الفعلي
        if (global.sessions) excludedDirs.add(global.sessions)

        // ━━━ امتدادات الملفات المستثناة ━━━
        const excludedExtensions = new Set([
            '.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv',   // فيديو
            '.mp3', '.wav', '.ogg', '.flac', '.aac',           // صوت
            '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',     // أرشيف
            '.iso', '.img', '.dmg',                             // صور أقراص
            '.exe', '.msi', '.apk',                             // تطبيقات
            '.sqlite', '.db',                                   // قواعد بيانات ثقيلة
            '.log',                                             // سجلات
        ])

        // ━━━ ملفات محددة مستثناة ━━━
        const excludedFiles = new Set([
            '.env',
            'yarn.lock',
            'package-lock.json',
            backupName + '.zip',
        ])

        // ━━━ الحد الأقصى لحجم الملف الواحد (5 MB) ━━━
        const MAX_FILE_SIZE = 5 * 1024 * 1024

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ⚡ أولاً: حساب الحجم المتوقع + عرض التقرير
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const root = process.cwd()
        let totalSize = 0
        let totalFiles = 0
        let skippedFiles = []
        let filesToBackup = []

        function walkDir(dir, relativePath = "") {
            let items
            try { items = fs.readdirSync(dir) } catch { return }

            for (const item of items) {
                const fullPath = path.join(dir, item)
                const relPath = relativePath ? `${relativePath}/${item}` : item

                let stat
                try { stat = fs.statSync(fullPath) } catch { continue }

                if (stat.isDirectory()) {
                    // تجاهل المجلدات المستثناة
                    if (excludedDirs.has(item)) {
                        skippedFiles.push({ path: relPath, reason: "مجلد مستثنى", size: 0 })
                        continue
                    }
                    // تجاهل مجلدات node_modules المتداخلة
                    if (item === "node_modules") continue

                    walkDir(fullPath, relPath)
                } else if (stat.isFile()) {
                    const ext = path.extname(item).toLowerCase()

                    // تجاهل ملفات محددة
                    if (excludedFiles.has(item)) {
                        skippedFiles.push({ path: relPath, reason: "ملف مستثنى", size: stat.size })
                        continue
                    }

                    // تجاهل امتدادات معينة
                    if (excludedExtensions.has(ext)) {
                        skippedFiles.push({ path: relPath, reason: `امتداد ${ext}`, size: stat.size })
                        continue
                    }

                    // تجاهل ملفات كبيرة
                    if (stat.size > MAX_FILE_SIZE) {
                        skippedFiles.push({ path: relPath, reason: `كبير ${(stat.size/1024/1024).toFixed(1)}MB`, size: stat.size })
                        continue
                    }

                    // تجاهل ملفات بدون اسم أو مخفية
                    if (item.startsWith('.') && item !== '.gitignore') continue

                    filesToBackup.push({ fullPath, relPath, size: stat.size })
                    totalSize += stat.size
                    totalFiles++
                }
            }
        }

        await m.reply("📦 *جاري تحليل الملفات...*")
        console.log("[BACKUP] تحليل الملفات...")

        walkDir(root)

        const expectedMB = (totalSize / 1024 / 1024).toFixed(2)
        const skippedSize = skippedFiles.reduce((a, b) => a + b.size, 0)
        const skippedMB = (skippedSize / 1024 / 1024).toFixed(2)

        console.log(`[BACKUP] 📊 ${totalFiles} ملف (${expectedMB} MB)`)
        console.log(`[BACKUP] ⏭️ ${skippedFiles.length} ملف تم تجاهله (${skippedMB} MB)`)

        // عرض تقرير المستثنى (أكبر 10)
        const topSkipped = skippedFiles
            .sort((a, b) => b.size - a.size)
            .slice(0, 10)

        let reportText = [
            `📊 *تقرير النسخ الاحتياطي*`,
            ``,
            `📁 الملفات: ${totalFiles}`,
            `📦 الحجم المتوقع: ~${expectedMB} MB`,
            `⏭️ تم تجاهل: ${skippedFiles.length} ملف (${skippedMB} MB)`,
        ]

        if (topSkipped.length > 0) {
            reportText.push(``, `🔝 *أكبر الملفات المستثناة:*`)
            for (const f of topSkipped) {
                if (f.size > 0) {
                    reportText.push(`• ${f.path} (${(f.size/1024/1024).toFixed(1)}MB)`)
                }
            }
        }

        reportText.push(``, `⏳ *جاري الضغط...*`)
        await m.reply(reportText.join('\n'))

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ⚡ لو لسه كبير — نقلل الحد
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (totalSize > 90 * 1024 * 1024) {
            // قلل الحد لـ 2MB بدل 5MB
            const smallerLimit = 2 * 1024 * 1024
            filesToBackup = filesToBackup.filter(f => f.size <= smallerLimit)
            totalSize = filesToBackup.reduce((a, b) => a + b.size, 0)
            totalFiles = filesToBackup.length
            const newMB = (totalSize / 1024 / 1024).toFixed(2)
            console.log(`[BACKUP] 📉 تقليل الحد: ${totalFiles} ملف (${newMB} MB)`)
            await m.reply(`📉 *تقليل الملفات عشان الحجم... (${newMB} MB)*`)
        }

        // لو لسه كبير — قلل لـ 1MB
        if (totalSize > 85 * 1024 * 1024) {
            const tinyLimit = 1 * 1024 * 1024
            filesToBackup = filesToBackup.filter(f => f.size <= tinyLimit)
            totalSize = filesToBackup.reduce((a, b) => a + b.size, 0)
            totalFiles = filesToBackup.length
        }

        // لو لسه كبير — الكود بس
        if (totalSize > 80 * 1024 * 1024) {
            const codeOnly = new Set(['.js', '.json', '.mjs', '.cjs', '.ts', '.md', '.txt', '.yaml', '.yml'])
            filesToBackup = filesToBackup.filter(f => codeOnly.has(path.extname(f.relPath).toLowerCase()))
            totalSize = filesToBackup.reduce((a, b) => a + b.size, 0)
            totalFiles = filesToBackup.length
            await m.reply(`📝 *وضع الكود فقط: ${totalFiles} ملف (${(totalSize/1024/1024).toFixed(2)} MB)*`)
        }

        if (totalFiles === 0) {
            return m.reply("❌ *مفيش ملفات للنسخ!*")
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ⚡ إنشاء الأرشيف
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("⏰ انتهت المهلة (3 دقايق)"))
            }, 3 * 60 * 1000)

            const output  = fs.createWriteStream(backupPath)
            const archive = archiver("zip", { zlib: { level: 5 } })

            output.on("close", () => {
                clearTimeout(timeout)
                console.log(`[BACKUP] ✅ أرشيف: ${archive.pointer()} bytes`)
                resolve()
            })

            output.on("error", (err) => {
                clearTimeout(timeout)
                reject(err)
            })

            archive.on("error", (err) => {
                clearTimeout(timeout)
                reject(err)
            })

            archive.on("warning", (warn) => {
                console.warn("[BACKUP] ⚠️", warn.message)
            })

            archive.pipe(output)

            // ━━━ أضف الملفات واحد واحد ━━━
            for (const f of filesToBackup) {
                try {
                    archive.file(f.fullPath, { name: f.relPath })
                } catch (e) {
                    console.warn(`[BACKUP] ⏭️ فشل: ${f.relPath}`)
                }
            }

            console.log(`[BACKUP] 📦 بيضغط ${totalFiles} ملف...`)
            archive.finalize()
        })

        // ━━━ تحقق ━━━
        if (!fs.existsSync(backupPath)) {
            return m.reply("❌ *فشل إنشاء ملف النسخ!*")
        }

        const fileSize = fs.statSync(backupPath).size
        const sizeMB = (fileSize / 1024 / 1024).toFixed(2)

        console.log(`[BACKUP] 📊 الحجم النهائي: ${sizeMB} MB`)

        if (fileSize === 0) {
            try { fs.unlinkSync(backupPath) } catch {}
            return m.reply("❌ *ملف النسخ فاضي!*")
        }

        if (fileSize > 95 * 1024 * 1024) {
            try { fs.unlinkSync(backupPath) } catch {}
            return m.reply(`❌ *الملف لسه كبير (${sizeMB} MB)*\n\nجرب: \`.سك_كود\` للكود بس`)
        }

        // ━━━ تحديد وجهة الإرسال ━━━
        let sendTo = m.chat
        if (m.isGroup) {
            const senderNum = (m.sender || "").split("@")[0].split(":")[0]
            if (senderNum) sendTo = senderNum + "@s.whatsapp.net"
        }

        console.log(`[BACKUP] 📤 إرسال: ${sendTo} (${sizeMB} MB)`)

        await m.reply(`✅ *تم الضغط!*\n📊 ${sizeMB} MB | ${totalFiles} ملف\n⏳ جاري الإرسال...`)

        // ━━━ إرسال ━━━
        try {
            await conn.sendMessage(sendTo, {
                document: fs.readFileSync(backupPath),
                fileName: `${backupName}.zip`,
                mimetype: "application/zip",
                caption: [
                    `📦 *نسخة احتياطية - ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}*`,
                    ``,
                    `📊 الحجم: ${sizeMB} MB`,
                    `📁 الملفات: ${totalFiles}`,
                    `📅 ${new Date().toLocaleString("ar-EG")}`,
                    ``,
                    `📌 *تعليمات:*`,
                    `1️⃣ فك الضغط`,
                    `2️⃣ npm install`,
                    `3️⃣ ضع ملف الجلسة`,
                    `4️⃣ node index.js`,
                ].join("\n")
            }, { quoted: m })

            console.log(`[BACKUP] ✅ تم!`)

            await conn.sendMessage(m.chat, {
                react: { text: "✅", key: m.key }
            }).catch(() => {})

            if (m.isGroup) await m.reply("✅ *تم إرسال النسخة في الخاص!*")

        } catch (sendErr) {
            console.error("[BACKUP] ❌ فشل:", sendErr.message)

            if (sendTo !== m.chat) {
                try {
                    await conn.sendMessage(m.chat, {
                        document: fs.readFileSync(backupPath),
                        fileName: `${backupName}.zip`,
                        mimetype: "application/zip",
                        caption: `📦 *نسخة احتياطية*\n📊 ${sizeMB} MB`
                    }, { quoted: m })
                } catch (err2) {
                    await m.reply(`❌ *فشل الإرسال*\n${sendErr.message}`)
                }
            } else {
                await m.reply(`❌ *فشل الإرسال*\n${sendErr.message}`)
            }
        }

    } catch (e) {
        console.error("[BACKUP] ❌:", e)
        await m.reply("❌ *فشل!*\n" + (e.message || String(e))).catch(() => {})
    } finally {
        try { if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath) } catch {}
    }
}

handler.help    = ["fullbackup"]
handler.tags    = ["owner"]
handler.command = /^(سك|fullbackup|fb|نسخ_كامل)$/i
handler.owner   = true

export default handler