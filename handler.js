import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"
import { areJidsSameUser, jidNormalizedUser } from "@whiskeysockets/baileys"
import store from "./lib/store.js"
import { safeRequest, withRetry, waitForRateLimit } from "./lib/rateLimit.js"


import * as baileys from "@whiskeysockets/baileys"
const { proto } = baileys
const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

if (!global._bannedMsgCD) global._bannedMsgCD = {}

function alreadyNotified(key, cooldownMs = 10 * 60 * 1000) {
    const now = Date.now()
    if (global._bannedMsgCD[key] && (now - global._bannedMsgCD[key]) < cooldownMs) return true
    global._bannedMsgCD[key] = now
    return false
}

export async function handler(chatUpdate) {
    const conn = this

    if (typeof conn.decodeJid !== "function") {
        conn.decodeJid = (jid) => jid?.replace(/:[0-9]+@/, "@") || jid || ""
    }
    if (typeof conn.getName !== "function") {
        conn.getName = async (jid) => {
            if (!jid) return ""
            try {
                const contact = conn.contacts?.[jid] || conn.contacts?.[conn.decodeJid(jid)] || {}
                return contact.name || contact.notify || contact.vname ||
                       contact.pushName || contact.verifiedName ||
                       global.db?.data?.users?.[jid]?.name || jid.split("@")[0]
            } catch { return jid.split("@")[0] }
        }
    }

    this.msgqueque = this.msgqueque || []
    if (this.msgqueque.length > 50) this.msgqueque = this.msgqueque.slice(-20)
    this.uptime = this.uptime || Date.now()

    if (!chatUpdate) return
    if (typeof this.pushMessage === "function") {
        try { await this.pushMessage(chatUpdate.messages) } catch {}
    }

    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()

    try {
        try {
            m = smsg(this, m) || m
        } catch (e) {
            console.error(chalk.red('[SMSG] Error:'), e.message)
            return
        }

        if (!m) return
        m.exp = 0

        try {
            const rawMsg = m.message || {}
            const innerMsg =
                rawMsg.viewOnceMessageV2Extension?.message ||
                rawMsg.viewOnceMessageV2?.message ||
                rawMsg.viewOnceMessage?.message ||
                rawMsg.ephemeralMessage?.message ||
                rawMsg.documentWithCaptionMessage?.message ||
                rawMsg

            const interResp = innerMsg.interactiveResponseMessage
            if (interResp) {
                if (interResp.nativeFlowResponseMessage?.paramsJson) {
                    try {
                        const params = JSON.parse(interResp.nativeFlowResponseMessage.paramsJson)
                        if (params.id) {
                            m.text = params.id
                            console.log(chalk.cyan(`[BUTTON] Native Flow → "${params.id}"`))
                        }
                    } catch {}
                }
                if (!m.text && interResp.body?.text) m.text = interResp.body.text
            }

            const btnResp = innerMsg.buttonsResponseMessage
            if (btnResp) {
                if (btnResp.selectedButtonId) m.text = btnResp.selectedButtonId
                else if (btnResp.selectedDisplayText) m.text = btnResp.selectedDisplayText
            }

            const listResp = innerMsg.listResponseMessage
            if (listResp?.singleSelectReply?.selectedRowId) m.text = listResp.singleSelectReply.selectedRowId

            const tmplResp = innerMsg.templateButtonReplyMessage
            if (tmplResp?.selectedId) m.text = tmplResp.selectedId

        } catch (e) { console.error(chalk.red('[BUTTON] Extract error:'), e.message) }

        try {
            const user = global.db.data.users[m.sender]
            if (typeof user !== "object") global.db.data.users[m.sender] = {}
            if (user) {
                if (!("name" in user))        user.name        = m.name || m.pushName || ""
                if (!("exp" in user))         user.exp         = 0
                if (!("coin" in user))        user.coin        = 0
                if (!("bank" in user))        user.bank        = 0
                if (!("lastDaily" in user))   user.lastDaily   = 0
                if (!("streak" in user))      user.streak      = 0
                if (!("level" in user))       user.level       = 0
                if (!("health" in user))      user.health      = 100
                if (!("genre" in user))       user.genre       = ""
                if (!("birth" in user))       user.birth       = ""
                if (!("marry" in user))       user.marry       = ""
                if (!("description" in user)) user.description = ""
                if (!("packstickers" in user))user.packstickers= null
                if (!("premium" in user))     user.premium     = false
                if (!("premiumTime" in user)) user.premiumTime = 0
                if (!("banned" in user))      user.banned      = false
                if (!("muto" in user))        user.muto        = false
                if (!("bannedReason" in user))user.bannedReason= ""
                if (!("commands" in user))    user.commands    = 0
                if (!("afk" in user))         user.afk         = -1
                if (!("afkReason" in user))   user.afkReason   = ""
                if (!("warn" in user))        user.warn        = 0
            } else {
                global.db.data.users[m.sender] = {
                    name: m.name || m.pushName || "", exp: 0, coin: 0, bank: 0,
                    level: 0, health: 100, genre: "", birth: "", marry: "",
                    description: "", packstickers: null, premium: false,
                    premiumTime: 0, banned: false, bannedReason: "",
                    commands: 0, afk: -1, afkReason: "", warn: 0,
                    lastDaily: 0, streak: 0, muto: false
                }
            }

            const chat = global.db.data.chats[m.chat]
            if (typeof chat !== "object") global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!("isBanned"   in chat)) chat.isBanned   = false
                if (!("isMute"     in chat)) chat.isMute     = false
                if (!("welcome"    in chat)) chat.welcome    = false
                if (!("sWelcome"   in chat)) chat.sWelcome   = ""
                if (!("sBye"       in chat)) chat.sBye       = ""
                if (!("detect"     in chat)) chat.detect     = false
                if (!("delete"     in chat)) chat.delete     = false
                if (!("primaryBot" in chat)) chat.primaryBot = null
                if (!("modoadmin"  in chat)) chat.modoadmin  = false
                if (!("antiLink"   in chat)) chat.antiLink   = true
                if (!("nsfw"       in chat)) chat.nsfw       = false
                if (!("economy"    in chat)) chat.economy    = true
                if (!("gacha"      in chat)) chat.gacha      = true
            } else {
                global.db.data.chats[m.chat] = {
                    isBanned: false, isMute: false, welcome: false,
                    sWelcome: "", sBye: "", detect: false, delete: false,
                    primaryBot: null, modoadmin: false, antiLink: true,
                    nsfw: false, economy: true, gacha: true
                }
            }

            const settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== "object") global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!("self"      in settings)) settings.self      = false
                if (!("cheonbot" in settings)) settings.cheonbot = true
            } else {
                global.db.data.settings[this.user.jid] = { self: false, cheonbot: true }
            }
        } catch (e) { console.error(e) }

        if (typeof m.text !== "string") m.text = ""
        const user     = global.db.data.users[m.sender]
        const chat     = global.db.data.chats[m.chat]
        const settings = global.db.data.settings[this.user.jid]

        try {
            const actual = user?.name || ""
            const nuevo  = m.pushName || await conn.getName(m.sender)
            if (typeof nuevo === "string" && nuevo.trim() && nuevo !== actual) {
                if (user) user.name = nuevo
            }
        } catch {}

        const detectwhat = (m.sender || "").includes("@lid") ? "@lid" : "@s.whatsapp.net"

        const allOwnerJids = [
            ...(global.owner || []).map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net"),
            ...(global.ownerLid || []).map(v => v.replace(/[^0-9]/g, "") + "@lid"),
        ]

        const isChannel = m.chat?.endsWith("@newsletter") || m.key?.remoteJid?.endsWith("@newsletter")

        const botNumJid = (this.user?.id || this.user?.jid || "").replace(/:[0-9]+@/, "@")

        const isROwner = allOwnerJids.includes(m.sender) ||
                         m.fromMe ||
                         m.sender === botNumJid ||
                         (isChannel && m.key?.fromMe) ||
                         (isChannel && m.key?.participant === undefined)

        const isOwner  = isROwner || m.fromMe
        const isOwners = isROwner || m.fromMe || m.sender === botNumJid || [this.user?.jid].includes(m.sender)

        const allPremsJids = [...(global.prems || []), ...(global.premsLid || [])]
            .map(v => v.replace(/[^0-9]/g, "") + detectwhat)

        const isPrems = isROwner || allPremsJids.includes(m.sender) || user?.premium === true

        if (!m.message) return

        global.lastMessageTime = Date.now()
        m.exp += Math.ceil(Math.random() * 10)

        if (opts["queque"] && m.text && !isPrems) {
            const queque     = this.msgqueque
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            if (previousID) {
                const maxWait   = 1000 * 30
                const startTime = Date.now()
                while (queque.includes(previousID) && (Date.now() - startTime) < maxWait) {
                    await delay(1000)
                }
            }
        }

        let usedPrefix
        const _chats = conn.chats || {}

        let groupMetadata = {}
        if (m.isGroup) {
            try {
                
                groupMetadata = await safeRequest(() => this.groupMetadata(m.chat), `groupMeta_${m.chat}`)
            } catch {
                groupMetadata = _chats[m.chat]?.metadata || {}
            }
        }

        const rawParticipants = groupMetadata.participants || []

        const _decode  = (j) => this.decodeJid(j || "")
        const _norm    = (j) => jidNormalizedUser(_decode(j))
        const _numOnly = (j) => String(_decode(j)).split("@")[0].replace(/[^0-9]/g, "")

        const meIdRaw  = this.user?.id  || this.user?.jid || ""
        const meLidRaw = (this.user?.lid || "").toString().split(":")[0].split("@")[0] || null

        const botCandidates = [
            _decode(meIdRaw), jidNormalizedUser(_decode(meIdRaw)), _numOnly(meIdRaw),
            meLidRaw ? `${meLidRaw}@lid` : null,
            meLidRaw ? jidNormalizedUser(`${meLidRaw}@lid`) : null,
            meLidRaw ? meLidRaw : null,
            meLidRaw ? `${meLidRaw}@s.whatsapp.net` : null,
        ].filter(Boolean)

        const senderCandidates = [
            _decode(m.sender), jidNormalizedUser(_decode(m.sender)), _numOnly(m.sender),
        ].filter(Boolean)

        const participantsMap = {}
        for (const p of rawParticipants) {
            const raw = p.jid || p.id || ""
            if (raw) {
                const dj = _decode(raw), nj = jidNormalizedUser(dj), no = _numOnly(dj)
                if (dj) participantsMap[dj] = p
                if (nj) participantsMap[nj] = p
                if (no) participantsMap[no] = p
            }
            if (p.phoneNumber) {
                const pn = _decode(p.phoneNumber), pnn = jidNormalizedUser(pn), pno = _numOnly(pn)
                if (pn) participantsMap[pn] = p
                if (pnn) participantsMap[pnn] = p
                if (pno) participantsMap[pno] = p
            }
            if (p.lid) {
                const lidNum = p.lid.toString().split("@")[0]
                if (lidNum) { participantsMap[lidNum] = p; participantsMap[`${lidNum}@lid`] = p }
            }
        }

        const pick = (cands) => {
            for (const k of cands) { if (k && participantsMap[k]) return participantsMap[k] }
            return rawParticipants.find(p =>
                cands.some(c => { try { return areJidsSameUser(_norm(p.jid || p.id), jidNormalizedUser(_decode(c))) } catch { return false } })
            ) || null
        }

        const userGroup = m.isGroup ? (pick(senderCandidates) || {}) : {}
        const botGroup  = m.isGroup ? (pick(botCandidates)    || {}) : {}

        if (m.isGroup && botGroup && !global.botLid) {
            const lid = botGroup.lid || botGroup.id || ""
            if (lid.endsWith("@lid")) {
                global.botLid = lid.split("@")[0]
                console.log(chalk.cyan("🔑 Bot LID:", global.botLid))
            }
        }

        const participants = rawParticipants.map(p => {
            const candidates = [p.jid, p.id, p.lid].filter(Boolean)
            const realJid = candidates.find(j => j?.endsWith("@s.whatsapp.net")) || candidates[0] || ""
            return { ...p, id: realJid, jid: realJid, admin: p.admin || null }
        })

        const isRAdmin   = userGroup.admin === "superadmin"
        const isAdmin    = isRAdmin || userGroup.admin === "admin" || userGroup.admin === true
        const isBotAdmin = botGroup.admin === "admin" || botGroup.admin === "superadmin" || botGroup.admin === true

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "plugins")

        const isBannedChat = chat?.isBanned && !isROwner
        const isBannedUser = user?.banned && !isROwner

        let isAnyCommand = false
        let isBanChatCommand = false

        if (m.text) {
            for (const name in global.plugins) {
                const plugin = global.plugins[name]
                if (!plugin || plugin.disabled || typeof plugin !== "function") continue

                const strRegex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
                const pluginPrefix = plugin.customPrefix || conn.prefix || global.prefix || "!"

                let testMatch
                try {
                    testMatch = (
                        pluginPrefix instanceof RegExp ? [[pluginPrefix.exec(m.text), pluginPrefix]] :
                        Array.isArray(pluginPrefix) ? pluginPrefix.map(p => { const r = p instanceof RegExp ? p : new RegExp(strRegex(p)); return [r.exec(m.text), r] }) :
                        typeof pluginPrefix === "string" ? [[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]] :
                        [[[], new RegExp]]
                    ).find(p => p[1])
                } catch { continue }

                const pfx = (testMatch?.[0] || "")[0]
                if (pfx) {
                    const noPrefix = m.text.replace(pfx, "")
                    let [cmd] = noPrefix.trim().split(" ").filter(v => v)
                    cmd = (cmd || "").toLowerCase()

                    const isAccept = plugin.command instanceof RegExp ? plugin.command.test(cmd) :
                        Array.isArray(plugin.command) ? plugin.command.some(c => c instanceof RegExp ? c.test(cmd) : c === cmd) :
                        typeof plugin.command === "string" ? plugin.command === cmd : false

                    if (isAccept) {
                        isAnyCommand = true
                        if (/banchat|حظر_جروب|فك_حظر|unbanchat|قائمة_محظورة|listbanned/i.test(cmd)) isBanChatCommand = true
                        break
                    }
                }
            }
        }

        if (isBannedChat && isAnyCommand && !isBanChatCommand) {
            const cdKey = `banchat_${m.chat}`
            if (!alreadyNotified(cdKey, 10 * 60 * 1000)) {
                await conn.sendMessage(m.chat, { text: `🪻 *البوت موقوف في هذا الجروب*\n📌 تواصل مع المطور عشان تفعّله` }, { quoted: m }).catch(() => {})
            }
            return
        }

        if (isBannedUser && isAnyCommand) {
            const cdKey = `banuser_${m.sender}`
            if (!alreadyNotified(cdKey, 10 * 60 * 1000)) {
                await conn.sendMessage(m.chat, { text: `🪻 *أنت محظور من استخدام البوت*\n📌 السبب: ${user?.bannedReason || 'غير محدد'}` }, { quoted: m }).catch(() => {})
            }
            return
        }

        for (const name in global.plugins) {
            const plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue
            const __filename = join(___dirname, name)

            if (typeof plugin.all === "function") {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate, __dirname: ___dirname, __filename,
                        user, chat, settings,
                        isAdmin, isROwner, isBotAdmin, isOwner, isPrems,
                        participants, groupMetadata
                    })
                } catch (e) { console.error(e) }
            }

            if (!opts["restrict"])
                if (plugin.tags && plugin.tags.includes("admin")) continue

            const strRegex     = str => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
            const pluginPrefix = plugin.customPrefix || conn.prefix || global.prefix || "!"

            let match
            try {
                match = (
                    pluginPrefix instanceof RegExp ? [[pluginPrefix.exec(m.text), pluginPrefix]] :
                    Array.isArray(pluginPrefix) ? pluginPrefix.map(p => { const r = p instanceof RegExp ? p : new RegExp(strRegex(p)); return [r.exec(m.text), r] }) :
                    typeof pluginPrefix === "string" ? [[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]] :
                    [[[], new RegExp]]
                ).find(p => p[1])
            } catch { continue }

            if (typeof plugin.before === "function") {
                try {
                    if (await plugin.before.call(this, m, {
                        match, conn: this, participants, groupMetadata,
                        userGroup, botGroup, isROwner, isOwner, isRAdmin,
                        isAdmin, isBotAdmin, isPrems, chatUpdate,
                        __dirname: ___dirname, __filename, user, chat, settings
                    })) continue
                } catch (e) { console.error(e) }
            }

            if (typeof plugin !== "function") continue

            if ((usedPrefix = (match?.[0] || "")[0])) {
                const noPrefix = m.text.replace(usedPrefix, "")
                let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
                args      = args || []
                let _args = noPrefix.trim().split(" ").slice(1)
                let text  = _args.join(" ")
                command   = (command || "").toLowerCase()

                const fail     = plugin.fail || global.dfail
                const isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(c => c instanceof RegExp ? c.test(command) : c === command) :
                    typeof plugin.command === "string" ? plugin.command === command : false

                global.comando = command

                if (!isChannel && !isOwners && settings?.self) continue

                if (!isROwner) {
                    const botLidJid = global.botLid ? global.botLid + '@lid' : null
                    if (m.sender === botNumJid || (botLidJid && m.sender === botLidJid) || m.key?.fromMe) continue
                }

                if (!isROwner && m.id && (
                    m.id.startsWith("NJX-") ||
                    (m.id.startsWith("BAE5") && m.id.length === 16) ||
                    (m.id.startsWith("B24E") && m.id.length === 20)
                )) continue

                if (global.db.data.chats[m.chat]?.primaryBot &&
                    global.db.data.chats[m.chat].primaryBot !== this.user.jid) {
                    const primaryBotConn = global.conns?.find(c =>
                        c.user?.jid === global.db.data.chats[m.chat].primaryBot &&
                        c.ws?.socket && c.ws.socket.readyState !== ws.CLOSED
                    )
                    const grpParticipants = m.isGroup ? (groupMetadata.participants || []) : []
                    const primaryBotInGroup = grpParticipants.some(p => (p.id || p.jid) === global.db.data.chats[m.chat].primaryBot)
                    if ((primaryBotConn && primaryBotInGroup) || global.db.data.chats[m.chat].primaryBot === global.conn?.user?.jid) {
                        continue
                    } else {
                        global.db.data.chats[m.chat].primaryBot = null
                    }
                }

                if (!isAccept) continue
                m.plugin = name
                if (global.db.data.users[m.sender]) global.db.data.users[m.sender].commands++

                const adminMode = chat?.modoadmin || false
                if (adminMode && !isOwner && m.isGroup && !isAdmin) continue

                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { fail("owner",    m, this); continue }
                if (plugin.rowner && !isROwner)  { fail("rowner",   m, this); continue }
                if (plugin.owner  && !isOwner)   { fail("owner",    m, this); continue }
                if (plugin.premium && !isPrems)  { fail("premium",  m, this); continue }
                if (plugin.group  && !m.isGroup) { fail("group",    m, this); continue }
                else if (plugin.botAdmin && !isBotAdmin) { fail("botAdmin", m, this); continue }
                else if (plugin.admin    && !isAdmin)    { fail("admin",    m, this); continue }
                if (plugin.private && m.isGroup) { fail("private",  m, this); continue }

                m.isCommand = true
                m.exp += plugin.exp ? parseInt(plugin.exp) : 10

                const extra = {
                    match, usedPrefix, noPrefix, _args, args, command, text,
                    conn: this, participants, groupMetadata, userGroup, botGroup,
                    isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
                    chatUpdate, __dirname: ___dirname, __filename, user, chat, settings
                }

                try {
                    await plugin.call(this, m, extra)
                } catch (err) {
                    m.error = err
                    console.error(err)
                    const _errText = [
                        "~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~\n🪻 صار خطأ في الأمر",
                        `📌 الأمر: ${command || "مجهول"}`,
                        `❌ الخطأ: ${err?.message || String(err)}`,
                        "~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~"
                    ].join("\n")
                    const _errJid = m.key?.remoteJid || m.chat || ""
                    try {
                        await this.sendMessage(_errJid, { react: { text: "❌", key: m.key } }).catch(() => {})
                        await this.sendMessage(_errJid, { text: _errText }, { quoted: m }).catch(() =>
                            this.sendMessage(_errJid, { text: _errText }).catch(() => {})
                        )
                    } catch {}
                } finally {
                    if (typeof plugin.after === "function") {
                        try { await plugin.after.call(this, m, extra) } catch (e) { console.error(e) }
                    }
                }
            }
        }

    } catch (err) {
        console.error(chalk.red('[HANDLER]'), err)
    } finally {
        if (this.msgqueque) {
            const qi = this.msgqueque.indexOf(m?.id || m?.key?.id)
            if (qi !== -1) this.msgqueque.splice(qi, 1)
        }
        if (m?.sender && global.db.data?.users?.[m.sender]) {
            global.db.data.users[m.sender].exp += (m.exp || 0)
            global.db.data.users[m.sender].lastseen = Date.now()
        }

        try {
            const mutoUser = global.db.data?.users?.[m?.sender]
            if (mutoUser?.muto === true && m?.key?.id) {
                await this.sendMessage(m.chat, {
                    delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant }
                }).catch(() => {})
            }
        } catch {}

        try {
            if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
        } catch (e) { console.warn(e) }
    }
}

