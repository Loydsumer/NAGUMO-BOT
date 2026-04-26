let handler = async (m, {conn, usedPrefix}) => {
    try {
        let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
        let user = global.db.data.users[who]

        // التحقق من وجود المستخدم في قاعدة البيانات
        if (!user) {
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮\n          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 المستخدم غير موجود\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 في قاعدة البيانات\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        let username = conn.getName(who)
        
        // تحديد مستوى الثروة بناء على الرصيد
        let wallet = user.money || 0
        let wealthStatus = '🪙 مبتدئ'
        if (wallet > 50000) wealthStatus = '💼 متوسط'
        if (wallet > 200000) wealthStatus = '💰 غني'
        if (wallet > 1000000) wealthStatus = '🤑 مليونير'
        if (wallet > 5000000) wealthStatus = '💎 ملياردير'

        const walletInfo = `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ 👛 𝐖𝐀𝐋𝐋𝐄𝐓 𝐈𝐍𝐅𝐎
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👤 الاسم: ${username}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💵 النقود: ${(user.money || 0).toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🏦 البنك: ${(user.bank || 0).toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💎 المجموع: ${((user.money || 0) + (user.bank || 0)).toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🎖 المستوى: ${user.level || 1}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ✨ الخبرة: ${user.exp || 0} XP
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 📊 الحالة: ${wealthStatus}
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💡 نصائح سريعة:
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🏦 استخدم ⟪${usedPrefix}بنك⟫ للبنك
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💰 استخدم ⟪${usedPrefix}عمل⟫ للعمل
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 📈 استخدم ⟪${usedPrefix}توب⟫ للتصنيف
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👑 المطور: DΣMΘΠ ØF SΘLITUDΣ
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 البوت: ZΘFΛΠ BΘƬ
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`

        // إرسال الرسالة مع الإشارة للمستخدم
        await conn.reply(m.chat, walletInfo, m, { 
            mentions: [who],
            contextInfo: {
                externalAdReply: {
                    title: "👛 محفظة زوفان",
                    body: `إدارة أموالك بذكاء`,
                    thumbnailUrl: "https://i.postimg.cc/J0j1Szm4/1761935543374.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029VaQl2p5JX0e9aJwXk1YH",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        })

    } catch (error) {
        console.error('❌ خطأ في أمر المحفظة:', error)
        await conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮\n          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 حدث خطأ في عرض المحفظة\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 الرجاء المحاولة مرة أخرى\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
    }
}

handler.help = ['محفظة', 'wallet', 'balance']
handler.tags = ['store']
handler.command = ['محفظة', 'wallet', 'رصيدي', 'balance'] 

export default handler