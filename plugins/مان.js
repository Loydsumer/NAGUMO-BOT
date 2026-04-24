import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import os from 'os'
import fs from 'fs'

// *************** تم إضافة تعريف الدالة المفقودة global.loading ***************
global.loading = async (m, conn, isDone = false) => {
    // يمكنك تعديل هذا السلوك حسب ما تراه مناسباً
    if (!isDone) {
        await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } }); // رد فعل عند البدء
    } else {
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // رد فعل عند الانتهاء
    }
}
// *************** تم إضافة تعريف متغير التكوين الافتراضي (config) ***************
// هذا ضروري لأن الكود يستخدم global.config.author و global.config.watermark
global.config = global.config || { 
    author: '24529689176623820', 
    watermark: '𝑻𝒂𝒊𝒃 2024 Bot' 
};
// *************** نهاية الإضافات الضرورية ***************

// تعريف القائمة الافتراضية
const defaultMenu = {
  before: `
${wish()}

🌸 *معلومات المستخدم* 🌸
────────────────────────
🧚‍♀️ *الاسم: %name*
🎀 *الحالة: %status*
🍭 *الحد: %limit*
📈 *المستوى: %level*
🧸 *الرتبة: %role*
🫧 *النقاط: %exp*

🌸 *معلومات الأوامر* 🌸
────────────────────────
*🅟 = مميز*
*🅛 = يستهلك حد*
*🅐 = أدمن*
*🅓 = مطور*
*🅞 = المالك*
`.trimStart(),
  header: `*%category*
────────────────────────`,
  body: `*⚘ %cmd* %islimit %isPremium %isAdmin %isMods %isOwner`,
  footer: `────────────────────────`,
  after: `💀 *حقوق النشر © 𝑻𝒂𝒊𝒃 2024*`
}

// تعريف الفئات والأقسام
const menuCategories = {
   ai: '🧠 الذكاء الاصطناعي & الدردشة',
  audio_ai: '🎧 الذكاء الاصطناعي صوتيات',
  downloader: '🍥 البحث وتنزيل',
  images: '🍥 تنزيل صور و خليفات',
  fun: '🍭 ترفيه & مرح',
  game: '🕹️ ألعاب & تسلية',
  group: '🧃 المجموعات & الإدارة',
  info: '📖 معلومات & مساعدة',
  internet: '💌 إنترنت & تواصل اجتماعي',
  maker: '🎀 صانع & تصميم',
  maker_2: '🍓 زخارف النص',
  news: '📰 أخبار & معلومات',
  devs: '❄ ادوات_للمطورين',
  owner: '🪄 المالك & المطور',
  quran: '🍃 القرآن الكريم & إسلاميات',
  quotes: '🫧 اقتباسات & تحفيز',
  search: '🔍 بحث & معلومات',
  sticker: '🌼 ملصقات & صانع',
  tools: '🧸 أدوات & خدمات',
  database: '🧺 قاعدة بيانات & تخزين',
  rules: '📜 القوانين',
  xp: '🍰 المستوى & النقاط'
}

// قائمة الصور للعرض
const imageList = [
  'https://i.postimg.cc/jjgJK5LM/1761129812881.jpg',
  'https://i.postimg.cc/Xq8WSZvL/1761129951001.jpg',
  'https://i.postimg.cc/Ssg2VyHw/1758308527318.jpg',
  'https://i.postimg.cc/6qS7JMWc/1758308542763.jpg',
  'https://i.postimg.cc/7Z7yNmp4/1758309757686.jpg',
  'https://i.postimg.cc/Px6Gqc8W/1758309764880.jpg',
  'https://i.postimg.cc/XY9T5XC7/1758309770226.jpg',
  'https://i.postimg.cc/HLvDYRMQ/1758309778303.jpg',
  'https://i.postimg.cc/26qpVGdg/1758309786406.jpg',
  'https://i.postimg.cc/Y9T5gFb0/1758309793353.jpg'
]

