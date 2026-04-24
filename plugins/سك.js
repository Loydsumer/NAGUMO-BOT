import fs from "fs"
import { execSync } from "child_process"

let handler = async (m, { conn }) => {
try {
const tempDir = "./tmp"
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
let files = fs.readdirSync(tempDir)
if (files.length > 0) {
for (let file of files) {
fs.unlinkSync(`${tempDir}/${file}`)
}
}
await m.reply("*📦جاري ارسال النسخه الاحتياطيه*")
const backupName = "Abyss-V2"
const backupPath = `${tempDir}/${backupName}.zip`
const ls = (await execSync("ls"))
.toString()
.split("\n")
.filter(
(pe) =>
pe !== "node_modules" &&
pe !== "auth" &&
pe !== "package-lock.json" &&
pe !== "yarn.lock" &&
pe !== "pnpm-lock.yaml" &&
pe !== ""
)
await execSync(`zip -r ${backupPath} ${ls.join(" ")}`)
await conn.sendMessage(m.sender, {
document: await fs.readFileSync(backupPath),
fileName: `${backupName}.zip`,
mimetype: "application/zip"
}, { quoted: m })
fs.unlinkSync(backupPath)
if (m.chat !== m.sender) return m.reply("*Script bot berhasil dikirim ke private chat!*")
} catch (e) {
console.error(e)
m.reply("❌ *Gagal membuat backup script!*")
}
}

handler.help = ["backup"]
handler.tags = ["owner"]
handler.command = /^(سك|bk)$/i
handler.owner = true;
export default handler