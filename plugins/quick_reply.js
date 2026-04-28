// plugins/buttons.js

import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, command, usedPrefix }) => {

    const botName = global.botName || '⧼ 𝑷𝑹𝑶𝑻𝑶𝑻𝒀𝑷𝑬 ⧽'
    const ownerNumber = global.owner[0] || '201002435496'
    const channelUrl = 'https://whatsapp.com/channel/0029VbCJtCILI8YQz9VFQQ2w'
    const channelId = '120363408060822145@newsletter'

    let type = (args[0] || '').toLowerCase()

    if (!type) {
        return m.reply(`╔═══「 ⚡ ${botName} ⚡ 」═══╗
║
║  📖 *أوامر الأزرار:*
║
║  • ${usedPrefix}ازرار quick
║    ↳ ردود سريعة
║
║  • ${usedPrefix}ازرار list
║    ↳ قائمة اختيار
║
║  • ${usedPrefix}ازرار mixed
║    ↳ رابط + اتصال + نسخ
║
║  • ${usedPrefix}ازرار channel
║    ↳ عرض القناة
║
║  • ${usedPrefix}ازرار all
║    ↳ كل الأنواع مع بعض
║
╚═══════════════════════════╝`)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  🔘 النوع 1: ردود سريعة (Quick Reply)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (type === 'quick') {
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `⚡ *أزرار الردود السريعة*\n\nاضغط على أي زر للرد السريع 👇`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: `⚡ ${botName} | ༺youssf༻`
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: `⚡ ${botName}`,
                            subtitle: 'Quick Reply Buttons',
                            hasMediaAttachment: false
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📋 القائمة',
                                        id: `${usedPrefix}menu`
                                    })
                                },
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📱 بروفايلي',
                                        id: `${usedPrefix}بروفايل`
                                    })
                                },
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '⚡ سرعة البوت',
                                        id: `${usedPrefix}ping`
                                    })
                                }
                            ]
                        })
                    })
                }
            }
        }, { userJid: conn.user.jid })

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  📋 النوع 2: قائمة اختيار (List / Single Select)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else if (type === 'list') {
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `⚡ *قائمة الأوامر*\n\nاختر من القائمة التالية 👇`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: `⚡ ${botName} | ༺youssf༻`
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: `⚡ ${botName}`,
                            subtitle: 'List Menu',
                            hasMediaAttachment: false
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: '📋 افتح القائمة',
                                        sections: [
                                            {
                                                title: '⚡ الأوامر الأساسية',
                                                highlight_label: '🔥 مهم',
                                                rows: [
                                                    {
                                                        header: '📋 القائمة الرئيسية',
                                                        title: 'عرض كل الأوامر',
                                                        description: 'اضغط لعرض قائمة أوامر البوت',
                                                        id: `${usedPrefix}menu`
                                                    },
                                                    {
                                                        header: '📱 البروفايل',
                                                        title: 'عرض بروفايلك',
                                                        description: 'اضغط لعرض معلومات حسابك',
                                                        id: `${usedPrefix}بروفايل`
                                                    },
                                                    {
                                                        header: '⚡ السرعة',
                                                        title: 'فحص سرعة البوت',
                                                        description: 'اضغط لمعرفة سرعة استجابة البوت',
                                                        id: `${usedPrefix}ping`
                                                    }
                                                ]
                                            },
                                            {
                                                title: '🎮 الألعاب والترفيه',
                                                rows: [
                                                    {
                                                        header: '🎰 الحظ',
                                                        title: 'جرب حظك',
                                                        description: 'العب واكسب كوينز',
                                                        id: `${usedPrefix}slot`
                                                    },
                                                    {
                                                        header: '🎲 النرد',
                                                        title: 'ارمي النرد',
                                                        description: 'لعبة النرد العشوائية',
                                                        id: `${usedPrefix}dice`
                                                    }
                                                ]
                                            },
                                            {
                                                title: '🛠️ أدوات',
                                                rows: [
                                                    {
                                                        header: '🖼️ ستيكر',
                                                        title: 'تحويل لستيكر',
                                                        description: 'أرسل صورة مع الأمر',
                                                        id: `${usedPrefix}sticker`
                                                    },
                                                    {
                                                        header: '📥 تحميل',
                                                        title: 'تحميل فيديو',
                                                        description: 'أرسل رابط مع الأمر',
                                                        id: `${usedPrefix}play`
                                                    }
                                                ]
                                            }
                                        ]
                                    })
                                }
                            ]
                        })
                    })
                }
            }
        }, { userJid: conn.user.jid })

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  🔗 النوع 3: رابط + اتصال + نسخ (Mixed)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else if (type === 'mixed') {
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `⚡ *أزرار متنوعة*\n\n🔗 رابط القناة\n📞 اتصال بالمطور\n📋 نسخ رقم المطور`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: `⚡ ${botName} | ༺youssf༻`
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: `⚡ ${botName}`,
                            subtitle: 'Mixed Buttons',
                            hasMediaAttachment: false
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    name: 'cta_url',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📢 القناة الرسمية',
                                        url: channelUrl,
                                        merchant_url: channelUrl
                                    })
                                },
                                {
                                    name: 'cta_call',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📞 اتصل بالمطور',
                                        phone_number: ownerNumber
                                    })
                                },
                                {
                                    name: 'cta_copy',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📋 نسخ رقم المطور',
                                        copy_code: ownerNumber
                                    })
                                }
                            ]
                        })
                    })
                }
            }
        }, { userJid: conn.user.jid })

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  📢 النوع 4: عرض القناة (Channel)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else if (type === 'channel') {
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `📢 *القناة الرسمية*\n\n⧼ 𝑷𝑹𝑶𝑻𝑶𝑻𝒀𝑷𝑬 ⧽\n╳ 𝗕𝗢𝗧𝗦 • 𝗟𝗔𝗕\n\nانضم للقناة لمتابعة التحديثات والأخبار 🔔`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: `⚡ ${botName} | ༺youssf༻`
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: '📢 ⧼ 𝑷𝑹𝑶𝑻𝑶𝑻𝒀𝑷𝑬 ⧽',
                            subtitle: '𝗕𝗢𝗧𝗦 • 𝗟𝗔𝗕',
                            hasMediaAttachment: false
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    name: 'cta_url',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📢 انضم للقناة',
                                        url: channelUrl,
                                        merchant_url: channelUrl
                                    })
                                },
                                {
                                    name: 'cta_copy',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📋 نسخ رابط القناة',
                                        copy_code: channelUrl
                                    })
                                },
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📊 معلومات القناة',
                                        id: `${usedPrefix}channelinfo`
                                    })
                                }
                            ]
                        })
                    })
                }
            }
        }, { userJid: conn.user.jid })

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  🌟 النوع 5: كل الأنواع (All)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else if (type === 'all') {
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `🌟 *كل أنواع الأزرار*\n\n⚡ ${botName}\n\n🔘 ردود سريعة\n📋 قائمة اختيار\n🔗 رابط القناة\n📞 اتصال بالمطور\n📋 نسخ النص`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: `⚡ ${botName} | ༺youssf༻`
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: `🌟 ${botName}`,
                            subtitle: 'All Button Types',
                            hasMediaAttachment: false
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                // 🔘 ردود سريعة
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📋 القائمة الرئيسية',
                                        id: `${usedPrefix}menu`
                                    })
                                },
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📱 بروفايلي',
                                        id: `${usedPrefix}بروفايل`
                                    })
                                },

                                // 📋 قائمة اختيار
                                {
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: '📋 افتح القائمة',
                                        sections: [
                                            {
                                                title: '⚡ أوامر أساسية',
                                                highlight_label: '🔥 الأكثر استخداماً',
                                                rows: [
                                                    {
                                                        header: '📋 القائمة',
                                                        title: 'كل الأوامر',
                                                        description: 'عرض جميع أوامر البوت',
                                                        id: `${usedPrefix}menu`
                                                    },
                                                    {
                                                        header: '⚡ السرعة',
                                                        title: 'سرعة البوت',
                                                        description: 'فحص سرعة الاستجابة',
                                                        id: `${usedPrefix}ping`
                                                    },
                                                    {
                                                        header: '🖼️ ستيكر',
                                                        title: 'تحويل لستيكر',
                                                        description: 'أرسل صورة لتحويلها',
                                                        id: `${usedPrefix}sticker`
                                                    }
                                                ]
                                            },
                                            {
                                                title: '🎮 ألعاب',
                                                rows: [
                                                    {
                                                        header: '🎰 السلوت',
                                                        title: 'لعبة الحظ',
                                                        description: 'جرب حظك واكسب كوينز',
                                                        id: `${usedPrefix}slot`
                                                    },
                                                    {
                                                        header: '🎲 النرد',
                                                        title: 'ارمي النرد',
                                                        description: 'لعبة النرد',
                                                        id: `${usedPrefix}dice`
                                                    }
                                                ]
                                            }
                                        ]
                                    })
                                },

                                // 🔗 رابط
                                {
                                    name: 'cta_url',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📢 القناة الرسمية',
                                        url: channelUrl,
                                        merchant_url: channelUrl
                                    })
                                },

                                // 📞 اتصال
                                {
                                    name: 'cta_call',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📞 اتصل بالمطور',
                                        phone_number: ownerNumber
                                    })
                                },

                                // 📋 نسخ
                                {
                                    name: 'cta_copy',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📋 نسخ رقم المطور',
                                        copy_code: ownerNumber
                                    })
                                }
                            ]
                        })
                    })
                }
            }
        }, { userJid: conn.user.jid })

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }

    // ━━━ نوع غير معروف ━━━
    else {
        return m.reply(`❌ نوع غير معروف: *${type}*\n\nالأنواع المتاحة:\n• quick\n• list\n• mixed\n• channel\n• all\n\nمثال: ${usedPrefix}ازرار all`)
    }

    // ⚡ ريأكشن
    conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })
}

handler.help = ['ازرار <نوع>']
handler.tags = ['tools']
handler.command = /^(ازرار|أزرار|buttons|btn)$/i

handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.premium = false
handler.owner = false
handler.fail = null
handler.exp = 10

export default handler