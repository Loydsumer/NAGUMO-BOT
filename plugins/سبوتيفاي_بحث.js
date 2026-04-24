import axios from 'axios';
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import("@whiskeysockets/baileys")).default;

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `🔴 لازم تدخل اسم الفنان أو الأغنية!\n🔹 مثال:\n${usedPrefix + command} tini`;

  try {
    let resultados = await spotifyxv(text);
    if (resultados.length === 0) throw `⚠️ مع الأسف مش لاقي حاجة تطابق بحثك 😔`;

    let cards = [];
    for (let i = 0; i < Math.min(resultados.length, 5); i++) {
      const result = resultados[i];
      const albumInfo = await obtenerAlbumInfo(result.album);

      const imageMessage = await generateWAMessageContent({
        image: { url: albumInfo.imagen }
      }, { upload: conn.waUploadToServer });

      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `*🎶 العنوان:* ${result.nombre}\n👤 *الفنانين:* ${result.artistas.join(', ')}\n🗂️ *الألبوم:* ${result.album}\n⏰ *المدة:* ${timestamp(result.duracion)}\n🔗 *الرابط:* ${result.link}`
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: "🔎 تم بواسطة Spotify API"
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          hasMediaAttachment: true,
          imageMessage: imageMessage.imageMessage
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [] // بدون أزرار
        })
      });
    }

    const interactiveMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `🎶 نتائج البحث عن: *${text}*`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "🔎 Spotify Search"
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: cards
            })
          })
        }
      }
    }, { quoted: m });

    await conn.relayMessage(m.chat, interactiveMessage.message, { messageId: interactiveMessage.key.id });

  } catch (e) {
    console.log(e);
    await conn.reply(m.chat, `❗ حصل خطأ أثناء البحث.\nحاول لاحقاً أو تحقق من الاسم.\n\n${usedPrefix + command}`, m);
  }
};

handler.command = /^(سبوتيفاي_بحث)$/i;

export default handler;

// ====== دوال مساعدة ======

async function spotifyxv(query) {
  const token = await obtenerTokenSpotify();
  const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return response.data.tracks.items.map(item => ({
    nombre: item.name,
    artistas: item.artists.map(a => a.name),
    album: item.album.name,
    duracion: item.duration_ms,
    link: item.external_urls.spotify
  }));
}

async function obtenerTokenSpotify() {
  const clientId = "cda875b7ec6a4aeea0c8357bfdbab9c2";
  const clientSecret = "c2859b35c5164ff7be4f979e19224dbe";
  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await axios.post("https://accounts.spotify.com/api/token", "grant_type=client_credentials", {
    headers: {
      'Content-Type': "application/x-www-form-urlencoded",
      'Authorization': `Basic ${encoded}`
    }
  });

  return response.data.access_token;
}

async function obtenerAlbumInfo(albumName) {
  const token = await obtenerTokenSpotify();
  const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(albumName)}&type=album`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const album = response.data.albums.items[0];
  return {
    nombre: album?.name || albumName,
    imagen: album?.images?.[0]?.url || null
  };
}

function timestamp(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}