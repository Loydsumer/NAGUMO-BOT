import axios from 'axios'

const ELEVENLABS_API_KEY = "sk_ce4df1ada3d4e2f9e6821a4972b769f2c179abe933f977f4"

const voices = {
  male:    "pNInz6obpgDQGcFmaJgB",
  female:  "EXAVITQu4vr4xnSDxMaL",
  robotic: "ErXwobaYiN019PkySvjV"
}
const voiceNames   = { male: "ذكري 🔵", female: "أنثوي 🔴", robotic: "روبوتي 🤖" }
const dialectNames = { fusha: "الفصحى", khaliji: "الخليجية", masri: "المصرية", shami: "الشامية", english: "English" }
const dialectKeys  = ['fusha', 'khaliji', 'masri', 'shami', 'english']

// جلسات نشطة — key: chatId
// step 1 = اختيار الصوت، step 2 = اختيار اللهجة
const sessions = {}

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text?.trim()) return m.reply(
    `🗣️ *اكتب الجملة بعد الأمر*\n\nمثال:\n${usedPrefix}احكي مرحبًا كيف حالك؟`
  )

  sessions[m.chat] = { step: 1, text: text.trim(), sender: m.sender }

  await conn.sendMessage(m.chat, {
    text: [
      `🎤 *اختر نوع الصوت:*`,
      ``,
      `1️⃣  ذكري`,
      `2️⃣  أنثوي`,
      `3️⃣  روبوتي`,
      ``,
      `✏️ اكتب رقم الاختيار`,
    ].join('\n')
  }, { quoted: m })
}

handler.command = /^(احكي|voice|تكلم)$/i
handler.help    = ['احكي <نص>']
handler.tags    = ['ai']

// ━━━ مراقبة الاختيارات ━━━
handler.all = async function (m) {
  const session = sessions[m.chat]
  if (!session) return
  if (!m.text) return
  if (m.text.startsWith('.') || m.text.startsWith('/')) return

  const input = m.text.trim()

  // ━━━ الخطوة 1 — اختيار الصوت ━━━
  if (session.step === 1) {
    const voiceMap = { '1': 'male', '2': 'female', '3': 'robotic' }
    const voice = voiceMap[input]
    if (!voice) return

    session.voice = voice
    session.step  = 2

    await this.sendMessage(m.chat, {
      text: [
        `🌍 *اختر اللهجة:*`,
        `🎤 الصوت: ${voiceNames[voice]}`,
        `📜 النص: ${session.text}`,
        ``,
        `1️⃣  الفصحى`,
        `2️⃣  الخليجية`,
        `3️⃣  المصرية`,
        `4️⃣  الشامية`,
        `5️⃣  English`,
        ``,
        `✏️ اكتب رقم الاختيار`,
      ].join('\n')
    }, { quoted: m })
    return
  }

  // ━━━ الخطوة 2 — اختيار اللهجة ━━━
  if (session.step === 2) {
    const dialectMap = { '1': 'fusha', '2': 'khaliji', '3': 'masri', '4': 'shami', '5': 'english' }
    const dialect = dialectMap[input]
    if (!dialect) return

    const { text, voice } = session
    delete sessions[m.chat]

    await this.sendMessage(m.chat, {
      text: `🎧 جارٍ توليد الصوت...`
    }, { quoted: m })

    try {
      const resp = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voices[voice]}`,
        {
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.35, similarity_boost: 0.8 }
        },
        {
          headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json" },
          responseType: "arraybuffer"
        }
      )

      const audioBuffer = Buffer.from(resp.data)

      await this.sendMessage(m.chat, {
        text: [
          `✅ *تم توليد الصوت!*`,
          `🎤 النوع: ${voiceNames[voice]}`,
          `🌍 اللهجة: ${dialectNames[dialect]}`,
          `📜 النص: ${text}`,
        ].join('\n')
      }, { quoted: m })

      await this.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        fileName: "yoru_voice.mp3",
        ptt: false
      })

    } catch (e) {
      console.error("TTS Error:", e)
      delete sessions[m.chat]
      this.sendMessage(m.chat, { text: `❌ فشل توليد الصوت: ${e.message}` }, { quoted: m })
    }
  }
}

export default handler