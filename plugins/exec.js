import syntaxerror from 'syntax-error';
import { format } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
import fetch from 'node-fetch';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);

const handler = async (m, _2) => {
  const { conn, usedPrefix, noPrefix, args, groupMetadata, command, isROwner } = _2;

  if (m.sender === conn.user.jid) return;
  if (!isROwner) return m.reply('⚠️ فقط المالك يمكنه استخدام هذا الأمر.');

  let _return;
  let _syntax = '';
  const _text = (/^=/.test(usedPrefix) ? 'return ' : '') + noPrefix;
  const old = m.exp * 1;

  try {
    let i = 15;
    const f = { exports: {} };

    // ✅ تعريف المصفوفة الخاصة بالأدمنات لتستخدمها بسهولة
    const push = {
      admin: global.db?.data?.settings?.[conn.user.jid]?.admin || []
    };

    const exec = new (async () => { }).constructor(
      'print',
      'm',
      'handler',
      'require',
      'conn',
      'Array',
      'process',
      'args',
      'groupMetadata',
      'module',
      'exports',
      'argument',
      'fetch',
      'push', // ✅ تمرير متغير push هنا
      _text
    );

    _return = await exec.call(
      conn,
      (...args) => {
        if (--i < 1) return;
        console.log(...args);
        return conn.reply(m.chat, format(...args), m);
      },
      m,
      handler,
      require,
      conn,
      CustomArray,
      process,
      args,
      groupMetadata,
      f,
      f.exports,
      [conn, _2],
      fetch,
      push // ✅ تمرير push هنا
    );

    // ✅ في حال تم تعديل المصفوفة، نحفظها فعلاً في قاعدة البيانات
    global.db.data.settings[conn.user.jid].admin = push.admin;

  } catch (e) {
    const err = syntaxerror(_text, 'Execution Function', {
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
      sourceType: 'module'
    });
    if (err) _syntax = '```' + err + '```\n\n';
    _return = e;
  } finally {
    conn.reply(m.chat, _syntax + format(_return), m);
    m.exp = old;
  }
};

handler.help = ['> ', '=> '];
handler.tags = ['advanced'];
handler.customPrefix = /=?>|~/;
handler.command = /(?:)/i;
export default handler;

class CustomArray extends Array {
  constructor(...args) {
    if (typeof args[0] == 'number') return super(Math.min(args[0], 10000));
    else return super(...args);
  }
}