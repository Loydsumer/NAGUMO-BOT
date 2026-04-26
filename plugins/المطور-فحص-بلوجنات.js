import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // 🎭 بداية العرض المسرحي
        const startTime = Date.now();
        
        const startMessage = `
🎭 *بداية العرض المسرحي لاوغامي كورليوني* 👻

▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂
📁 *جاري فحص الملفات...*
⚡ *إعداد النظام للتنفيذ...*
▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
        `.trim();

        await m.reply(startMessage);

        const pluginDir = './plugins';
        const files = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));

        if (files.length === 0) {
            return m.reply(`
👻 *لا يوجد أي بلوجنات للعرض...*

📌 *التوضيح:* لم أجد أي ملفات بلوجن في المجلد
🎯 *الحل:* تأكد من وجود ملفات JavaScript في مجلد plugins

▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂
ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
            `.trim());
        }

        let successCount = 0;
        let warningCount = 0;
        let errorCount = 0;
        const results = [];
        
        // 🎪 إنشاء رسالة التقدم الأولى
        let progressMessage = await m.reply(`
🔄 *جاري معالجة البلوجن 0/${files.length}*

▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂
📁 *الملف:* جاري البدء...
📊 *التقدم:* [░░░░░░░░░░] 0%
⚡ *الحالة:* جاري التنفيذ...
▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
        `.trim());

        // 🎬 التنفيذ مع منع rate limit
        for (const [index, file] of files.entries()) {
            const fullPath = path.join(pluginDir, file);
            
            try {
                // 👻 تحديث كل 10 بلوجنات فقط لتجنب rate limit
                if (index % 10 === 0 || index === files.length - 1) {
                    const progress = Math.round((index / files.length) * 100);
                    const progressBar = '█'.repeat(Math.round(progress / 10)) + '░'.repeat(10 - Math.round(progress / 10));
                    
                    const updateMessage = `
🔄 *جاري معالجة البلوجن ${index + 1}/${files.length}*

▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂
📁 *الملف:* ${file}
📊 *التقدم:* [${progressBar}] ${progress}%
⚡ *الحالة:* جاري التنفيذ...
▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
                    `.trim();

                    // ⏳ إضافة تأخير بين التحديثات
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    await conn.relayMessage(m.chat, {
                        protocolMessage: {
                            key: progressMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: updateMessage
                            }
                        }
                    }, {});
                }

                const plugin = await import(path.resolve(fullPath));
                
                if (plugin?.default?.handler) {
                    // 🎯 تنفيذ الhandler مع تأخير لتجنب rate limit
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const executionPromise = plugin.default.handler(m, { 
                        conn, 
                        text: '', 
                        usedPrefix: '', 
                        command: '' 
                    });
                    
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('⏰ انتهى وقت التنفيذ')), 8000)
                    );
                    
                    await Promise.race([executionPromise, timeoutPromise]);
                    
                    successCount++;
                    results.push(`✅ ${file}`);
                    console.log(chalk.green(`🎯 تم تنفيذ: ${file}`));
                    
                } else {
                    warningCount++;
                    results.push(`⚠️ ${file} - بدون handler`);
                    console.log(chalk.yellow(`⚠️ لا يوجد handler في ${file}`));
                }
                
            } catch (e) {
                errorCount++;
                results.push(`❌ ${file} - ${e.message.substring(0, 30)}...`);
                console.log(chalk.red(`👻 خطأ في ${file}: ${e.message}`));
                
                // ⏳ تأخير بعد الخطأ
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // 🏁 النتائج النهائية
        const endTime = Date.now();
        const executionTime = ((endTime - startTime) / 1000).toFixed(2);
        
        const finalMessage = `
🎉 *انتهى العرض المسرحي* 👻

▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂
📊 *التقرير النهائي:*
• ✅ ناجح: ${successCount}
• ⚠️ تحذيرات: ${warningCount}  
• ❌ أخطاء: ${errorCount}
• ⏱️ الوقت: ${executionTime} ثانية
• 📁 الإجمالي: ${files.length}
▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂

🎪 *عينة من النتائج:*
${results.slice(0, 8).join('\n')}
${results.length > 8 ? `\n📎 ...و ${results.length - 8} نتيجة أخرى` : ''}

🎯 *نصيحة اوغامي:* تم تجنب rate limit بنجاح

▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂
ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
        `.trim();

        // ⏳ تأخير أخير قبل إرسال النتيجة
        await new Promise(resolve => setTimeout(resolve, 2000));
        await m.reply(finalMessage);

    } catch (error) {
        console.error(chalk.red('👻 خطأ رئيسي:'), error);
        
        const errorMessage = `
👻 *حدث خطأ في النظام...*

📌 *السبب:* ${error.message.includes('rate') ? 'تم إرسال رسائل كثيرة جداً' : error.message}
🎯 *الحل:* جاري إصلاح النظام تلقائياً

▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂
ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
        `.trim();
        
        await m.reply(errorMessage);
    }
};

// 👻 الأوامر المتعددة
handler.help = ['فحص', 'تشغيل_الكل', 'فحص_البلوجنات'];
handler.tags = ['نظام', 'نظامي'];
handler.command = /^(فحص|تشغيل_الكل|فحص_البلوجنات|runall|testplugins)$/i;

// 🎯 صلاحيات المطور فقط
handler.owner = true;
handler.mods = false;
handler.premium = false;

export default handler;