let handler = async (m, { conn, usedPrefix, command, __dirname, isOwner, isMods, isPrems, args }) => {
  try {
    await global.loading(m, conn)
    
    let teks = `${args[0] || ''}`.toLowerCase()
    let arrayMenu = Object.keys(menuCategories)
    
    // التحقق من صحة الفئة المطلوبة
    if (!arrayMenu.includes(teks)) teks = '404'
    
    // إعداد العلامات بناءً على الفئة المطلوبة
    let tags = {}
    if (teks === 'all') {
      // إضافة جميع الفئات باستثناء 'all'
      Object.keys(menuCategories).forEach(key => {
        if (key !== 'all') tags[key] = menuCategories[key]
      })
    } else if (teks !== '404') {
      tags[teks] = menuCategories[teks]
    }
    
    // بيانات المستخدم
    let { exp, level, role } = global.db.data.users[m.sender] || { exp: 0, level: 0, role: 'مستخدم عادي' }
    let { min, max } = xpRange(level, global.multiplier || 5)
    let user = global.db.data.users[m.sender] || {}
    let limit = isPrems ? 'غير محدود' : toRupiah(user.limit || 0)
    let name = user.registered ? user.name : conn.getName(m.sender)
    let status = isMods ? '🧁 مطوّر' 
                : isOwner ? '🪄 المالك' 
                : isPrems ? '💖 مستخدم بريميوم' 
                : (user.level || 0) > 1000 ? '🌟 مستخدم نخبة' 
                : '🍬 مستخدم مجاني'
    
    // إدارة الفهرس للصور
    if (!global._imageIndex) global._imageIndex = 0
    let image = imageList[global._imageIndex % imageList.length]
    global._imageIndex++
    
    // إحصائيات البوت
    let member = Object.keys(global.db.data.users).filter(v => 
      typeof global.db.data.users[v].commandTotal != 'undefined' && v != conn.user.jid
    ).sort((a, b) => {
      return (global.db.data.users[b].command || 0) - (global.db.data.users[a].command || 0)
    })
    
    let commandToday = member.reduce((acc, number) => 
      acc + (global.db.data.users[number].command || 0), 0
    )
    
    let totalf = Object.values(global.plugins)
      .filter(v => Array.isArray(v.help))
      .reduce((acc, v) => acc + v.help.length, 0)
    
    let totalreg = Object.keys(global.db.data.users).length
    let uptime = formatUptime(process.uptime())
    let muptime = formatUptime(os.uptime())
    
    // تم إصلاح الوصول إلى التقييم
    const botData = global.db.data.bots || {}; 
    const ratingData = botData.rating || {};
    
    let listRate = Object.values(ratingData).map(v => v.rate)
    let averageRating = listRate.length > 0 ? 
      listRate.reduce((sum, rating) => sum + rating, 0) / listRate.length : 0
    
    let timeID = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date())
    
    let subtitle = `🕒 ${timeID}`
    
    // معلومات الإصدار
    let dbSize = 0;
    try {
        dbSize = fs.readFileSync("./database.json").byteLength;
    } catch (e) {
        console.error("Failed to read database.json size:", e);
    }
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
    const Version = packageJson.version
    const mode = global.opts.self ? 'Private' : 'Public'
    
    // معلومات البوت
    let listCmd = `
🌸 *معلومات البوت* 🌸
────────────────────────
🧁 *الاسم: ${conn.user.name}*
🧸 *الإصدار: ${Version}*
🍰 *وضع البوت: ${mode}*
🗂️ *قاعدة البيانات: ${bytesToMB(dbSize)} Mb*
⏱️ *مدة التشغيل: ${uptime}*
🔋 *مدة تشغيل الجهاز: ${muptime}*
👤 *إجمالي المسجلين: ${totalreg}*
📝 *الأوامر اليوم: ${commandToday}*
⭐ *التقييم: ${averageRating.toFixed(2)}/5.00 (${listRate.length} مستخدم)*
────────────────────────
`.trimStart()
    
    // إنشاء قائمة الأقسام
    let lists = arrayMenu.map(v => ({
      title: `📂 ${v === 'all' ? 'جميع الأقسام' : menuCategories[v]}`,
      description: `🚀 لفتح قائمة ${v === 'all' ? 'جميع الأقسام' : menuCategories[v]}`,
      id: `.قسم_${v}`
    }))
    
    // عرض القائمة الرئيسية إذا لم يتم تحديد قسم
    if (teks == '404') {
      return await conn.sendMessage(m.chat, {
        product: {
          productImage: { url: image },
          productId: '1497536671470348',
          title: wish(),
          description: '',
          currencyCode: 'USD',
          priceAmount1000: '20',
          retailerId: global.config.author,
          url: 'https://wa.me/p/1497536671470348/201500564191‬',
          productImageCount: 1
        },
        businessOwnerJid: '201500564191‬@s.whatsapp.net',
        caption: listCmd,
        title: '',
        subtitle: subtitle,
        footer: global.config.watermark,
        interactiveButtons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: 'اختر هنا 💀',
              sections: [{
                title: `📑 ميزات البوت المتاحة ${totalf}`,
                rows: lists
              }]
            })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: '🎐 اتصل بالمالك',
              id: '.owner'
            })
          }
        ],
        hasMediaAttachment: false
      })
    }
    
    // تجميع الأوامر حسب الفئة
    let help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled)
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        mods: plugin.mods,
        owner: plugin.owner,
        admin: plugin.admin,
        enabled: !plugin.disabled,
      }))
    
    let groups = {}
    for (let tag in tags) {
      groups[tag] = []
      for (let plugin of help) {
        if (plugin.tags && plugin.tags.includes(tag) && plugin.help) {
          groups[tag].push(plugin)
        }
      }
    }
    
    // إعداد القائمة
    conn.menu = conn.menu || {}
    let before = conn.menu.before || defaultMenu.before
    let header = conn.menu.header || defaultMenu.header
    let body = conn.menu.body || defaultMenu.body
    let footer = conn.menu.footer || defaultMenu.footer
    let after = conn.menu.after || (conn.user.jid == global.conn.user.jid ? '' : `*Powered by https://wa.me/${global.conn.user.jid.split`@`[0]}*`) + defaultMenu.after
    
    // بناء نص القائمة
    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' + [
          ...groups[tag].map(menu => {
            return menu.help.map(help => {
              return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help)
                .replace(/%islimit/g, menu.limit ? '🅛' : '')
                .replace(/%isPremium/g, menu.premium ? '🅟' : '')
                .replace(/%isAdmin/g, menu.admin ? '🅐' : '')
                .replace(/%isMods/g, menu.mods ? '🅓' : '')
                .replace(/%isOwner/g, menu.owner ? '🅞' : '')
                .trim()
            }).join('\n')
          }),
          footer
        ].join('\n')
      }),
      after
    ].join('\n')
    
    let text = typeof conn.menu == 'string' ? conn.menu : typeof conn.menu == 'object' ? _text : ''
    
    // استبدال المتغيرات في النص
    let replace = {
      '%': '%',
      p: usedPrefix,
      exp: toRupiah(exp - min),
      level: toRupiah(level),
      limit,
      name,
      role,
      status
    }
    
    text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])
    
    // إرسال القائمة
    await conn.sendMessage(m.chat, {
      product: {
        productImage: { url: image },
        productId: '1497536671470348',
        title: wish(),
        description: '',
        currencyCode: 'USD',
        priceAmount1000: '0',
        retailerId: global.config.author,
        url: 'https://wa.me/p/1497536671470348/201500564191',
        productImageCount: 1
      },
      businessOwnerJid: '201500564191‬@s.whatsapp.net',
      caption: text.trim(),
      title: '',
      subtitle: subtitle,
      footer: global.config.watermark,
      interactiveButtons: [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: 'القوائم بوت فيتو 💀🔥',
            sections: [{
              title: `📑 ميزة البوت المتاحة ${totalf}`,
              rows: lists
            }]
          })
        }
      ],
      hasMediaAttachment: false
    })
    
  } catch (error) {
    console.error('CRITICAL ERROR IN MENU HANDLER:', error)
    await conn.sendMessage(m.chat, { 
      text: `❌ حدث خطأ أثناء تحميل القائمة. يرجى المحاولة مرة أخرى.\n\nتفاصيل الخطأ: ${error.message || error}` 
    })
  } finally {
    await global.loading(m, conn, true)
  }
}

