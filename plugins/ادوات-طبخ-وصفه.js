import axios from 'axios';
import cheerio from 'cheerio';

class CookpadScraper {
  constructor(searchTerm) {
    this.searchTerm = searchTerm;
    this.baseUrl = 'https://cookpad.com/id/cari/';
  }

  async fetchSearchResults(page = 1) {
    const url = `${this.baseUrl}${this.searchTerm}?page=${page}`;
    const response = await axios.get(url);
    return cheerio.load(response.data);
  }

  async extractRecipeLinks($) {
    const links = [];
    $('a.block-link__main').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        links.push(`https://cookpad.com${href}`);
      }
    });
    if (links.length === 0 && $('.text-cookpad-14.xs\\:text-cookpad-20.font-semibold').text().includes('Tidak dapat menemukan resep?')) {
      throw new Error('❌ لم يتم العثور على وصفة لهذا البحث.');
    }
    return links;
  }

  async fetchRecipePage(url) {
    const response = await axios.get(url);
    return cheerio.load(response.data);
  }

  async extractRecipeDetails($) {
    const title = $('h1').text().trim();
    const mainImage = $('img[alt^="Foto resep"]').attr('src');
    const cookingTime = $('.flex.flex-wrap .mise-icon-text').first().text().trim();
    const serving = $('.flex.flex-wrap .mise-icon-text').last().text().trim();

    const ingredients = [];
    $('#ingredients .ingredient-list ol li').each((i, el) => {
      if ($(el).hasClass('font-semibold')) {
        const subheading = $(el).find('span').text().trim();
        ingredients.push(`*${subheading}*`);
      } else {
        const quantity = $(el).find('bdi').text().trim();
        const ingredient = $(el).find('span').text().trim();
        ingredients.push(`- ${quantity} ${ingredient}`);
      }
    });

    const steps = [];
    $('ol.list-none li.step').each((i, el) => {
      const stepNumber = $(el).find('.flex-shrink-0 .text-cookpad-14').text().trim();
      const description = $(el).find('div[dir="auto"] p').text().trim();
      steps.push(`${stepNumber}. ${description}`);
    });

    return {
      title,
      mainImage,
      cookingTime,
      serving,
      ingredients: ingredients.join('\n'),
      steps: steps.join('\n')
    };
  }

  async scrapeRecipes() {
    try {
      const $ = await this.fetchSearchResults();
      const links = await this.extractRecipeLinks($);

      if (links.length === 0) {
        throw new Error('❌ لم يتم العثور على وصفة لهذا البحث.');
      }

      const recipePage = await this.fetchRecipePage(links[0]);
      return await this.extractRecipeDetails(recipePage);
    } catch (error) {
      return { error: error.message };
    }
  }
}

let handler = async (m, { text, conn, command }) => {
  if (!text) {
    let usage = `🍳 *كيفية البحث عن وصفات الطبخ:*\n\n` +
                `🔎 *يرجى البحث باللغة الإنجليزية فقط!*\n` +
                `🚫 *مثال خاطئ:* .وصفة بيتزا\n` +
                `✅ *مثال صحيح:* .وصفة Pizza\n\n` +
                `📌 *أمثلة لاستخدام الأوامر:*\n` +
                `  - .وصفة Pancakes\n` +
                `  - .وصفه Spaghetti\n` +
                `  - .طبخ Fried Chicken\n\n` +
                `📩 *ملاحظة:* تأكد من إدخال الاسم باللغة الإنجليزية للحصول على نتائج صحيحة. 🧞‍♀️`;

    return m.reply(usage);
  }

  // التحقق مما إذا كان الإدخال يحتوي على أحرف عربية
  if (/[ء-ي]/.test(text)) {
    return m.reply('⚠️ *يرجى البحث عن الوصفات باللغة الإنجليزية فقط!* مثال: .وصفة Burger 🍔');
  }

  let scraper = new CookpadScraper(text);
  let recipe = await scraper.scrapeRecipes();

  if (recipe.error) return m.reply(recipe.error);

  let caption = `*🍽️ ${recipe.title}*\n\n` +
                `⏳ *وقت الطهي:* ${recipe.cookingTime}\n` +
                `🍽️ *عدد الحصص:* ${recipe.serving}\n\n` +
                `📝 *المكونات:*\n${recipe.ingredients}\n\n` +
                `👨‍🍳 *خطوات التحضير:*\n${recipe.steps}`;

  if (recipe.mainImage) {
    conn.sendMessage(m.chat, { image: { url: recipe.mainImage }, caption }, { quoted: m });
  } else {
    m.reply(caption);
  }
};

// تخصيص الأوامر
handler.command = ['وصفة', 'وصفه', 'طبخ']
handler.tags = ['search', 'cooking']
handler.limit = false;

// التوقيع
handler.footer = 'ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ'

export default handler;