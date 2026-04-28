import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, getDevice } from '@whiskeysockets/baileys'
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
import { fileURLToPath } from 'url'
import { exec, spawn } from 'child_process'
import { makeWASocket } from '../lib/simple.js'

if (typeof global.wm === 'undefined') {
    global.wm = '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const { CONNECTING } = ws

let rtx = `⛄┊≡ ◡̈⃝🧸↜♡︎✿︎𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓 𝚋𝚘𝚝ꨄ︎ఌ
🎤┊≡ ◡̈⃝🎼↜اســتــخــدم هــذا الــكــود لــتــصــبــح بــوت فــرعــي
❄️┊ ۬.͜ـ🧸˖ ↜ الــخــطــوات كــالــتــالــي
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹✨›⊏═┈─๋︩︪─
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇
┤┌
│┊𝟣 : اضــغــط عــلــى الــثــلاث نــقــاط
│┊𝟤 : اضــغــط عــلــى الأجــهــزة الــمــرتــبــطــة
│┊𝟥 : امــســح الـرمـز هــذا
┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇
╯─ׅ─๋︩︪─┈─๋︩︪─═⊐‹♻️›⊏═┈─๋︩︪⊐`

let rtx2 = `⛄┊≡ ◡̈⃝🧸↜♡︎✿︎𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓 𝚋𝚘𝚝ꨄ︎ఌ
🎤┊≡ ◡̈⃝🎼↜اســتــخــدم هــذا الــكــود لــتــصــبــح بــوت فــرعــي
❄️┊ ۬.͜ـ🧸˖ ↜ الــخــطــوات كــالــتــالــي
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹✨›⊏═┈─๋︩︪─
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇
┤┌
│┊𝟣 : اضــغــط عــلــى الــثــلاث نــقــاط
│┊𝟤 : اضــغــط عــلــى الأجــهــزة الــمــرتــبــطــة
│┊𝟥 : اخــتــر ربــط مــع رقــم الــهــاتــف
│┊𝟦 : اكــتــب الــكــود
┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇
╯─ׅ─๋︩︪─┈─๋︩︪─═⊐‹♻️›⊏═┈─๋︩︪⊐`

const gataJBOptions = {}
const retryMap = new Map()
const maxAttempts = 5

if (global.conns instanceof Array) console.log()
else global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner, text }) => {
    if (!global.db.data.settings[conn.user.jid].jadibotmd) return m.reply('⚠️ خاصية البوتات الفرعية معطلة.')
    if (conn.user.jid === m.sender) return
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${text ? text.replace(/\D/g, '') : who.split`@`[0]}`
    let pathGataJadiBot = path.join('./jadibts/', id)
    if (!fs.existsSync(pathGataJadiBot)) {
        fs.mkdirSync(pathGataJadiBot, { recursive: true })
    }
    gataJBOptions.pathGataJadiBot = pathGataJadiBot
    gataJBOptions.m = m
    gataJBOptions.conn = conn
    gataJBOptions.args = args
    gataJBOptions.usedPrefix = usedPrefix
    gataJBOptions.command = command
    gataJBOptions.fromCommand = true
    gataJadiBot(gataJBOptions, text)
}

handler.command = /^(jadibot|serbot|rentbot|تنصيب)$/i
export default handler

export async function gataJadiBot(options, text) {
    let { pathGataJadiBot, m, conn, args, usedPrefix, command } = options

    // ═══════════════════════════════════════
    // معالجة أمر تنصيب
    // ═══════════════════════════════════════
    if (command === 'تنصيب') {
        command = 'jadibot'
        if (!args.includes('تنصيب') && !args.includes('--تنصيب')) {
            args.unshift('--تنصيب')
        }
    }

    const mcode = args[0] && /(--تنصيب|تنصيب)/.test(args[0].trim()) ? true : args[1] && /(--تنصيب|تنصيب)/.test(args[1].trim()) ? true : false
    let txtCode, codeBot, txtQR

    if (mcode) {
        args[0] = args[0].replace(/^--تنصيب$|^تنصيب$/, '').trim()
        if (args[1]) args[1] = args[1].replace(/^--تنصيب$|^تنصيب$/, '').trim()
        if (args[0] == '') args[0] = undefined
    }

    const pathCreds = path.join(pathGataJadiBot, 'creds.json')
    if (!fs.existsSync(pathGataJadiBot)) {
        fs.mkdirSync(pathGataJadiBot, { recursive: true })
    }

    try {
        args[0] && args[0] != undefined
            ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], 'base64').toString('utf-8')), null, '\t'))
            : ''
    } catch {
        conn.reply(m.chat, `*استخدم الأمر بشكل صحيح:* \`${usedPrefix + command} code\``, m)
        return
    }

    // ═══════════════════════════════════════
    // إعداد الاتصال
    // ═══════════════════════════════════════
    let { version } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => {}
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathGataJadiBot)

    const connectionOptions = {
        logger: pino({ level: 'fatal' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        msgRetry,
        msgRetryCache,
        browser: mcode ? ['Windows', 'Chrome', '110.0.5585.95'] : ['GataBot-MD (Sub Bot)', 'Chrome', '2.0.0'],
        version: version,
        generateHighQualityLinkPreview: true
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true
    let reconnectAttempts = 0

    // ═══════════════════════════════════════
    // معالجة أحداث الاتصال
    // ═══════════════════════════════════════
    async function connectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update
        if (isNewLogin) sock.isInit = false

        // ─── QR Code ───
        if (qr && !mcode) {
            if (m?.chat) {
                txtQR = await conn.sendMessage(m.chat, {
                    image: await qrcode.toBuffer(qr, { scale: 8 }),
                    caption: rtx.trim() + '\n'
                }, { quoted: m })
                if (txtQR?.key) {
                    setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000)
                }
            }
            return
        }

        // ─── Pairing Code ───
        if (qr && mcode) {
            let fixTe = text ? text.replace(/\D/g, '') : m.sender.split('@')[0]
            let secret = await sock.requestPairingCode(fixTe)
            secret = secret.match(/.{1,4}/g)?.join('-') || secret
            const dispositivo = await getDevice(m.key.id)

            if (!m.isWABusiness) {
                if (/web|desktop|unknown/i.test(dispositivo)) {
                    txtCode = await conn.sendMessage(m.chat, {
                        image: { url: 'https://s7.ezgif.com/tmp/ezgif-7905c1c9baa94fbc.jpg' },
                        caption: rtx2.trim() + '\n'
                    }, { quoted: m })
                    codeBot = await m.reply(secret)
                } else {
                    txtCode = await conn.sendButton(
                        m.chat,
                        rtx2.trim(),
                        global.wm + `\n*الــكــود 🌺:* ${secret}`,
                        'https://files.catbox.moe/azc9kk.jpg',
                        null,
                        [['🫐 نـسـخ الـكـود 🫐', secret]],
                        null, null, m
                    )
                }
            } else {
                txtCode = await conn.sendMessage(m.chat, {
                    image: { url: 'https://h.uguu.se/GUHtpVKY.jpg' },
                    caption: rtx2.trim() + '\n'
                }, { quoted: m })
                codeBot = await m.reply(secret)
            }
            console.log(secret)
        }

        if ((txtCode?.key || txtCode?.id)) {
            setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key || txtCode.id }), 30000)
        }
        if (codeBot?.key) {
            setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000)
        }

        // ═══════════════════════════════════════
        // دالة تنظيف الاتصال
        // ═══════════════════════════════════════
        const endSesion = async (loaded) => {
            if (!loaded) {
                try { sock.ws.close() } catch {}
                sock.ev.removeAllListeners()
                let i = global.conns.indexOf(sock)
                if (i < 0) return
                delete global.conns[i]
                global.conns.splice(i, 1)
            }
        }

        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

        // ═══════════════════════════════════════
        // معالجة الانقطاع — كل حالة لوحدها
        // ═══════════════════════════════════════
        if (connection === 'close') {

            // ─── 428: اتصال مغلق مؤقتاً ───
            if (reason === 428) {
                if (reconnectAttempts < maxAttempts) {
                    const delayTime = 1000 * Math.pow(2, reconnectAttempts)
                    console.log(chalk.bold.magentaBright(`\n┆ إعادة اتصال (+${path.basename(pathGataJadiBot)}) بعد ${delayTime / 1000}ث (${reconnectAttempts + 1}/${maxAttempts})\n`))
                    await sleep(delayTime)
                    await creloadHandler(true).catch(console.error)
                    reconnectAttempts++
                } else {
                    console.log(chalk.redBright(`┆ فشل الاتصال (+${path.basename(pathGataJadiBot)}) بعد ${maxAttempts} محاولات`))
                }
            }

            // ─── 408: انتهت المهلة ───
            if (reason === 408) {
                console.log(chalk.bold.magentaBright(`\n┆ انتهت مهلة الاتصال (+${path.basename(pathGataJadiBot)}). إعادة اتصال...\n`))
                await creloadHandler(true).catch(console.error)
            }

            // ─── 440: جلسة بديلة (لا تحذف!) ───
            if (reason === 440) {
                console.log(chalk.bold.magentaBright(`\n┆ تم استبدال الجلسة (+${path.basename(pathGataJadiBot)}) بجلسة أخرى\n`))
                try {
                    if (options.fromCommand && m?.chat) {
                        await conn.sendMessage(m.chat, {
                            text: '> *تم اكتشاف جلسة جديدة. احذف الجلسة القديمة للمتابعة*'
                        }, { quoted: m })
                    }
                } catch {}
            }

            // ─── 401 / 405: جلسة غير صالحة → حذف ───
            if (reason === 401 || reason === 405) {
                console.log(chalk.bold.magentaBright(`\n┆ جلسة (+${path.basename(pathGataJadiBot)}) غير صالحة (${reason}). حذف...\n`))
                try {
                    if (options.fromCommand && m?.chat) {
                        await conn.sendMessage(m.chat, {
                            text: '*🟢 الجلسة معلقة*\n\n> *لزما امسح ملف الاتصال  مات*'
                        }, { quoted: m })
                    }
                } catch {}
                try { fs.rmdirSync(pathGataJadiBot, { recursive: true }) } catch {}
                await endSesion(false)
            }

            // ─── 403: حساب محظور → حذف ───
            if (reason === 403) {
                console.log(chalk.bold.magentaBright(`\n┆ حساب (+${path.basename(pathGataJadiBot)}) محظور أو قيد الدعم\n`))
                try { fs.rmdirSync(pathGataJadiBot, { recursive: true }) } catch {}
                await endSesion(false)
            }

            // ─── 500: خطأ سيرفر ───
            if (reason === 500) {
                console.log(chalk.bold.magentaBright(`\n┆ انقطع الاتصال (+${path.basename(pathGataJadiBot)}) خطأ سيرفر\n`))
                if (options.fromCommand && m?.chat) {
                    try {
                        await conn.sendMessage(m.chat, {
                            text: '*انقطع الاتصال*\n\n> *اصبر امسح ملف الاتصال *'
                        }, { quoted: m })
                    } catch {}
                }
            }

            // ─── 515: إعادة تشغيل تلقائي ───
            if (reason === 515) {
                console.log(chalk.bold.magentaBright(`\n┆ إعادة تشغيل تلقائي (+${path.basename(pathGataJadiBot)})\n`))
                await creloadHandler(true).catch(console.error)
            }
        }

        // ═══════════════════════════════════════
        // فحص قاعدة البيانات
        // ═══════════════════════════════════════
        if (global.db.data == null) loadDatabase()

        // ═══════════════════════════════════════
        // الاتصال ناجح
        // ═══════════════════════════════════════
        if (connection === 'open') {
            reconnectAttempts = 0
            if (!global.db.data?.users) loadDatabase()

            let userName = sock.authState.creds.me.name || 'مجهول'
            let userJid = sock.authState.creds.me.jid || `${path.basename(pathGataJadiBot)}@s.whatsapp.net`

            console.log(chalk.bold.cyanBright(`\n✅ ${userName} (+${path.basename(pathGataJadiBot)}) متصل بنجاح.\n`))

            sock.isInit = true
            global.conns.push(sock)
            console.log(`📢 إجمالي البوتات الفرعية النشطة: ${global.conns.length}`)

            // ─── رسالة النجاح ───
            if (m?.chat && options.fromCommand) {
                await conn.sendMessage(m.chat, {
                    text: `\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n┆ ✅ تم الاتصال بنجاح\n┆ 📱 الرقم: ${path.basename(pathGataJadiBot)}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363404349859805@newsletter',
                            newsletterName: '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓 Bot',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: m })
            }

            // ─── إشعار القناة ───
            try {
                let chtxt = `*اتصال بوت فرعي ✅*\n\n*👤 المستخدم:* ${userName}\n*📞 الرقم:* ${path.basename(pathGataJadiBot)}`
                if (global.ch?.ch1) {
                    await global.conn.sendMessage(global.ch.ch1, { text: chtxt })
                }
            } catch {}

            await joinChannels(sock)
        }
    }

    // ═══════════════════════════════════════
    // تنظيف الاتصالات الميتة كل 60 ثانية
    // ═══════════════════════════════════════
    setInterval(async () => {
        if (!sock.user) {
            try { sock.ws.close() } catch {}
            sock.ev.removeAllListeners()
            let i = global.conns.indexOf(sock)
            if (i < 0) return
            delete global.conns[i]
            global.conns.splice(i, 1)
        }
    }, 60000)

    // ═══════════════════════════════════════
    // تحميل وتحديث المعالج
    // ═══════════════════════════════════════
    let handler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
        try {
            const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
            if (Object.keys(Handler || {}).length) handler = Handler
        } catch (e) {
            console.error('خطأ:', e)
        }

        if (restatConn) {
            const oldChats = sock.chats
            try { sock.ws.close() } catch {}
            sock.ev.removeAllListeners()
            sock = makeWASocket(connectionOptions, { chats: oldChats })
            isInit = true
        }

        if (!isInit) {
            sock.ev.off('messages.upsert', sock.handler)
            sock.ev.off('group-participants.update', sock.participantsUpdate)
            sock.ev.off('groups.update', sock.groupsUpdate)
            sock.ev.off('message.delete', sock.onDelete)
            sock.ev.off('call', sock.onCall)
            sock.ev.off('connection.update', sock.connectionUpdate)
            sock.ev.off('creds.update', sock.credsUpdate)
        }

        sock.handler = handler.handler.bind(sock)
        sock.participantsUpdate = handler.participantsUpdate.bind(sock)
        sock.groupsUpdate = handler.groupsUpdate.bind(sock)
        sock.onDelete = handler.deleteUpdate.bind(sock)
        sock.onCall = handler.callUpdate.bind(sock)
        sock.connectionUpdate = connectionUpdate.bind(sock)
        sock.credsUpdate = saveCreds.bind(sock, true)

        sock.ev.on('messages.upsert', sock.handler)
        sock.ev.on('group-participants.update', sock.participantsUpdate)
        sock.ev.on('groups.update', sock.groupsUpdate)
        sock.ev.on('message.delete', sock.onDelete)
        sock.ev.on('call', sock.onCall)
        sock.ev.on('connection.update', sock.connectionUpdate)
        sock.ev.on('creds.update', sock.credsUpdate)
        isInit = false
        return true
    }
    creloadHandler(false)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function joinChannels(conn) {
    for (const channelId of Object.values(global.ch || {})) {
        if (channelId && channelId.endsWith('@newsletter')) {
            await conn.newsletterFollow(channelId).catch(() => {})
        }
    }
}

// ═══════════════════════════════════════
// فحص وإعادة تشغيل البوتات الفرعية كل 30 دقيقة
// ═══════════════════════════════════════
async function checkSubBots() {
    const subBotDir = path.resolve('./jadibts')
    if (!fs.existsSync(subBotDir)) return

    const folders = fs.readdirSync(subBotDir)
        .filter(f => fs.statSync(path.join(subBotDir, f)).isDirectory())

    for (const folder of folders) {
        const botPath = path.join(subBotDir, folder)
        const credsPath = path.join(botPath, 'creds.json')

        if (!fs.existsSync(credsPath)) continue

        const isConnected = global.conns.find(c =>
            c.user?.jid?.includes(folder) || false
        )

        if (!isConnected) {
            const retries = retryMap.get(folder) || 0
            if (retries >= 5) {
                retryMap.delete(folder)
                continue
            }

            console.log(chalk.yellowBright(`\n┆ إعادة تشغيل بوت فرعي (+${folder})...\n`))

            try {
                await gataJadiBot({
                    pathGataJadiBot: botPath,
                    m: null,
                    conn: global.conn,
                    args: [],
                    usedPrefix: '.',
                    command: 'jadibot',
                    fromCommand: false
                })
                retryMap.delete(folder)
            } catch (e) {
                console.error(chalk.redBright(`فشل تشغيل (+${folder}):`), e.message)
                retryMap.set(folder, retries + 1)
            }
        }
    }
}

setInterval(checkSubBots, 1800000)
