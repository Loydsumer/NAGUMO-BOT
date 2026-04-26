// أمر المتجر - shop.js
let handler = async (m, { conn, usedPrefix, command, args }) => {
    try {
        let user = global.db.data.users[m.sender]
        if (!user) {
            global.db.data.users[m.sender] = {
                money: 1000,
                bank: 0,
                exp: 0,
                level: 1,
                inventory: {}
            }
            user = global.db.data.users[m.sender]
        }

        // تأكد من وجود inventory
        if (!user.inventory) user.inventory = {}

        // المتجر مع 300 عنصر
        const shopItems = {
            // 🍎 الأطعمة والمشروبات (50 عنصر)
            'تفاح': { price: 50, emoji: '🍎', category: 'طعام', description: 'تفاح طازج وصحي' },
            'موز': { price: 30, emoji: '🍌', category: 'طعام', description: 'موز طازج' },
            'عنب': { price: 80, emoji: '🍇', category: 'طعام', description: 'عنب لذيذ' },
            'برتقال': { price: 40, emoji: '🍊', category: 'طعام', description: 'برتقال منعش' },
            'فراولة': { price: 100, emoji: '🍓', category: 'طعام', description: 'فراولة حلوة' },
            'بطيخ': { price: 150, emoji: '🍉', category: 'طعام', description: 'بطيخ منعش' },
            'أناناس': { price: 120, emoji: '🍍', category: 'طعام', description: 'أناناس استوائي' },
            'ليمون': { price: 25, emoji: '🍋', category: 'طعام', description: 'ليمون حامض' },
            'خوخ': { price: 60, emoji: '🍑', category: 'طعام', description: 'خوخ ناضج' },
            'كرز': { price: 90, emoji: '🍒', category: 'طعام', description: 'كرز أحمر' },
            'مانجو': { price: 110, emoji: '🥭', category: 'طعام', description: 'مانجو استوائية' },
            'كمثرى': { price: 45, emoji: '🍐', category: 'طعام', description: 'كمثرى طازجة' },
            'بيتزا': { price: 200, emoji: '🍕', category: 'طعام', description: 'بيتزا لذيذة' },
            'برجر': { price: 180, emoji: '🍔', category: 'طعام', description: 'برجر شهي' },
            'بطاطس': { price: 70, emoji: '🍟', category: 'طعام', description: 'بطاطس مقلية' },
            'ساندويتش': { price: 120, emoji: '🥪', category: 'طعام', description: 'ساندويتش طازج' },
            'تاكو': { price: 150, emoji: '🌮', category: 'طعام', description: 'تاكو مكسيكي' },
            'بوريتو': { price: 160, emoji: '🌯', category: 'طعام', description: 'بوريتو كبير' },
            'سوشي': { price: 300, emoji: '🍣', category: 'طعام', description: 'سوشي ياباني' },
            'رامين': { price: 180, emoji: '🍜', category: 'طعام', description: 'رامين ساخن' },
            'سباغيتي': { price: 140, emoji: '🍝', category: 'طعام', description: 'سباغيتي إيطالية' },
            'دجاج': { price: 220, emoji: '🍗', category: 'طعام', description: 'دجاج مشوي' },
            'لحم': { price: 350, emoji: '🥩', category: 'طعام', description: 'لحم طازج' },
            'سمك': { price: 280, emoji: '🐟', category: 'طعام', description: 'سمك مشوي' },
            'جمبري': { price: 400, emoji: '🦐', category: 'طعام', description: 'جمبري طازج' },
            'سلطة': { price: 90, emoji: '🥗', category: 'طعام', description: 'سلطة صحية' },
            'فطيرة': { price: 130, emoji: '🥧', category: 'طعام', description: 'فطيرة حلوة' },
            'كيك': { price: 250, emoji: '🍰', category: 'طعام', description: 'كيك شوكولاتة' },
            'دونات': { price: 80, emoji: '🍩', category: 'طعام', description: 'دونات محلاة' },
            'بسكويت': { price: 60, emoji: '🍪', category: 'طعام', description: 'بسكويت شوكولاتة' },
            'آيس كريم': { price: 120, emoji: '🍦', category: 'طعام', description: 'آيس كريم بارد' },
            'شوكولاتة': { price: 70, emoji: '🍫', category: 'طعام', description: 'شوكولاتة لذيذة' },
            'حلوى': { price: 40, emoji: '🍬', category: 'طعام', description: 'حلوى ملونة' },
            'علكة': { price: 20, emoji: '🍭', category: 'طعام', description: 'علكة بنكهات' },
            'عسل': { price: 180, emoji: '🍯', category: 'طعام', description: 'عسل طبيعي' },
            'خبز': { price: 50, emoji: '🍞', category: 'طعام', description: 'خبز طازج' },
            'جبن': { price: 120, emoji: '🧀', category: 'طعام', description: 'جبن شيدر' },
            'زبادي': { price: 60, emoji: '🥛', category: 'طعام', description: 'زبادي طازج' },
            'حليب': { price: 40, emoji: '🥛', category: 'طعام', description: 'حليب بارد' },
            'عصير': { price: 70, emoji: '🧃', category: 'طعام', description: 'عصير طازج' },
            'قهوة': { price: 100, emoji: '☕', category: 'طعام', description: 'قهوة ساخنة' },
            'شاي': { price: 60, emoji: '🍵', category: 'طعام', description: 'شاي عربي' },
            'مشروب غازي': { price: 50, emoji: '🥤', category: 'طعام', description: 'مشروب منعش' },
            'عصير برتقال': { price: 80, emoji: '🧃', category: 'طعام', description: 'عصير برتقال طازج' },
            'ميلك شيك': { price: 150, emoji: '🥤', category: 'طعام', description: 'ميلك شيك شوكولاتة' },
            'سموذي': { price: 130, emoji: '🥤', category: 'طعام', description: 'سموذي فواكه' },
            'ماء': { price: 10, emoji: '💧', category: 'طعام', description: 'ماء نقي' },
            'مشروب طاقة': { price: 120, emoji: '⚡', category: 'طعام', description: 'مشروب طاقة' },

            // 🎮 الأسلحة والأدوات (50 عنصر)
            'سيف خشبي': { price: 500, emoji: '⚔️', category: 'أسلحة', description: 'سيف خشبي للمبتدئين' },
            'سيف حديد': { price: 1500, emoji: '🗡️', category: 'أسلحة', description: 'سيف حديدي قوي' },
            'سيف الماس': { price: 5000, emoji: '💎', category: 'أسلحة', description: 'سيف ماسي نادر' },
            'سيف التنين': { price: 10000, emoji: '🐉', category: 'أسلحة', description: 'سيف أسطوري' },
            'قوس خشبي': { price: 800, emoji: '🏹', category: 'أسلحة', description: 'قوس خشبي' },
            'قوس حديد': { price: 2000, emoji: '🏹', category: 'أسلحة', description: 'قوس حديدي' },
            'سهم خشبي': { price: 20, emoji: '➡️', category: 'أسلحة', description: 'سهم خشبي' },
            'سهم حديد': { price: 50, emoji: '⬆️', category: 'أسلحة', description: 'سهم حديدي' },
            'سهم ماس': { price: 200, emoji: '💎', category: 'أسلحة', description: 'سهم ماسي' },
            'فأس خشبي': { price: 400, emoji: '🪓', category: 'أسلحة', description: 'فأس خشبي' },
            'فأس حديد': { price: 1200, emoji: '🪓', category: 'أسلحة', description: 'فأس حديدي' },
            'فأس ماس': { price: 4000, emoji: '💎', category: 'أسلحة', description: 'فأس ماسي' },
            'بلطة': { price: 600, emoji: '🪓', category: 'أسلحة', description: 'بلطة حادة' },
            'رمح': { price: 900, emoji: '🔱', category: 'أسلحة', description: 'رمح طويل' },
            'سلسال': { price: 300, emoji: '⛓️', category: 'أسلحة', description: 'سلسال حديدي' },
            'درع خشبي': { price: 700, emoji: '🛡️', category: 'أسلحة', description: 'درع خشبي' },
            'درع حديد': { price: 1800, emoji: '🛡️', category: 'أسلحة', description: 'درع حديدي' },
            'درع ماس': { price: 6000, emoji: '💎', category: 'أسلحة', description: 'درع ماسي' },
            'خوذة': { price: 500, emoji: '⛑️', category: 'أسلحة', description: 'خوذة واقية' },
            'قفازات': { price: 300, emoji: '🥊', category: 'أسلحة', description: 'قفازات قتالية' },
            'معول خشبي': { price: 200, emoji: '⛏️', category: 'أدوات', description: 'معول خشبي' },
            'معول حديد': { price: 600, emoji: '⛏️', category: 'أدوات', description: 'معول حديدي' },
            'معول ماس': { price: 2000, emoji: '💎', category: 'أدوات', description: 'معول ماسي' },
            'منجل': { price: 350, emoji: '🔪', category: 'أدوات', description: 'منجل حاد' },
            'سكين': { price: 150, emoji: '🔪', category: 'أدوات', description: 'سكين صغير' },
            'مطرقة': { price: 450, emoji: '🔨', category: 'أدوات', description: 'مطرقة ثقيلة' },
            'مفك': { price: 100, emoji: '🪛', category: 'أدوات', description: 'مفك براغي' },
            'كماشة': { price: 120, emoji: '🛠️', category: 'أدوات', description: 'كماشة متعددة' },
            'منشار': { price: 800, emoji: '🪚', category: 'أدوات', description: 'منشار كهربائي' },
            'لاصق': { price: 50, emoji: '🩹', category: 'أدوات', description: 'لاصق قوي' },
            'حبل': { price: 80, emoji: '🪢', category: 'أدوات', description: 'حبل متين' },
            'سلم': { price: 400, emoji: '🪜', category: 'أدوات', description: 'سلم خشبي' },
            'صندوق أدوات': { price: 1500, emoji: '🧰', category: 'أدوات', description: 'صندوق أدوات كامل' },
            'مصباح': { price: 200, emoji: '💡', category: 'أدوات', description: 'مصباح يدوي' },
            'بطارية': { price: 100, emoji: '🔋', category: 'أدوات', description: 'بطارية قوية' },
            'ساعة': { price: 300, emoji: '⌚', category: 'أدوات', description: 'ساعة يد' },
            'نظارات': { price: 250, emoji: '👓', category: 'أدوات', description: 'نظارات شمسية' },
            'كاميرا': { price: 1200, emoji: '📷', category: 'أدوات', description: 'كاميرا رقمية' },
            'تلسكوب': { price: 800, emoji: '🔭', category: 'أدوات', description: 'تلسكوب فلكي' },
            'ميكروسكوب': { price: 1500, emoji: '🔬', category: 'أدوات', description: 'ميكروسكوب علمي' },
            'ميزان': { price: 300, emoji: '⚖️', category: 'أدوات', description: 'ميزان دقيق' },
            'مغناطيس': { price: 150, emoji: '🧲', category: 'أدوات', description: 'مغناطيس قوي' },
            'بوصلة': { price: 180, emoji: '🧭', category: 'أدوات', description: 'بوصلة ملاحية' },
            'خريطة': { price: 200, emoji: '🗺️', category: 'أدوات', description: 'خريطة العالم' },
            'مفتاح': { price: 70, emoji: '🔑', category: 'أدوات', description: 'مفتاح قديم' },
            'قفل': { price: 90, emoji: '🔒', category: 'أدوات', description: 'قفل حديدي' },

            // 🎒 المعدات والملابس (50 عنصر)
            'حقيبة ظهر': { price: 400, emoji: '🎒', category: 'ملابس', description: 'حقيبة ظهر كبيرة' },
            'حقيبة يد': { price: 300, emoji: '👜', category: 'ملابس', description: 'حقيبة يد أنيقة' },
            'محفظة': { price: 200, emoji: '👛', category: 'ملابس', description: 'محفظة جلدية' },
            'حزام': { price: 150, emoji: '⛓️', category: 'ملابس', description: 'حزام جلد' },
            'ساعة ذهبية': { price: 2000, emoji: '⌚', category: 'ملابس', description: 'ساعة ذهبية فاخرة' },
            'قلادة': { price: 800, emoji: '📿', category: 'ملابس', description: 'قلادة ذهبية' },
            'خاتم': { price: 600, emoji: '💍', category: 'ملابس', description: 'خاتم ماسي' },
            'أقراط': { price: 500, emoji: '👂', category: 'ملابس', description: 'أقراط لامعة' },
            'تيشرت': { price: 100, emoji: '👕', category: 'ملابس', description: 'تيشرت قطني' },
            'جينز': { price: 300, emoji: '👖', category: 'ملابس', description: 'جينز أزرق' },
            'بدلة': { price: 1500, emoji: '👔', category: 'ملابس', description: 'بدلة رسمية' },
            'ربطة عنق': { price: 200, emoji: '👔', category: 'ملابس', description: 'ربطة عنق حرير' },
            'فستان': { price: 800, emoji: '👗', category: 'ملابس', description: 'فستان أنيق' },
            'تنورة': { price: 400, emoji: '👗', category: 'ملابس', description: 'تنورة قصيرة' },
            'بلوزة': { price: 250, emoji: '👚', category: 'ملابس', description: 'بلوزة نسائية' },
            'سترة': { price: 600, emoji: '🧥', category: 'ملابس', description: 'سترة شتوية' },
            'معطف': { price: 1200, emoji: '🧥', category: 'ملابس', description: 'معطف طويل' },
            'كنزة': { price: 350, emoji: '🧶', category: 'ملابس', description: 'كنزة صوف' },
            'قبعة': { price: 120, emoji: '🧢', category: 'ملابس', description: 'قبعة بيسبول' },
            'طاقية': { price: 80, emoji: '🧢', category: 'ملابس', description: 'طاقية صوف' },
            'نظارات شمس': { price: 200, emoji: '🕶️', category: 'ملابس', description: 'نظارات شمسية' },
            'وشاح': { price: 150, emoji: '🧣', category: 'ملابس', description: 'وشاح صوف' },
            'قفازات': { price: 100, emoji: '🧤', category: 'ملابس', description: 'قفازات شتوية' },
            'جوارب': { price: 50, emoji: '🧦', category: 'ملابس', description: 'جوارب قطن' },
            'حذاء رياضي': { price: 400, emoji: '👟', category: 'ملابس', description: 'حذاء رياضي' },
            'حذاء رسمي': { price: 600, emoji: '👞', category: 'ملابس', description: 'حذاء رسمي' },
            'صنادل': { price: 200, emoji: '👡', category: 'ملابس', description: 'صنادل صيفية' },
            'بوت': { price: 800, emoji: '👢', category: 'ملابس', description: 'بوت شتوي' },
            'كعب عالي': { price: 500, emoji: '👠', category: 'ملابس', description: 'كعب عالي' },
            'نعال': { price: 60, emoji: '🩴', category: 'ملابس', description: 'نعال منزلية' },
            'حقيبة سفر': { price: 1000, emoji: '🧳', category: 'ملابس', description: 'حقيبة سفر كبيرة' },
            'مظلة': { price: 180, emoji: '☂️', category: 'ملابس', description: 'مظلة واقية' },
            'ساعة حائط': { price: 400, emoji: '🕰️', category: 'ملابس', description: 'ساعة حائط قديمة' },
            'مرآة': { price: 120, emoji: '🪞', category: 'ملابس', description: 'مرآة كبيرة' },
            'مشط': { price: 30, emoji: '🪮', category: 'ملابس', description: 'مشط شعر' },
            'فرشاة شعر': { price: 40, emoji: '🪮', category: 'ملابس', description: 'فرشاة شعر' },
            'ماسكارا': { price: 150, emoji: '💄', category: 'ملابس', description: 'ماسكارا سوداء' },
            'أحمر شفاه': { price: 120, emoji: '💄', category: 'ملابس', description: 'أحمر شفاه' },
            'عطر': { price: 600, emoji: '💨', category: 'ملابس', description: 'عطر فاخر' },
            'كريم': { price: 80, emoji: '🧴', category: 'ملابس', description: 'كريم ترطيب' },
            'صابون': { price: 20, emoji: '🧼', category: 'ملابس', description: 'صابون طبيعي' },
            'شامبو': { price: 70, emoji: '🧴', category: 'ملابس', description: 'شامبو للشعر' },
            'معجون أسنان': { price: 40, emoji: '🦷', category: 'ملابس', description: 'معجون أسنان' },
            'فرشاة أسنان': { price: 25, emoji: '🪥', category: 'ملابس', description: 'فرشاة أسنان' },
            'منشفة': { price: 60, emoji: '🛀', category: 'ملابس', description: 'منشفة ناعمة' },
            'مقص': { price: 90, emoji: '✂️', category: 'ملابس', description: 'مقص حاد' },
            'إبرة': { price: 10, emoji: '🪡', category: 'ملابس', description: 'إبرة وخيط' },

            // 🏠 المنزل والديكور (50 عنصر)
            'كرسي': { price: 300, emoji: '🪑', category: 'منزل', description: 'كرسي مريح' },
            'طاولة': { price: 500, emoji: '🪑', category: 'منزل', description: 'طاولة خشبية' },
            'سرير': { price: 1200, emoji: '🛏️', category: 'منزل', description: 'سرير مريح' },
            'وسادة': { price: 80, emoji: '🛏️', category: 'منزل', description: 'وسادة ناعمة' },
            'بطانية': { price: 150, emoji: '🛏️', category: 'منزل', description: 'بطانية دافئة' },
            'سجادة': { price: 400, emoji: '🧶', category: 'منزل', description: 'سجادة فارسية' },
            'ستائر': { price: 350, emoji: '🪟', category: 'منزل', description: 'ستائر قطن' },
            'مصباح طاولة': { price: 200, emoji: '💡', category: 'منزل', description: 'مصباح طاولة' },
            'شمعة': { price: 30, emoji: '🕯️', category: 'منزل', description: 'شمعة معطرة' },
            'مزهرية': { price: 120, emoji: '🏺', category: 'منزل', description: 'مزهرية زجاج' },
            'زهرة': { price: 50, emoji: '💐', category: 'منزل', description: 'زهرة طبيعية' },
            'نبات': { price: 100, emoji: '🌿', category: 'منزل', description: 'نبات منزلي' },
            'شجرة': { price: 300, emoji: '🌳', category: 'منزل', description: 'شجرة صغيرة' },
            'تلفزيون': { price: 2000, emoji: '📺', category: 'منزل', description: 'تلفزيون ذكي' },
            'راديو': { price: 300, emoji: '📻', category: 'منزل', description: 'راديو قديم' },
            'كمبيوتر': { price: 3000, emoji: '💻', category: 'منزل', description: 'كمبيوتر محمول' },
            'هاتف': { price: 1500, emoji: '📱', category: 'منزل', description: 'هاتف ذكي' },
            'تابلت': { price: 1800, emoji: '📱', category: 'منزل', description: 'تابلت حديث' },
            'طابعة': { price: 800, emoji: '🖨️', category: 'منزل', description: 'طابعة ليزر' },
            'ماسح ضوئي': { price: 600, emoji: '📷', category: 'منزل', description: 'ماسح ضوئي' },
            'ميكروويف': { price: 700, emoji: '🍽️', category: 'منزل', description: 'ميكروويف' },
            'ثلاجة': { price: 1500, emoji: '🍽️', category: 'منزل', description: 'ثلاجة كبيرة' },
            'غسالة': { price: 1200, emoji: '🧼', category: 'منزل', description: 'غسالة ملابس' },
            'مجفف': { price: 1000, emoji: '👕', category: 'منزل', description: 'مجفف ملابس' },
            'مكواة': { price: 300, emoji: '👔', category: 'منزل', description: 'مكواة ملابس' },
            'مكنسة': { price: 400, emoji: '🧹', category: 'منزل', description: 'مكنسة كهربائية' },
            'ممسحة': { price: 80, emoji: '🧹', category: 'منزل', description: 'ممسحة أرضية' },
            'سلة مهملات': { price: 50, emoji: '🗑️', category: 'منزل', description: 'سلة مهملات' },
            'خزانة': { price: 800, emoji: '🚪', category: 'منزل', description: 'خزانة ملابس' },
            'رف': { price: 200, emoji: '📚', category: 'منزل', description: 'رف كتب' },
            'درج': { price: 150, emoji: '🗄️', category: 'منزل', description: 'درج تخزين' },
            'صندوق': { price: 60, emoji: '📦', category: 'منزل', description: 'صندوق تخزين' },
            'ساعة حائط': { price: 250, emoji: '🕰️', category: 'منزل', description: 'ساعة حائط' },
            'مرآة حائط': { price: 300, emoji: '🪞', category: 'منزل', description: 'مرآة حائط كبيرة' },
            'لوحة فنية': { price: 500, emoji: '🖼️', category: 'منزل', description: 'لوحة فنية' },
            'تمثال': { price: 400, emoji: '🗿', category: 'منزل', description: 'تمثال زخرفي' },
            'ساعة رمل': { price: 180, emoji: '⏳', category: 'منزل', description: 'ساعة رملية' },
            'كرة بلورية': { price: 600, emoji: '🔮', category: 'منزل', description: 'كرة بلورية' },
            'مجسم عالمي': { price: 800, emoji: '🌍', category: 'منزل', description: 'مجسم الكرة الأرضية' },
            'خريطة نجمية': { price: 350, emoji: '🌌', category: 'منزل', description: 'خريطة النجوم' },
            'ألعاب نارية': { price: 200, emoji: '🎆', category: 'منزل', description: 'ألعاب نارية' },
            'بالونات': { price: 40, emoji: '🎈', category: 'منزل', description: 'بالونات ملونة' },
            'شريط': { price: 20, emoji: '🎀', category: 'منزل', description: 'شريط زينة' },
            'أضواء': { price: 150, emoji: '💡', category: 'منزل', description: 'أضواء ملونة' },
            'شموع معطرة': { price: 100, emoji: '🕯️', category: 'منزل', description: 'شموع معطرة' },
            'معطر جو': { price: 120, emoji: '💨', category: 'منزل', description: 'معطر جو' },
            'ساعة رقمية': { price: 180, emoji: '⏰', category: 'منزل', description: 'ساعة رقمية' },
            'منبه': { price: 90, emoji: '⏰', category: 'منزل', description: 'منبه صوتي' },

            // 🎯 أدوات الترفيه (50 عنصر)
            'كرة قدم': { price: 200, emoji: '⚽', category: 'ترفيه', description: 'كرة قدم رسمية' },
            'كرة سلة': { price: 180, emoji: '🏀', category: 'ترفيه', description: 'كرة سلة' },
            'كرة طائرة': { price: 150, emoji: '🏐', category: 'ترفيه', description: 'كرة طائرة' },
            'كرة تنس': { price: 50, emoji: '🎾', category: 'ترفيه', description: 'كرة تنس' },
            'مضرب تنس': { price: 300, emoji: '🎾', category: 'ترفيه', description: 'مضرب تنس' },
            'مضرب بيسبول': { price: 250, emoji: '⚾', category: 'ترفيه', description: 'مضرب بيسبول' },
            'عصا هوكي': { price: 280, emoji: '🏒', category: 'ترفيه', description: 'عصا هوكي' },
            'زحليقة': { price: 400, emoji: '🛝', category: 'ترفيه', description: 'زحليقة أطفال' },
            'أرجوحة': { price: 350, emoji: '🛝', category: 'ترفيه', description: 'أرجوحة حديقة' },
            'دراجة': { price: 800, emoji: '🚲', category: 'ترفيه', description: 'دراجة هوائية' },
            'سكوتر': { price: 500, emoji: '🛴', category: 'ترفيه', description: 'سكوتر كهربائي' },
            'زلاجة': { price: 300, emoji: '🛷', category: 'ترفيه', description: 'زلاجة ثلج' },
            'تزلج': { price: 600, emoji: '⛸️', category: 'ترفيه', description: 'أحذية تزلج' },
            'سنو بورد': { price: 700, emoji: '🏂', category: 'ترفيه', description: 'لوح تزلج' },
            'مظلة': { price: 400, emoji: '🪂', category: 'ترفيه', description: 'مظلة قفز' },
            'قارب': { price: 2000, emoji: '🚤', category: 'ترفيه', description: 'قارب صغير' },
            'مجداف': { price: 150, emoji: '🛶', category: 'ترفيه', description: 'مجداف قارب' },
            'صنارة': { price: 120, emoji: '🎣', category: 'ترفيه', description: 'صنارة صيد' },
            'طعم': { price: 30, emoji: '🪱', category: 'ترفيه', description: 'طعم صيد' },
            'كاميرا تصوير': { price: 1500, emoji: '📷', category: 'ترفيه', description: 'كاميرا احترافية' },
            'عدسة': { price: 800, emoji: '📸', category: 'ترفيه', description: 'عدسة كاميرا' },
            'حامل ثلاثي': { price: 300, emoji: '📷', category: 'ترفيه', description: 'حامل ثلاثي' },
            'ميكروفون': { price: 400, emoji: '🎤', category: 'ترfيه', description: 'ميكروفون احترافي' },
            'سماعات': { price: 250, emoji: '🎧', category: 'ترفيه', description: 'سماعات رأس' },
            'مكبر صوت': { price: 600, emoji: '🔊', category: 'ترفيه', description: 'مكبر صوت' },
            'جيتار': { price: 800, emoji: '🎸', category: 'ترفيه', description: 'جيتار كهربائي' },
            'بيانو': { price: 3000, emoji: '🎹', category: 'ترفيه', description: 'بيانو كبير' },
            'كمان': { price: 1200, emoji: '🎻', category: 'ترفيه', description: 'كمان كلاسيكي' },
            'طبلة': { price: 500, emoji: '🥁', category: 'ترفيه', description: 'طبلة إيقاع' },
            'بوق': { price: 400, emoji: '🎺', category: 'ترفيه', description: 'بوق نحاسي' },
            'ساكسفون': { price: 1500, emoji: '🎷', category: 'ترفيه', description: 'ساكسفون' },
            'ناي': { price: 200, emoji: '🎵', category: 'ترفيه', description: 'ناي خشبي' },
            'مزمار': { price: 180, emoji: '🎶', category: 'ترفيه', description: 'مزمار' },
            'أوراق لعب': { price: 40, emoji: '🃏', category: 'ترفيه', description: 'أوراق لعب' },
            'نرد': { price: 20, emoji: '🎲', category: 'ترفيه', description: 'نرد ألعاب' },
            'شطرنج': { price: 150, emoji: '♟️', category: 'ترفيه', description: 'لعبة شطرنج' },
            'داما': { price: 80, emoji: '⚫', category: 'ترفيه', description: 'لعبة dama' },
            'بازل': { price: 120, emoji: '🧩', category: 'ترfيه', description: 'بازل أطفال' },
            'ليجو': { price: 300, emoji: '🧱', category: 'ترفيه', description: 'مكعبات lego' },
            'دمية': { price: 100, emoji: '🧸', category: 'ترفيه', description: 'دمية محشوة' },
            'سيارة لعبة': { price: 80, emoji: '🚗', category: 'ترفيه', description: 'سيارة لعبة' },
            'قطار': { price: 200, emoji: '🚂', category: 'ترفيه', description: 'قطار لعبة' },
            'طائرة': { price: 150, emoji: '✈️', category: 'ترفيه', description: 'طائرة لعبة' },
            'روبوت': { price: 600, emoji: '🤖', category: 'ترفيه', description: 'روبوت تحكم' },
            'درون': { price: 1200, emoji: '🚁', category: 'ترفيه', description: 'درون طائر' },
            'تلسكوب': { price: 500, emoji: '🔭', category: 'ترفيه', description: 'تلسكوب فلكي' },
            'مجهر': { price: 800, emoji: '🔬', category: 'ترفيه', description: 'مجهر علمي' },
            'كتاب': { price: 60, emoji: '📚', category: 'ترفيه', description: 'كتاب ممتع' },
            'مجلة': { price: 30, emoji: '📰', category: 'ترفيه', description: 'مجلة أسبوعية' },
            'جريدة': { price: 10, emoji: '🗞️', category: 'ترفيه', description: 'جريدة يومية' },

            // 💎 المجوهرات والتحف (50 عنصر)
            'خاتم ذهب': { price: 2000, emoji: '💍', category: 'مجوهرات', description: 'خاتم ذهب عيار 24' },
            'سلسال ذهب': { price: 1500, emoji: '📿', category: 'مجوهرات', description: 'سلسال ذهب' },
            'أقراط ذهب': { price: 1200, emoji: '👂', category: 'مجوهرات', description: 'أقراط ذهب' },
            'سوار ذهب': { price: 1800, emoji: '📿', category: 'مجوهرات', description: 'سوار ذهب' },
            'تاج': { price: 5000, emoji: '👑', category: 'مجوهرات', description: 'تاج ملكي' },
            'قلادة لؤلؤ': { price: 3000, emoji: '📿', category: 'مجوهرات', description: 'قلادة لؤلؤ طبيعي' },
            'خاتم ماس': { price: 8000, emoji: '💎', category: 'مجوهرات', description: 'خاتم ماس نادر' },
            'أقراط ماس': { price: 6000, emoji: '💎', category: 'مجوهرات', description: 'أقراط ماس' },
            'قلادة ماس': { price: 10000, emoji: '💎', category: 'مجوهرات', description: 'قلادة ماس' },
            'سوار ماس': { price: 7000, emoji: '💎', category: 'مجوهرات', description: 'سوار ماس' },
            'خاتم فضة': { price: 800, emoji: '💍', category: 'مجوهرات', description: 'خاتم فضة' },
            'سلسال فضة': { price: 600, emoji: '📿', category: 'مجوهرات', description: 'سلسال فضة' },
            'أقراط فضة': { price: 500, emoji: '👂', category: 'مجوهرات', description: 'أقراط فضة' },
            'سوار فضة': { price: 700, emoji: '📿', category: 'مجوهرات', description: 'سوار فضة' },
            'خاتم بلاتين': { price: 4000, emoji: '💍', category: 'مجوهرات', description: 'خاتم بلاتين' },
            'ساعة رولكس': { price: 15000, emoji: '⌚', category: 'مجوهرات', description: 'ساعة رولكس أصلية' },
            'ساعة كارتير': { price: 12000, emoji: '⌚', category: 'مجوهرات', description: 'ساعة كارتير' },
            'ساعة أوميغا': { price: 10000, emoji: '⌚', category: 'مجوهرات', description: 'ساعة أوميغا' },
            'عقد زمرد': { price: 5000, emoji: '💚', category: 'مجوهرات', description: 'عقد زمرد أخضر' },
            'عقد ياقوت': { price: 6000, emoji: '♦️', category: 'مجوهرات', description: 'عقد ياقوت أحمر' },
            'عقد ياقوت أزرق': { price: 7000, emoji: '🔷', category: 'مجوهرات', description: 'عقد ياقوت أزرق' },
            'عقد توباز': { price: 3000, emoji: '💛', category: 'مجوهرات', description: 'عقد توباز أصفر' },
            'عقد أميثيست': { price: 2500, emoji: '💜', category: 'مجوهرات', description: 'عقد أميثيست بنفسجي' },
            'عقد أكوامارين': { price: 3500, emoji: '💙', category: 'مجوهرات', description: 'عقد أكوامارين أزرق' },
            'عقد بيريدوت': { price: 2000, emoji: '💚', category: 'مجوهرات', description: 'عقد بيريدوت أخضر' },
            'عقد جارنت': { price: 1800, emoji: '❤️', category: 'مجوهرات', description: 'عقد جارنت أحمر' },
            'عقد أوبال': { price: 4000, emoji: '🌈', category: 'مجوهرات', description: 'عقد أوبال ملون' },
            'عقد لابيس': { price: 2200, emoji: '🔵', category: 'مجوهرات', description: 'عقد لابيس أزرق' },
            'عقد تورمالين': { price: 3200, emoji: '💗', category: 'مجوهرات', description: 'عقد تورمالين وردي' },
            'عقد زركون': { price: 1500, emoji: '💎', category: 'مجوهرات', description: 'عقد زركون أبيض' },
            'بروش ذهب': { price: 1200, emoji: '📌', category: 'مجوهرات', description: 'بروش ذهب منقوش' },
            'بروش فضة': { price: 800, emoji: '📌', category: 'مجوهرات', description: 'بروش فضة' },
            'بروش لؤلؤ': { price: 2000, emoji: '📌', category: 'مجوهرات', description: 'بروش لؤلؤ' },
            'دبوس شعر': { price: 300, emoji: '📌', category: 'مجوهرات', description: 'دبوس شعر مزين' },
            'سلسلة ساعة': { price: 400, emoji: '⛓️', category: 'مجوهرات', description: 'سلسلة ساعة جلد' },
            'حافظة نظارات': { price: 150, emoji: '👓', category: 'مجوهرات', description: 'حافظة نظارات جلد' },
            'مشبك ربطة عنق': { price: 200, emoji: '📎', category: 'مجوهرات', description: 'مشبك ربطة عنق' },
            'قلم ذهب': { price: 1000, emoji: '🖊️', category: 'مجوهرات', description: 'قلم ذهب فاخر' },
            'مرآة جيب': { price: 180, emoji: '🪞', category: 'مجوهرات', description: 'مرآة جيب مزينة' },
            'مشط زينة': { price: 120, emoji: '🪮', category: 'مجوهرات', description: 'مشط زينة للشعر' },
            'علبة مجوهرات': { price: 500, emoji: '💼', category: 'مجوهرات', description: 'علبة مجوهرات خشب' },
            'حامل خواتم': { price: 150, emoji: '💍', category: 'مجوهرات', description: 'حامل خواتم' },
            'منفضة سجائر': { price: 300, emoji: '🚬', category: 'مجوهرات', description: 'منفضة سجائر فضة' },
            'ولاعة ذهب': { price: 800, emoji: '🔥', category: 'مجوهرات', description: 'ولاعة ذهب' },
            'سكين جيب': { price: 200, emoji: '🔪', category: 'مجوهرات', description: 'سكين جيب صغير' },
            'مفتاح سحر': { price: 100, emoji: '🔑', category: 'مجوهرات', description: 'مفتاح سحر مزين' },
            'عملة ذهب': { price: 500, emoji: '🪙', category: 'مجوهرات', description: 'عملة ذهب نادرة' },
            'عملة فضة': { price: 200, emoji: '🪙', category: 'مجوهرات', description: 'عملة فضة' },
            'عملة برونز': { price: 50, emoji: '🪙', category: 'مجوهرات', description: 'عملة برونز' }
        }

        // عرض المتجر
        if (!args[0]) {
            let categories = [...new Set(Object.values(shopItems).map(item => item.category))]
            let shopMsg = `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ 🏪 𝐒𝐇𝐎𝐏 𝐙𝐎𝐅𝐀𝐍
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💰 رصيدك: ${user.money.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🛒 عدد العناصر: 300 عنصر
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ───────────────────
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 📂 الأقسام المتاحة:`

            categories.forEach(cat => {
                let categoryItems = Object.entries(shopItems).filter(([_, item]) => item.category === cat)
                shopMsg += `\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ ${cat} (${categoryItems.length} عنصر)`
            })

            shopMsg += `\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💡 الاستخدام: ${usedPrefix}متجر <اسم العنصر>
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🛍️ مثال: ${usedPrefix}متجر تفاح
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 📋 لعرض قسم: ${usedPrefix}متجر طعام
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👑 المطور: DΣMΘΠ ØF SΘLITUDΣ
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 البوت: ZΘFΛΠ BΘƬ
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`

            return conn.reply(m.chat, shopMsg, m)
        }

        let itemName = args.join(' ').toLowerCase()
        
        // عرض قسم معين
        let categories = [...new Set(Object.values(shopItems).map(item => item.category))]
        if (categories.map(c => c.toLowerCase()).includes(itemName)) {
            let categoryItems = Object.entries(shopItems).filter(([_, item]) => 
                item.category.toLowerCase() === itemName.toLowerCase()
            )
            
            let categoryMsg = `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ 🛍️ 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐘: ${itemName}
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💰 رصيدك: ${user.money.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 📦 عدد العناصر: ${categoryItems.length}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ───────────────────`

            categoryItems.slice(0, 20).forEach(([name, item]) => {
                categoryMsg += `\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ ${item.emoji} ${name} - ${item.price.toLocaleString()} دولار`
            })

            if (categoryItems.length > 20) {
                categoryMsg += `\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ ... و ${categoryItems.length - 20} عنصر آخر`
            }

            categoryMsg += `\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💡 للشراء: ${usedPrefix}متجر <اسم العنصر>
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🛒 مثال: ${usedPrefix}متجر تفاح
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👑 المطور: DΣMΘΠ ØF SΘLITUDΣ
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 البوت: ZΘFΛΠ BΘƬ
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`

            return conn.reply(m.chat, categoryMsg, m)
        }

        // البحث عن عنصر معين
        let itemKey = Object.keys(shopItems).find(key => 
            key.toLowerCase() === itemName.toLowerCase()
        )

        if (!itemKey) {
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 العنصر غير موجود
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 استخدم ${usedPrefix}متجر لعرض الأقسام
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        let item = shopItems[itemKey]
        
        // عملية الشراء
        if (user.money < item.price) {
            return conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 لا تملك رصيد كافي
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 رصيدك: ${user.money.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💸 سعر العنصر: ${item.price.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ⚡ تحتاج: ${(item.price - user.money).toLocaleString()} دولار إضافية
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
        }

        // تنفيذ الشراء
        user.money -= item.price
        user.inventory[itemKey] = (user.inventory[itemKey] || 0) + 1

        let successMsg = `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ✅ 𝐏𝐔𝐑𝐂𝐇𝐀𝐒𝐄 𝐒𝐔𝐂𝐂𝐄𝐒𝐒
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🛍️ تم الشراء بنجاح!
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ${item.emoji} العنصر: ${itemKey}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💰 السعر: ${item.price.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 📂 القسم: ${item.category}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 📝 الوصف: ${item.description}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ───────────────────
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💵 رصيدك الآن: ${user.money.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🎒 الكمية في المخزن: ${user.inventory[itemKey]}
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💡 استخدم ${usedPrefix}مخزني لعرض مخزونك
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🏪 استخدم ${usedPrefix}متجر للمزيد
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👑 المطور: DΣMΘΠ ØF SΘLITUDΣ
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 البوت: ZΘFΛΠ BΘƬ
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`

        await conn.reply(m.chat, successMsg, m)

    } catch (error) {
        console.error('❌ خطأ في أمر المتجر:', error)
        await conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 حدث خطأ في المتجر
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 الرجاء المحاولة مرة أخرى
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m)
    }
}

handler.help = ['متجر', 'shop']
handler.tags = ['store']
handler.command = ['متجر', 'shop', 'متجر']

export default handler