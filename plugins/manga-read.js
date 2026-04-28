import axios from 'axios'
import * as cheerio from 'cheerio'
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const BASE = 'https://azoramoon.com'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
const HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
  'Accept-Language': 'ar,en;q=0.5',
  'Referer': BASE
}
const MAX_IMAGES = 50
const DELAY_MS = 1500

if (!global.mangaCache) global.mangaCache = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('::')) {
    return m.reply([
      `❌ *صيغة خاطئة*`,
      `💡 استخدم ${usedPrefix}مانجا للبحث أولاً`
    ].join('\n'))
  }

  const [slug, chapterNum] = text.trim().split('::')
  const isPDF = /^(pdf_فصل|pdf_chapter|pdfch)$/i.test(command)

  await conn.sendMessage(m.chat, { react: { text: isPDF ? '📥' : '📖', key: m.key } })

  try {
    const manga = global.mangaCache[slug] || {}
    const mangaTitle = manga.title || slug
    let images = []

    // ─── الرابط الصحيح: /series/SLUG/chapter-N ───
    const chapterUrls = []

    // لو عندنا URL من الكاش
    if (manga.chapters) {
      const cached = manga.chapters.find(c => c.number === chapterNum)
      if (cached?.url) chapterUrls.push(cached.url)
    }

    chapterUrls.push(
      `${BASE}/series/${slug}/chapter-${chapterNum}`,
      `${BASE}/series/${slug}/chapter-${chapterNum}/`,
    )

    let html = ''
    let chapterUrl = chapterUrls[0]

    for (const url of chapterUrls) {
      try {
        console.log(`[read] Trying: ${url}`)
        const resp = await axios.get(url, {
          headers: { ...HEADERS, Referer: `${BASE}/series/${slug}` },
          timeout: 25000,
          validateStatus: s => s < 400
        })
        html = resp.data
        chapterUrl = url
        console.log(`[read] ✅ Got chapter page`)
        break
      } catch {}
    }

    if (!html) {
      return m.reply([
        `❌ *لم أجد الفصل ${chapterNum}*`,
        `🔗 ${chapterUrls[0]}`
      ].join('\n'))
    }

    const $ = cheerio.load(html)

    // ══════════════════════════════════════════════
    // 🔥 طريقة 1: __NEXT_DATA__
    // ══════════════════════════════════════════════
    const nextDataRaw = $('script#__NEXT_DATA__').html()
    if (nextDataRaw) {
      try {
        const nextData = JSON.parse(nextDataRaw)
        const pageProps = nextData?.props?.pageProps || {}

        console.log(`[read] pageProps keys: ${JSON.stringify(Object.keys(pageProps))}`)

        // طباعة هيكل البيانات
        for (const [key, val] of Object.entries(pageProps)) {
          if (Array.isArray(val)) {
            console.log(`[read]   "${key}" → Array(${val.length})${val.length > 0 ? ` [first: ${typeof val[0]}]` : ''}`)
          } else if (val && typeof val === 'object') {
            console.log(`[read]   "${key}" → Object(${Object.keys(val).length}) keys: ${JSON.stringify(Object.keys(val).slice(0, 5))}`)
          }
        }

        // ─── بحث عميق عن الصور ───
        const imgArray = deepFindImagesArray(pageProps)

        if (imgArray && imgArray.length > 0) {
          images = imgArray.map(img => {
            if (typeof img === 'string') return img
            return img?.url || img?.src || img?.image || img?.path ||
              img?.imageUrl || img?.pageUrl || img?.file || ''
          }).filter(Boolean)
          console.log(`[read] ✅ __NEXT_DATA__ images: ${images.length}`)
        }

        // ─── جرب /_next/data/ ───
        if (images.length === 0 && nextData.buildId) {
          try {
            const { data: jsonData } = await axios.get(
              `${BASE}/_next/data/${nextData.buildId}/series/${slug}/chapter-${chapterNum}.json`,
              {
                headers: { ...HEADERS, Accept: 'application/json' },
                timeout: 12000,
                validateStatus: s => s < 400
              }
            )
            if (jsonData?.pageProps) {
              const imgs = deepFindImagesArray(jsonData.pageProps)
              if (imgs && imgs.length > 0) {
                images = imgs.map(img =>
                  typeof img === 'string' ? img : img?.url || img?.src || ''
                ).filter(Boolean)
                console.log(`[read] ✅ /_next/data images: ${images.length}`)
              }
            }
          } catch {}
        }

      } catch (e) {
        console.error('[read] __NEXT_DATA__ error:', e.message)
      }
    }

    // ══════════════════════════════════════════════
    // 🔥 طريقة 2: img tags في HTML
    // ══════════════════════════════════════════════
    if (images.length === 0) {
      // ─── صور القراءة ───
      const imgSelectors = [
        '.reading-content img',
        '.text-left img',
        '.entry-content img',
        '.chapter-content img',
        '.page-break img',
        'img.wp-manga-chapter-img',
        'img[data-src*="storage"]',
        'img[data-src*="manga"]',
        'img[data-src*="chapter"]',
        'img[data-src*="uploads"]',
        'img[src*="storage"]',
        'img[src*="manga"]',
        'img[src*="chapter"]',
      ]

      $(imgSelectors.join(', ')).each((i, el) => {
        const src = $(el).attr('data-src')
          || $(el).attr('data-lazy-src')
          || $(el).attr('data-original')
          || $(el).attr('src') || ''

        if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
          const cleaned = cleanImageUrl(src)
          if (cleaned && !images.includes(cleaned)) images.push(cleaned)
        }
      })
      console.log(`[read] HTML img tags: ${images.length} images`)
    }

    // ══════════════════════════════════════════════
    // 🔥 طريقة 3: البحث في الـ scripts
    // ══════════════════════════════════════════════
    if (images.length === 0) {
      $('script').each((i, el) => {
        if (images.length > 0) return false
        const content = $(el).html() || ''

        const patterns = [
          /"images"\s*:\s*(\[[\s\S]*?\])\s*[,}]/,
          /"pages"\s*:\s*(\[[\s\S]*?\])\s*[,}]/,
          /chapter_preloaded_images\s*=\s*(\[[\s\S]*?\])/,
          /chapterImages\s*[=:]\s*(\[[\s\S]*?\])/,
          /"urls"\s*:\s*(\[[\s\S]*?\])\s*[,}]/,
          /imageLinks\s*[=:]\s*(\[[\s\S]*?\])/,
          /"sources"\s*:\s*(\[[\s\S]*?\])\s*[,}]/,
        ]

        for (const pattern of patterns) {
          const match = content.match(pattern)
          if (match) {
            try {
              const parsed = JSON.parse(match[1])
              if (Array.isArray(parsed) && parsed.length > 2) {
                const extracted = parsed.map(item =>
                  typeof item === 'string' ? item : item?.url || item?.src || ''
                ).filter(Boolean).map(cleanImageUrl).filter(Boolean)

                if (extracted.length > 2) {
                  images = extracted
                  console.log(`[read] Script extraction: ${images.length} images`)
                  return false
                }
              }
            } catch {}
          }
        }
      })
    }

    // ─── تنظيف ───
    images = images.map(cleanImageUrl).filter(Boolean)
    images = [...new Set(images)]

    if (images.length === 0) {
      return m.reply([
        `❌ *لم أجد صور للفصل ${chapterNum}*`,
        `🔗 *افتح يدوياً:* ${chapterUrl}`
      ].join('\n'))
    }

    const pagesToSend = Math.min(images.length, MAX_IMAGES)

    // ══════════════════════════════════════════════
    // وضع PDF
    // ══════════════════════════════════════════════
    if (isPDF) {
      await m.reply([
        `*📥 جاري إنشاء PDF...*`,
        `> 📖 ${mangaTitle} — الفصل ${chapterNum}`,
        `> 📄 ${images.length} صفحة`
      ].join('\n'))

      try {
        const pdfBuffer = await createPDF(images, mangaTitle, chapterNum, chapterUrl)
        const sizeMB = (pdfBuffer.length / 1024 / 1024).toFixed(1)

        if (pdfBuffer.length > 95 * 1024 * 1024) {
          return m.reply(`❌ PDF كبير جداً (${sizeMB}MB)`)
        }

        await conn.sendMessage(m.chat, {
          document: pdfBuffer,
          mimetype: 'application/pdf',
          fileName: `${mangaTitle} - Ch.${chapterNum}.pdf`,
          caption: `✅ ${mangaTitle} | الفصل ${chapterNum} | ${images.length} صفحة | ${sizeMB}MB`
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      } catch (e) {
        m.reply(`❌ فشل PDF: ${e.message}`)
      }
      return
    }

    // ══════════════════════════════════════════════
    // وضع القراءة العادية
    // ══════════════════════════════════════════════
    await m.reply([
      `*📖 جاري الإرسال...*`,
      `> ${mangaTitle} — الفصل ${chapterNum}`,
      `> 📄 ${pagesToSend} صفحة | ⏳ ~${Math.ceil(pagesToSend * DELAY_MS / 1000)}ث`
    ].join('\n'))

    let sent = 0, failed = 0

    for (let i = 0; i < pagesToSend; i++) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: images[i] },
          caption: `📖 ${mangaTitle} | الفصل ${chapterNum} | ${i + 1}/${pagesToSend}`
        }, { quoted: i === 0 ? m : undefined })
        sent++
      } catch {
        failed++
        if (failed >= 5 && sent === 0) {
          m.reply(`❌ فشل.\n📥 جرب: ${usedPrefix}pdf_فصل ${slug}::${chapterNum}`)
          return
        }
      }
      if (i < pagesToSend - 1) await delay(DELAY_MS)
    }

    // ─── أزرار التنقل ───
    const navButtons = []

    navButtons.push({
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: `📥 PDF الفصل ${chapterNum}`,
        id: `${usedPrefix}pdf_فصل ${slug}::${chapterNum}`
      })
    })

    if (manga.chapters) {
      const idx = manga.chapters.findIndex(c => c.number === chapterNum)
      const next = manga.chapters[idx - 1]
      const prev = manga.chapters[idx + 1]
      if (next) navButtons.push({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: `⬅️ الفصل ${next.number}`,
          id: `${usedPrefix}اقرا ${slug}::${next.number}`
        })
      })
      if (prev) navButtons.push({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: `➡️ الفصل ${prev.number}`,
          id: `${usedPrefix}اقرا ${slug}::${prev.number}`
        })
      })
    }

    navButtons.push({
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: '📚 قائمة الفصول',
        id: `${usedPrefix}فصول ${slug}`
      })
    })

    const doneText = `✅ ${mangaTitle} | الفصل ${chapterNum} | ✅${sent}${failed ? ` ❌${failed}` : ''}`

    const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
      body: { text: doneText },
      footer: { text: '⚡ Yoru Manga' },
      header: { hasMediaAttachment: false },
      nativeFlowMessage: { buttons: navButtons, messageParamsJson: '' }
    })

    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, {
      userJid: conn.user.jid, quoted: m
    })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('[read] error:', e)
    m.reply(`❌ ${e.message}\n🔗 ${BASE}/series/${slug}/chapter-${chapterNum}`)
  }
}

