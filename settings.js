//هنا تقدر تعدل عادي خذ راحتك يحب🐦👍


import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'

//~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~

global.owner = [
  ['4917672339436', '𝐋𝐎𝐘𝐃', true]
]

//~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~

global.mods = []
global.prems = []
   
//~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~

global.packname = `𝐋𝐎𝐘𝐃`
global.author = '...'
global.wait = '𝐍𝐀𝐆𝐔𝐌𝐎 𝐁𝐎𝐓'
global.botname = '𝐍𝐀𝐆𝐔𝐌𝐎 𝐁𝐎𝐓'
global.textbot = ``
global.listo = '...'
global.namechannel = '𓏲ׄ 𝐋𝐎𝐘𝐃⏤͟͟͞͞🪻 ָ ۫𝐒𝐎𝐋𝐎 ࣪𖥔¹'

//~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~

global.catalogo = fs.readFileSync('./menu.png')
global.miniurl = fs.readFileSync('./menu.png')

//~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~

global.group = 'https://chat.whatsapp.com/KkuYNJrg3qv1JslwoFOTUt?mode=gi_t'
global.group2 = 'https://chat.whatsapp.com/KkuYNJrg3qv1JslwoFOTUt?mode=gi_t'
global.group3 = 'https://chat.whatsapp.com/KkuYNJrg3qv1JslwoFOTUt?mode=gi_t'
global.canal = 'https://whatsapp.com/channel/0029Vb6kG3s0AgW2lYD8ad1L'

//~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~

global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: botname, orderTitle: 'Bang', thumbnail: catalogo, sellerJid: '0@s.whatsapp.net'}}}

//~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios

//~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~

global.multiplier = 69 
global.maxwarn = '2' 

//~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
