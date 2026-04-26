const STRIKE_CONFIG = {
    damageRange: [1000, 5000],
    criticalMultiplier: 10,
    cooldown: 300000,
    strikeTypes: [
        'PLASMA', 'ION', 'QUANTUM',
        'NEUTRON', 'ANTIMATTER', 'GRAogamiN'
    ]
};

const handler = async (m, { conn, usedPrefix, command }) => {
    let users = global.db.data.users;
    let sender = m.sender;

    // تحديد الهدف
    let who = m.mentionedJid && m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted ? m.quoted.sender : '';
    if (!who) {
        return m.reply(
            `👻 يا صديقي... يجب أن تشير إلى هدفك بوضوح.\n` +
            `مثال: ${usedPrefix}${command} @الهدف\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
        );
    }
    if (!(who in users)) return m.reply(`👻 هذا الاسم غير موجود في دفاتر العائلة...\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`);
    if (who === sender) return m.reply(`👻 رجل حكيم لا يوجه السلاح إلى نفسه...\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`);

    // التبريد (Cooldown)
    let __timers = (new Date - (users[sender]?.lastorbital || 0));
    let _timers = (STRIKE_CONFIG.cooldown - __timers);
    let timers = clockString(_timers);
    if (__timers < STRIKE_CONFIG.cooldown) {
        return m.reply(`👻 المدافع بحاجة لإعادة الشحن...\nانتظر ${timers} أخرى.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`);
    }

    const target = users[who];
    const isCritical = Math.random() < 0.3;

    try {
        await conn.sendPresenceUpdate('composing', m.chat);

        // رسالة البداية
        const lockMsg = await conn.reply(m.chat,
            `👻 🎯 الهدف تحت المراقبة...\nجارٍ الفحص @${who.split('@')[0]}...\n[===== 50%]\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`,
            m, { mentions: [who] }
        );

        // شحن
        await new Promise(resolve => setTimeout(resolve, 2000));
        await conn.relayMessage(m.chat, {
            protocolMessage: {
                key: lockMsg.key,
                type: 14,
                editedMessage: {
                    conversation: `👻 ⚡ شحن السلاح...\nالنوع: ${pickRandom(STRIKE_CONFIG.strikeTypes)}\n[======= 80%]\n\n🅥🅘🅣🅞 🅑🅣 👻`
                }
            }
        }, {});

        // الضربة
        await new Promise(resolve => setTimeout(resolve, 2000));
        const damage = calculateDamage(isCritical);
        const strikeType = pickRandom(STRIKE_CONFIG.strikeTypes);

        await conn.relayMessage(m.chat, {
            protocolMessage: {
                key: lockMsg.key,
                type: 14,
                editedMessage: {
                    conversation: `👻 ☄️ الضربة وشيكة...\nالسلاح: ${strikeType}\nالضرر: ${damage.toLocaleString()}${isCritical ? ' (حرجة!)' : ''}\n\n🅥🅘🅣🅞 🅑🅣 👻`
                }
            }
        }, {});

        // تحديث حياة الهدف
        target.health = (target.health || 100) - damage;
        if (target.health < 0) target.health = 0;
        if (!users[sender]) users[sender] = {};
        users[sender].lastorbital = new Date * 1;

        // رسالة النتيجة
        await conn.sendMessage(m.chat, {
            text: `👻 💥 الهدف ضُرب بقوة.\n` +
                  `الضحية: @${who.split('@')[0]}\n` +
                  `الضرر: ${damage.toLocaleString()}${isCritical ? ' 👻 ضربة حاسمة!' : ''}\n` +
                  `السلاح: ${strikeType} CANNON\n` +
                  `❤️ حياة الهدف: ${target.health}/${target.maxhealth || 100}\n\n🅥🅘🅣🅞 🅑🅣 👻`,
            mentions: [who]
        }, { quoted: m });

    } catch (error) {
        console.error('Error:', error);
        conn.reply(m.chat, `👻 فشل التنفيذ...\nالخطأ: ${error.message}\n\n🅥🅘🅣🅞 🅑🅣 👻`, m);
    }
};

function calculateDamage(isCritical) {
    const [min, max] = STRIKE_CONFIG.damageRange;
    const baseDamage = Math.floor(Math.random() * (max - min + 1)) + min;
    return isCritical ? baseDamage * STRIKE_CONFIG.criticalMultiplier : baseDamage;
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

// أوامر المساعدة
handler.help = ['orbitalstrike', 'orbitalnuke', 'os', 'ضربه', 'ضربة', 'قصف'];
handler.tags = ['rpg', 'owner']; // ← أضفت owner بجانب rpg
handler.command = /^(orbital(strike|nuke)|os|ضربه|ضربة|قصف)$/i;
handler.group = true;
handler.rpg = true;

export default handler;