// تعريف الأوامر والوسوم
handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help|الاوامر|التايب|اومرو|امور|مان|القائمه|القائمة)$/i
handler.register = true

export default handler

// الدوال المساعدة 
function formatUptime(seconds) {
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)
  let days = Math.floor(hours / 24)
  
  // ********* تم إصلاح هذا القسم *********
  let totalMonths = Math.floor(days / 30) 
  let years = Math.floor(totalMonths / 12)
  
  minutes %= 60
  hours %= 24
  days %= 30
  let months = totalMonths % 12 // استخدام باقي قسمة totalMonths
  // ************************************
  
  let result = []
  if (years) result.push(`${years} سنة`)
  if (months) result.push(`${months} شهر`)
  if (days) result.push(`${days} يوم`)
  if (hours) result.push(`${hours} ساعة`)
  if (minutes || result.length === 0) result.push(`${minutes} دقيقة`)
  
  return result.join(' ')
}

function wish() {
  let time = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  let hours = time.getHours()
  let minutes = time.getMinutes()
  let quarter = Math.floor(minutes / 15)
  
  const messages = {
    0: ['🌙 منتصف الليل، وقت النوم! لا تسهر كثيراً~'],
    1: ['🛌 الساعة تجاوزت الواحدة، هيا لننام. لا تكثر من السهر~'],
    2: ['💤 ما زلت تسهر حتى الثانية؟ لا تنسى صحتك~'],
    3: ['🌌 الساعة الثالثة صباحاً، وقت النوم~'],
    4: ['☀️ الفجر! حان وقت الاستيقاظ~'],
    5: ['🐓 الديك يصيح، حان وقت الاستيقاظ~'],
    6: ['🏃‍♂️ الصباح الباكر، وقت التمارين~'],
    7: ['💻 صباح منتج! ركز على العمل أو المهام~'],
    8: ['🍎 وجبة خفيفة صباحية مهمة للحفاظ على الطاقة~'],
    9: ['🌤️ صباح الخير! حان وقت الفطور~'],
    10: ['📖 وقت القراءة مع الشاي~'],
    11: ['🌇 بداية الظهيرة، لا تنسى إنهاء مهامك~'],
    12: ['🌤️ حان وقت الغداء~'],
    13: ['☀️ الحر شديد في هذا الوقت، اشرب الماء~'],
    14: ['📖 وقت القيلولة أو القراءة~'],
    15: ['🌇 المساء يقترب، تمدد قليلاً~'],
    16: ['📸 التقط صوراً لغروب الشمس~'],
    17: ['🌅接近晚上، 气氛很凉爽~'],
    18: ['🌙 الليل يحل، وقت الهدوء~'],
    19: ['🎮 تلعب لعبة؟ لا تنسى الوقت~'],
    20: ['📖 وقت القراءة الليلية~'],
    21: ['🌌 الليل، لا تسهر كثيراً~'],
    22: ['🌌 وقت متأخر من الليل، أطفئ الأنوار قبل النوم~'],
    23: ['💤 منتصف الليل، وقت النوم العميق~']
  }
  
  let message = messages[hours]?.[quarter] || messages[hours]?.[3] || '✨ الوقت يمر، ابقَ متحمساً ليومك~'
  return `*${message}*`
}

const toRupiah = number => parseInt(number).toLocaleString().replace(/,/g, ".")

function bytesToMB(bytes) {
  return (bytes / 1048576).toFixed(2)
}