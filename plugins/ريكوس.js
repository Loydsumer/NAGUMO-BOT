import pkg from '@whiskeysockets/baileys';
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import dns from 'dns/promises';
import { fileTypeFromBuffer } from 'file-type';
const { generateWAMessageFromContent } = pkg;

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if(!text) return m.reply(`🔴 استخدم: ${usedPrefix+command} <URL>`);

    const args = text.trim().split(' ');
    const urlInput = args[0];
    const fileType = args[1]; 
    const fileIndex = args[2]; 

    try {
        const parsedUrl = new URL(urlInput);

        let res;
        try { res = await axios.get(urlInput, { headers:{'User-Agent':'Mozilla/5.0'}, validateStatus:null }); } catch { res = null; }
        if(!res || !res.data) return m.reply('❌ فشل الوصول للصفحة أو الصفحة فارغة');

        const htmlContent = res.data.toString();
        const $ = cheerio.load(htmlContent);

        const jsFiles = [];
        const cssFiles = [];
        $('script[src]').each((i, el) => { const src = $(el).attr('src'); if(src) jsFiles.push(src); });
        $('link[rel="stylesheet"]').each((i, el) => { const href = $(el).attr('href'); if(href) cssFiles.push(href); });

        // عرض القائمة الرئيسية
        if(!fileType){
            const sections = [
                { title:'اختار نوع الملف', rows:[
                    { title:`HTML - الصفحة كاملة`, rowId:`.ريكوس ${urlInput} .html`, description:'عرض الصفحة كاملة' },
                    { title:`JS - ${jsFiles.length} ملفات`, rowId:`.ريكوس ${urlInput} .js`, description:'عرض ملفات JS' },
                    { title:`CSS - ${cssFiles.length} ملفات`, rowId:`.ريكوس ${urlInput} .css`, description:'عرض ملفات CSS' },
                    { title:`تحميل كل ملفات Node/API`, rowId:`.ريكوس ${urlInput} node`, description:'بحث عن ملفات Node.js وملفات تحتوي API وجمعها' },
                    { title:`تحميل كل الملفات`, rowId:`.ريكوس ${urlInput} كل`, description:'تحميل HTML + JS + CSS دفعة واحدة (بدون zip)' },
                    { title:`تحليل الصفحة`, rowId:`.ريكوس ${urlInput} تحليل`, description:'فحص الحماية والـ API Keys والملفات المهمة' },
                    { title:`تحميل أي ملف`, rowId:`.ريكوس ${urlInput} تحميل`, description:'تحميل الملف مباشرة' },
                    { title:`سجل الشبكة`, rowId:`.ريكوس ${urlInput} network`, description:'عرض جميع الطلبات وForms وJS/CSS Requests' },
                    { title:`جمع المفاتيح المخفية`, rowId:`.ريكوس ${urlInput} hidden`, description:'جمع جميع Hidden Keys في ملف واحد' }
                ]}
            ];
            return conn.sendMessage(m.chat,{
                text:`📄 ملفات الموقع: ${urlInput}\nJS: ${jsFiles.length} | CSS: ${cssFiles.length}`,
                footer:'ريكوس - Web Scraper',
                title:'📑 اختر نوع الملف',
                buttonText:'اضغط للاختيار',
                sections
            },{ quoted:m });
        }

        // ---- إرسال HTML مباشرة ----
        if(fileType==='.html'){
            const tmpPath = path.join('./tmp', `page_${Date.now()}.txt`);
            if(!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
            fs.writeFileSync(tmpPath, htmlContent, 'utf8');
            await conn.sendMessage(m.chat, { document:{ url:tmpPath, mimetype:'text/plain', fileName:'page.txt'} }, { quoted:m });
            fs.unlinkSync(tmpPath);
            return;
        }

        // ---- التحليل المتقدم ----
        if(fileType==='تحليل'){
            const protocol = parsedUrl.protocol.replace(':','').toUpperCase();
            const host = parsedUrl.hostname;
            const endpoint = parsedUrl.pathname + parsedUrl.search;

            let ip;
            try { ip = (await dns.lookup(host)).address; } catch { ip = '❌ فشل الحصول على IP'; }

            const startTime = Date.now();
            const responseTime = Date.now() - startTime;

            let analysis = `🕵️‍♂️ تحليل متقدم للموقع: ${urlInput}\n\n`;
            analysis += `🔹 Host: ${host}\n`;
            analysis += `🔹 IP: ${ip}\n`;
            analysis += `🔹 Port: ${protocol==='HTTPS'?443:80}\n`;
            analysis += `🔹 Protocol: ${protocol}\n`;
            analysis += `🔹 Endpoint: ${endpoint}\n`;
            analysis += `🔹 Status: ${res.status}\n`;
            analysis += `🔹 Response Time: ${responseTime}ms\n`;

            let protection = '❌ لا توجد حماية واضحة';
            if(res.headers['server']?.toLowerCase().includes('cloudflare')) protection='⚠️ Cloudflare Detected';
            if(htmlContent.toLowerCase().includes('captcha')) protection='⚠️ CAPTCHA Detected';
            let antiBot = '❌ لا يوجد أنتي بوت';
            $('script').each((i, el)=>{
                const content = $(el).html();
                if(content && content.toLowerCase().includes('antibot')) antiBot='⚠️ JS Anti-Bot Scripts Detected';
            });
            analysis += `🔹 Protection: ${protection}\n`;
            analysis += `🔹 Anti-Bot: ${antiBot}\n`;

            let cookies = '❌ لا توجد';
            if(res.headers['set-cookie']) cookies = res.headers['set-cookie'].join(' | ');
            analysis += `🔹 Cookies:\n${cookies}\n`;

            analysis += '🔹 Security Headers:\n';
            const secHeaders = ['x-frame-options','x-xss-protection','content-security-policy','strict-transport-security'];
            secHeaders.forEach(h=>{
                analysis += `${h}: ${res.headers[h]||'غير موجود'}\n`;
            });

            let hiddenKeys = [];
            const keyPatterns = /(api[_-]?key|token|secret|access_key|client_id)[\s]*[:=]['"`][\w-]{8,}['"`]/gi;
            let match;
            while((match = keyPatterns.exec(htmlContent)) !== null) hiddenKeys.push({ key: match[0], path: 'HTML inline' });

            for(let f of jsFiles){
                let jsUrl = f.startsWith('http') ? f : `${parsedUrl.origin}${f.startsWith('/')?'':'/'}${f}`;
                try {
                    const jsRes = await axios.get(jsUrl, { headers:{'User-Agent':'Mozilla/5.0'} });
                    const jsData = jsRes.data.toString();
                    let m2;
                    while((m2 = keyPatterns.exec(jsData))!==null){
                        hiddenKeys.push({ key: m2[0], path: jsUrl });
                    }
                } catch {}
            }

            let jsAntiBotCount = 0;
            jsFiles.forEach(f=>{
                if(f.toLowerCase().includes('anti') || f.toLowerCase().includes('bot')) jsAntiBotCount++;
            });
            analysis += `🔹 JS Anti-Bot Scripts: ${jsAntiBotCount>0?jsAntiBotCount+' موجود':'❌ لا يوجد'}\n`;

            analysis += `🔹 Hidden APIs / Keys: ${hiddenKeys.length>0?'\n':''}`;
            hiddenKeys.forEach(h=>analysis += `  • ${h.key} (مسار: ${h.path})\n`);
            if(hiddenKeys.length===0) analysis += '❌ لا يوجد\n';

            let formsDetected = $('form').length;
            let networkRequests = jsFiles.length + cssFiles.length;
            analysis += `🔹 Network Requests Detected: ${networkRequests>0?'يوجد':'❌ لا يوجد'}\n`;
            analysis += `🔹 Forms Detected: ${formsDetected>0?'يوجد':'❌ لا يوجد'}\n`;

            let score = 100;
            if(protection.includes('Cloudflare') || antiBot.includes('Detected')) score -= 30;
            if(hiddenKeys.length>0) score -= 30;
            analysis += `🔹 Security Score: ${score}/100 (Risk Level: ${score<50?'High':score<80?'Medium':'Low'})\n`;

            analysis += `🔹 Headers:\n${JSON.stringify(res.headers, null, 2)}\n`;

            return m.reply(analysis);
        }

        // ---- JS/CSS تحميل مباشر ----
        if(fileType==='.js' || fileType==='.css'){
            let filesArray = fileType==='.js' ? jsFiles : cssFiles;
            if(!fileIndex){
                const rows = filesArray.map((f,i)=>({ title:`${i+1} - ${f.split('/').pop()}`, rowId:`.ريكوس ${urlInput} ${fileType} ${i}`, description:f }));
                const sections = [{ title:`اختار الملف`, rows }];
                return conn.sendMessage(m.chat,{
                    text:`📂 ${fileType.toUpperCase()} Files:\n${filesArray.length} ملف`,
                    footer:'ريكوس - Web Scraper',
                    title:`📑 اختر الملف لتحميله`,
                    buttonText:'اضغط للاختيار',
                    sections
                },{ quoted:m });
            }

            const index = parseInt(fileIndex);
            if(index>=0 && index<filesArray.length){
                let f = filesArray[index];
                if(!f.startsWith('http')) f = `${parsedUrl.origin}${f.startsWith('/')?'':'/'}${f}`;
                let fr;
                try { fr = await axios.get(f, { headers:{'User-Agent':'Mozilla/5.0'}, responseType:'arraybuffer' }); } catch { fr=null; }
                if(!fr || !fr.data) return m.reply('❌ فشل تحميل الملف');

                const tmpPath = path.join('./tmp', `${fileType}_${Date.now()}.txt`);
                if(!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
                fs.writeFileSync(tmpPath, fr.data);

                await conn.sendMessage(m.chat, { 
                    document: fs.readFileSync(tmpPath), 
                    fileName: `${fileType}_${fileIndex}.txt`, 
                    mimetype: 'text/plain' 
                }, { quoted:m });

                fs.unlinkSync(tmpPath);
            }
            return;
        }

        // ---- تحميل أي ملف مباشر ----
        if(fileType==='تحميل'){
            const buffer = Buffer.from(await (await axios.get(urlInput, { responseType:'arraybuffer' })).data);
            const ft = await fileTypeFromBuffer(buffer);
            const mime = ft?.mime || 'application/octet-stream';
            const ext = ft?.ext || 'bin';
            const baseName = path.basename(parsedUrl.pathname).split('.')[0] || `file_${Date.now()}`;
            const fileName = `${baseName}.${ext}`;
            if(!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
            const filePath = path.join('./tmp', fileName);
            fs.writeFileSync(filePath, buffer);

            await conn.sendMessage(m.chat, { 
                document: fs.readFileSync(filePath), 
                fileName, 
                mimetype: mime 
            }, { quoted:m });

            fs.unlinkSync(filePath);
            return;
        }

        // ---- سجل الشبكة ----
        if(fileType==='network'){
            let networkLog = `🌐 سجل الشبكة للموقع: ${urlInput}\n\n`;
            networkLog += `🔹 JS Files (${jsFiles.length}):\n`;
            jsFiles.forEach((f,i)=>networkLog+=`  ${i+1}. ${f}\n`);
            networkLog += `🔹 CSS Files (${cssFiles.length}):\n`;
            cssFiles.forEach((f,i)=>networkLog+=`  ${i+1}. ${f}\n`);
            const formsDetected = $('form').length;
            networkLog += `🔹 Forms Detected: ${formsDetected>0?formsDetected:'❌ لا يوجد'}\n`;
            networkLog += `🔹 Total Network Requests: ${jsFiles.length + cssFiles.length}\n`;
            await m.reply(networkLog);
            return;
        }

        // ---- جمع المفاتيح المخفية ----
        if(fileType==='hidden'){
            let allKeys = [];
            const keyPatterns = /(api[_-]?key|token|secret|access_key|client_id)[\s]*[:=]['"`][\w-]{8,}['"`]/gi;
            
            // HTML
            let match;
            while((match = keyPatterns.exec(htmlContent)) !== null) allKeys.push(`HTML: ${match[0]}`);

            // JS
            for(let f of jsFiles){
                let jsUrl = f.startsWith('http') ? f : `${parsedUrl.origin}${f.startsWith('/')?'':'/'}${f}`;
                try {
                    const jsRes = await axios.get(jsUrl, { headers:{'User-Agent':'Mozilla/5.0'} });
                    const jsData = jsRes.data.toString();
                    let m2;
                    while((m2 = keyPatterns.exec(jsData))!==null) allKeys.push(`${jsUrl}: ${m2[0]}`);
                } catch {}
            }

            if(allKeys.length===0) return m.reply('❌ لا يوجد مفاتيح مخفية');

            const tmpPath = path.join('./tmp', `hiddenKeys_${Date.now()}.txt`);
            if(!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
            fs.writeFileSync(tmpPath, allKeys.join('\n'), 'utf8');

            await conn.sendMessage(m.chat, { 
                document: fs.readFileSync(tmpPath), 
                fileName: `HiddenKeys.txt`, 
                mimetype: 'text/plain' 
            }, { quoted:m });

            fs.unlinkSync(tmpPath);
            return;
        }

        // ---- تحميل كل الملفات بدون zip (HTML + JS + CSS) ----
        if(fileType==='كل'){
            if(!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
            const outPath = path.join('./tmp', `all_files_${Date.now()}.txt`);
            let outData = `Collected from: ${urlInput}\nDate: ${new Date().toISOString()}\n\n`;

            outData += `--- INDEX.HTML ---\n\n${htmlContent}\n\n`;

            for(let i=0;i<jsFiles.length;i++){
                let f = jsFiles[i];
                let url = f.startsWith('http') ? f : `${parsedUrl.origin}${f.startsWith('/')?'':'/'}${f}`;
                outData += `--- JS FILE [${i+1}] : ${url} ---\n`;
                try {
                    const fr = await axios.get(url, { headers:{'User-Agent':'Mozilla/5.0'} , responseType:'text' });
                    outData += fr.data.toString() + '\n\n';
                } catch(e){
                    outData += `/* failed to fetch ${url} */\n\n`;
                }
            }

            for(let i=0;i<cssFiles.length;i++){
                let f = cssFiles[i];
                let url = f.startsWith('http') ? f : `${parsedUrl.origin}${f.startsWith('/')?'':'/'}${f}`;
                outData += `--- CSS FILE [${i+1}] : ${url} ---\n`;
                try {
                    const fr = await axios.get(url, { headers:{'User-Agent':'Mozilla/5.0'} , responseType:'text' });
                    outData += fr.data.toString() + '\n\n';
                } catch(e){
                    outData += `/* failed to fetch ${url} */\n\n`;
                }
            }

            fs.writeFileSync(outPath, outData, 'utf8');
            await conn.sendMessage(m.chat, { document: fs.readFileSync(outPath), fileName: path.basename(outPath), mimetype:'text/plain' }, { quoted:m });
            fs.unlinkSync(outPath);
            return;
        }

        // ---- بحث عن ملفات Node.js وملفات تحتوي API (crawl داخلي) ----
        if(fileType==='node'){
            if(!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
            const results = [];
            const discoveredAPIs = new Set();
            const visited = new Set();
            const queue = [urlInput];
            const maxDepth = 3;
            const maxFiles = 80;
            let fileCount = 0;

            const isNodeLike = (code) => {
                const indicators = [
                    /require\s*\(/i,
                    /module\.exports/i,
                    /exports\./i,
                    /process\.env/i,
                    /express\s*\(/i,
                    /app\.(get|post|put|delete|use)\s*\(/i,
                    /router\.(get|post|put|delete)\s*\(/i
                ];
                return indicators.some(rx => rx.test(code));
            };

            const extractEndpoints = (code, srcUrl) => {
                const endpoints = [];
                const routeRx = /(?:app|router)\.(get|post|put|delete|use)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
                let m;
                while((m = routeRx.exec(code)) !== null){
                    endpoints.push({ type: `route:${m[1]}`, path: m[2], source: srcUrl });
                }
                const apiUrlRx = /https?:\/\/[^\s'"]+\/api[^\s'"]*/gi;
                while((m = apiUrlRx.exec(code)) !== null){
                    endpoints.push({ type: 'url', url: m[0], source: srcUrl });
                }
                const relApiRx = /['"`](\/api[^\s'"`]*)['"`]/gi;
                while((m = relApiRx.exec(code)) !== null){
                    endpoints.push({ type: 'relative', path: m[1], source: srcUrl });
                }
                const plainApiRx = /(api[_-]?endpoint|apiUrl|API_URL)[\s:=]+['"`]([^'"`]+)['"`]/gi;
                while((m = plainApiRx.exec(code)) !== null){
                    endpoints.push({ type: 'var', name: m[1], value: m[2], source: srcUrl });
                }
                return endpoints;
            };

            while(queue.length && fileCount < maxFiles){
                const currentUrl = queue.shift();
                if(visited.has(currentUrl)) continue;
                visited.add(currentUrl);

                try {
                    const fr = await axios.get(currentUrl, { headers:{'User-Agent':'Mozilla/5.0'}, responseType:'text' });
                    const code = fr.data.toString();
                    const nodeLike = isNodeLike(code);
                    const endpoints = extractEndpoints(code, currentUrl);
                    results.push({ url: currentUrl, nodeLike, endpoints, snippet: code.slice(0,2000) });
                    endpoints.forEach(ep=>{
                        if(ep.url) discoveredAPIs.add(`${ep.type} | ${ep.url} | ${ep.source}`);
                        else if(ep.path) discoveredAPIs.add(`${ep.type} | ${ep.path} | ${ep.source}`);
                        else if(ep.value) discoveredAPIs.add(`${ep.type} | ${ep.value} | ${ep.source}`);
                    });
                    fileCount++;

                    // اكتشاف روابط JS إضافية
                    const $code = cheerio.load(code);
                    $code('script[src]').each((i, el)=>{
                        let src = $code(el).attr('src');
                        if(src && !src.startsWith('http')) src = `${parsedUrl.origin}${src.startsWith('/')?'':'/'}${src}`;
                        if(src && !visited.has(src)) queue.push(src);
                    });
                } catch(e){
                    results.push({ url: currentUrl, nodeLike:false, endpoints:[], error: e.message });
                }
            }

            const outPath = path.join('./tmp', `node_files_and_apis_${Date.now()}.txt`);
            let out = `Node/API extraction report for: ${urlInput}\nGenerated: ${new Date().toISOString()}\n\n`;
            out += `Discovered JS files and Node-like sources: ${results.length}\n\n`;
            for(let r of results){
                out += `--- FILE: ${r.url} ---\nNode-like: ${r.nodeLike}\n`;
                if(r.error) out += `Error: ${r.error}\n`;
                out += `Extracted endpoints count: ${r.endpoints.length}\n`;
                r.endpoints.forEach((ep, idx)=> {
                    out += `  ${idx+1}. [${ep.type}] ${ep.url?ep.url:ep.path?ep.path:(ep.value||JSON.stringify(ep))} (source: ${ep.source})\n`;
                });
                out += `\n/* SNIPPET START */\n${r.snippet}\n/* SNIPPET END */\n\n`;
            }
            out += `\n\n=== Aggregated APIs & endpoints ===\n`;
            if(discoveredAPIs.size===0) out += '❌ No APIs discovered\n';
            else Array.from(discoveredAPIs).forEach((s,i)=> out += `${i+1}. ${s}\n`);

            fs.writeFileSync(outPath, out, 'utf8');
            await conn.sendMessage(m.chat, { document: fs.readFileSync(outPath), fileName: path.basename(outPath), mimetype:'text/plain' }, { quoted:m });
            fs.unlinkSync(outPath);
            return;
        }

        return m.reply('❌ نوع الملف غير معروف. استخدم بدون خيارات لرؤية القائمة.');
    } catch(err){
        console.error(err);
        m.reply(`❌ حدث خطأ: ${err.message||err}`);
    }
};

handler.command=/^ريكوس$/i;
handler.tags=['tools'];
handler.help=['ريكوس <URL>'];
export default handler;