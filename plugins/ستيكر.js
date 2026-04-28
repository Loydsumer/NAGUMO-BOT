import { downloadContentFromMessage } from "@whiskeysockets/baileys"
import { sticker } from "../lib/sticker.js"
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'

// استخدام ffmpeg الثابت لو موجود
if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tmpDir = path.join(__dirname, '../tmp')

// تأكد من وجود مجلد tmp
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true })
}

// دالة لتحويل الفيديو لستيكر متحرك
async function videoToAnimatedSticker(videoBuffer, packName, authorName, videoDuration) {
    const inputPath = path.join(tmpDir, `video_${Date.now()}.mp4`)
    const outputPath = path.join(tmpDir, `sticker_${Date.now()}.webp`)
    
    try {
        // حفظ الفيديو المؤقت
        fs.writeFileSync(inputPath, videoBuffer)
        
        // تحديد المدة القصوى - لو الفيديو 10 ثواني بالضبط نخليها 9.8
        let maxDuration = videoDuration
        if (videoDuration >= 9.95 && videoDuration <= 10.05) {
            maxDuration = 9.8  // تعديل للفيديوهات 10 ثواني بالضبط
            console.log(`⚠️ فيديو ${videoDuration} ثانية، تم التعديل إلى ${maxDuration} ثانية`)
        } else {
            maxDuration = Math.min(videoDuration, 10) // حد أقصى 10 ثواني
        }
        
        // استخدام ffmpeg لتحويل الفيديو لـ webp متحرك
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoFilters([
                    // تغيير الحجم مع الحفاظ على النسبة
                    'scale=512:512:force_original_aspect_ratio=increase',
                    'crop=512:512',
                    // تحسين الجودة للستيكر المتحرك
                    'fps=15',
                    'setpts=PTS'
                ])
                .outputOptions([
                    '-vcodec', 'libwebp',
                    '-lossless', '0',
                    '-compression_level', '6',
                    '-q:v', '60',  // جودة متوسطة
                    '-loop', '0',   // تكرار لا نهائي
                    '-preset', 'default',
                    '-vsync', '0',  // الحفاظ على الإطارات
                    '-an'           // إزالة الصوت
                ])
                .duration(maxDuration)  // استخدام المدة المعدلة
                .on('start', (cmd) => {
                    console.log('FFmpeg started')
                })
                .on('end', () => {
                    console.log('FFmpeg finished')
                    resolve()
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err)
                    reject(err)
                })
                .save(outputPath)
        })
        
        // التحقق من وجود الملف
        if (!fs.existsSync(outputPath)) {
            throw new Error('فشل إنشاء الستيكر')
        }
        
        // قراءة الستيكر
        const stickerBuffer = fs.readFileSync(outputPath)
        
        // التحقق من أن الملف ليس فارغاً
        if (stickerBuffer.length < 100) {
            throw new Error('الستيكر الناتج فارغ')
        }
        
        // تنظيف الملفات المؤقتة
        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)
        
        return stickerBuffer
        
    } catch (err) {
        // تنظيف لو حصل خطأ
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
        throw err
    }
}

// دالة بديلة باستخدام wa-sticker-formatter لو موجودة
async function videoToStickerAlternative(videoBuffer, packName, authorName) {
    try {
        // محاولة استخدام wa-sticker-formatter إذا كانت موجودة
        const { Sticker } = await import('wa-sticker-formatter')
        
        const sticker = new Sticker(videoBuffer, {
            pack: packName,
            author: authorName,
            type: 'crop',
            categories: ['🎉'],
            quality: 50,
            background: '#FFFFFF'
        })
        
        return await sticker.toBuffer()
    } catch (err) {
        console.log('wa-sticker-formatter غير متاح')
        throw err
    }
}

