const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util'
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

let rtx = "*❀ سيرفر البوت • وضع QR*\n\n✰ باستخدام هاتف آخر أو على الكمبيوتر، امسح رمز QR هذا ضوئيًا لتصبح *بوت فرعي* مؤقت.\n\n\`1\` » انقر على النقاط الثلاث في الزاوية اليمنى العليا\n\n\`2\` » انقر على الأجهزة المرتبطة\n\n\`3\` » امسح رمز QR هذا ضوئيًا لتسجيل الدخول باستخدام البوت\n\n✧ ينتهي صلاحية رمز QR هذا بعد 45 ثانية!"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const yukiJBOptions = {}

if (global.conns instanceof Array) console.log()
else global.conns = []

function isSubBotConnected(jid) { return global.conns.some(sock => sock?.user?.jid && sock.user.jid.split("@")[0] === jid.split("@")[0]) }

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`ꕥ الأمر *${command}* معطل مؤقتًا.`)
let time = global.db.data.users[m.sender].Subs + 120000
if (new Date - global.db.data.users[m.sender].Subs < 120000) return conn.reply(m.chat, `ꕥ يجب الانتظار ${msToTime(time - new Date())} لربط *بوت فرعي* مرة أخرى.`, m)
let socklimit = global.conns.filter(sock => sock?.user).length
if (socklimit >= 200) {
return m.reply(`ꕥ لم يتم العثور على مساحات متاحة لـ *البوتات الفرعية*.`)
}

let mentionedJid = await m.mentionedJid
let who = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = `${who.split`@`[0]}`
let pathYukiJadiBot = path.join(`./${jadi}/`, id)
if (!fs.existsSync(pathYukiJadiBot)){
fs.mkdirSync(pathYukiJadiBot, { recursive: true })
}

yukiJBOptions.pathYukiJadiBot = pathYukiJadiBot
yukiJBOptions.m = m
yukiJBOptions.conn = conn
yukiJBOptions.args = args
yukiJBOptions.usedPrefix = usedPrefix
yukiJBOptions.command = command
yukiJBOptions.fromCommand = true
yukiJadiBot(yukiJBOptions)
global.db.data.users[m.sender].Subs = new Date * 1
}

handler.help = ['qr', 'code', 'تنصيب']
handler.tags = ['serbot']
handler.command = ['qr', 'code', 'تنصيب']
export default handler 

