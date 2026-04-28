// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🤖 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓 — AI مع تحكم كامل في الواتساب
//  شات + صور + إدارة جروبات + معلومات ذكية
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch"
import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync, statSync } from "fs"
import { join, dirname } from "path"

const GROQ_KEY     = "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"
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
const MODEL_TEXT   = "llama-3.3-70b-versatile"
const MODEL_VISION = "meta-llama/llama-4-scout-17b-16e-instruct"

const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY || ""
const CLAUDE_URL = "https://api.anthropic.com/v1/messages"
const CLAUDE_MODEL = "claude-sonnet-4-5"
const USE_CLAUDE = !!CLAUDE_KEY
const BOT_DIR = process.cwd()

// ── console capture ────────────────────────────────────────────────────────
const consoleLogs = []
const _log = console.log, _err = console.error, _warn = console.warn
const pushLog = (type, args) => {
    consoleLogs.push({ time: Date.now(), line: `[${type}] ${args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ")}` })
    if (consoleLogs.length > 200) consoleLogs.shift()
}
console.log   = (...a) => { _log(...a);  pushLog("LOG",   a) }
console.error = (...a) => { _err(...a);  pushLog("ERROR", a) }
console.warn  = (...a) => { _warn(...a); pushLog("WARN",  a) }

