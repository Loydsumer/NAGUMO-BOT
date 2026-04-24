// by Anas ❤️‍🔥
// 🔰 Spotify Search + Download (via Spotisaver.net)

import axios from 'axios';
import fs from 'fs';
import path from 'path';

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36"
};

// 🧠 البحث في Spotify
async function getSpotifyToken() {
  const clientId = 'cda875b7ec6a4aeea0c8357bfdbab9c2';
  const clientSecret = 'c2859b35c5164ff7be4f979e19224dbe';
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`
    }
  });
  return res.data.access_token;
}

async function searchSpotify(query) {
  const token = await getSpotifyToken();
  const res = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const item = res.data.tracks.items[0];
  if (!item) return null;

  return {
    id: item.id,
    name: item.name,
    artists: item.artists.map(a => a.name),
    album: item.album.name,
    duration_ms: item.duration_ms,
    image: item.album.images[0].url,
    url: item.external_urls.spotify
  };
}

// 🔻 Spotisaver API
async function getSpotifyInfo(url) {
  const trackMatch = url.match(/\/track\/([a-zA-Z0-9]+)/);
  if (!trackMatch) throw new Error('❌ لم يتم العثور على Track ID');
  const id = trackMatch[1];
  const type = 'track';
  const referer = `https://spotisaver.net/en/track/${id}/`;

  const apiUrl = `https://spotisaver.net/api/get_playlist.php?id=${id}&type=${type}&lang=en`;
  const res = await axios.get(apiUrl, {
    headers: { ...HEADERS, Referer: referer, 'Accept': 'application/json' },
    timeout: 20000
  });

  if (res.data.error) throw new Error(`خطأ: ${res.data.error}`);
  const tracks = res.data?.tracks || [];
  if (!tracks.length) throw new Error('⚠️ لم يتم العثور على بيانات المسار.');

  return { tracks, referer };
}

async function downloadTrack(track) {
  const payload = {
    track,
    download_dir: "downloads",
    filename_tag: "SPOTISAVER",
    user_ip: "2404:c0:9830::800e:2a9c",
    is_premium: false
  };

  const res = await axios.post(
    "https://spotisaver.net/api/download_track.php",
    payload,
    {
      headers: {
        ...HEADERS,
        Referer: `https://spotisaver.net/en/track/${track.id}/`,
        'Content-Type': 'application/json'
      },
      responseType: "arraybuffer",
      timeout: 60000
    }
  );

  return Buffer.from(res.data);
}

function timestamp(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function cleanFileName(name = 'track') {
  return name.replace(/[\\/:"'*?<>|]+/g, '').replace(/\s+/g, '_').slice(0, 150);
}

// 🎧 Handler رئيسي
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❗ أدخل اسم الأغنية أو الفنان.\n🔹 مثال:\n${usedPrefix + command} TINI - Cupido`);

  let tempFile = null;

  try {
    const wait = await m.reply('🔍 جارٍ البحث عن الأغنية...');

    // 1️⃣ البحث عن الأغنية
    const track = await searchSpotify(text);
    if (!track) return m.reply('⚠️ لم يتم العثور على نتائج. حاول بكلمة أخرى.');

    const caption = `🎵 *العنوان:* ${track.name}
👤 *الفنان:* ${track.artists.join(', ')}
💽 *الألبوم:* ${track.album}
⏰ *المدة:* ${timestamp(track.duration_ms)}
🔗 *الرابط:* ${track.url}

⏳ *جاري التحميل من Spotisaver.net...*`;

    await conn.sendMessage(m.chat, {
      image: { url: track.image },
      caption
    }, { quoted: m });

    // 2️⃣ تحميل المسار عبر Spotisaver
    const { tracks } = await getSpotifyInfo(track.url);
    const fileBuffer = await downloadTrack(tracks[0]);

    if (!fileBuffer || fileBuffer.length < 2000)
      throw new Error("فشل التحميل أو الملف فارغ.");

    const filename = `${cleanFileName(track.name)}.mp3`;
    tempFile = path.join(process.cwd(), `spotify_${Date.now()}.mp3`);
    fs.writeFileSync(tempFile, fileBuffer);

    // 3️⃣ إرسال الصوت
    await conn.sendMessage(m.chat, {
      audio: fileBuffer,
      mimetype: 'audio/mpeg',
      fileName: filename,
      caption: `✅ *تم التنزيل بنجاح*\n📁 ${filename}`
    }, { quoted: m });

    try { await conn.sendMessage(m.chat, { delete: wait.key }); } catch {}
  } catch (err) {
    console.error(err);
    m.reply(`❌ حدث خطأ أثناء التحميل:\n${err.message}`);
  } finally {
    if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
};

handler.command = /^سبوتيفاي$/i;
handler.help = ['سبوتي <اسم_الأغنية>'];
handler.tags = ['downloader'];

export default handler;