export async function yukiJadiBot(options) {
let { pathYukiJadiBot, m, conn, args, usedPrefix, command } = options

if (command === 'code' || command === 'تنصيب') {
command = 'qr'
args.unshift('code')
}

const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
let txtCode, codeBot, txtQR

if (mcode) {
args[0] = args[0].replace(/^--code$|^code$/, "").trim()
if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
if (args[0] == "") args[0] = undefined
}

const pathCreds = path.join(pathYukiJadiBot, "creds.json")
if (!fs.existsSync(pathYukiJadiBot)){
fs.mkdirSync(pathYukiJadiBot, { recursive: true })}

try {
args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
} catch {
conn.reply(m.chat, `ꕥ استخدم الأمر بشكل صحيح » ${usedPrefix + command}`, m)
return
}

const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
const drmer = Buffer.from(drm1 + drm2, `base64`)
let { version, isLatest } = await fetchLatestBaileysVersion()
const msgRetry = (MessageRetryMap) => { }
const msgRetryCache = new NodeCache()
const { state, saveState, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

const connectionOptions = {
logger: pino({ level: "fatal" }),
printQRInTerminal: false,
auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
msgRetry,
msgRetryCache, 
browser: ['Windows', 'Firefox'],
version: version,
generateHighQualityLinkPreview: true
}

let sock = makeWASocket(connectionOptions)
sock.isInit = false
let isInit = true

setTimeout(async () => {
if (!sock.user) {
try { fs.rmSync(pathYukiJadiBot, { recursive: true, force: true }) } catch {}
try { sock.ws?.close() } catch {}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)
if (i >= 0) global.conns.splice(i, 1)
console.log(`[التنظيف التلقائي] تم حذف جلسة ${path.basename(pathYukiJadiBot)} بسبب بيانات اعتماد غير صالحة.`)
}}, 60000)

async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update

if (isNewLogin) sock.isInit = false

if (qr && !mcode) {
if (m?.chat) {
txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
} else {
return 
}

if (txtQR && txtQR.key) {
setTimeout(() => { conn.sendMessage(m.chat, { delete: txtQR.key })}, 30000)
}
return
} 

if (qr && mcode) {
let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
secret = secret.match(/.{1,4}/g)?.join("-")
    
// إرسال إرشادات التنصيب مع الصورة
const installationGuide = `
*🛠️ دليل تنصيب غيتو 🛠️*

مرحبًا بك في عائلة غيتو! إليك الخطوات اللازمة لتنصيب البوت لتصبح فرد من العائلة:

📱 *الخطوات الأساسية:*
اولا وقبل كل شي تاكد ان لا يوجد اجهزه مرتبطه سابقا اذا وجدت قم بمسحها وتبع التعليمات
1. سيظهر الرمز المكون من ثمانيه في الاسفل
2. قم بضغط عليه ضغط مطوله وقم بنسخه بلكامل
3. اذهب الى الاشعار واتساب الذي ظهر في الاعلى
4. اضغط على تاكيد
5. الصق الرمز الذي نسخته سابقا 
⚡ *متطلبات التشغيل:*
- واتساب ماسنجر (مطلوب)
- اتصال إنترنت مستقر
📢 *انضم لجروب دعم البوت:*
- مجموعة الدعم: https://chat.whatsapp.com/FbtnufBkzESC9KiXSf0MsE
🎯 *ملاحظات هامة:*
- لتجنب الحظر اجعل رقم خاص بلبوت ولا تتحدث منه في الخاص
- استخدم ماسنجر ليعمل معك التنصيب بشكل ممتاز
*مع تحيات، غيتو 👑*
*تم التطوير من قبل 𝑮𝒉𝒆𝒕𝒕𝒐*
`

// إرسال الصورة والتعليمات أولاً
await conn.sendMessage(m.chat, { 
image: { url: 'https://files.catbox.moe/3vn1on.jpg' },
caption: installationGuide
}, { quoted: m })

// ثم إرسال الرمز فقط بدون أي نص إضافي
codeBot = await m.reply(`\`\`\`${secret}\`\`\``)
console.log(secret)
}

if (codeBot && codeBot.key) {
setTimeout(() => { conn.sendMessage(m.chat, { delete: codeBot.key })}, 30000)
}

const endSesion = async (loaded) => {
if (!loaded) {
try {
sock.ws.close()
} catch {
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)                
if (i < 0) return 
delete global.conns[i]
global.conns.splice(i, 1)
}}

const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

if (connection === 'close') {
if (reason === 428) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ تم إغلاق الاتصال (+${path.basename(pathYukiJadiBot)}) بشكل غير متوقع. جاري إعادة الاتصال...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
await creloadHandler(true).catch(console.error)
}

if (reason === 408) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ فقد الاتصال (+${path.basename(pathYukiJadiBot)}) أو انتهت صلاحيته. السبب: ${reason}. جاري إعادة الاتصال...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
await creloadHandler(true).catch(console.error)
}

if (reason === 440) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ تم استبدال الاتصال (+${path.basename(pathYukiJadiBot)}) بجلسة نشطة أخرى.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
try {
if (options.fromCommand) m?.chat ? await conn.sendMessage(m.chat, {text : `⚠︎ لقد اكتشفنا جلسة جديدة، يرجى حذف الجلسة القديمة للمتابعة.\n\n> ☁︎ إذا كانت هناك أي مشكلة، يرجى إعادة الاتصال.` }, { quoted: m || null }) : ""
} catch (error) {
console.error(chalk.bold.yellow(`⚠︎ خطأ 440: تعذر إرسال رسالة إلى: +${path.basename(pathYukiJadiBot)}`))
}}

if (reason == 405 || reason == 401) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ تم إغلاق الجلسة (+${path.basename(pathYukiJadiBot)}). بيانات اعتماد غير صالحة أو تم فصل الجهاز يدويًا.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
try {
if (options.fromCommand) m?.chat ? await conn.sendMessage(m.chat, {text : '⚠︎ جلسة معلقة.\n\n> ☁︎ يرجى المحاولة مرة أخرى لتصبح *بوت فرعي* مرة أخرى.' }, { quoted: m || null }) : ""
} catch (error) {
console.error(chalk.bold.yellow(`⚠︎ خطأ 405: تعذر إرسال رسالة إلى: +${path.basename(pathYukiJadiBot)}`))
}
fs.rmdirSync(pathYukiJadiBot, { recursive: true })
}