global.dfail = (type, m, conn) => {
    const botName = global.botName || "𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓"
    const zarf = global.zarf || "~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~"
    const msg = {
        rowner:   `${zarf}\n🪻 *${botName}*\n${zarf}\n\n❌ هذا الأمر للمطور بس يا حبيبي`,
        owner:    `${zarf}\n🪻 *${botName}*\n${zarf}\n\n❌ هذا الأمر للمطور بس ما ينفعك`,
        mods:     `${zarf}\n🪻 *${botName}*\n${zarf}\n\n❌ هذا الأمر لمشرفي البوت بس`,
        premium:  `${zarf}\n🪻 *${botName}*\n${zarf}\n\n⭐ هذا الأمر للمميزين، تواصل مع المطور`,
        group:    `${zarf}\n🪻 *${botName}*\n${zarf}\n\n👥 هذا الأمر يشتغل في المجموعات بس`,
        private:  `${zarf}\n🪻 *${botName}*\n${zarf}\n\n💬 هذا الأمر يشتغل في الخاص بس`,
        admin:    `${zarf}\n🪻 *${botName}*\n${zarf}\n\n🛡️ هذا الأمر للأدمن بس يا حبيبي`,
        botAdmin: `${zarf}\n🪻 *${botName}*\n${zarf}\n\n⚙️ خليني أدمن في الجروب أول`,
        restrict: `${zarf}\n🪻 *${botName}*\n${zarf}\n\n🚫 هذي الخاصية موقوفة الحين`,
    }[type]
    if (msg) return conn.sendMessage(m.chat, { text: msg }, { quoted: m })
        .then(_ => conn.sendMessage(m.chat, { react: { text: "🪻", key: m.key } }))
}

