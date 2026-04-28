// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  📌 أمر بحث صور بنترست - كاروسيل
//  🤖 𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch"
import {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} from "@whiskeysockets/baileys"

let handler = async (m, { conn, text, usedPrefix, command }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = global.botName || '𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊'

  if (!text) {
    react('❌')
    return m.reply(
      '╔═══════════════════════════════╗\n' +
      '║     📌 بحث بنترست 📌     ║\n' +
      '╚═══════════════════════════════╝\n\n' +
      '⚡ الاستخدام:\n' +
      usedPrefix + command + ' <كلمة البحث>\n\n' +
      '⚡ أمثلة:\n' +
      usedPrefix + command + ' anime\n' +
      usedPrefix + command + ' wallpaper\n' +
      usedPrefix + command + ' naruto\n\n' +
      '> ⚡ ' + botName + ' ⚡'
    )
  }

  react('⏳')
  await m.reply('🔍 جاري البحث عن الصور...')

  try {
    const images = await searchPinterest(text)

    if (!images || images.length === 0) {
      react('❌')
      return m.reply('❌ ما لقيت صور لـ *' + text + '*\n\n💡 جرب بالإنجليزي')
    }

    console.log('✅ Found', images.length, 'images for:', text)

    // ─── تجهيز الكاروسيل ────────────────
    let cards = []
    let counter = 1

    for (let imageUrl of images.slice(0, 10)) {
      try {
        const imgRes = await fetch(imageUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36' }
        })

        if (!imgRes.ok) continue

        const buffer = Buffer.from(await imgRes.arrayBuffer())
        if (buffer.length < 1000) continue

        const { imageMessage } = await generateWAMessageContent(
          { image: buffer },
          { upload: conn.waUploadToServer }
        )

        if (!imageMessage) continue

        cards.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: '🔎 *نتيجة البحث عن:* ' + text + '\n📸 𝐏𝐇𝐎𝐓𝐎 ' + counter
          }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            hasMediaAttachment: true,
            imageMessage: imageMessage
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [{
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "📌 فتح في Pinterest",
                url: 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(text)
              })
            }]
          })
        })

        counter++
      } catch {
        continue
      }
    }

    if (cards.length === 0) {
      react('❌')
      return m.reply('❌ فشل تجهيز الصور')
    }

    // ─── إرسال الكاروسيل ────────────────
    const finalMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: '> 🔍 نتائج: ' + text + ' (' + cards.length + ' صورة)\n> ⚡ ' + botName + ' ⚡'
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: cards
            })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, finalMessage.message, { messageId: finalMessage.key.id })
    react('✅')

  } catch (e) {
    console.error('❌ Pinterest Error:', e)
    react('❌')
    m.reply('❌ خطأ: ' + e.message)
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🔍 بحث بنترست - جلب cookies جديدة كل مرة
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function searchPinterest(query) {

  // ─── خطوة 1: جلب cookies و CSRF جديدة ──
  try {
    console.log('🔑 Getting fresh Pinterest session...')

    const sessionRes = await fetch('https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(query), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html'
      },
      redirect: 'follow'
    })

    // استخراج cookies من الرد
    const setCookies = sessionRes.headers.raw()['set-cookie'] || []
    let csrfToken = ''
    let cookieStr = ''

    for (const cookie of setCookies) {
      const parts = cookie.split(';')[0]
      cookieStr += parts + '; '

      if (parts.startsWith('csrftoken=')) {
        csrfToken = parts.split('=')[1]
      }
    }

    console.log('🔑 CSRF:', csrfToken ? csrfToken.substring(0, 10) + '...' : 'none')
    console.log('🍪 Cookies:', cookieStr ? 'OK' : 'none')

    // ─── أيضاً استخراج صور من HTML ──────
    if (sessionRes.ok) {
      const html = await sessionRes.text()

      // محاولة استخراج البيانات من JSON المدمج في الصفحة
      const jsonMatch = html.match(/{"resource_response":.+?"results":\[.+?\]/)
      if (jsonMatch) {
        try {
          // ابحث عن الصور في الـ HTML
          const imgPattern = /https:\/\/i\.pinimg\.com\/(?:originals|736x|564x)\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]+\.(?:jpg|png|jpeg)/gi
          const matches = html.match(imgPattern)
          if (matches && matches.length > 3) {
            const unique = [...new Set(matches)]
            console.log('✅ HTML extract:', unique.length)
            return unique
          }
        } catch {}
      }

      // ─── خطوة 2: POST بالـ cookies الجديدة ──
      if (csrfToken && cookieStr) {
        console.log('🔍 Pinterest POST with fresh cookies...')

        const dataObj = {
          options: {
            query: query,
            scope: "pins",
            page_size: 25,
            rs: "typed",
            redux_normalize_feed: true
          },
          context: {}
        }

        const sourceUrl = '/search/pins/?q=' + encodeURIComponent(query) + '&rs=typed'

        const body = 'source_url=' + encodeURIComponent(sourceUrl) +
          '&data=' + encodeURIComponent(JSON.stringify(dataObj))

        const apiRes = await fetch('https://www.pinterest.com/resource/BaseSearchResource/get/', {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
            'Accept': 'application/json, text/javascript, */*',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken,
            'X-Pinterest-Source-Url': sourceUrl,
            'X-Pinterest-AppState': 'active',
            'Origin': 'https://www.pinterest.com',
            'Referer': 'https://www.pinterest.com' + sourceUrl,
            'Cookie': cookieStr
          },
          body: body
        })

        console.log('📡 POST Status:', apiRes.status)

        if (apiRes.ok) {
          const data = await apiRes.json()
          const results = data?.resource_response?.data?.results

          if (results && results.length > 0) {
            const imgs = results
              .map(pin => {
                if (pin.images?.orig?.url) return pin.images.orig.url
                if (pin.images?.['736x']?.url) return pin.images['736x'].url
                if (pin.images?.['564x']?.url) return pin.images['564x'].url
                return null
              })
              .filter(Boolean)

            if (imgs.length > 0) {
              console.log('✅ Pinterest POST:', imgs.length, 'images')
              return imgs
            }
          }
        }
      }

      // ─── استخراج من HTML مباشرة ────────
      const allImages = []
      const patterns = [
        /https:\/\/i\.pinimg\.com\/originals\/[^\s"'\\><]+\.(?:jpg|png|jpeg)/gi,
        /https:\/\/i\.pinimg\.com\/736x\/[^\s"'\\><]+\.(?:jpg|png|jpeg)/gi,
        /https:\/\/i\.pinimg\.com\/564x\/[^\s"'\\><]+\.(?:jpg|png|jpeg)/gi
      ]

      for (const pattern of patterns) {
        const matches = html.match(pattern)
        if (matches) allImages.push(...matches)
      }

      if (allImages.length > 0) {
        const unique = [...new Set(allImages)]
        console.log('✅ HTML fallback:', unique.length)
        return unique
      }
    }
  } catch (e) {
    console.log('❌ Pinterest session:', e.message)
  }

  // ─── بديل: Unsplash ──────────────────
  try {
    console.log('🔍 Trying Unsplash...')
    const res = await fetch(
      'https://unsplash.com/napi/search/photos?query=' + encodeURIComponent(query) + '&per_page=15',
      { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }
    )

    if (res.ok) {
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        const imgs = data.results
          .map(photo => photo.urls?.regular || photo.urls?.small)
          .filter(Boolean)
        if (imgs.length > 0) {
          console.log('✅ Unsplash:', imgs.length)
          return imgs
        }
      }
    }
  } catch (e) {
    console.log('❌ Unsplash:', e.message)
  }

  // ─── بديل: Pixabay ───────────────────
  try {
    console.log('🔍 Trying Pixabay...')
    const res = await fetch(
      'https://pixabay.com/api/?key=46488553-0b3cf67e62b8a0caf11764aa5&q=' + encodeURIComponent(query) + '&per_page=15&image_type=photo',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )

    if (res.ok) {
      const data = await res.json()
      if (data.hits && data.hits.length > 0) {
        const imgs = data.hits.map(img => img.largeImageURL || img.webformatURL).filter(Boolean)
        if (imgs.length > 0) {
          console.log('✅ Pixabay:', imgs.length)
          return imgs
        }
      }
    }
  } catch (e) {
    console.log('❌ Pixabay:', e.message)
  }

  return null
}

handler.help = ['بنترست <بحث>']
handler.tags = ['downloader']
handler.command = /^(بنترست|بينترست|بينتر|pin|pinterest)$/i

export default handler