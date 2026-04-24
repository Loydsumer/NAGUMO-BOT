import axios from 'axios';

const handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply('أين اسم المستخدم؟ استخدم الأمر "بحث-جيتهاب [اسم المستخدم]" أو "githubstalk [اسم المستخدم]"');
  }
  
  try {
    const res = await githubstalk(text);
    
    const caption = `
*اسم المستخدم :* ${res.username}
*اللقب :* ${res.nickname || 'لا يوجد'}
*السيرة الذاتية :* ${res.bio || 'لا يوجد'}
*الرقم التعريفي :* ${res.id}
*رقم العقد :* ${res.nodeId}
*النوع :* ${res.type}
*إداري :* ${res.admin ? 'نعم' : 'لا'}
*الشركة :* ${res.company || 'لا يوجد'}
*المدونة :* ${res.blog || 'لا يوجد'}
*الموقع :* ${res.location || 'لا يوجد'}
*البريد الإلكتروني :* ${res.email || 'لا يوجد'}
*المستودعات العامة :* ${res.public_repo}
*الملخصات العامة :* ${res.public_gists}
*المتابعون :* ${res.followers}
*المتابعة :* ${res.following}
*تم الإنشاء في :* ${res.created_at}
*تم التحديث في :* ${res.updated_at}
`;

    await conn.sendMessage(m.chat, { 
      image: { url: res.profile_pic }, 
      caption: caption + `\n> ⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐` 
    }, { quoted: m });

  } catch (e) {
    if (e.response && e.response.status === 404) {
      const suggestions = await getSuggestedUsers(text);
      if (suggestions.length > 0) {
        m.reply(`لم نجد نتيجة، هل تقصد أحد الأسماء التالية؟\n\n${suggestions.join('\n')}`);
      } else {
        m.reply('لم نجد نتيجة.');
      }
    } else {
      m.reply(`حدث خطأ: ${e.message}`);
    }
  }
};

async function githubstalk(user) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.github.com/users/' + user)
    .then(({ data }) => {
      const hasil = {
        username: data.login,
        nickname: data.name,
        bio: data.bio,
        id: data.id,
        nodeId: data.node_id,
        profile_pic: data.avatar_url,
        url: data.html_url,
        type: data.type,
        admin: data.site_admin,
        company: data.company,
        blog: data.blog,
        location: data.location,
        email: data.email,
        public_repo: data.public_repos,
        public_gists: data.public_gists,
        followers: data.followers,
        following: data.following,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      resolve(hasil);
    })
    .catch(reject);
  });
}

// الحصول على أسماء مشابهة إذا كان المستخدم أخطأ في الكتابة
async function getSuggestedUsers(user) {
  try {
    const res = await axios.get('https://api.github.com/search/users?q=' + user);
    if (res.data.items.length > 0) {
      return res.data.items.map(item => item.login);
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

// التوضيح للمستخدم مع مثال
handler.help = ['githubstalk', 'ghstalk', 'بحث-جيتهاب'];
handler.command = /^(ghstalk|githubstalk|مستخدم_جيت)$/i;
handler.tags = ['internet'];

handler.description = `
لتنفيذ البحث عن مستخدم على GitHub، استخدم الأمر التالي:
1. *githubstalk [اسم المستخدم]* أو *ghstalk [اسم المستخدم]* (بالإنجليزية)
2. *بحث-جيتهاب [اسم المستخدم]* (بالعربية)

مثال:
- *githubstalk octocat* أو *ghstalk octocat* 
- *بحث-جيتهاب octocat* (بالعربية)

سيتم استرجاع معلومات حول المستخدم من GitHub مثل اسم المستخدم، السيرة الذاتية، عدد المتابعين، وغيرها من البيانات الهامة.
`;

export default handler;