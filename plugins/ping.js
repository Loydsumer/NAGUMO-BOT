import speed from 'performance-now'
import { spawn, exec, execSync } from 'child_process'

let handler = async (m, { conn }) => {
         let timestamp = speed();
         let latensi = speed() - timestamp;
         exec(`neofetch --stdout`, (error, stdout, stderr) => {
          let child = stdout.toString("utf-8");
          let ssd = child.replace(/Memory:/, "رام:");
          m.reply(`*» السرعة* : ${latensi.toFixed(4)} _مللي ثانية_`);
            });
}
handler.help = ['بنج']
handler.tags = ['main']
handler.command = ['بنج', 'سرعة', 'س', 'السرعه']

export default handler