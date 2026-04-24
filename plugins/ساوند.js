import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
import { generateWAMessageFromContent, prepareWAMessageMedia } from "@whiskeysockets/baileys";

class SoundCloudHandler {
    constructor() {
        this.clientId = 'KKzJxmw11tYpCs6T24P4uUYhqmjalG6M';
        this.baseURL = 'https://api-mobi.soundcloud.com';
        this.headers = {
            'Host': 'api-mobi.soundcloud.com',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 14; 22120RN86G Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.155 Mobile Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.1',
            'Content-Type': 'application/json',
            'Origin': 'https://m.soundcloud.com',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://m.soundcloud.com/',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'ar,en-GB;q=0.9,en-US;q=0.8,en;q=0.7'
        };
    }

    // البحث في SoundCloud
    async search(query, limit = 10) {
        try {
            const url = `${this.baseURL}/search`;
            const params = {
                q: query,
                client_id: this.clientId,
                limit: limit,
                stage: ''
            };

            const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
                headers: this.headers
            });

            const data = await response.json();
            return this.formatSearchResults(data);
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    // الحصول على تفاصيل track معين
    async getTrackDetails(trackId) {
        try {
            const url = `${this.baseURL}/tracks/${trackId}`;
            const params = {
                client_id: this.clientId,
                stage: ''
            };

            const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
                headers: this.headers
            });