// ══════════════════════════════════════════════════════════
function deepFindImagesArray(obj, depth = 0) {
  if (depth > 5 || !obj || typeof obj !== 'object') return null

  const imgKeys = [
    'images', 'pages', 'chapterImages', 'urls',
    'sources', 'pageList', 'imageList', 'pics',
    'chapterPages', 'pageImages', 'files'
  ]

  for (const key of imgKeys) {
    if (Array.isArray(obj[key]) && obj[key].length > 0) {
      const first = obj[key][0]
      if (typeof first === 'string' && (first.includes('http') || first.startsWith('/'))) return obj[key]
      if (first && typeof first === 'object' && (first.url || first.src || first.image || first.path)) return obj[key]
    }
  }

  for (const [key, val] of Object.entries(obj)) {
    if (Array.isArray(val) && val.length > 3) {
      const first = val[0]
      if (typeof first === 'string' && (
        first.includes('.jpg') || first.includes('.png') ||
        first.includes('.webp') || first.includes('storage') ||
        first.includes('manga') || first.includes('chapter')
      )) {
        console.log(`[read] Found images at key: "${key}"`)
        return val
      }
    }
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const found = deepFindImagesArray(val, depth + 1)
      if (found) return found
    }
  }

  return null
}

function cleanImageUrl(url) {
  if (!url || typeof url !== 'string') return ''
  url = url.trim()
  if (url.includes('wsrv.nl')) {
    try { url = decodeURIComponent(new URL(url).searchParams.get('url') || url) } catch {}
  }
  if (url.startsWith('//')) url = 'https:' + url
  if (url && !url.startsWith('http') && !url.startsWith('data:')) url = `${BASE}${url}`
  return url
}

