import moment from 'moment-timezone'
import PhoneNum from 'awesome-phonenumber'

let regionNames = new Intl.DisplayNames(['ar'], { type: 'region' })

let handler = async (m, { conn, text, usedPrefix, command: cmd }) => {
    let num = m.quoted?.sender || m.mentionedJid?.[0] || text
    if (!num) throw `مثال: ${usedPrefix + cmd} @الاسم / 628xxx`
    num = num.replace(/\D/g, '') + '@s.whatsapp.net'
    if (!(await conn.onWhatsApp(num))[0]?.exists) throw 'هذا المستخدم غير موجود على واتساب'
    let img = await conn.profilePictureUrl(num, 'image').catch(_ => './src/avatar_contact.png')
    let bio = await conn.fetchStatus(num).catch(_ => { })
    let name = await conn.getName(num)
    let business = await conn.getBusinessProfile(num)
    let format = PhoneNum(`+${num.split('@')[0]}`)
    let country = regionNames.of(format.getRegionCode('international'))
    let message = `\t\t\t\t*▾ معلومات واتساب ▾*\n\n` +
        `*° الدولة:* ${country.toUpperCase()}\n` +
        `*° الاسم:* ${name ? name : '-'}\n` +
        `*° الرقم بصيغة دولية:* ${format.getNumber('international')}\n` +
        `*° رابط المحادثة:* wa.me/${num.split('@')[0]}\n` +
        `*° الإشارة:* @${num.split('@')[0]}\n` +
        `*° الحالة:* ${bio?.status || '-'}\n` +
        `*° تاريخ الحالة:* ${bio?.setAt ? moment(bio.setAt.toDateString()).locale('ar').format('LL') : '-'}\n\n` +
        `${business ? `\t\t\t\t*▾ معلومات العمل ▾*\n\n` +
        `*° معرف العمل:* ${business.wid}\n` +
        `*° الموقع الإلكتروني:* ${business.website ? business.website : '-'}\n` +
        `*° البريد الإلكتروني:* ${business.email ? business.email : '-'}\n` +
        `*° الفئة:* ${business.category}\n` +
        `*° العنوان:* ${business.address ? business.address : '-'}\n` +
        `*° المنطقة الزمنية:* ${business.business_hours.timezone ? business.business_hours.timezone : '-'}\n` +
        `*° الوصف:* ${business.description ? business.description : '-'}` : '*حساب واتساب عادي*'}\n\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`

    img ? await conn.sendMessage(m.chat, { image: { url: img }, caption: message, mentions: [num] }, { quoted: m }) : m.reply(message)
}

handler.help = ['wastalk', 'واتستوك']
handler.tags = ['tools', 'أدوات']
handler.command = /^(wa|whatsapp)stalk|واتستوك$/i
handler.register = true

export default handler