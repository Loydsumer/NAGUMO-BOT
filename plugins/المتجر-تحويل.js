// أمر التحويل - send.js
let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        // نتأكد من وجود قاعدة البيانات
        if (!global.db.data) global.db.data = {}
        if (!global.db.data.users) global.db.data.users = {}
        
        let user = global.db.data.users[m.sender]
        if (!user) {
            // إذا المستخدم مو موجود، نسجله
            global.db.data.users[m.sender] = {
                money: 1000, // رصيد ابتدائي
                bank: 0,
                exp: 0,
                level: 1
            }
            user = global.db.data.users[m.sender]
        }

        let money = user.money || 0
        
        // نتأكد من المدخلات
        if (args.length < 2) {
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ 💸 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 الاستخدام: ${usedPrefix}ارسال <المبلغ> @الشخص
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💰 مثال: ${usedPrefix}ارسال 100 @غيتو
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ───────────────────
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💵 رصيدك الحالي: ${money.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🏦 الحد الأدنى: 10 دولار
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        let amount = parseInt(args[0])
        if (isNaN(amount) || amount <= 0) {
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 يرجى إدخال مبلغ صحيح
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 مثال: ${usedPrefix}ارسال 100 @غيتو
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        if (amount < 10) {
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 الحد الأدنى للتحويل 10 دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 لكي نغطي رسوم المعاملة
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        if (amount > money) {
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 لا تملك هذا المبلغ
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 رصيدك: ${money.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💸 المطلوب: ${amount.toLocaleString()} دولار
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        // طريقة بديلة للحصول على المستخدم المستهدف
        let mentionedJid = null
        
        // جربنا ناخذ المنشن من m.mentionedJid
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            mentionedJid = m.mentionedJid[0]
        } 
        // إذا ما في منشن، نجرب ناخذ من النص
        else {
            let text = m.text.toLowerCase()
            let mentionRegex = /@(\d+)/g
            let matches = text.match(mentionRegex)
            if (matches && matches[0]) {
                mentionedJid = matches[0].replace('@', '') + '@s.whatsapp.net'
            }
        }

        if (!mentionedJid) {
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 يرجى تحديد الشخص
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 مثال: ${usedPrefix}ارسال 100 @غيتو
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        // منع التحويل للنفس
        if (mentionedJid === m.sender) {
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 لا يمكنك التحويل لنفسك
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 اختر شخص آخر
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        // نتأكد من وجود المستخدم المستهدف في قاعدة البيانات
        if (!global.db.data.users[mentionedJid]) {
            global.db.data.users[mentionedJid] = {
                money: 1000,
                bank: 0,
                exp: 0,
                level: 1
            }
        }

        let targetUser = global.db.data.users[mentionedJid]
        let senderName = conn.getName(m.sender)
        let receiverName = conn.getName(mentionedJid)

        // رسوم التحويل (2%)
        let fee = Math.floor(amount * 0.02)
        let netAmount = amount - fee

        // تنفيذ التحويل
        user.money -= amount
        targetUser.money = (targetUser.money || 0) + netAmount

        // رسالة النجاح للمرسل
        let successMsg = `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ✅ 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑 𝐒𝐔𝐂𝐂𝐄𝐒𝐒
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💸 تم التحويل بنجاح!
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👤 إلى: ${receiverName}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💰 المبلغ: ${amount.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ⚡ صافي الاستلام: ${netAmount.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💸 رسوم التحويل: ${fee.toLocaleString()} دولار (2%)
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ───────────────────
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💵 رصيدك الآن: ${user.money.toLocaleString()} دولار
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💡 شكراً لاستخدامك خدمة التحويل
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🏦 بنك زوفان الآمن
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👑 المطور: DΣMΘΠ ØF SΘLITUDΣ
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 البوت: ZΘFΛΠ BΘƬ
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`

        await conn.reply(m.chat, successMsg, m, {
            mentions: [mentionedJid]
        })

        // إرسال إشعار للمستلم
        let notificationMsg = `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ 🎉 𝐍𝐄𝐖 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💰 تلقيت تحويلاً جديداً!
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👤 من: ${senderName}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💸 المبلغ: ${netAmount.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ───────────────────
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💵 رصيدك الآن: ${targetUser.money.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🏦 استخدم ⟪.بنك⟫ لعرض رصيدك
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👑 المطور: DΣMΘΠ ØF SΘLITUDΣ
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 البوت: ZΘFΛΠ BΘƬ
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`

        await conn.reply(mentionedJid, notificationMsg, null)

    } catch (error) {
        console.error('❌ خطأ في أمر التحويل:', error)
        await conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 حدث خطأ أثناء التحويل
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 الرجاء المحاولة مرة أخرى
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ⚡ الخطأ: ${error.message}
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
    }
}

handler.help = ['ارسال', 'send', 'تحويل']
handler.tags = ['store']
handler.command = ['ارسال', 'send', 'تحويل', 'حول']

export default handler