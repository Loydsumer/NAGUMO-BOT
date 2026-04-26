import fetch from "node-fetch"

let handler = async (m, { command, conn, text }) => {
    let options = { "مجموعة": "gc", "خاص": "pc" }

    if (command === "بحث-رساله") {
        return m.reply(`📌 *طريقة استخدام البحث في الرسائل:*\n\n🔹 يمكنك البحث عن الرسائل في *المجموعات* أو *المحادثات الخاصة* باستخدام الأمر التالي:\n\n📝 *الصيغة:*\n\`بحث-رساله [مجموعة|خاص]|[الكلمة المراد البحث عنها]\`\n\n📌 *مثال:*\n🔹 للبحث عن كلمة "مرحبا" في *المجموعات*:\n\`بحث-رساله مجموعة|مرحبا\`\n🔹 للبحث عن كلمة "السلام عليكم" في *الدردشات الخاصة*:\n\`بحث-رساله خاص|السلام عليكم\`\n\n⚠️ *ملاحظات:*\n- يجب تحديد *مجموعة* أو *خاص* في البحث.\n- سيتم عرض جميع الرسائل التي تحتوي على الكلمة المطلوبة.\n- يظهر اسم المجموعة (إن كان البحث في القروبات) ومرسل الرسالة.\n\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`)
    }

    let [feature, searchText] = text.split("|")
    if (!feature || !searchText) {
        throw `⚠️ *استخدام خاطئ!*\nاستخدم الأمر بالشكل التالي:\n\`بحث-رساله [مجموعة|خاص]|[الكلمة المراد البحث عنها]\`\n\n📌 *مثال:*\n🔹 \`بحث-رساله مجموعة|كيف حالكم\`\n🔹 \`بحث-رساله خاص|السلام عليكم\`\n\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`
    }

    let type = options[feature]
    if (!type) throw "❌ *نوع البحث غير صحيح!* اختر: مجموعة أو خاص 🧞‍♀️"

    let chats = Object.entries(await conn.chats)
        .filter(([jid]) => (type === "gc" ? jid.endsWith("g.us") : !jid.endsWith("g.us")))
        .map(([jid, chat]) => ({
            jid,
            messages: Object.values(chat.messages || {})
        }))

    let foundMessages = chats.flatMap(({ jid, messages }) =>
        messages.filter(msg =>
            (msg.message?.extendedTextMessage?.text?.includes(searchText) ||
                msg.message?.conversation?.includes(searchText)) &&
            msg.key.remoteJid
        ).map(msg => ({ msg, jid }))
    )

    if (!foundMessages.length) throw "❌ *لم يتم العثور على أي رسالة تحتوي على هذه الكلمة!* 🧞‍♀️"

    let results = await Promise.all(
        foundMessages.map(async ({ msg, jid }, index) => {
            let sender = "@" + (msg.key.participant || msg.key.remoteJid).split("@")[0]
            let chatName = type === "gc" ? `📌 *المجموعة:* ${await conn.getName(jid)}` : ""
            let messageText = msg.message?.extendedTextMessage?.text || msg.message?.conversation || ""

            return `🎯 *[ ${index + 1} ]*\n${chatName}\n👤 *المرسل:* ${sender}\n💬 *الرسالة:* ${messageText}`
        })
    )

    let response = results.join("\n\n________________________\n\n")
    m.reply(response, m.chat, { mentions: await conn.parseMention(response) })
}

handler.help = ["بحث-رساله", "بحثرسالة نوع|كلمة", "searchmessage نوع|كلمة"]
handler.tags = ["tools"]
handler.command = /^(بحث-رساله|بحثرسالة|searchmessage)$/i

export default handler