import axios from 'axios'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const commandName = command.toLowerCase()
  const isArabicCommand = commandName === 'عيي' || commandName === 'ويب'

  const usageMessage = `
*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞🍓◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*
*◞🍓‟⌝╎طـريـقـة الاسـتـخـدام ⸃⤹*  
> *╭*  
> *┊ 🍓╎${usedPrefix}${command} <رابط الموقع>*  
> *┊ 🍓╎مثـال:* ${usedPrefix}${command} https://google.com  
> *╰*

*⌝🍓╎خـيـارات مـتـقـدمـة: ⌞*  
> *╭*  
> *┊ 🍓╎تغـيـير أسـماء المـلـفـات (renameAssets)*  
> *┊ 🍓╎الاحتـفاظ بـهـيـكل المـوقـع (saveStructure)*  
> *┊ 🍓╎نـسـخـة المـوبـايـل (mobileVersion)*  
> *╰*
*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞🍓◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*
`.trim()

  if (!args[0]) {
    const errorMessage = isArabicCommand
      ? `⚠️ *يـجـب إدخـال رابـط المـوقـع أولاً!* 🍓\n\n${usageMessage}`
      : `⚠️ *Please enter a website URL first!* 🍓\n\n${usageMessage}`
    return m.reply(errorMessage)
  }

  const processingMessage = isArabicCommand
    ? `🍓 *جـاري حـفـظ المـوقـع...*\nقـد تـسـتـغـرق العـمـلـيـة بـعـض الـوقـت حسـب حـجـم المـوقـع 🍓`
    : `🍓 *Saving website...*\nThis may take a while depending on the site size 🍓`
  await m.reply(processingMessage)

  try {
    const options = {
      renameAssets: true,
      saveStructure: false,
      alternativeAlgorithm: false,
      mobileVersion: false
    }

    const result = await saveweb2zip(args[0], options)

    await conn.sendMessage(
      m.chat,
      {
        document: { url: result.downloadUrl },
        fileName: `🍓موقع_${args[0].replace(/https?:\/\//, '')}.zip`,
        mimetype: 'application/zip',
        caption: `
*◞🍓‟⌝╎تـم حـفـظ المـوقـع بـنـجـاح ⸃⤹*  
> *╭*  
> *┊ 🍓╎الـرابـط:* ${args[0]}  
> *┊ 🍓╎عـدد الـمـلـفـات:* ${result.copiedFilesAmount}  
> *╰*  
*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞🍓◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*  

*⌝🍓╎تـنـفـيـذ بـواسـطـة ⌞*  
*⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐*
`
      },
      { quoted: m }
    )
  } catch (error) {
    const errorMsg = isArabicCommand
      ? `❌ *حـدث خـطـأ أثـنـاء حـفـظ المـوقـع!* 🍓\n▢ الـتـفـاصـيـل: ${error.message}\n*جـرب مـرة أخـرى لاحقـاً.* 🍓`
      : `❌ *Failed to save the website!* 🍓\n▢ Details: ${error.message}\n*Please try again later.* 🍓`
    m.reply(errorMsg)
  }
}

// 🍓 دالة حفظ الموقع كملف ZIP
async function saveweb2zip(url, options = {}) {
  if (!url) throw new Error('يـجـب تـقـديـم رابـط الـمـوقـع 🍓')
  url = url.startsWith('https://') ? url : `https://${url}`

  const { data } = await axios.post(
    'https://copier.saveweb2zip.com/api/copySite',
    {
      url,
      renameAssets: options.renameAssets,
      saveStructure: options.saveStructure,
      alternativeAlgorithm: options.alternativeAlgorithm,
      mobileVersion: options.mobileVersion
    },
    {
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        origin: 'https://saveweb2zip.com',
        referer: 'https://saveweb2zip.com/',
        'user-agent':
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    }
  )

  while (true) {
    const { data: process } = await axios.get(
      `https://copier.saveweb2zip.com/api/getStatus/${data.md5}`,
      {
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          origin: 'https://saveweb2zip.com',
          referer: 'https://saveweb2zip.com/',
          'user-agent':
            'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
        }
      }
    )

    if (!process.isFinished) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      continue
    } else {
      return {
        url,
        error: {
          text: process.errorText,
          code: process.errorCode
        },
        copiedFilesAmount: process.copiedFilesAmount,
        downloadUrl: `https://copier.saveweb2zip.com/api/downloadArchive/${process.md5}`
      }
    }
  }
}

handler.command = /^(saveweb|web2zip|حفظ-موقع|ويب|عيي)$/i
handler.footer = '⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐'

export default handler