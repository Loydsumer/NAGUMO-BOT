import got from "got";
import cheerio from "cheerio";
import fetch from "node-fetch";

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let text;
    if (args.length >= 1) {
        text = args.slice(0).join(" ");
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text;
    } else throw "*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*خدمة البحث وتحميل الفروض و الدروس الدراسية 😁💛*\n*المرجو تقديم بعد الامر اسم درس لي البحث عليه، بفضل بالإنجليزي*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*";

    await m.reply("*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*انتظر جاري يا اخي.......📚*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*");

    if (command == "حمل-درس") {
        try {
            let res = await getAlloschool(text);
            await conn.sendFile(m.chat, res[0].url, res[0].title, "", m, false, {
                asDocument: true
            });
        } catch (e) {
            throw 'حدثت مشكلة، أعد المحاولة لاحقًا';
        }
    } else {
        try {
            let res = await searchAlloschool(text);

            const buttons = res.map(v => ({
                header: 'الدرس او الفــــــــرض',
                title: v.title,
                description: '',
                id: `.حمل-درس ${v.url}`
            }));

            conn.relayMessage(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                title: `*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*نتائج البحث عن الفروض و الدروس 😁*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*`
                            },
                            body: {
                                text: ''
                            },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: 'single_select',
                                        buttonParamsJson: JSON.stringify({
                                            title: 'نتائــــــج البحث عن الفرض..',
                                            sections: [
                                                {
                                                    title: 'قــــــــسم الدروس',
                                                    highlight_label: 'BY:OBITO',
                                                    rows: buttons
                                                }
                                            ]
                                        }),
                                        messageParamsJson: ''
                                    }
                                ]
                            }
                        }
                    }
                }
            }, {});
        } catch (e) {
            throw 'حدثت مشكلة، أعد المحاولة لاحقًا';
        }
    }
};

handler.help = ["اوبيتو"];
handler.tags = ["اوبيتو"];
handler.command = /^دروس|حمل-درس$/i;
export default handler;

/* New Line */
async function searchAlloschool(query) {
    try {
        const response = await got('https://www.alloschool.com/search?q=' + query);
        const $ = cheerio.load(response.body);
        const elements = $('ul.list-unstyled li');
        const result = elements.map((i, el) => {
            const title = $('a', el).text().trim();
            const url = $('a', el).attr('href');
            if (/^https?:\/\/www\.alloschool\.com\/element\/\d+$/.test(url)) {
                return {
                    index: i + 1,
                    title,
                    url
                };
            }
        }).get().filter(item => item);
        return result;
    } catch (error) {
        console.log(error);
    }
}

async function getAlloschool(url) {
    try {
        const pdfRegex = /\.pdf$/i;
        const response = await got(url);
        const $ = cheerio.load(response.body);
const results = [];
        $('a').each((i, link) => {
            const href = $(link).attr('href');
            const title = $(link).text();
            if (pdfRegex.test(href)) {
                results.push({
                    index: i + 1,
                    title,
                    url: href
                });
            }
        });

        return results;
    } catch (error) {
        console.log(error);
    }
}