// advancedXP.js
import { writeFileSync, existsSync, readFileSync } from 'fs'
import path from 'path'

// إعداد قاعدة البيانات
const dbFile = path.join('./', 'database.json')
if (!existsSync(dbFile)) writeFileSync(dbFile, JSON.stringify({ users: {} }))
const db = JSON.parse(readFileSync(dbFile))

let handler = async (m, { conn }) => {
    try {
        const sender = m.sender
        const name = conn.getName(sender)

        // إنشاء حساب للمستخدم إذا لم يكن موجود
        if (!db.users[sender]) {
            db.users[sender] = {
                exp: 0,
                level: 1,
                role: 'عضو'
            }
        }

        const user = db.users[sender]

        // حساب XP تصاعدي، يصبح أبطأ بعد المستوى 50
        let randomXP
        if (user.level < 50) {
            randomXP = Math.floor(Math.random() * 15) + 5  // XP عادي
        } else if (user.level < 80) {
            randomXP = Math.floor(Math.random() * 10) + 3  // XP أبطأ
        } else {
            randomXP = Math.floor(Math.random() * 5) + 1   // XP بطيء جدًا
        }

        user.exp += randomXP

        // حساب XP المطلوب للترقية: كل مستوى يحتاج أكثر من السابق
        const xpToLevel = Math.floor(100 * Math.pow(1.2, user.level - 1))

        let leveledUp = false
        while (user.exp >= xpToLevel && user.level < 100) {
            user.exp -= xpToLevel
            user.level++
            leveledUp = true
        }

        // تحديث الرنق تلقائي حسب المستوى
        if (user.level >= 1 && user.level < 10) user.role = 'عضو'
        else if (user.level < 25) user.role = 'مبتدئ'
        else if (user.level < 50) user.role = 'محترف'
        else if (user.level < 75) user.role = 'خبير'
        else if (user.level < 100) user.role = 'أسطورة'
        else user.role = 'الماستر الأعلى'

        // حفظ قاعدة البيانات
        writeFileSync(dbFile, JSON.stringify(db))

        // رسالة المزخرفة للمستخدم
        const message = `
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ 📊 𝐔𝐒𝐄𝐑 𝐒𝐓𝐀𝐓𝐒
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├°•.°•.°•.°•.°•.°•.°•.°•.°•.°•┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👤 الاسم: ${name}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🎯 المستوى: ${user.level}/100
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ⭐ XP: ${user.exp}/${xpToLevel}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👑 الرنق: ${user.role}
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├°•.°•.°•.°•.°•.°•.°•.°•.°•.°•┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 📈 تحتاج ${xpToLevel - user.exp} XP
├ׁ̟̇˚₊· ͟͟͞͞➳❥ للترقية للمستوى التالي
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├°•.°•.°•.°•.°•.°•.°•.°•.°•.°•┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🩸 ZΘFΛΠ BΘƬ
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`.trim()

        await conn.sendMessage(m.chat, { text: message }, { quoted: m })

        // إذا تمت ترقية المستخدم، أرسل رسالة تهنئة مزخرفة
        if (leveledUp) {
            const levelUpMessage = `
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ⬆️ 𝐋𝐄𝐕𝐄𝐋 𝐔𝐏
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├°•.°•.°•.°•.°•.°•.°•.°•.°•.°•┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🎉 مبروك ${name}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ لقد ارتفع مستواك بنجاح
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├°•.°•.°•.°•.°•.°•.°•.°•.°•.°•┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🆕 المستوى الجديد: ${user.level}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👑 الرنق الجديد: ${user.role}
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├°•.°•.°•.°•.°•.°•.°•.°•.°•.°•┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💡 استمر في التفاعل مع البوت
├ׁ̟̇˚₊· ͟͟͞͞➳❥ لترتفع مستوياتك أكثر
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├°•.°•.°•.°•.°•.°•.°•.°•.°•.°•┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🩸 ZΘFΛΠ BΘƬ
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`.trim()
            
            await conn.sendMessage(m.chat, { text: levelUpMessage }, { quoted: m })
        }

    } catch (err) {
        console.error(err)
        await conn.sendMessage(m.chat, { 
            text: `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ⚠️ 𝐄𝐑𝐑𝐎𝐑
├ׁ̟̇˚₊· ͟͟͞͞➳❥ حدث خطأ أثناء حساب المستوى
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯` 
        }, { quoted: m })
    }
}

handler.help = ['level', 'مستوى', 'لفل']
handler.tags = ['rpg', 'xp']
handler.command = ['level', 'lvl', 'لفل', 'مستوى']
handler.register = true

export default handler