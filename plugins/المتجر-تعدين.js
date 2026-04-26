// أمر التعدين - mine.js
let handler = async (m, { conn }) => {
    try {
        let user = global.db.data.users[m.sender]
        if (!user) {
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮\n          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 لم يتم العثور على بياناتك\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 جاري تسجيلك في النظام...\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        // التحقق من وقت التعدين الأخير
        let cooldown = 600000 // 10 دقائق
        let lastMine = user.lastmine || 0
        if (Date.now() - lastMine < cooldown) {
            let timeLeft = cooldown - (Date.now() - lastMine)
            let minutes = Math.floor(timeLeft / 60000)
            let seconds = Math.floor((timeLeft % 60000) / 1000)
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮\n          ˏˋ°•*⁀➷ ⏰ 𝐂𝐎𝐎𝐋𝐃𝐎𝐖𝐍\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 يجب الانتظار قبل التعدين مرة أخرى\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 الوقت المتبقي: ${minutes} دقائق ${seconds} ثانية\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        // أنواع المعادن والقيم
        let minerals = [
            { name: "⛏️ حديد", value: [200, 400], emoji: "🪨" },
            { name: "💎 ألماس", value: [800, 1200], emoji: "💎" },
            { name: "🥇 ذهب", value: [500, 800], emoji: "⭐" },
            { name: "🔗 فضة", value: [300, 500], emoji: "⚡" },
            { name: "🔮 بلاتين", value: [1000, 1500], emoji: "🔮" },
            { name: "💚 زمرد", value: [600, 900], emoji: "💚" },
            { name: "♦️ روبي", value: [700, 1100], emoji: "♦️" }
        ]

        let mineral = minerals[Math.floor(Math.random() * minerals.length)]
        let minedValue = Math.floor(Math.random() * (mineral.value[1] - mineral.value[0] + 1)) + mineral.value[0]
        
        // فرصة للحصول على كنز نادر
        let rareChance = Math.random()
        let bonus = 0
        let rareItem = ""

        if (rareChance < 0.05) { // 5% فرصة
            bonus = 5000
            rareItem = "🎊 كنز نادر! +5,000 دولار"
        } else if (rareChance < 0.15) { // 10% فرصة
            bonus = 2000
            rareItem = "🎁 كنز خاص! +2,000 دولار"
        }

        let totalValue = minedValue + bonus

        // تحديث بيانات المستخدم
        user.money = (user.money || 0) + totalValue
        user.exp = (user.exp || 0) + 100
        user.lastmine = Date.now()

        // رسالة النجاح
        let successMsg = `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ⛏️ 𝐌𝐈𝐍𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ${mineral.emoji} المعدن: ${mineral.name}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💰 القيمة: ${minedValue.toLocaleString()} دولار
${bonus > 0 ? `├ׁ̟̇˚₊· ͟͟͞͞➳❥ ${rareItem}\n` : ''}├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🎊 المجموع: ${totalValue.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ✨ الخبرة: +100 XP
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💡 يمكنك التعدين مرة أخرى بعد 10 دقائق
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🏦 استخدم ⟪.بنك⟫ لحماية أموالك
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👑 المطور: DΣMΘΠ ØF SΘLITUDΣ
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 البوت: ZΘFΛΠ BΘƬ
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`

        await conn.reply(m.chat, successMsg, m)

    } catch (error) {
        console.error('❌ خطأ في أمر التعدين:', error)
        await conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮\n          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 حدث خطأ أثناء التعدين\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 الرجاء المحاولة مرة أخرى\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
    }
}

handler.help = ['تعدين', 'mine']
handler.tags = ['store']
handler.command = ['تعدين', 'mine', 'تنقيب']
handler.cooldown = 600000 // 10 دقائق

export default handler