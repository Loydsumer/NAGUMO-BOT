let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        // 👻 تحديد الرسالة بناء على الأمر المستخدم
        let commandInfo = {
            'robloxstalk': { name: 'روبلوكس', desc: 'تتبع معلومات لاعب روبلوكس' },
            'stalkroblox': { name: 'روبلوكس', desc: 'تتبع معلومات لاعب روبلوكس' },
            'روبلوكس': { name: 'روبلوكس', desc: 'تتبع معلومات لاعب روبلوكس' }
        }

        let currentCommand = commandInfo[command] || { name: 'روبلوكس', desc: 'تتبع معلومات لاعب روبلوكس' }

        if (!text) return m.reply(`👻 *يا رفيقي* ❌\n\nاكتب اسم لاعب روبلوكس عشان أبحث عنه\n\n👻 *مثال:*\n*${usedPrefix + command}* nau_pangindo`)

        await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

        let res = await fetch(`https://api.zenzxz.my.id/api/stalker/roblox?user=${encodeURIComponent(text)}`)
        if (!res.ok) throw new Error('👻 المشكلة في السيرفر يا رفيقي!')
        let json = await res.json()
        let data = json?.data
        if (!data) return m.reply('👻 *ما لقيت لاعب* 🎮\n\nما قدرت أجد بيانات لهذا اللاعب، تأكد من الاسم!')

        let user = data.basic
        let presence = data.presence?.userPresences?.[0]?.lastLocation || 'ما نعرف'
        let social = data.social
        let groups = data.groups?.list?.data?.slice(0, 5) || []

        let caption = `
👻 *ᎧᎶᏗᎷᎥ ᏰᎧᏖ - معلومات روبلوكس* 🎮

🪪 *الاسم:* ${user.displayName} (@${user.name})
🧩 *الرقم:* ${user.id}
📜 *الوصف:* ${user.description || 'ما في وصف.'}
📆 *أنشئ في:* ${new Date(user.created).toLocaleString('ar-EG')}
🚫 *محظور:* ${user.isBanned ? 'ايوه' : 'لا'}
🌐 *الحالة:* ${data.status || 'ما في حالة.'}
📍 *آخر نشاط:* ${presence}

👥 *الشبكة الاجتماعية*
   🧑‍🤝‍🧑 *الأصدقاء:* ${social.friends.count}
   👣 *المتابعين:* ${social.followers.count}
   🔁 *يتابع:* ${social.following.count}

🏷️ *أهم المجموعات:*
${groups.length ? groups.map((g, i) => `   ${i + 1}. *${g.group.name}* — ${g.role.name}`).join('\n') : '   ما في مجموعات.'}

👻 *طريقة الاستخدام:*
╰─⊶ *${usedPrefix}روبلوكس* اسم_اللاعب
`

        await conn.reply(m.chat, caption.trim(), m)
    } catch (error) {
        await m.reply(`👻 *يا رفيقي* ⚠️\n\nصارت مشكلة في البحث\nجرب اسم لاعب ثاني أو حاول لاحقاً`)
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    }
}

handler.help = ['stalkroblox', 'روبلوكس'];
handler.tags = ['tools'];
handler.command = /^(robloxstalk|stalkroblox|روبلوكس)$/i;
handler.register = false;

export default handler