if (reason === 500) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ فقد الاتصال في الجلسة (+${path.basename(pathYukiJadiBot)}). جاري حذف البيانات...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
if (options.fromCommand) m?.chat ? await conn.sendMessage(m.chat, {text : '⚠︎ فقد الاتصال.\n\n> ☁︎ يرجى محاولة الاتصال يدويًا لتصبح *بوت فرعي* مرة أخرى' }, { quoted: m || null }) : ""
return creloadHandler(true).catch(console.error)
}

if (reason === 515) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ إعادة تشغيل تلقائي للجلسة (+${path.basename(pathYukiJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
await creloadHandler(true).catch(console.error)
}

if (reason === 403) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ تم إغلاق الجلسة أو الحساب في الدعم للجلسة (+${path.basename(pathYukiJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
fs.rmdirSync(pathYukiJadiBot, { recursive: true })
}}

if (global.db.data == null) loadDatabase()

if (connection == `open`) {
if (!global.db.data?.users) loadDatabase()
await joinChannels(sock)
let userName, userJid 
userName = sock.authState.creds.me.name || 'مجهول'
userJid = sock.authState.creds.me.jid || `${path.basename(pathYukiJadiBot)}@s.whatsapp.net`

console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• البوت الفرعي •】⸺⸺⸺⸺❒\n│\n│ ❍ ${userName} (+${path.basename(pathYukiJadiBot)}) متصل بنجاح.\n│\n❒⸺⸺⸺【• متصل •】⸺⸺⸺❒`))

sock.isInit = true
global.conns.push(sock)

m?.chat ? await conn.sendMessage(m.chat, { text: isSubBotConnected(m.sender) ? `@${m.sender.split('@')[0]}, أنت متصل بالفعل، جاري قراءة الرسائل الواردة...` : `❀ لقد سجلت *بوت فرعي* جديد! [@${m.sender.split('@')[0]}]\n\n> يمكنك رؤية معلومات البوت باستخدام الأمر *#infobot*`, mentions: [m.sender] }, { quoted: m }) : ''
}}

setInterval(async () => {
if (!sock.user) {
try { sock.ws.close() } catch (e) {}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}}, 60000)

let handler = await import('../handler.js')
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) handler = Handler
} catch (e) {
console.error('⚠︎ خطأ جديد: ', e)
}

if (restatConn) {
const oldChats = sock.chats
try { sock.ws.close() } catch { }
sock.ev.removeAllListeners()
sock = makeWASocket(connectionOptions, { chats: oldChats })
isInit = true
}

if (!isInit) {
sock.ev.off("messages.upsert", sock.handler)
sock.ev.off("connection.update", sock.connectionUpdate)
sock.ev.off('creds.update', sock.credsUpdate)
}

sock.handler = handler.handler.bind(sock)
sock.connectionUpdate = connectionUpdate.bind(sock)
sock.credsUpdate = saveCreds.bind(sock, true)

sock.ev.on("messages.upsert", sock.handler)
sock.ev.on("connection.update", sock.connectionUpdate)
sock.ev.on("creds.update", sock.credsUpdate)

isInit = false
return true
}

creloadHandler(false)
})
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));}

function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

hours = (hours < 10) ? '0' + hours : hours
minutes = (minutes < 10) ? '0' + minutes : minutes
seconds = (seconds < 10) ? '0' + seconds : seconds

return minutes + ' دقيقة و ' + seconds + ' ثانية'
}

async function joinChannels(conn) {
  const MAIN_CHANNEL = '120363402816865265@newsletter';
  
  try {
    // الانضمام الإجباري إلى القناة الرئيسية
    await conn.newsletterFollow(MAIN_CHANNEL).catch(() => {});
    console.log(chalk.bold.green('✅ تم الانضمام إلى قناة البوت بنجاح'));
    
    // الانضمام للقنوات الإضافية إذا كانت موجودة
    if (global.ch && typeof global.ch === 'object') {
      for (const channelId of Object.values(global.ch)) {
        if (!channelId) continue;
        if (channelId === MAIN_CHANNEL) continue;
        await conn.newsletterFollow(channelId).catch(() => {});
      }
    }
  } catch (error) {
    console.error(chalk.bold.red('❌ فشل في الانضمام إلى قناة البوت'));
  }
}