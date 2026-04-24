import axios from 'axios'

async function ttSearch(query) {
    return new Promise(async (resolve, reject) => {
        axios("https://tikwm.com/api/feed/search", {
            headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "cookie": "current_language=en",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
            },
            data: {
                "keywords": query,
                "count": 12,
                "cursor": 0,
                "web": 1,
                "hd": 1
            },
            method: "POST"
        }).then(res => {
            resolve(res.data.data)
        }).catch(err => {
            reject(err)
        })
    })
}

let sentVideos = []

let handler = async (m, {
    conn,
    args,
    text,
    usedPrefix,
    command
}) => {
    ttSearch('حلات حزينه لي الواتس اب').then(a => {
        let videos = a.videos

        videos.sort((v1, v2) => {
            return new Date(v2.created_at) - new Date(v1.created_at)
        })

        let newVideo = null
        for (let video of videos) {
            if (!sentVideos.includes(video.id)) {
                newVideo = video
                break
            }
        }

        if (newVideo) {
            let result = 'https://tikwm.com/' + newVideo.play
            conn.sendMessage(m.chat, {video: {url: result}, caption: '⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐'}, {quoted: m})

            sentVideos.push(newVideo.id)
        } else {
            m.reply('لا توجد فيديوهات جديدة حالياً، يرجى المحاولة لاحقاً.')
        }
    }).catch(err => {
        m.reply('حدث خطأ')
    })
}

handler.help = ['شيلات-حزينه']
handler.tags = ['random']
handler.command = /^(حلات-حزينه)$/i
handler.register = true

export default handler