// أمر العمل - work.js
let handler = async (m, { conn }) => {
    try {
        let user = global.db.data.users[m.sender]
        if (!user) {
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮\n          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 لم يتم العثور على بياناتك\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 جاري تسجيلك في النظام...\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        // التحقق من وقت العمل الأخير
        let cooldown = 300000 // 5 دقائق
        let lastWork = user.lastwork || 0
        if (Date.now() - lastWork < cooldown) {
            let timeLeft = cooldown - (Date.now() - lastWork)
            let minutes = Math.floor(timeLeft / 60000)
            let seconds = Math.floor((timeLeft % 60000) / 1000)
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮\n          ˏˋ°•*⁀➷ ⏰ 𝐂𝐎𝐎𝐋𝐃𝐎𝐖𝐍\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 يجب الانتظار قبل العمل مرة أخرى\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 الوقت المتبقي: ${minutes} دقائق ${seconds} ثانية\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        // أنواع الوظائف والأجور
        let jobs = [
            { name: "👨‍💼 مبرمج", salary: [800, 1200] },
            { name: "👨‍🍳 طاهي", salary: [500, 800] },
            { name: "👷 عامل بناء", salary: [300, 600] },
            { name: "🚕 سائق تكسي", salary: [400, 700] },
            { name: "👨‍🏫 مدرس", salary: [600, 900] },
            { name: "🛒 بائع", salary: [350, 550] },
            { name: "🎬 ممثل", salary: [1000, 1500] },
            { name: "👨‍🔬 عالم", salary: [1200, 1800] }
        ]

        let job = jobs[Math.floor(Math.random() * jobs.length)]
        let salary = Math.floor(Math.random() * (job.salary[1] - job.salary[0] + 1)) + job.salary[0]
        
        // مكافأة إضافية بناء على المستوى
        let levelBonus = Math.floor((user.level || 1) * 50)
        let totalSalary = salary + levelBonus

        // تحديث بيانات المستخدم
        user.money = (user.money || 0) + totalSalary
        user.exp = (user.exp || 0) + 50
        user.lastwork = Date.now()

        // رسالة النجاح
        let successMsg = `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ 💼 𝐖𝐎𝐑𝐊 𝐒𝐔𝐂𝐂𝐄𝐒𝐒
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🎯 الوظيفة: ${job.name}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💰 الراتب: ${salary.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ⭐ مكافأة المستوى: ${levelBonus.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🎊 المجموع: ${totalSalary.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ✨ الخبرة: +50 XP
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💡 يمكنك العمل مرة أخرى بعد 5 دقائق
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🏦 استخدم ⟪.بنك⟫ لإيداع أموالك
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👑 المطور: DΣMΘΠ ØF SΘLITUDΣ
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 البوت: ZΘFΛΠ BΘƬ
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`

        await conn.reply(m.chat, successMsg, m)

    } catch (error) {
        console.error('❌ خطأ في أمر العمل:', error)
        await conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮\n          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 حدث خطأ أثناء العمل\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 الرجاء المحاولة مرة أخرى\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
    }
}

handler.help = ['عمل', 'work']
handler.tags = ['store']
handler.command = ['عمل', 'work', 'وظيفة']
handler.cooldown = 300000 // 5 دقائق

export default handler