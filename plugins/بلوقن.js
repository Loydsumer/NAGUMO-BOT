// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  📦 إدارة البلوقنات — مع نظام الأقسام
//  🤖 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fs   from "fs"
import path from "path"
import { downloadContentFromMessage } from "@whiskeysockets/baileys"

// ── مسار ملف تصنيف الأقسام ────────────────────────────────────────────────
const TAGS_FILE = "./src/database/plugin-tags.json"

// ── الأقسام المتاحة ────────────────────────────────────────────────────────
const SECTIONS = {
    ai:         "🤖 الذكاء الاصطناعي",
    downloader: "🔗 التحميلات",
    games:      "🎮 الألعاب",
    sticker:    "🖼️ الصور والستيكر",
    group:      "👥 المجموعات",
    tools:      "🔧 الأدوات",
    economy:    "🏦 الاقتصاد",
    protection: "🛡️ الحماية",
    fun:        "🎉 ترفيه",
    owner:      "⚜️ المطور",
    main:       "🏠 عام",
}

// ── قراءة/كتابة ملف الأقسام ───────────────────────────────────────────────
function loadTags() {
    try {
        if (fs.existsSync(TAGS_FILE)) return JSON.parse(fs.readFileSync(TAGS_FILE, "utf-8"))
    } catch {}
    return {}
}