let handler = async (m, { conn, args }) => {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }) } catch {}
    }

    // ━━━ ابحث عن الميديا ━━━
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
    let mediaMsg  = null
    let mediaType = null

    if (m.message?.imageMessage) {
        mediaMsg  = m.message.imageMessage
        mediaType = 'image'
    } else if (m.message?.videoMessage) {
        mediaMsg  = m.message.videoMessage
        mediaType = 'video'
    } else if (m.message?.stickerMessage) {
        mediaMsg  = m.message.stickerMessage
        mediaType = 'sticker'
    } else if (quoted?.imageMessage) {
        mediaMsg  = quoted.imageMessage
        mediaType = 'image'
    } else if (quoted?.videoMessage) {
        mediaMsg  = quoted.videoMessage
        mediaType = 'video'
    } else if (quoted?.stickerMessage) {
        mediaMsg  = quoted.stickerMessage
        mediaType = 'sticker'
    }

    if (!mediaMsg) {
        await react("❌")
        return m.reply("❌ رد على صورة أو فيديو")
    }

    await react("⏳")

    try {
        // ━━━ تحميل الميديا مباشرة للذاكرة ━━━
        let dlType = mediaType === 'sticker' ? 'image' : mediaType
        if (mediaType === 'video') dlType = 'video'
        
        const stream = await downloadContentFromMessage(mediaMsg, dlType)

        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer.length) throw new Error('فشل تحميل الميديا')

        // لو ستيكر → صورة
        if (mediaType === 'sticker') {
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: "✅ تم تحويل الستيكر لصورة"
            }, { quoted: m })
            return await react("✅")
        }

        const packName   = args.join(" ") || global.botName || "𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓"
        const authorName = global.botDev  || "♡Jana♡"

        let webp
        
        // معالجة الفيديو
        if (mediaType === 'video') {
            // التحقق من مدة الفيديو
            const videoDuration = mediaMsg.seconds || 0
            
            if (videoDuration > 10.5) {
                await react("⚠️")
                return m.reply("⚠️ الفيديو طويل جداً! الحد الأقصى 10 ثواني للستيكر")
            }
            
            // رسالة للمستخدم
            let durationMsg = videoDuration.toFixed(1)
            if (videoDuration >= 9.95 && videoDuration <= 10.05) {
                durationMsg = "10 (سيتم تعديلها قليلاً للتحويل)"
            }
            
            await m.reply(`🎬 جاري تحويل الفيديو (${durationMsg} ثانية) لستيكر متحرك...`)
            
            try {
                // المحاولة الأولى: wa-sticker-formatter
                webp = await videoToStickerAlternative(buffer, packName, authorName)
            } catch (err1) {
                console.log("wa-sticker-formatter فشل:", err1.message)
                // المحاولة الثانية: ffmpeg مع إرسال مدة الفيديو
                webp = await videoToAnimatedSticker(buffer, packName, authorName, videoDuration)
            }
            
        } else {
            // معالجة الصورة
            try {
                webp = await sticker(buffer, null, packName, authorName)
            } catch (err) {
                console.log("sticker فشل، نجرب طريقة تانية")
                // طريقة بديلة للصور
                const { Sticker } = await import('wa-sticker-formatter')
                const stickerObj = new Sticker(buffer, {
                    pack: packName,
                    author: authorName,
                    type: 'full'
                })
                webp = await stickerObj.toBuffer()
            }
        }

        if (!Buffer.isBuffer(webp) || webp.length < 100) {
            throw new Error('فشل تحويل الستيكر - الملف الناتج فارغ')
        }

        await conn.sendMessage(m.chat, { sticker: webp }, { quoted: m })
        await react("✅")

    } catch (e) {
        console.error("sticker error:", e.message)
        await react("❌")
        let errorMsg = e.message
        if (errorMsg.includes('duration') || errorMsg.includes('time')) {
            errorMsg = 'الفيديو طويل جداً (أقصى مدة 10 ثواني)'
        } else if (errorMsg.includes('empty') || errorMsg.includes('فارغ')) {
            errorMsg = 'فشل إنشاء الستيكر، حاول مرة أخرى'
        }
        m.reply("❌ فشل التحويل: " + errorMsg)
    }
}

handler.help    = ["ستيكر [اسم]"]
handler.tags    = ["sticker"]
handler.command = /^(ستيكر|sticker|s|سـ)$/i

export default handler