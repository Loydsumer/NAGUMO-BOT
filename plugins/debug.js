import * as baileys from '@whiskeysockets/baileys'
const { proto, generateWAMessageFromContent } = baileys

let handler = async (m, { conn }) => {
  const jid = m.chat

  try {
    // ═══ Step 1: Check proto support ═══
    console.log('═══════ PROTO CHECK ═══════')
    console.log('InteractiveMessage:', !!proto.Message.InteractiveMessage)
    console.log('FutureProofMessage:', !!proto.Message.FutureProofMessage)
    console.log('NativeFlowMessage:', !!proto.Message.InteractiveMessage?.NativeFlowMessage)

    const allKeys = Object.keys(proto.Message.fields || {})
    console.log('viewOnce fields:', allKeys.filter(k => k.toLowerCase().includes('viewonce')))
    console.log('interactive fields:', allKeys.filter(k => k.toLowerCase().includes('interactive')))
    console.log('button fields:', allKeys.filter(k => k.toLowerCase().includes('button')))

    // ═══ Step 2: Create message ═══
    console.log('═══════ CREATE MESSAGE ═══════')

    const interactiveMsg = {
      body: { text: 'Test buttons' },
      footer: { text: 'Footer' },
      nativeFlowMessage: {
        buttons: [{
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({ display_text: 'Test', id: 'test_1' })
        }],
        messageParamsJson: ''
      }
    }

    const fullMessage = proto.Message.fromObject({
      viewOnceMessage: {
        message: {
          interactiveMessage: interactiveMsg
        }
      }
    })

    console.log('viewOnceMessage:', !!fullMessage.viewOnceMessage)
    console.log('viewOnceMessage.message:', !!fullMessage.viewOnceMessage?.message)
    console.log('interactiveMessage:', !!fullMessage.viewOnceMessage?.message?.interactiveMessage)
    console.log('body:', fullMessage.viewOnceMessage?.message?.interactiveMessage?.body?.text)
    console.log('buttons:', fullMessage.viewOnceMessage?.message?.interactiveMessage?.nativeFlowMessage?.buttons?.length)

    // ═══ Step 3: Encode & Decode test ═══
    console.log('═══════ ENCODE TEST ═══════')
    const encoded = proto.Message.encode(fullMessage).finish()
    console.log('Encoded bytes:', encoded.length)

    const decoded = proto.Message.decode(encoded)
    console.log('Decoded viewOnce:', !!decoded.viewOnceMessage)
    console.log('Decoded interactive:', !!decoded.viewOnceMessage?.message?.interactiveMessage)
    console.log('Decoded body:', decoded.viewOnceMessage?.message?.interactiveMessage?.body?.text)
    console.log('Decoded buttons:', decoded.viewOnceMessage?.message?.interactiveMessage?.nativeFlowMessage?.buttons?.length)

    // ═══ Step 4: Try sending ═══
    console.log('═══════ SENDING ═══════')

    const msg = generateWAMessageFromContent(jid, fullMessage, {
      userJid: conn.user.jid,
      quoted: m
    })

    console.log('msg.key.id:', msg.key.id)
    console.log('msg.message keys:', Object.keys(msg.message || {}))

    const innerMsg = msg.message?.viewOnceMessage?.message
    console.log('inner keys:', Object.keys(innerMsg || {}))
    console.log('has interactive:', !!innerMsg?.interactiveMessage)

    await conn.relayMessage(jid, msg.message, { messageId: msg.key.id })
    console.log('═══════ DONE ═══════')

    await m.reply('✅ شوف الـ Terminal')

  } catch (e) {
    console.error('DEBUG ERROR:', e)
    await m.reply('❌ Error: ' + e.message + '\n' + e.stack)
  }
}

handler.command = /^(debugbtn|تصحيح)$/i
handler.tags = ['owner']
handler.rowner = true
export default handler