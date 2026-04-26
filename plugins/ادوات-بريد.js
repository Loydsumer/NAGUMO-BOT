import axios from 'axios';

class TempMail {
  constructor() {
    this.cookie = null;
    this.baseUrl = 'https://tempmail.so';
  }

  async updateCookie(response) {
    if (response.headers['set-cookie']) {
      this.cookie = response.headers['set-cookie'].join('; ');
    }
  }

  async makeRequest(url) {
    const response = await axios({
      method: 'GET',
      url: url,
      headers: {
        'accept': 'application/json',
        'cookie': this.cookie || '',
        'referer': this.baseUrl + '/',
        'x-inbox-lifespan': '600',
        'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
        'sec-ch-ua-mobile': '?1'
      }
    });
    
    await this.updateCookie(response);
    return response;
  }

  async initialize() {
    const response = await axios.get(this.baseUrl, {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"'
      }
    });
    await this.updateCookie(response);
    return this;
  }

  async getInbox() {
    const url = `${this.baseUrl}/us/api/inbox?requestTime=${Date.now()}&lang=us`;
    const response = await this.makeRequest(url);
    return response.data;
  }

  async getMessage(messageId) {
    const url = `${this.baseUrl}/us/api/inbox/messagehtmlbody/${messageId}?requestTime=${Date.now()}&lang=us`;
    const response = await this.makeRequest(url);
    return response.data;
  }
}

async function createTempMail() {
  const mail = new TempMail();
  await mail.initialize();
  return mail;
}

const handler = async (m, { conn }) => {
  try {
    const mail = await createTempMail();
    const inbox = await mail.getInbox();
    
    if (!inbox.data?.name) {
      throw new Error('فشل في الحصول على البريد المؤقت');
    }

    const emailInfo = `بريد مؤقت\n\n*البريد الإلكتروني :* ${inbox.data.name}\n *ينتهي بعد :* 10 دقائق\nحالة البريد الوارد : ${inbox.data.inbox?.length || 0} رسائل\n\n> سيتم حذف البريد تلقائيًا بعد 10 دقائق`;
    await m.reply(emailInfo);

    const state = {
      processedMessages: new Set(),
      lastCheck: Date.now(),
      isRunning: true
    };

    const processInbox = async () => {
      if (!state.isRunning) return;
      
      try {
        const updatedInbox = await mail.getInbox();
        
        if (updatedInbox.data?.inbox?.length > 0) {
        
          const sortedMessages = [...updatedInbox.data.inbox].sort((a, b) => 
            new Date(b.date) - new Date(a.date));
          
          for (const message of sortedMessages) {
            if (!state.processedMessages.has(message.id)) {
              const messageDetail = await mail.getMessage(message.id);
              
              let cleanContent = messageDetail.data?.html 
                ? messageDetail.data.html.replace(/<[^>]*>?/gm, '').trim() 
                : 'لا يوجد نص';

              const messageInfo = `_رسالة جديدة عندك_\n\nمن : ${message.from || 'مجهول'}\n*الموضوع :* ${message.subject || 'لا يوجد موضوع'}\n\n*المحتوى :*\n${cleanContent}`;
              
              await conn.sendMessage(m.chat, { text: messageInfo }, { quoted: m });
              state.processedMessages.add(message.id);
            }
          }
        }
      } catch (error) {
        console.error('خطأ:', error);
      }
    };

    await processInbox();

    const checkInterval = setInterval(processInbox, 10000);

    setTimeout(() => {
      state.isRunning = false;
      clearInterval(checkInterval);
      m.reply('تم حذف البريد بعد 10 دقائق');
    }, 600000);

  } catch (error) {
    m.reply(`خطأ: ${error.message}`);
  }
};

// التوضيح حول كيفية استخدام الأمر
handler.help = ['بريد', 'tempmail'];
handler.command = ['بريد', 'tempmail'];
handler.tags = ['أدوات'];

handler.description = "يتيح لك إنشاء بريد إلكتروني مؤقت واستلام الرسائل عليه. بعد 10 دقائق سيتم حذف البريد تلقائيًا.\n\n**مثال على الاستخدام**: عندما تكتب 'بريد'، سيقوم البوت بإنشاء بريد مؤقت وإخبارك بحالة الرسائل الواردة.\n🧞‍♀️";

// توقيع في الرسائل
handler.reply = (message) => {
  return `${message}\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`;
};

export default handler;