function saveTags(data) {
    try {
        const dir = path.dirname(TAGS_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(TAGS_FILE, JSON.stringify(data, null, 2), "utf-8")
    } catch {}
}

// ── محاولة كشف القسم من الكود تلقائياً ───────────────────────────────────
function detectTag(code) {
    const match = code.match(/handler\.tags\s*=\s*\[['"`]([^'"`]+)['"`]\]/)
    if (match) return match[1].toLowerCase()
    return null
}

// ── جلسات الانتظار (ينتظر رد المستخدم لاختيار القسم) ─────────────────────
const waitingSections = new Map()  // sender → { fileName, code, pluginsDir }

// ─────────────────────────────────────────────────────────────────────────────

let handler = async (m, { conn, args, usedPrefix }) => {

    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }) } catch {}
    }

    const pluginsDir  = path.dirname(global.__filename(import.meta.url, true))
    const currentFile = path.basename(global.__filename(import.meta.url, true))
    const getPlugins  = () => fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js") && f !== currentFile)

    const action = (args[0] || "").toLowerCase()
    const tags   = loadTags()

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  انتظار اختيار القسم — لو المستخدم بعت رقم
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (waitingSections.has(m.sender) && /^[0-9]+$/.test(m.text?.trim())) {
        const session    = waitingSections.get(m.sender)
        const secKeys    = Object.keys(SECTIONS)
        const choice     = parseInt(m.text.trim()) - 1

        if (choice < 0 || choice >= secKeys.length) {
            return m.reply("❌ رقم غير صحيح — اختار رقم من القائمة")
        }

        const chosenTag = secKeys[choice]

        // حفظ الملف
        const savePath = path.join(session.pluginsDir, session.fileName)
        const isEdit   = fs.existsSync(savePath)
        fs.writeFileSync(savePath, session.code, "utf-8")

        // حفظ القسم
        tags[session.fileName] = chosenTag
        saveTags(tags)

        waitingSections.delete(m.sender)

        await react("✅")
        return m.reply(
            `✅ تم ${isEdit ? "تعديل" : "إضافة"} البلوقن *${session.fileName}*\n` +
            `📂 القسم: ${SECTIONS[chosenTag]}`
        )
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  لست — عرض كل البلوقنات مع أقسامها
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/^(لست|list)$/i.test(action)) {
        const plugins = getPlugins()
        if (!plugins.length) {
            await react("📦")
            return m.reply("📂 لا يوجد أي بلوقنات")
        }

        // تجميع حسب القسم
        const grouped = {}
        for (const f of plugins) {
            const tag = tags[f] || "main"
            if (!grouped[tag]) grouped[tag] = []
            grouped[tag].push(f.replace(".js", ""))
        }

        const lines = [`╔══「 📦 قائمة البلوقنات 」══╗`, ``]
        for (const [tag, cmds] of Object.entries(grouped)) {
            const sec = SECTIONS[tag] || `📌 ${tag}`
            lines.push(`┌─「 ${sec} 」`)
            cmds.forEach((c, i) => lines.push(`│  ${i + 1}. ${c}`))
            lines.push(`└──────────────────`)
            lines.push(``)
        }
        lines.push(`> المجموع: ${plugins.length} بلوقن`)

        await react("📦")
        return m.reply(lines.join("\n"))
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  عرض — إرسال ملف بلوقن
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/^(عرض|show|get)$/i.test(action)) {
        const nameArg = args.slice(1).join(" ").trim()
        if (!nameArg) return m.reply(`📄 الاستخدام:\n${usedPrefix}بلوقن عرض <اسم>`)

        const fileName = nameArg.replace(/\.js$/i, "") + ".js"
        const filePath = path.join(pluginsDir, fileName)
        if (!fs.existsSync(filePath)) {
            await react("❌")
            return m.reply(`❌ الملف *${fileName}* غير موجود`)
        }

        await react("📄")
        return conn.sendMessage(m.chat, {
            document: fs.readFileSync(filePath),
            fileName,
            mimetype: "application/javascript",
            caption:  `📦 *${fileName}*\n📂 القسم: ${SECTIONS[tags[fileName] || "main"] || "عام"}`
        }, { quoted: m })
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  نقل — نقل بلوقن لقسم تاني
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/^(نقل|move)$/i.test(action)) {
        const nameArg = args.slice(1).join(" ").trim()
        if (!nameArg) return m.reply(`📂 الاستخدام:\n${usedPrefix}بلوقن نقل <اسم>`)

        const fileName = nameArg.replace(/\.js$/i, "") + ".js"
        if (!fs.existsSync(path.join(pluginsDir, fileName))) {
            await react("❌")
            return m.reply(`❌ الملف *${fileName}* غير موجود`)
        }

        const currentTag = tags[fileName] || "main"
        const secKeys    = Object.keys(SECTIONS)
        const lines      = [
            `📂 *${fileName}*`,
            `القسم الحالي: ${SECTIONS[currentTag]}`,
            ``,
            `اختار القسم الجديد:`,
            ``
        ]
        secKeys.forEach((k, i) => lines.push(`${i + 1}. ${SECTIONS[k]}`))
        lines.push(`\nأرسل الرقم للتأكيد`)

        // حفظ جلسة الانتظار
        waitingSections.set(m.sender, {
            fileName,
            code:       fs.readFileSync(path.join(pluginsDir, fileName), "utf-8"),
            pluginsDir,
            isMove:     true,
        })

        await react("📂")
        return m.reply(lines.join("\n"))
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  حذف — حذف البلوقن من النظام والقسم
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/^(حذف|delete|del|remove)$/i.test(action)) {
        const nameArg = args.slice(1).join(" ").trim()
        if (!nameArg) return m.reply(`🗑️ الاستخدام:\n${usedPrefix}بلوقن حذف <اسم>`)

        const fileName = nameArg.replace(/\.js$/i, "") + ".js"
        const filePath = path.join(pluginsDir, fileName)
        if (!fs.existsSync(filePath)) {
            await react("❌")
            return m.reply(`❌ الملف *${fileName}* غير موجود`)
        }

        const oldTag = tags[fileName] || "main"

        // حذف الملف
        fs.unlinkSync(filePath)

        // حذف من الذاكرة
        if (global.plugins?.[fileName]) delete global.plugins[fileName]

        // حذف من ملف الأقسام
        delete tags[fileName]
        saveTags(tags)

        await react("🗑️")
        return m.reply(
            `🗑️ تم حذف *${fileName}*\n` +
            `كان في قسم: ${SECTIONS[oldTag] || oldTag}`
        )
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  اضف — إضافة بلوقن جديد
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/^(اضف|اضافه|اضافة|add)$/i.test(action)) {
        const quoted = m.quoted
        if (!quoted) {
            await react("❌")
            return m.reply("❌ رد على كود أو ملف البلوقن")
        }

        let code     = ""
        let fileName = ""

        // ─── ملف Document ────────────────────────────────────────────────
        const docMsg = quoted.message?.documentMessage ||
            quoted.message?.documentWithCaptionMessage?.message?.documentMessage || null

        if (docMsg) {
            let buffer
            try { buffer = await quoted.download() } catch {
                try {
                    const stream = await downloadContentFromMessage(docMsg, "document")
                    const chunks = []
                    for await (const c of stream) chunks.push(c)
                    buffer = Buffer.concat(chunks)
                } catch (e) {
                    await react("❌")
                    return m.reply("❌ فشل تحميل الملف: " + e.message)
                }
            }

            const baseName = (docMsg.fileName || `plugin_${Date.now()}`).replace(/\.js$/i, "")
            fileName = `${baseName}.js`
            code     = buffer.toString("utf-8")

        } else {
            // ─── نص (كود مكتوب) ──────────────────────────────────────────
            code = quoted.text || quoted.body || ""
            if (!code.trim()) {
                await react("❌")
                return m.reply("❌ الرسالة مش فيها كود")
            }

            const matchName = code.match(/handler\.command\s*=\s*\/\^\(?([^)\/|\\s]+)/) ||
                              code.match(/command\s*:\s*['"`]([^'"`]+)['"`]/)
            fileName = matchName
                ? `${matchName[1].trim()}.js`
                : `plugin_${Date.now()}.js`
        }

        // ─── كشف القسم تلقائياً ──────────────────────────────────────────
        const detectedTag = detectTag(code)

        if (detectedTag && SECTIONS[detectedTag]) {
            // القسم واضح في الكود — حفظ مباشرة
            const savePath = path.join(pluginsDir, fileName)
            const isEdit   = fs.existsSync(savePath)
            fs.writeFileSync(savePath, code, "utf-8")
            tags[fileName] = detectedTag
            saveTags(tags)

            await react("✅")
            return m.reply(
                `✅ تم ${isEdit ? "تعديل" : "إضافة"} *${fileName}*\n` +
                `📂 القسم (تلقائي): ${SECTIONS[detectedTag]}`
            )
        }

        // ─── القسم مش معروف — اسأل المستخدم ─────────────────────────────
        const secKeys = Object.keys(SECTIONS)
        const lines   = [
            `📦 *${fileName}*`,
            ``,
            `مش قادر أحدد القسم تلقائياً.`,
            `اختار القسم المناسب:`,
            ``
        ]
        secKeys.forEach((k, i) => lines.push(`${i + 1}. ${SECTIONS[k]}`))
        lines.push(`\nأرسل الرقم للتأكيد`)

        waitingSections.set(m.sender, { fileName, code, pluginsDir })

        await react("❓")
        return m.reply(lines.join("\n"))
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  القائمة الافتراضية
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await react("📦")
    return m.reply(
        `╭──「 📦 إدارة البلوقنات 」──╮\n` +
        `│\n` +
        `│ ${usedPrefix}بلوقن لست\n` +
        `│   ↳ قائمة كل البلوقنات بأقسامها\n` +
        `│\n` +
        `│ ${usedPrefix}بلوقن عرض <اسم>\n` +
        `│   ↳ إرسال ملف البلوقن\n` +
        `│\n` +
        `│ ${usedPrefix}بلوقن اضف (رد على كود/ملف)\n` +
        `│   ↳ إضافة بلوقن جديد\n` +
        `│\n` +
        `│ ${usedPrefix}بلوقن نقل <اسم>\n` +
        `│   ↳ نقل بلوقن لقسم تاني\n` +
        `│\n` +
        `│ ${usedPrefix}بلوقن حذف <اسم>\n` +
        `│   ↳ حذف بلوقن نهائياً\n` +
        `│\n` +
        `╰── 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓 ──╯`
    )
}

handler.help    = ["بلوقن لست", "بلوقن عرض", "بلوقن اضف", "بلوقن نقل", "بلوقن حذف"]
handler.tags    = ["owner"]
handler.command = /^(بلوقن|plugin|plugins)$/i
handler.owner   = true

export default handler