// ── file tools (owner only) ────────────────────────────────────────────────
const fileTools = {
    list_files: ({ path: p = "." }) => {
        const dir = p.startsWith("/") ? p : join(BOT_DIR, p)
        try {
            return readdirSync(dir).map(f => {
                const full = join(dir, f)
                const stat = statSync(full)
                return stat.isDirectory() ? `📁 ${f}/` : `📄 ${f} (${(stat.size/1024).toFixed(1)}KB)`
            }).join("\n")
        } catch (e) { return `Error: ${e.message}` }
    },
    read_file: ({ path: p }) => {
        const full = p.startsWith("/") ? p : join(BOT_DIR, p)
        if (!existsSync(full)) return `Error: File not found: ${p}`
        try { return readFileSync(full, "utf-8").slice(0, 3000) } catch (e) { return `Error: ${e.message}` }
    },
    write_file: ({ path: p, content }) => {
        const full = p.startsWith("/") ? p : join(BOT_DIR, p)
        try {
            mkdirSync(dirname(full), { recursive: true })
            writeFileSync(full, content, "utf-8")
            return `✅ Saved: ${full}`
        } catch (e) { return `Error: ${e.message}` }
    },
    delete_file: ({ path: p }) => {
        const full = p.startsWith("/") ? p : join(BOT_DIR, p)
        if (!existsSync(full)) return `Error: Not found`
        try { unlinkSync(full); return `✅ Deleted: ${p}` } catch (e) { return `Error: ${e.message}` }
    },
    get_console: () => {
        return consoleLogs.slice(-20).map(l =>
            `[${new Date(l.time).toLocaleTimeString("en-US")}] ${l.line}`
        ).join("\n") || "Console is empty"
    },
    restart_bot: () => { setTimeout(() => process.exit(0), 1500); return "✅ Restarting..." }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ⚡ Helper Functions (LID + JID support)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function extractNum(jid) {
    if (!jid) return ""
    return jid.split("@")[0].split(":")[0]
}

function findMemberJid(metadata, number) {
    const cleanNum = number.replace(/[^0-9]/g, "")
    const member = metadata.participants.find(p => extractNum(p.id) === cleanNum)
    return member ? member.id : cleanNum + "@s.whatsapp.net"
}

function findMember(metadata, number) {
    const cleanNum = number.replace(/[^0-9]/g, "")
    return metadata.participants.find(p => extractNum(p.id) === cleanNum) || null
}

function getDisplayName(conn, jid) {
    try {
        const num = extractNum(jid)
        const name = conn.getName?.(jid)
            || conn.chats?.[jid]?.name
            || conn.chats?.[jid]?.notify
            || conn.chats?.[jid]?.vname
            || conn.chats?.[num + "@s.whatsapp.net"]?.name
            || conn.chats?.[num + "@s.whatsapp.net"]?.notify
            || conn.chats?.[num + "@s.whatsapp.net"]?.vname
            || null
        return name || num
    } catch {
        return extractNum(jid)
    }
}

function formatMember(conn, jid) {
    const num = extractNum(jid)
    const name = getDisplayName(conn, jid)
    return name !== num ? `${name} (${num})` : num
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ⚡ WhatsApp Tools
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function buildWhatsAppTools(conn, m, isOwner, isAdmin, isBotAdmin) {
    const tools = {}

    tools.get_group_info = async () => {
        if (!m.isGroup) return "❌ This is a private chat, not a group."
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const admins = metadata.participants.filter(p => p.admin).map(p => {
                const role = p.admin === "superadmin" ? "👑 Owner" : "🛡️ Admin"
                return `  ${role}: ${formatMember(conn, p.id)}`
            })

            const senderNum = extractNum(m.sender)
            const senderP = metadata.participants.find(p => extractNum(p.id) === senderNum)
            const senderRole = senderP?.admin === "superadmin" ? "👑 أنت صاحب الجروب" :
                              senderP?.admin === "admin" ? "🛡️ أنت مشرف" : "👤 أنت عضو عادي"

            const botNum = extractNum(conn.user.id)
            const botLid = conn.user.lid ? extractNum(conn.user.lid) : ""
            const botP = metadata.participants.find(p => {
                const pNum = extractNum(p.id)
                return pNum === botNum || (botLid && pNum === botLid)
            })
            const botRole = botP?.admin ? "✅ البوت مشرف" : "❌ البوت مش مشرف"

            return [
                `📋 Group: ${metadata.subject}`,
                `📝 Description: ${metadata.desc || "No description"}`,
                `👥 Members: ${metadata.participants.length}`,
                `🔒 Settings: ${metadata.announce ? "Admins only" : "Everyone can send"}`,
                ``,
                `${senderRole}`,
                `${botRole}`,
                ``,
                `👑 Admins & Owner:`,
                ...admins
            ].join("\n")
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.get_members = async () => {
        if (!m.isGroup) return "❌ Not a group."
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const members = metadata.participants.map(p => {
                const role = p.admin === "superadmin" ? "👑" : p.admin === "admin" ? "🛡️" : "👤"
                return `${role} ${formatMember(conn, p.id)}`
            })
            return `👥 Members (${members.length}):\n${members.join("\n")}`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.close_group = async () => {
        if (!m.isGroup) return "❌ Not a group."
        if (!isAdmin && !isOwner) return "❌ You need to be admin or owner."
        if (!isBotAdmin) return "❌ Bot is not admin in this group."
        try {
            await conn.groupSettingUpdate(m.chat, "announcement")
            return "✅ Group closed — only admins can send messages now."
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.open_group = async () => {
        if (!m.isGroup) return "❌ Not a group."
        if (!isAdmin && !isOwner) return "❌ You need to be admin or owner."
        if (!isBotAdmin) return "❌ Bot is not admin in this group."
        try {
            await conn.groupSettingUpdate(m.chat, "not_announcement")
            return "✅ Group opened — everyone can send messages now."
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.change_group_name = async ({ name }) => {
        if (!m.isGroup) return "❌ Not a group."
        if (!isAdmin && !isOwner) return "❌ You need to be admin or owner."
        if (!isBotAdmin) return "❌ Bot is not admin."
        if (!name) return "❌ No name provided."
        try {
            await conn.groupUpdateSubject(m.chat, name)
            return `✅ Group name changed to: ${name}`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.change_group_desc = async ({ description }) => {
        if (!m.isGroup) return "❌ Not a group."
        if (!isAdmin && !isOwner) return "❌ You need to be admin or owner."
        if (!isBotAdmin) return "❌ Bot is not admin."
        try {
            await conn.groupUpdateDescription(m.chat, description || "")
            return `✅ Group description updated.`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.kick_member = async ({ number }) => {
        if (!m.isGroup) return "❌ Not a group."
        if (!isAdmin && !isOwner) return "❌ You need to be admin or owner."
        if (!isBotAdmin) return "❌ Bot is not admin in this group."
        if (!number) return "❌ No number provided."
        const cleanNum = number.replace(/[^0-9]/g, "")
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const member = findMember(metadata, cleanNum)
            if (!member) return `❌ Member ${cleanNum} not found in this group.`
            const displayName = formatMember(conn, member.id)
            await conn.groupParticipantsUpdate(m.chat, [member.id], "remove")
            return `✅ Kicked: ${displayName}`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.promote_member = async ({ number }) => {
        if (!m.isGroup) return "❌ Not a group."
        if (!isAdmin && !isOwner) return "❌ You need to be admin or owner."
        if (!isBotAdmin) return "❌ Bot is not admin."
        if (!number) return "❌ No number provided."
        const cleanNum = number.replace(/[^0-9]/g, "")
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const member = findMember(metadata, cleanNum)
            if (!member) return `❌ Member ${cleanNum} not found.`
            const displayName = formatMember(conn, member.id)
            await conn.groupParticipantsUpdate(m.chat, [member.id], "promote")
            return `✅ Promoted: ${displayName}`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.demote_member = async ({ number }) => {
        if (!m.isGroup) return "❌ Not a group."
        if (!isAdmin && !isOwner) return "❌ You need to be admin or owner."
        if (!isBotAdmin) return "❌ Bot is not admin."
        if (!number) return "❌ No number provided."
        const cleanNum = number.replace(/[^0-9]/g, "")
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const member = findMember(metadata, cleanNum)
            if (!member) return `❌ Member ${cleanNum} not found.`
            const displayName = formatMember(conn, member.id)
            await conn.groupParticipantsUpdate(m.chat, [member.id], "demote")
            return `✅ Demoted: ${displayName}`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.send_message = async ({ text, to }) => {
        if (!isOwner) return "❌ Only owner can send messages via AI."
        const target = to ? (to.replace(/[^0-9]/g, "") + "@s.whatsapp.net") : m.chat
        try {
            await conn.sendMessage(target, { text })
            return `✅ Message sent.`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.tag_all = async ({ message }) => {
        if (!m.isGroup) return "❌ Not a group."
        if (!isAdmin && !isOwner) return "❌ You need to be admin or owner."
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const mentions = metadata.participants.map(p => p.id)
            const text = message || "📢 تنبيه للجميع!"
            await conn.sendMessage(m.chat, { text, mentions })
            return `✅ Tagged ${mentions.length} members.`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.get_bot_info = async () => {
        const uptime = process.uptime()
        const days = Math.floor(uptime / 86400)
        const hours = Math.floor((uptime % 86400) / 3600)
        const mins = Math.floor((uptime % 3600) / 60)
        let pluginCount = 0
        for (const name in (global.plugins || {})) {
            if (global.plugins[name]?.command) pluginCount++
        }
        return [
            `🤖 Bot: ${global.botName || "Yoru"}`,
            `👤 Number: ${extractNum(conn.user?.id || "")}`,
            `📦 Plugins: ${pluginCount}`,
            `⏰ Uptime: ${days}d ${hours}h ${mins}m`,
            `🧠 Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB`,
        ].join("\n")
    }

    tools.get_user_info = async ({ number }) => {
        const targetNum = number
            ? number.replace(/[^0-9]/g, "")
            : extractNum(m.sender)
        let role = "👤 User"
        let displayName = targetNum
        if (m.isGroup) {
            try {
                const metadata = await conn.groupMetadata(m.chat)
                const p = metadata.participants.find(x => extractNum(x.id) === targetNum)
                if (p) {
                    displayName = getDisplayName(conn, p.id)
                    if (p.admin === "superadmin") role = "👑 Group Owner"
                    else if (p.admin === "admin") role = "🛡️ Admin"
                }
            } catch {}
        }
        const isGlobalOwner = (global.owner || []).includes(targetNum) ? "✅ Yes" : "❌ No"
        return [
            `👤 Name: ${displayName}`,
            `📱 Number: ${targetNum}`,
            `🏷️ Role: ${role}`,
            `👑 Bot Owner: ${isGlobalOwner}`,
        ].join("\n")
    }

    return tools
}

// ── Tool definitions for Groq ──────────────────────────────────────────────
const fileToolDefs = [
    { type: "function", function: { name: "list_files", description: "List files in a directory", parameters: { type: "object", properties: { path: { type: "string" } } } } },
    { type: "function", function: { name: "read_file",  description: "Read file content", parameters: { type: "object", required: ["path"], properties: { path: { type: "string" } } } } },
    { type: "function", function: { name: "write_file", description: "Write or create a file", parameters: { type: "object", required: ["path","content"], properties: { path: { type: "string" }, content: { type: "string" } } } } },
    { type: "function", function: { name: "delete_file", description: "Delete a file", parameters: { type: "object", required: ["path"], properties: { path: { type: "string" } } } } },
    { type: "function", function: { name: "get_console", description: "Get last 20 console log lines", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "restart_bot", description: "Restart the bot", parameters: { type: "object", properties: {} } } }
]

const waToolDefs = [
    { type: "function", function: { name: "get_group_info", description: "Get current group info, admins, members count, and check if user is admin", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "get_members", description: "Get full list of group members with roles and names", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "close_group", description: "Close group — only admins can send messages", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "open_group", description: "Open group — everyone can send messages", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "change_group_name", description: "Change group name", parameters: { type: "object", required: ["name"], properties: { name: { type: "string" } } } } },
    { type: "function", function: { name: "change_group_desc", description: "Change group description", parameters: { type: "object", required: ["description"], properties: { description: { type: "string" } } } } },
    { type: "function", function: { name: "kick_member", description: "Kick a member from the group by phone number. Returns success with name or error.", parameters: { type: "object", required: ["number"], properties: { number: { type: "string", description: "Phone number like 201234567890" } } } } },
    { type: "function", function: { name: "promote_member", description: "Promote a member to admin by phone number", parameters: { type: "object", required: ["number"], properties: { number: { type: "string" } } } } },
    { type: "function", function: { name: "demote_member", description: "Demote an admin to member by phone number", parameters: { type: "object", required: ["number"], properties: { number: { type: "string" } } } } },
    { type: "function", function: { name: "send_message", description: "Send a message to a chat (owner only)", parameters: { type: "object", required: ["text"], properties: { text: { type: "string" }, to: { type: "string", description: "Phone number (optional)" } } } } },
    { type: "function", function: { name: "tag_all", description: "Tag/mention all group members", parameters: { type: "object", properties: { message: { type: "string" } } } } },
    { type: "function", function: { name: "get_bot_info", description: "Get bot status, uptime, plugins count", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "get_user_info", description: "Get info about a user — name, role, admin status", parameters: { type: "object", properties: { number: { type: "string", description: "Phone number (optional, default is sender)" } } } } },
]

// ── system prompts ─────────────────────────────────────────────────────────
const SYSTEM_USER = `أنت 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓 — مساعد ذكاء اصطناعي في بوت واتساب. صُنعت بواسطة ♡Jana♡.

عندك أدوات تتحكم بيها في الجروب:
- get_group_info: تجيب معلومات الجروب والمشرفين بأسمائهم
- get_members: تجيب قائمة كل الأعضاء بأسمائهم
- close_group / open_group: تقفل أو تفتح الجروب
- change_group_name / change_group_desc: تغيّر اسم أو وصف الجروب
- kick_member / promote_member / demote_member: تطرد أو ترقّي أو تنزّل عضو
- tag_all: تعمل منشن لكل الأعضاء
- get_bot_info: معلومات البوت
- get_user_info: معلومات عضو معين بالاسم

قواعد مهمة:
1. لو حد سألك عن الجروب أو المشرفين أو الأعضاء — استخدم الأدوات
2. لو حد قال "اقفل الجروب" — استخدم close_group
3. لو حد قال "مين المشرفين" — استخدم get_group_info
4. لو حد قال "أنا مشرف؟" — استخدم get_user_info
5. لو حد قال "تاق الكل" — استخدم tag_all
6. الأوامر اللي بتحتاج صلاحية — الأدوات بتتحقق تلقائي
7. تجاوب بالعربي دايماً وبطريقة ودية
8. لما أداة ترجع "✅ Kicked: اسم" — قول "تم طرد اسم ✅" ومتقولش "مش قادر"
9. لما أداة ترجع نتيجة تبدأ بـ "✅" — معناها نجحت، قول النتيجة بالعربي
10. لما أداة ترجع نتيجة تبدأ بـ "❌" أو "Error" — معناها فشلت، قول السبب
11. لو حد سألك سؤال عادي — جاوب بدون أدوات
12. لا تذكر اسم الموديل أو الشركة أبداً`

const SYSTEM_OWNER = `أنت 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓 — مساعد AI مع تحكم كامل في البوت والواتساب. صُنعت بواسطة ♡Jana♡.
مجلد البوت: ${BOT_DIR}

عندك أدوات ملفات: list_files, read_file, write_file, delete_file, get_console, restart_bot
وعندك أدوات واتساب: get_group_info, get_members, close_group, open_group, change_group_name, change_group_desc, kick_member, promote_member, demote_member, send_message, tag_all, get_bot_info, get_user_info

قواعد:
1. استخدم الأدوات المناسبة حسب الطلب
2. لما أداة ترجع "✅" — معناها نجحت، قول النتيجة بالعربي
3. لما أداة ترجع "❌" أو "Error" — معناها فشلت
4. لو حد قال "اقفل الجروب" — close_group
5. لو حد قال "اقرا ملف" — read_file
6. لو حد قال "مين الأعضاء" — get_members
7. ممنوع تستدعي console.log أو eval
8. تجاوب بالعربي دايماً
9. لا تستدعي نفس الأداة مرتين لنفس الطلب

لما تنشئ plugin:
let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  m.reply("رد")
}
handler.command = /^(امر)$/i
handler.tags = ["misc"]
export default handler`

// ── AI call with tools ─────────────────────────────────────────────────────
async function askText(messages, allTools, allToolFns, isOwner = false) {
    const msgs = [...messages]
    const calledTools = new Set()

    for (let i = 0; i < 5; i++) {
        const body = { model: MODEL_TEXT, messages: msgs, max_tokens: 2048, temperature: 0.7 }

        const lastMsg = msgs[msgs.length - 1]?.content || ""
        const needsWaTools = /جروب|مجموع|مشرف|ادمن|اعضاء|اقفل|افتح|طرد|اطرد|ترقي|رقي|نزل|تنزيل|تاق|منشن|بوت|معلومات|admin|group|member|kick|promote|demote|close|open|tag|انا مشرف|هل انا|مين صاحب|owner/i.test(lastMsg)
        const needsFileTools = isOwner && /اقرا|قرا|اكتب|احذف|امسح|ls|ملفات|كونسل|ريستارت|read|write|delete|list|console|restart/i.test(lastMsg)

        if (needsWaTools || needsFileTools) {
            const activeDefs = []
            if (needsWaTools) activeDefs.push(...waToolDefs)
            if (needsFileTools) activeDefs.push(...fileToolDefs)
            body.tools = activeDefs
            body.tool_choice = "auto"
        }

        const res = await fetch(GROQ_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
            body: JSON.stringify(body)
        })
        if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`)
        const data = await res.json()
        const msg = data.choices[0].message

        if (!msg.tool_calls?.length) return msg.content || ""

        msgs.push(msg)
        for (const tc of msg.tool_calls) {
            const toolKey = `${tc.function.name}:${tc.function.arguments}`
            if (calledTools.has(toolKey)) {
                msgs.push({ role: "tool", tool_call_id: tc.id, content: "Already called this tool with same arguments. Use the previous result." })
                continue
            }
            calledTools.add(toolKey)

            const fn = allToolFns[tc.function.name]
            let result
            if (fn) {
                try {
                    const args = JSON.parse(tc.function.arguments || "{}")
                    result = await fn(args)
                } catch (e) {
                    result = `Error: ${e.message}`
                }
            } else {
                result = `Unknown tool: ${tc.function.name}`
            }
            console.log(`[AI Tool] ${tc.function.name} → ${String(result).slice(0, 100)}`)
            msgs.push({ role: "tool", tool_call_id: tc.id, content: String(result) })
        }
    }
    return "تعذر الحصول على رد."
}

async function askVision(imageBase64, mimeType, prompt) {
    const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
            model: MODEL_VISION,
            messages: [{
                role: "user",
                content: [
                    { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
                    { type: "text", text: prompt || "صف هذه الصورة بالتفصيل بالعربي" }
                ]
            }],
            max_tokens: 1024
        })
    })
    if (!res.ok) throw new Error(`Vision ${res.status}: ${await res.text()}`)
    return (await res.json()).choices[0].message.content
}

// ── conversation history ───────────────────────────────────────────────────
const chats = new Map()

function getHistory(sender) {
    if (!chats.has(sender)) chats.set(sender, [])
    return chats.get(sender)
}

// ── handler ────────────────────────────────────────────────────────────────
let handler = async (m, { conn, args, text, usedPrefix, command, isROwner }) => {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }) } catch {}
    }
    const reply = async (txt) => {
        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }

    const sub = args[0]?.toLowerCase()

    if (/^(مسح|clear|reset|جديد)$/.test(sub)) {
        chats.delete(m.sender)
        await react("🗑️")
        return reply("✅ محادثة جديدة")
    }

    if (!text?.trim()) {
        await react("🤖")
        return reply(
            `╔═══「 🤖 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓 AI 」═══╗\n│\n` +
            `│ 💬 ${usedPrefix}${command} <سؤالك>\n` +
            `│ 🖼️ ابعت صورة + ${usedPrefix}${command}\n` +
            `│ 🌐 ${usedPrefix}${command} ترجم <نص>\n` +
            `│ 📝 ${usedPrefix}${command} لخص <نص>\n` +
            `│ 💻 ${usedPrefix}${command} كود <مهمة>\n` +
            `│ 🗑️ ${usedPrefix}${command} مسح\n` +
            `│\n` +
            `│ ⚡ *أوامر ذكية:*\n` +
            `│ 💬 "مين المشرفين؟"\n` +
            `│ 💬 "اقفل الجروب"\n` +
            `│ 💬 "أنا مشرف؟"\n` +
            `│ 💬 "تاق الكل"\n` +
            `│ 💬 "معلومات البوت"\n` +
            `│\n╚══════════════════════╝`
        )
    }

    await react("⏳")

    // ── Check permissions (supports LID + regular JID) ──
    let isAdmin = false
    let isBotAdmin = false
    if (m.isGroup) {
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const botNum = extractNum(conn.user.id)
            const botLid = conn.user.lid ? extractNum(conn.user.lid) : ""
            const senderNum = extractNum(m.sender)

            isAdmin = metadata.participants.some(p =>
                extractNum(p.id) === senderNum && p.admin
            )

            isBotAdmin = metadata.participants.some(p => {
                const pNum = extractNum(p.id)
                return (pNum === botNum || (botLid && pNum === botLid)) && p.admin
            })
        } catch {}
    }
    const isOwner = isROwner || (global.owner || []).includes(extractNum(m.sender))

    const waTools = buildWhatsAppTools(conn, m, isOwner, isAdmin, isBotAdmin)
    const allToolFns = { ...waTools, ...(isOwner ? fileTools : {}) }

    try {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const imgMsg = m.message?.imageMessage || quoted?.imageMessage

        if (imgMsg) {
            const { downloadMediaMessage } = await import("@whiskeysockets/baileys")
            const buffer = await downloadMediaMessage(
                imgMsg === m.message?.imageMessage ? m : { message: quoted },
                "buffer", {}
            )
            const base64 = buffer.toString("base64")
            const mimeType = imgMsg.mimetype || "image/jpeg"
            const prompt = text.replace(/^(ai|ذكاء|مساعد|yoru|يورو|مس|قوين)/i, "").trim() || "صف هذه الصورة بالتفصيل"
            const answer = await askVision(base64, mimeType, prompt)
            await react("✅")
            return reply(answer)
        }

        if (/^ترجم|translate/i.test(sub)) {
            const toTranslate = args.slice(1).join(" ")
            if (!toTranslate) return reply("❌ اكتب النص بعد ترجم")
            const answer = await askText([
                { role: "system", content: "أنت مترجم محترف. رجع الترجمة فقط." },
                { role: "user", content: `ترجم:\n${toTranslate}` }
            ], [], allToolFns)
            await react("✅")
            return reply(`🌐 *الترجمة:*\n${answer}`)
        }

        if (/^لخص|summarize/i.test(sub)) {
            const toSum = args.slice(1).join(" ")
            if (!toSum) return reply("❌ اكتب النص بعد لخص")
            const answer = await askText([
                { role: "system", content: "لخص في نقاط مختصرة بالعربي." },
                { role: "user", content: toSum }
            ], [], allToolFns)
            await react("✅")
            return reply(`📝 *الملخص:*\n${answer}`)
        }

        if (/^كود|code/i.test(sub)) {
            const task = args.slice(1).join(" ")
            if (!task) return reply("❌ اكتب المهمة بعد كود")
            const answer = await askText([
                { role: "system", content: "اكتب كود نظيف ومشروح." },
                { role: "user", content: task }
            ], [], allToolFns)
            await react("✅")
            return reply(`💻 *الكود:*\n${answer}`)
        }

        const history = getHistory(m.sender)
        const system = isOwner ? SYSTEM_OWNER : SYSTEM_USER

        history.push({ role: "user", content: text.trim() })
        if (history.length > 16) history.splice(0, 2)

        const messages = [{ role: "system", content: system }, ...history]
        const answer = await askText(messages, [...waToolDefs, ...(isOwner ? fileToolDefs : [])], allToolFns, isOwner)

        history.push({ role: "assistant", content: answer })

        await react("✅")
        return reply(answer)

    } catch (err) {
        console.error("AI Error:", err.message)
        await react("❌")
        let msg = "❌ " + err.message
        if (err.message.includes("401")) msg = "🔑 API Key invalid"
        if (err.message.includes("429")) msg = "⏳ Rate limited — try again"
        return reply(msg)
    }
}

handler.help    = ["ai <سؤال>"]
handler.tags    = ["ai"]
handler.command = /^(ai|ذكاء|مساعد|اسال|ask|gpt|مس|يورو|yoru|قوين|qwen)$/i

export default handler