async function createPDF(imageUrls, title, chapterNum, referer) {
  const { PDFDocument } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()
  pdfDoc.setTitle(`${title} - Ch.${chapterNum}`)
  let added = 0

  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const { data } = await axios.get(imageUrls[i], {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': UA, Referer: referer || BASE, Accept: 'image/*' },
        timeout: 30000
      })
      const bytes = new Uint8Array(data)
      let img = null
      if (bytes[0] === 0xFF && bytes[1] === 0xD8) img = await pdfDoc.embedJpg(bytes)
      else if (bytes[0] === 0x89 && bytes[1] === 0x50) img = await pdfDoc.embedPng(bytes)
      else { try { img = await pdfDoc.embedJpg(bytes) } catch { try { img = await pdfDoc.embedPng(bytes) } catch { continue } } }

      if (img) {
        const pg = pdfDoc.addPage([img.width, img.height])
        pg.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
        added++
      }
    } catch {}
    if (i % 5 === 4) await delay(300)
  }

  if (added === 0) throw new Error('لم تتم إضافة أي صورة')
  return Buffer.from(await pdfDoc.save())
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

handler.help = ['اقرا <slug>::<ch>', 'pdf_فصل <slug>::<ch>']
handler.tags = ['anime']
handler.command = /^(اقرا|اقرأ|read|pdf_فصل|pdf_chapter|pdfch)$/i

export default handler