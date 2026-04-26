import { default as makeWASocket, DisconnectReason} from "@whiskeysockets/baileys";

const handler = async (m, { conn}) => {
    try {
        conn.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect} = update;

            if (connection === "close") {
                const reason = lastDisconnect?.error?.output?.statusCode;

                if (reason === DisconnectReason.restartRequired || reason === DisconnectReason.connectionLost) {
                    console.log("⚠️ تم فصل الاتصال، إعادة تشغيل البوت...");
                    conn.connect(); // إعادة الاتصال تلقائيًا
}
} else if (connection === "open") {
                console.log("✅ البوت متصل الآن!");
}
});

        // تحديث قائمة الجروبات بشكل دوري
        setInterval(async () => {
            const allGroups = await conn.groupFetchAllParticipating();
            const groupIds = Object.keys(allGroups);

            if (groupIds.length === 0) {
                console.log("❌ لا يوجد أي جروبات مسجلة.");
} else {
                console.log(`✅ البوت متصل في ${groupIds.length} جروبات.`);
}
}, 60000); // تحديث كل دقيقة

        // التأكد من استقبال الرسائل داخل الجروبات
        conn.ev.on("messages.upsert", async ({ messages}) => {
            const msg = messages[0];
            if (!msg.key.remoteJid.endsWith("@g.us")) return; // التأكد أن الرسالة داخل الجروب

            console.log(`📩 تم استقبال رسالة في الجروب ${msg.key.remoteJid}: ${msg.message.conversation}`);

            // إرسال تأكيد أن البوت يعمل
            await conn.sendMessage(msg.key.remoteJid, { text: "🚀 البوت يعمل هنا!"});
});

        console.log("✅ تم تشغيل النظام الذكي لإدارة الجروبات!");
} catch (error) {
        console.error(`❌ حدث خطأ في البوت: ${error.message}`);
}
};

handler.help = ["إصلاح-الجروبات"];
handler.tags = ["group"];
handler.command = ["إصلاح-الجروبات"];
handler.rowner = true;

export default handler;