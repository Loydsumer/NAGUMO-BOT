import { areJidsSameUser } from '@whiskeysockets/baileys'

export async function before(m, { participants, conn }) {
    if (m.isGroup) {
        let chat = global.db.data.chats[m.chat];

        // إذا لم يكن خيار "antiBot2" مفعّل، توقف عن التنفيذ
        if (!chat.antiBot2) {
            return
        }

        let botJid = global.conn.user.jid // رقم تعريف (JID) البوت الرئيسي

        if (botJid === conn.user.jid) {
            // إذا كان هذا هو البوت الرئيسي نفسه، لا تفعل شيئًا
            return
        } else {
            // تحقق مما إذا كان البوت الرئيسي موجودًا في نفس المجموعة
            let isBotPresent = participants.some(p => areJidsSameUser(botJid, p.id))

            if (isBotPresent) {
                setTimeout(async () => {
                    await conn.reply(m.chat, `《✧》يوجد البوت الرئيسي في هذه المجموعة، سأغادر لتجنب الإزعاج (السبام).`, m)
                    await this.groupLeave(m.chat)
                }, 5000) // بعد 5 ثواني
            }
        }
    }
}