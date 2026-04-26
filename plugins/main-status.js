let system = `*「✦」حالة النظام*

◇ *عدد الأوامر المُنفّذة* » ${toNum(totalCommands)}
◇ *عدد المستخدمين* » ${totalUsers.toLocaleString()}
◇ *عدد المجموعات المسجّلة* » ${totalChats.toLocaleString()}
◇ *عدد الإضافات (Plugins)* » ${totalPlugins}
◇ *عدد البوتات المتصلة* » ${totalBots}

❍ *حالة السيرفر*

◆ *نظام التشغيل* » ${platform()}
◆ *عدد أنوية المعالج* » ${_cpus().length} نواة
◆ *الرام الكلي* » ${format(totalmem())}
◆ *الرام المستخدم* » ${format(totalmem() - freemem())}
◆ *المعمارية* » ${process.arch}
◆ *معرّف السيرفر* » ${hostname().slice(0, 8)}...

*❑ استخدام ذاكرة NODEJS*

◈ *الرام المستخدمة* » ${format(process.memoryUsage().rss)}
◈ *Heap المحجوز* » ${format(process.memoryUsage().heapTotal)}
◈ *Heap المستخدم* » ${format(process.memoryUsage().heapUsed)}
◈ *الموديولات الخارجية* » ${format(process.memoryUsage().external)}
◈ *البيانات المخزّنة (Buffers)* » ${format(process.memoryUsage().arrayBuffers)}`

handler.help = ['estado']
handler.tags = ['info']
handler.command = ['estado', 'status']

export default handler

function toNum(number) {
if (number >= 1000 && number < 1000000) {
return (number / 1000).toFixed(1) + 'k'
} else if (number >= 1000000) {
return (number / 1000000).toFixed(1) + 'M'
} else {
return number.toString()
}}