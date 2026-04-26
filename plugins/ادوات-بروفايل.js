import { canLevelUp, xpRange } from '../lib/levelling.js';
import { createHash } from 'crypto';
import PhoneNumber from 'awesome-phonenumber';
import fetch from 'node-fetch';
import axios from 'axios';

function isPremium(userId) {
  return global.prems.includes(userId.split`@`[0]);
}

let handler = async (m, { conn }) => {
  if (!m.isGroup) return; 

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let bio = await conn.fetchStatus(who).catch(_ => 'undefined');
  let user = global.db.data.users[who];
  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://i.ibb.co/0nMY9Y0/file.jpg');
  let { exp, limit, level, role, name, registered, age } = user;
  let { min, xp, max } = xpRange(level, global.multiplier);
  let prem = isPremium(who);
  let sn = createHash('md5').update(who).digest('hex');
  let api = await axios.get(`https://delirius-apiofc.vercel.app/tools/country?text=${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}`);
  let userNationalityData = api.data.result;
  let userNationality = userNationalityData ? `${userNationalityData.name} ${userNationalityData.emoji}` : 'Desconocido';
  let img = await (await fetch(pp)).buffer();

  let { level: userLevel, exp: userExp } = user;
  let { min: minExp, xp: xpMax } = xpRange(userLevel, global.multiplier);
  let xpToLevelUp = xpMax - userExp;

  let d = new Date(new Date + 3600000);
  let locale = 'ar';
  let week = d.toLocaleDateString(locale, { weekday: 'long' });
  let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });

  let _uptime = process.uptime() * 1000;
  let _muptime;
  if (process.send) {
    process.send('uptime');
    _muptime = await new Promise(resolve => {
        process.once('message', resolve);
        setTimeout(resolve, 1000);
    }) * 1000;
  }

  let muptime = clockString(_muptime);
  let uptime = clockString(_uptime);
  let totalreg = Object.keys(global.db.data.users).length;
  let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length;

  let txt = ` *『 بروفايل المستخدم 』*\n\n`;
  txt += `◦ *الاسم* : ${name}\n`;
  txt += `◦ *العمر* : ${registered ? `${age} سنة` : '×'}\n`;
  txt += `◦ *الرقم* : ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}\n`;
  txt += `◦ *الجنسية* : ${userNationality}\n`;
  txt += `◦ *الرابط* : wa.me/${who.split`@`[0]}\n`;
  txt += `◦ *المستوى* : ${userLevel}\n`;
  txt += `◦ *XP الإجمالي* : ${userExp} (${userExp - minExp}/${xpMax})\n`;
  txt += `◦ *XP للترقية* : ${xpToLevelUp}\n`;
  txt += `◦ *بريميوم* : ${prem ? 'نعم' : 'لا'}\n`;
  txt += `◦ *مسجل* : ${registered ? 'نعم' : 'لا'}\n`;
  txt += `◦ *الحد اليومي* : ${limit}\n`;
  txt += `◦ *اليوم* : ${week}\n`;
  txt += `◦ *التاريخ الميلادي* : ${date}\n`;
  txt += `◦ *التاريخ الإسلامي* : ${dateIslamic}\n`;
  txt += `◦ *الوقت* : ${time}\n`;
  txt += `◦ *وقت تشغيل البوت* : ${uptime}\n`;
  txt += `◦ *وقت تشغيل الخادم* : ${muptime}\n`;
  txt += `◦ *عدد المستخدمين المسجلين* : ${rtotalreg} / ${totalreg}\n`;
  txt += `◦ *المستوى الحالي* : ${role}\n`;
  txt += `◦ *XP المتبقي للترقية* : ${xpMax - userExp}\n`;

  await conn.sendMessage(m.chat, {
    image: img,
    caption: txt,
    footer: '🅜🅘🅝🅐🅣🅞 🅑🅞V2🧞‍♀️',
    buttons: [
      { buttonId: `.الاوامر`, buttonText: { displayText: '❤️' } },
      { buttonId: `.menu`, buttonText: { displayText: '💓' } }
    ],
    viewOnce: true,
    headerType: 4,
  }, { quoted: m });
};

handler.help = ['بروفايل', 'برفايلي', 'perfil', 'profile', 'برفايل', 'برافايل', 'بروفايل *@user*'];
handler.tags = ['start'];
handler.command = /^(بروفايل|برفايلي|perfil|profile|برفايل|برافايل)$/i;
handler.register = true;

export default handler;

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}