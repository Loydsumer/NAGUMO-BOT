import fetch from "node-fetch"

let handler = async (m, { conn, isROwner }) => {
    if (!isROwner) return

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } }).catch(() => {})

    try {
        // استخدام API مجاني من apify (معرفش يدوم قد إيه)
        const searchQuery = "anime edit"
        const apiUrl = `https://api.apify.com/v2/key-value-stores/3PoJTVQk7Rm6Zk2Gp/records/LATEST?fbclid=IwAR3N1YbP5R4pQnXqL8M9k2J3H4g5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0`
        
        const res = await fetch(apiUrl)
        const data = await res.json()
        
        if (!data?.videos?.length) throw new Error('مافيش فيديوهات')
        
        const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)]
        const videoUrl = randomVideo.url
        
        const videoRes = await fetch(videoUrl)
        const videoBuffer = Buffer.from(await videoRes.arrayBuffer())

        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            ptv: true,
            mimetype: "video/mp4"
        })

        await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } }).catch(() => {})

    } catch (e) {
        console.error("❌", e)
        await m.reply(`⚠️ فشل: ${e.message}`)
    }
}

handler.rowner = true
handler.command = /^(تست|test)$/i
export default handler