            const data = await response.json();
            return this.formatTrackItem(data);
        } catch (error) {
            throw new Error(`Track details fetch failed: ${error.message}`);
        }
    }

    // تنسيق نتائج البحث
    formatSearchResults(data) {
        const results = {
            tracks: [],
            users: [],
            playlists: []
        };

        if (data.collection) {
            data.collection.forEach(item => {
                switch (item.kind) {
                    case 'track':
                        results.tracks.push(this.formatTrackItem(item));
                        break;
                    case 'user':
                        results.users.push(this.formatUserItem(item));
                        break;
                    case 'playlist':
                        results.playlists.push(this.formatPlaylistItem(item));
                        break;
                }
            });
        }

        return results;
    }

    // تنسيق عناصر Track
    formatTrackItem(track) {
        return {
            id: track.id,
            title: track.title,
            description: track.description,
            duration: track.duration,
            genre: track.genre,
            playback_count: track.playback_count,
            likes_count: track.likes_count,
            reposts_count: track.reposts_count,
            comment_count: track.comment_count,
            created_at: track.created_at,
            artwork_url: track.artwork_url,
            waveform_url: track.waveform_url,
            permalink_url: track.permalink_url,
            stream_url: track.stream_url,
            user: {
                id: track.user?.id,
                username: track.user?.username,
                full_name: track.user?.full_name,
                avatar_url: track.user?.avatar_url,
                verified: track.user?.verified
            },
            tags: track.tag_list ? track.tag_list.split(' ') : []
        };
    }

    // تنسيق عناصر User
    formatUserItem(user) {
        return {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            description: user.description,
            followers_count: user.followers_count,
            followings_count: user.followings_count,
            track_count: user.track_count,
            playlist_count: user.playlist_count,
            avatar_url: user.avatar_url,
            permalink_url: user.permalink_url,
            verified: user.verified,
            city: user.city,
            country: user.country
        };
    }

    // تنسيق عناصر Playlist
    formatPlaylistItem(playlist) {
        return {
            id: playlist.id,
            title: playlist.title,
            description: playlist.description,
            duration: playlist.duration,
            track_count: playlist.track_count,
            likes_count: playlist.likes_count,
            reposts_count: playlist.reposts_count,
            created_at: playlist.created_at,
            artwork_url: playlist.artwork_url,
            permalink_url: playlist.permalink_url,
            user: {
                id: playlist.user?.id,
                username: playlist.user?.username,
                full_name: playlist.user?.full_name,
                avatar_url: playlist.user?.avatar_url
            },
            tags: playlist.tag_list ? playlist.tag_list.split(' ') : []
        };
    }

    // دالة مساعدة لتحويل المدة الزمنية
    static formatDuration(ms) {
        if (!ms) return '0:00';
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // دالة مساعدة لتنسيق الأرقام
    static formatNumber(num) {
        if (!num) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// دالة تحميل الصوت من SoundCloud
const downloadSoundCloud = async (url) => {
    try {
        const form = new FormData()
        form.append('url', url)
        form.append('token', '')

        const res = await fetch('https://scdler.com/wp-json/aio-dl/video-data/', {
            method: 'POST',
            body: form,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://scdler.com/ar/soundcloud-downloader/',
                'Origin': 'https://scdler.com',
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
            },
        })

        const json = await res.json()
        if (!json || !json.medias || json.medias.length === 0) {
            throw new Error('لم يتم العثور على ملف صوت.')
        }

        const media = json.medias[0]
        return {
            audioUrl: media.url,
            title: json.title || 'مقطع صوتي',
            quality: media.quality || 'صوت',
            size: media.size || 'غير معروف',
            thumb: json.thumbnail || null
        }
    } catch (error) {
        throw new Error(`فشل التحميل: ${error.message}`)
    }
}

const handler = async (m, { conn, text, command, usedPrefix }) => {
    if (command === 'soundcloud' || command === 'ساوند' || command === 'اغنية' || command === 'sound') {
        if (!text) {
            return await m.reply(`🎵 أدخل اسم الأغنية أو الفنان للبحث\n\nمثال:\n${usedPrefix + command} into your arms`);
        }

        try {
            await m.reply("🔍 جاري البحث في SoundCloud...");
            
            const soundcloud = new SoundCloudHandler();
            const searchResults = await soundcloud.search(text, 10);
            
            if (searchResults.tracks.length === 0) {
                return await m.reply("❌ ما لقيت أي أغاني تطابق بحثك");
            }

            // حفظ النتائج في المتغير العام
            global.soundcloudResults = searchResults.tracks;

            // إنشاء قائمة الأزرار
            const rows = searchResults.tracks.map((track, index) => ({
                header: `🎵 ${index + 1}`,
                title: `${track.title}`,
                description: `👤 ${track.user.full_name || track.user.username} | ⏱️ ${SoundCloudHandler.formatDuration(track.duration)}`,
                id: `${usedPrefix}اختيار-صوت ${index + 1}`
            }));

            const caption = `🔍 *نتائج البحث عن: ${text}*\n\nاختر أغنية من القائمة أدناه:`;
            
            const mediaMessage = await prepareWAMessageMedia({ 
                image: { url: "https://files.catbox.moe/lguww0.jpg" } 
            }, { upload: conn.waUploadToServer });
            
            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: { text: caption },
                            footer: { text: "SoundCloud Bot" },
                            header: {
                                hasMediaAttachment: true,
                                imageMessage: mediaMessage.imageMessage
                            },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: 'single_select',
                                        buttonParamsJson: JSON.stringify({
                                            title: '「 قــائــمــة الأغاني 」',
                                            sections: [
                                                {
                                                    title: '「 نتائج البحث 」',
                                                    highlight_label: "SoundCloud Bot",
                                                    rows: rows
                                                }
                                            ]
                                        })
                                    }
                                ]
                            }
                        }
                    }
                }
            }, { userJid: conn.user.jid, quoted: m });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            
        } catch (error) {
            console.error(error);
            await m.reply("❌ صار خطأ أثناء البحث في SoundCloud");
        }
    }

    if (command === 'اختيار-صوت') {
        if (!text) return await m.reply("⚠️ الرجاء إدخال رقم الأغنية من قائمة البحث.");
        let choice = parseInt(text);
        if (isNaN(choice)) return await m.reply("❌ الرجاء إدخال رقم صحيح.");

        if (!global.soundcloudResults || choice < 1 || choice > global.soundcloudResults.length) {
            return await m.reply("❌ لم يتم العثور على الأغنية المحددة. قم بإجراء بحث جديد أولاً.");
        }

        let selectedTrack = global.soundcloudResults[choice - 1];
        
        try {
            await m.reply(`🎵 *جاري تحميل:* ${selectedTrack.title}\n👤 *الفنان:* ${selectedTrack.user.full_name || selectedTrack.user.username}\n\n⏳ *يرجى الانتظار...*`);

            // تحميل الصوت
            const downloadResult = await downloadSoundCloud(selectedTrack.permalink_url);
            
            // إرسال معلومات الأغنية
            let caption = `🎵 *${selectedTrack.title}*`;
            caption += `\n👤 *الفنان:* ${selectedTrack.user.full_name || selectedTrack.user.username}`;
            caption += `\n⏱️ *المدة:* ${SoundCloudHandler.formatDuration(selectedTrack.duration)}`;
            caption += `\n👂 *الاستماعات:* ${SoundCloudHandler.formatNumber(selectedTrack.playback_count)}`;
            caption += `\n❤️ *الإعجابات:* ${SoundCloudHandler.formatNumber(selectedTrack.likes_count)}`;
            caption += `\n📥 *الجودة:* ${downloadResult.quality}`;
            caption += `\n📦 *الحجم:* ${downloadResult.size}`;

            // إرسال الصورة مع المعلومات إذا كانت متوفرة
            if (selectedTrack.artwork_url) {
                await conn.sendMessage(
                    m.chat,
                    { 
                        image: { url: selectedTrack.artwork_url.replace('large', 't500x500') },
                        caption: caption
                    },
                    { quoted: m }
                );
            } else {
                await m.reply(caption);
            }

            // إرسال الصوت
            await conn.sendMessage(m.chat, {
                audio: { url: downloadResult.audioUrl },
                fileName: `${selectedTrack.title}.mp3`,
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            await m.reply("❌ حدث خطأ أثناء تحميل الصوت. حاول مرة أخرى لاحقًا.");
        }
    }

    if (command === 'ساوند-تحميل') {
        if (!text || !text.includes('soundcloud.com')) {
            return await m.reply('⚠️ أرسل رابط صوت من ساوند كلاود مثل:\n.ساوند https://soundcloud.com/...');
        }

        const url = text;

        try {
            await m.reply("🔗 *جاري تحميل الرابط المباشر...*");

            const downloadResult = await downloadSoundCloud(url);
            
            const waitMsg = `🎶 *جاري التحميل من SoundCloud...*\n\n` +
                `📌 *العنوان:* ${downloadResult.title}\n` +
                `📥 *الجودة:* ${downloadResult.quality}\n` +
                `📦 *الحجم:* ${downloadResult.size}\n` +
                `⏳ *يرجى الانتظار قليلاً... سيتم إرسال الصوت الآن.*`;

            if (downloadResult.thumb) {
                await conn.sendMessage(m.chat, {
                    image: { url: downloadResult.thumb },
                    caption: waitMsg
                }, { quoted: m });
            } else {
                await m.reply(waitMsg);
            }

            await conn.sendMessage(m.chat, {
                audio: { url: downloadResult.audioUrl },
                fileName: `${downloadResult.title}.mp3`,
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            await m.reply('❌ حدث خطأ أثناء تحميل الصوت. تأكد من الرابط أو حاول لاحقًا.');
        }
    }
};

// تعريف الأوامر
handler.command = ['soundcloud', 'ساوند-تحميل', 'اغنية', 'sound', 'اختيار-صوت', 'ساوند'];
handler.help = [
    'soundcloud <بحث> - البحث في SoundCloud',
    'ساوند <رابط> - تحميل مباشر من الرابط'
];
handler.tags = ['search', 'download'];

export default handler;