import Akinator from 'akinator-api'
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

// تخزين جلسات اللعب لكل مستخدم
const games = new Map()

// صورة المارد
const AKINATOR_IMAGE = 'https://file.garden/aauvg01sjleV_ic1/Mard.jpg'

// دالة لإنشاء كائن Akinator
function createAki(lang) {
    return new Akinator({
        region: lang,     // 'ar' للعربية
        childMode: false
    })
}

let handler = async (m, { conn, command }) => {
    const userId = m.sender

    // ━━━ بدء لعبة جديدة ━━━
    if (command === 'مارد') {
        if (games.has(userId)) games.delete(userId)

        // بناء رسالة الترحيب
        const welcomePayload = {
            body: { text: '🧞‍♂️ *مرحباً! أنا المارد الأزرق*\n\n✨ *فكر في شخصية* (حقيقية أو خيالية)\n📝 *سأطرح عليك أسئلة* لأحاول تخمينها\n\n🎮 *جاهز؟* اضغط على زر ابدأ' },
            footer: { text: `⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}` },
            header: { hasMediaAttachment: false },
            nativeFlowMessage: {
                buttons: [
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎮 ابدأ اللعبة', id: 'akin_start_game' }) }
                ]
            }
        }

        // إضافة صورة المارد
        try {
            const media = await conn.prepareWAMessageMedia?.({ image: { url: AKINATOR_IMAGE } }, { upload: conn.waUploadToServer })
            if (media) {
                welcomePayload.header = {
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                }
            }
        } catch (err) {
            console.error('Image error:', err.message)
        }

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject(welcomePayload)
                }
            }
        }, { userJid: conn.user.jid, quoted: m })

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
        return
    }

    // ━━━ بدء اللعبة الفعلي (بعد الضغط على زر ابدأ) ━━━
    if (command === 'akin_start_game') {
        try {
            const aki = createAki('ar')
            await aki.start()

            const sessionId = Date.now()
            games.set(userId, {
                aki: aki,
                sessionId: sessionId
            })

            // بناء رسالة السؤال الأول
            const questionPayload = {
                body: { text: `🧞‍♂️ *السؤال 1:*\n\n${aki.question}\n\n📊 *نسبة التقدم:* 0%` },
                footer: { text: `⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}` },
                header: { hasMediaAttachment: false },
                nativeFlowMessage: {
                    buttons: [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✅ نعم', id: `akin_${sessionId}_0` }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '❌ لا', id: `akin_${sessionId}_1` }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '❓ لا أعرف', id: `akin_${sessionId}_2` }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🤔 ربما', id: `akin_${sessionId}_3` }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '😕 على الأرجح لا', id: `akin_${sessionId}_4` }) }
                    ]
                }
            }

            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.fromObject(questionPayload)
                    }
                }
            }, { userJid: conn.user.jid, quoted: m })

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

        } catch (err) {
            console.error('Start game error:', err)
            await m.reply('❌ حدث خطأ في بدء اللعبة: ' + err.message)
        }
        return
    }

    // ━━━ معالجة إجابات الأسئلة ━━━
    if (command && command.startsWith('akin_') && !command.startsWith('akin_confirm_')) {
        const game = games.get(userId)
        if (!game) {
            await m.reply('🧞‍♂️ لا توجد لعبة نشطة!\nاكتب .مارد لبدء لعبة جديدة')
            return
        }

        const answerId = parseInt(command.split('_')[2])
        if (isNaN(answerId)) return

        try {
            const aki = game.aki
            await aki.step(answerId)

            const progress = aki.progress || 0

            // إذا وصلنا للتخمين
            if (progress >= 85 || aki.currentStep >= 75) {
                await aki.win()
                const guess = aki.answers[0]

                if (guess && guess.name) {
                    // إرسال صورة الشخصية إذا وجدت
                    const imgUrl = guess.absolute_picture_path || guess.photo
                    let caption = `🧞‍♂️ *أعتقد أن شخصيتك هي:*\n\n✨ *${guess.name}*`
                    if (guess.description) caption += `\n📝 ${guess.description.substring(0, 200)}`
                    caption += `\n\n🎯 *هل توقعي صحيح؟*`

                    if (imgUrl) {
                        await conn.sendMessage(m.chat, { image: { url: imgUrl }, caption: caption }, { quoted: m }).catch(() => m.reply(caption))
                    } else {
                        await m.reply(caption)
                    }

                    // أزرار التأكيد
                    const confirmPayload = {
                        body: { text: '🧞‍♂️ *هل هذا صحيح؟*' },
                        footer: { text: `⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}` },
                        header: { hasMediaAttachment: false },
                        nativeFlowMessage: {
                            buttons: [
                                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✅ نعم صحيح', id: `akin_confirm_${userId}_yes` }) },
                                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '❌ لا، أكمل', id: `akin_confirm_${userId}_no` }) }
                            ]
                        }
                    }

                    const msg = generateWAMessageFromContent(m.chat, {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: proto.Message.InteractiveMessage.fromObject(confirmPayload)
                            }
                        }
                    }, { userJid: conn.user.jid, quoted: m })

                    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

                    game.lastGuess = guess
                    games.set(userId, game)

                } else {
                    await m.reply('❓ لم أستطع التخمين، حاول مرة أخرى بـ .مارد')
                    games.delete(userId)
                }

            } else {
                // سؤال جديد
                const questionPayload = {
                    body: { text: `🧞‍♂️ *السؤال ${aki.currentStep + 1}:*\n\n${aki.question}\n\n📊 *نسبة التقدم:* ${Math.round(progress)}%` },
                    footer: { text: `⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}` },
                    header: { hasMediaAttachment: false },
                    nativeFlowMessage: {
                        buttons: [
                            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✅ نعم', id: `akin_${game.sessionId}_0` }) },
                            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '❌ لا', id: `akin_${game.sessionId}_1` }) },
                            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '❓ لا أعرف', id: `akin_${game.sessionId}_2` }) },
                            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🤔 ربما', id: `akin_${game.sessionId}_3` }) },
                            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '😕 على الأرجح لا', id: `akin_${game.sessionId}_4` }) }
                        ]
                    }
                }

                const msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage: proto.Message.InteractiveMessage.fromObject(questionPayload)
                        }
                    }
                }, { userJid: conn.user.jid, quoted: m })

                await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
            }

        } catch (err) {
            console.error('Answer error:', err)
            await m.reply('❌ حدث خطأ، ابدأ من جديد بـ .مارد')
            games.delete(userId)
        }
        return
    }

    // ━━━ تأكيد التخمين ━━━
    if (command && command.startsWith('akin_confirm_')) {
        const parts = command.split('_')
        const confirmUserId = parts[2]
        const confirmAnswer = parts[3]

        if (confirmUserId !== userId) return

        const game = games.get(userId)
        if (!game) return

        if (confirmAnswer === 'yes') {
            await m.reply('🎉 *رائع!* سعيد بأني توقعت شخصيتك!\n\nاستخدم .مارد للعب مرة أخرى')
            games.delete(userId)
        } else {
            try {
                const aki = game.aki
                await aki.win()
                const nextGuess = aki.answers[1] || aki.answers[0]

                if (nextGuess && nextGuess.name) {
                    const imgUrl = nextGuess.absolute_picture_path || nextGuess.photo
                    let caption = `🧞‍♂️ *حسناً، جرب تخمين آخر:*\n\n✨ *${nextGuess.name}*`
                    if (nextGuess.description) caption += `\n📝 ${nextGuess.description.substring(0, 200)}`
                    caption += `\n\n🎯 *هل هذا صحيح؟*`

                    if (imgUrl) {
                        await conn.sendMessage(m.chat, { image: { url: imgUrl }, caption: caption }, { quoted: m }).catch(() => m.reply(caption))
                    } else {
                        await m.reply(caption)
                    }

                    const confirmPayload = {
                        body: { text: '🧞‍♂️ *هل هذا صحيح؟*' },
                        footer: { text: `⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}` },
                        header: { hasMediaAttachment: false },
                        nativeFlowMessage: {
                            buttons: [
                                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✅ نعم صحيح', id: `akin_confirm_${userId}_yes` }) },
                                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '❌ لا، أكمل', id: `akin_confirm_${userId}_no` }) }
                            ]
                        }
                    }

                    const msg = generateWAMessageFromContent(m.chat, {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: proto.Message.InteractiveMessage.fromObject(confirmPayload)
                            }
                        }
                    }, { userJid: conn.user.jid, quoted: m })

                    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

                } else {
                    await m.reply('❓ لم أستطع التخمين، ابدأ من جديد بـ .مارد')
                    games.delete(userId)
                }

            } catch (err) {
                console.error('Confirm error:', err)
                await m.reply('❌ حدث خطأ، ابدأ من جديد')
                games.delete(userId)
            }
        }
        return
    }
}

// ━━━ معالج الأزرار (نفس نظام الأوامر) ━━━
handler.all = async function (m) {
    if (!m.text) return false
    
    const txt = m.text.trim()
    
    // معالجة أزرار المارد
    if (txt === 'akin_start_game' || (txt && txt.startsWith('akin_'))) {
        await handler(m, { conn: this, command: txt })
        return true
    }
    
    return false
}

handler.help = ['مارد']
handler.tags = ['game']
handler.command = /^(مارد|akinator)$/i

export default handler