export async function deleteUpdate(message) {
  try {
    const { fromMe, id, participant, remoteJid } = message
    if (fromMe) return
    let msg = null
    try { msg = await store.loadMessage(remoteJid, id) } catch {}
    if (!msg) return
    try { if (typeof this.serializeM === "function") msg = this.serializeM(msg) } catch {}
    const chatJid = msg?.chat || remoteJid
    let chat = global.db.data?.chats?.[chatJid] || {}
    if (!chat?.delete) return
    let isGroup   = remoteJid?.endsWith('@g.us')
    let isPrivate = !isGroup && remoteJid?.endsWith('@s.whatsapp.net')
    if (!isGroup && !isPrivate) return
    const senderNum = (participant || "").split('@')[0]
    await this.sendMessage(chatJid, {
      text: `🪻 *${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'} — نظام ضد الحذف*\n\n👤 @${senderNum} حذف رسالة!`,
      mentions: [participant]
    }).catch(() => {})
    if (msg.message) {
      try { await this.sendMessage(chatJid, { forward: msg }) } catch {
        try { if (typeof this.copyNForward === "function") await this.copyNForward(chatJid, msg) } catch {}
      }
    }
  } catch {}
}

export async function groupsUpdate(groupsUpdate) {
  for (const groupUpdate of groupsUpdate) {
    const id = groupUpdate.id
    if (!id) continue
    let chat = global.db.data?.chats?.[id]
    if (!chat?.detect) continue
    let text = ''
    if (groupUpdate.subject) text = `📝 تم تغيير اسم المجموعة إلى:\n*${groupUpdate.subject}*`
    if (groupUpdate.desc)    text = `📋 تم تغيير وصف المجموعة:\n${groupUpdate.desc}`
    if (groupUpdate.revoke)  text = `🔗 تم تغيير رابط المجموعة`
    if (!text) continue
    try { await this.sendMessage(id, { text, mentions: this.parseMention?.(text) || [] }) } catch {}
  }
}

