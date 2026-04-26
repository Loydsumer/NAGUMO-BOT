const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
  const primaryBot = global.db.data.chats[m.chat].primaryBot
  if (primaryBot && conn.user.jid !== primaryBot) throw !1
  
  const chat = global.db.data.chats[m.chat]
  const action = command.toLowerCase()

  // إذا كتب الأمر فقط بدون إضافة
  if (args.length === 0) {
    let commandsList = `🍬 *أوامر الإعدادات المتاحة*\n\n`

    commandsList += `👑 *أوامر المشرفين:*\n`
    commandsList += `• antilink - منع مشاركة الروابط في المجموعة\n`
    commandsList += `• welcome - إرسال رسائل ترحيب للأعضاء الجدد\n`
    commandsList += `• detect - كشف التغييرات في المجموعة\n`
    commandsList += `• modoadmin - تقييد الأوامر للمشرفين فقط\n`
    commandsList += `• economy - تفعيل النظام الاقتصادي\n`
    commandsList += `• gacha - تفعيل ألعاب الـ RPG\n\n`

    commandsList += `🔐 *أوامر المطورين:*\n`
    commandsList += `• nsfw - تفعيل المحتوى الحساس (+18)\n\n`

    commandsList += `🍬 *طريقة الاستخدام:*\n`
    commandsList += `${usedPrefix}${command} [اسم الإعداد]\n\n`
    commandsList += `🍬 *أمثلة:*\n`
    commandsList += `${usedPrefix}${command} antilink\n`
    commandsList += `${usedPrefix}${command} welcome\n\n`
    commandsList += `🅾🅶🅰🅼🅸 🅱🅾🆃`

    return conn.reply(m.chat, commandsList, m)
  }

  // الحصول على نوع الأمر من args[0]
  let type = args[0].toLowerCase()

  // التعرف على جميع أسماء الأوامر
  const commandMap = {
    'welcome': { key: 'welcome', name: 'الترحيب', desc: 'إرسال رسائل ترحيب عند دخول أعضاء جدد', role: 'admin' },
    'modoadmin': { key: 'modoadmin', name: 'وضع الأدمن', desc: 'تقييد استخدام الأوامر للمشرفين فقط', role: 'admin' },
    'detect': { key: 'detect', name: 'نظام الكشف', desc: 'كشف التغييرات في إعدادات المجموعة', role: 'admin' },
    'antilink': { key: 'antiLink', name: 'منع الروابط', desc: 'حظر مشاركة أي روابط في المجموعة', role: 'admin' },
    'economy': { key: 'economy', name: 'نظام الاقتصاد', desc: 'تفعيل الألعاب والنظام الاقتصادي', role: 'admin' },
    'gacha': { key: 'gacha', name: 'نظام الألعاب', desc: 'تفعيل ألعاب الـ RPG والجائزة', role: 'admin' },
    'nsfw': { key: 'nsfw', name: 'المحتوى الممنوع', desc: 'تفعيل الأوامر ذات المحتوى الحساس', role: 'owner' }
  }

  // البحث عن الأمر
  const commandInfo = commandMap[type]
  
  if (!commandInfo) {
    return conn.reply(m.chat, `🍬 الأمر *${type}* غير معروف\n\nاستخدم *${usedPrefix}${command}* لرؤية الأوامر المتاحة`, m)
  }

  const { key, name, desc, role } = commandInfo
  const isEnabled = chat[key] !== undefined ? chat[key] : false

  // تحقق من الصلاحيات
  if (m.isGroup && role === 'admin' && !(isAdmin || isOwner)) {
    global.dfail('admin', m, conn)
    return
  }
  
  if (m.isGroup && role === 'owner' && !isOwner) {
    global.dfail('owner', m, conn)
    return
  }

  // تحديد الإجراء
  let isEnableNew = false

  if (action === 'تفعيل' || action === 'on') {
    if (isEnabled) {
      return conn.reply(m.chat, `🍬 ${name}\n\n${desc}\n\n${role === 'owner' ? '🔐 صلاحية: المطور فقط' : '👑 صلاحية: المشرفين'}\nالحالة: مفعل مسبقاً 🟢`, m)
    }
    isEnableNew = true
  } else if (action === 'تعطيل' || action === 'off') {
    if (!isEnabled) {
      return conn.reply(m.chat, `🍬 ${name}\n\n${desc}\n\n${role === 'owner' ? '🔐 صلاحية: المطور فقط' : '👑 صلاحية: المشرفين'}\nالحالة: معطل مسبقاً 🔴`, m)
    }
    isEnableNew = false
  }

  // تحديث الإعداد
  chat[key] = isEnableNew

  conn.reply(m.chat, `🍬 ${name}\n\n${desc}\n\n${role === 'owner' ? '🔐 صلاحية: المطور فقط' : '👑 صلاحية: المشرفين'}\nالحالة: ${isEnableNew ? 'تم التفعيل ✅' : 'تم التعطيل ❌'}\n\n🅾🅶🅰🅼🅸 🅱🅾🆃`, m)
}

handler.help = ['تفعيل', 'تعطيل', 'on', 'off']
handler.tags = ['nable']
handler.command = ['تفعيل', 'تعطيل', 'on', 'off']
handler.group = true

export default handler