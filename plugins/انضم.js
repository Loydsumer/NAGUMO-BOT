let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;

let handler = async (m, { conn, text, isROwner, isOwner, isPrems }) => {
    const react = async (emoji) => {
        try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
    }

    // ━━━ استخراج الرابط ━━━
    let link = (m.quoted?.text ? m.quoted.text : text) || text
    let match = link.match(linkRegex)
    let code = match ? match[1] : null

    if (!code) {
        await react('❌')
        return m.reply(`❌ *الرابط غير صالح*\n\n📌 *الاستخدام الصحيح:*\n\`.انضم https://chat.whatsapp.com/XXXXXXX\``)
    }

    await react('⏳')
    await m.reply('🔄 *جاري محاولة الانضمام إلى المجموعة...*')

    // ━━━ التحقق من صلاحيات المستخدم ━━━
    const hasAccess = isROwner || isOwner || isPrems || m.fromMe

    if (hasAccess) {
        try {
            // محاولة الانضمام
            let res = await conn.groupAcceptInvite(code)
            
            // انتظار قليلاً حتى يتم الانضمام
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // الحصول على معرف المجموعة (res قد يكون هو المعرف مباشرة أو كائن)
            let groupJid = res
            if (typeof res === 'object' && res.gid) groupJid = res.gid
            if (typeof res === 'object' && res.id) groupJid = res.id
            
            // جلب معلومات المجموعة
            let groupMetadata = await conn.groupMetadata(groupJid)
            let groupName = groupMetadata.subject || 'المجموعة'

            await react('✅')
            await m.reply(`✅ *تم الانضمام بنجاح*\n\n📌 *اسم المجموعة:* ${groupName}\n👤 *تم بواسطة:* @${m.sender.split('@')[0]}\n\n> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`, { mentions: [m.sender] })
            
        } catch (err) {
            console.error('Join error:', err)
            // إذا كان الخطأ بسبب أن البوت موجود بالفعل، نعتبرها نجاح
            if (err.message?.includes('already') || err.message?.includes('exist')) {
                await react('✅')
                await m.reply(`✅ *البوت موجود بالفعل في المجموعة*\n\n> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`)
            } else {
                await react('❌')
                await m.reply(`❌ *فشل الانضمام*\n\n📌 *الأسباب المحتملة:*\n1️⃣ الرابط منتهي الصلاحية\n2️⃣ البوت محظور من المجموعة سابقاً\n3️⃣ المجموعة ممتلئة\n\n> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`)
            }
        }
    } else {
        // ━━━ للمستخدمين العاديين (إرسال طلب للمطور) ━━━
        await react('📨')
        
        // إرسال إشعار للمطورين
        const owners = global.owner || []
        for (let owner of owners) {
            let ownerJid = owner[0] + '@s.whatsapp.net'
            await conn.sendMessage(ownerJid, {
                text: `📨 *طلب انضمام بوت جديد*\n\n👤 *مقدم الطلب:* wa.me/${m.sender.split('@')[0]}\n🔗 *الرابط:* ${link}\n\n> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
                mentions: [m.sender]
            })
        }
        
        await m.reply(`✅ *تم إرسال طلبك للمطور*\n\n📌 سيتم مراجعة طلبك والرد عليك قريباً\n\n> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`)
    }
}

handler.help = ['انضم <رابط>']
handler.tags = ['group']
handler.command = /^(انضم|join)$/i

export default handler