export async function participantsUpdate({ id, participants, action }) {
    if (opts["self"]) return
    if (this.isInit) return
    if (global.db.data == null) await global.loadDatabase()

    const chat = global.db.data.chats[id] || {}
    if (!chat.welcome) return

    const groupMetadata = await safeRequest(() => this.groupMetadata(id), `groupMeta_${id}`).catch(() => null)
    if (!groupMetadata) return

    for (const user of participants) {
        let pp = global.images?.group || "https://i.imgur.com/2hcBYMn.jpg"
        try { pp = await this.profilePictureUrl(user, "image") } catch {}

        let text = ""
        if (action === "add") {
            text = (chat.sWelcome || `🪻 *أهلاً وسهلاً @user في المجموعة!*\n\n📌 *${groupMetadata.subject}*`)
                .replace("@user", "@" + user.split("@")[0])
                .replace("@subject", groupMetadata.subject || "")
        } else if (action === "remove") {
            text = (chat.sBye || `👋 *@user ساب المجموعة*`)
                .replace("@user", "@" + user.split("@")[0])
        } else if (action === "promote") {
            text = `🛡️ *@${user.split("@")[0]} صار أدمن! تهانينا 🎉*`
        } else if (action === "demote") {
            text = `📉 *@${user.split("@")[0]} ما عاد أدمن*`
        }

        if (text) {
            await this.sendMessage(id, { text, mentions: [user] }).catch(() => {})
        }
    }
}

export async function callUpdate(callUpdate) {
    const settings = global.db.data?.settings?.[this.user?.jid] || {}
    if (!settings.antiCall) return
    for (const call of callUpdate) {
        if (!call.isGroup && call.status === "offer") {
            try {
                await this.rejectCall(call.id, call.from).catch(() => {})
                await this.sendMessage(call.from, {
                    text: `⚡ *${global.botName || "𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓"}*\n\n❌ ما نقدر نقبل المكالمات الحين، شيل البوت من جهات اتصالك`
                }).catch(() => {})
            } catch {}
        }
    }
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.cyan("🪻 تم تحديث handler.js"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})