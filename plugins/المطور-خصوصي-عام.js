let handler = async (m, { conn, command }) => {
  // تحديد إذا الأمر يساوي Public/عام أو Self/خصوصي
  let isPublic = /^(public|عام)$/i.test(command)
  let self = global.opts["self"]

  // لو البوت بالفعل في نفس الوضع
  if (self === !isPublic) {
    return m.reply(
      `👻 يا ولدي... البوت كان ${!isPublic ? "في الوضع الخصوصي" : "في الوضع العام"} منذ البداية.
لا تكرر الطلبات... العائلة لا تحب التكرار.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
    )
  }

  // تغيير الوضع فعليًا
  global.opts["self"] = !isPublic

  // تخصيص الشرح حسب الأمر
  let explanation = ''
  if (!isPublic) {
    explanation = `👻 الآن دخل البوت الوضع *الخصوصي*...
لن يستجيب إلا لك وحدك، مثل أسرار العائلة.
مثال: اكتب *خصوصي* أو *self* ليبقى البوت معك وحدك.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
  } else {
    explanation = `👻 الآن أصبح البوت في الوضع *العام*...
أي شخص في العائلة يمكنه التحدث معه.
مثال: اكتب *عام* أو *public* ليكون متاحاً للجميع.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
  }

  m.reply(explanation)
}

handler.help = ["self", "خصوصي", "public", "عام"]
handler.tags = ["owner"]
handler.command = /^(self|خصوصي|public|عام)$/i
handler.owner = true

export default handler