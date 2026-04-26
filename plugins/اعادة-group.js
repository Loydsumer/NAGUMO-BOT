let handler = async (m, { conn, text, command, usedPrefix }) => {
  // التحقق من وجود نص
  if (!text) {
    return conn.reply(
      m.chat,
      `👻 *إنتبه يا صديقي... لم تكتب النص بعد!*  
      
📜 *الاستخدام الصحيح:*  
> \`${usedPrefix + command} <النص المطلوب>\`

🎩 *مثال:*  
> \`${usedPrefix + command} هذا مثال لإعادة التوجيه\`

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`,
      m
    )
  }

  // إعادة إرسال النص وكأنه رسالة معاد توجيهها
  m.reply(`${text} 👻`, false, {
    contextInfo: {
      forwardingScore: 1000,
      isForwarded: true,
    },
  })
}

// أوامر مسموحة (عربي + إنجليزي)
handler.help = ['teruskan', 'forward', 'اعادة', 'اعادة_توجيه'].map(
  (v) => v + ' <النص>'
)
handler.tags = ['tools']

handler.command = /^(teruskan|forward|اعادة|اعادة_توجيه)$/i

handler.owner = true
handler.register = true

export default handler