// French and Arabic for the seed content in ./seed-data.ts, keyed by slug.
// Used by `npm run seed` (new items are inserted with their translations) and
// by `npm run seed -- --translations` (fills them into an existing database).
// After that the CMS owns them, like the rest of the content.
//
// A field left out is simply not translated: the site shows the English.
// The limits are those of the English fields (name 80, booking label 60,
// chip 24, description 200, tag 20, photo description 140); the seed script
// checks them before writing anything.
import type { TranslationLocale } from "../lib/i18n/config";
import type { ClinicText, DoctorText, ServiceText } from "../lib/types";

type Copies<T> = Record<TranslationLocale, Partial<T>>;

export const serviceTranslations: Record<string, Copies<ServiceText>> = {
  // ------------------------------------------------------------ specialists
  "specialists-internal-and-general-medicine": {
    fr: {
      name: "Médecine interne et générale",
      chip: "Médecine",
      description: "Soins préventifs et santé au quotidien",
      imageAlt: "Médecin discutant avec un patient en salle de consultation",
    },
    ar: {
      name: "الطب الداخلي والعام",
      chip: "الطب العام",
      description: "رعاية وقائية وصحة يومية",
      imageAlt: "طبيب يتحدث مع مريض في غرفة المعاينة",
    },
  },
  "specialists-allergist": {
    fr: {
      name: "Allergologue",
      bookingLabel: "Allergologie",
      chip: "Allergies",
      description: "Tests et traitement des allergies et des sensibilités",
      imageAlt: "Homme souffrant d’allergies saisonnières tenant un mouchoir",
    },
    ar: {
      name: "طبيب الحساسية",
      bookingLabel: "الحساسية",
      chip: "الحساسية",
      description: "فحوصات وعلاج للحساسية بأنواعها",
      imageAlt: "رجل يعاني من حساسية موسمية يحمل منديلاً",
    },
  },
  "specialists-cardiologist": {
    fr: {
      name: "Cardiologue",
      bookingLabel: "Cardiologie",
      chip: "Cardiologie",
      description: "Santé du cœur, rythme cardiaque et prévention",
      imageAlt: "Modèle anatomique d’un cœur humain",
    },
    ar: {
      name: "طبيب القلب",
      bookingLabel: "أمراض القلب",
      chip: "أمراض القلب",
      description: "صحة القلب، انتظام النبض والرعاية الوقائية",
      imageAlt: "مجسّم تشريحي لقلب الإنسان",
    },
  },
  "specialists-endocrinologist": {
    fr: {
      name: "Endocrinologue",
      bookingLabel: "Endocrinologie",
      chip: "Endocrinologie",
      description: "Hormones, diabète et équilibre métabolique",
      imageAlt: "Mesure de la glycémie avec un glucomètre",
    },
    ar: {
      name: "طبيب الغدد الصمّاء",
      bookingLabel: "الغدد الصمّاء",
      chip: "الغدد الصمّاء",
      description: "الهرمونات، السكري والتوازن الأيضي",
      imageAlt: "فحص سكر الدم بجهاز قياس السكر",
    },
  },
  "specialists-orthopedist": {
    fr: {
      name: "Orthopédiste",
      bookingLabel: "Orthopédie",
      chip: "Orthopédie",
      description: "Articulations, os et mobilité",
      imageAlt: "Spécialiste examinant le genou d’un patient",
    },
    ar: {
      name: "طبيب العظام",
      bookingLabel: "جراحة العظام",
      chip: "العظام",
      description: "المفاصل، العظام والحركة",
      imageAlt: "اختصاصي يفحص ركبة مريض",
    },
  },
  "specialists-pediatrician": {
    fr: {
      name: "Pédiatre",
      bookingLabel: "Pédiatrie",
      chip: "Pédiatrie",
      description: "Soins pour les enfants, des bilans au suivi de la croissance",
      imageAlt: "Pédiatre examinant un bébé dans les bras de sa mère",
    },
    ar: {
      name: "طبيب الأطفال",
      bookingLabel: "طب الأطفال",
      chip: "طب الأطفال",
      description: "رعاية الأطفال من الفحوصات الدورية إلى متابعة النمو",
      imageAlt: "طبيب أطفال يفحص رضيعاً تحمله أمه",
    },
  },
  "specialists-dietitian": {
    fr: {
      name: "Diététicien",
      chip: "Nutrition",
      description: "Plans nutritionnels personnalisés et accompagnement",
      imageAlt: "Assiette équilibrée avec œufs, avocat et légumes",
    },
    ar: {
      name: "أخصائي التغذية",
      chip: "التغذية",
      description: "خطط غذائية مخصّصة ومتابعة",
      imageAlt: "طبق متوازن من البيض والأفوكادو والخضار",
    },
  },
  "specialists-psychologist": {
    fr: {
      name: "Psychologue",
      bookingLabel: "Psychologie",
      chip: "Psychologie",
      description: "Soutien en santé mentale et thérapie",
      imageAlt: "Psychologue à l’écoute d’un patient pendant une séance",
    },
    ar: {
      name: "الأخصائي النفسي",
      bookingLabel: "علم النفس",
      chip: "علم النفس",
      description: "دعم الصحة النفسية والعلاج النفسي",
      imageAlt: "أخصائي نفسي يصغي إلى مريض خلال جلسة",
    },
  },
  "specialists-physiotherapist": {
    fr: {
      name: "Physiothérapeute",
      chip: "Physiothérapie",
      description: "Récupération, mobilité et thérapie par le mouvement",
      imageAlt: "Physiothérapeute traitant l’épaule d’un patient",
    },
    ar: {
      name: "المعالج الفيزيائي",
      chip: "العلاج الفيزيائي",
      description: "التعافي، الحركة والعلاج الحركي",
      imageAlt: "معالج فيزيائي يعالج كتف مريض",
    },
  },
  "specialists-dentists": {
    fr: {
      name: "Dentistes",
      chip: "Dentaire",
      description: "Soins dentaires généraux, préventifs et restaurateurs",
      imageAlt: "Salle de soins dentaires lumineuse et moderne",
    },
    ar: {
      name: "أطباء الأسنان",
      chip: "طب الأسنان",
      description: "رعاية أسنان عامة، وقائية وترميمية",
      imageAlt: "غرفة علاج أسنان حديثة ومضيئة",
    },
  },
  "specialists-dermatology": {
    fr: {
      name: "Dermatologie",
      chip: "Dermatologie",
      description: "Soins de la peau, des cheveux et des ongles",
      imageAlt: "Patiente recevant un soin dermatologique de la peau",
    },
    ar: {
      name: "الأمراض الجلدية",
      chip: "الجلدية",
      description: "العناية بالبشرة، الشعر والأظافر",
      imageAlt: "مريضة تتلقى علاجاً جلدياً للبشرة",
    },
  },
  "specialists-gynecology": {
    fr: {
      name: "Gynécologie",
      chip: "Gynécologie",
      description: "Santé des femmes, bien-être et prévention",
      imageAlt: "Médecin en blouse blanche avec un stéthoscope",
    },
    ar: {
      name: "الأمراض النسائية",
      chip: "النسائية",
      description: "صحة المرأة، العافية والرعاية الوقائية",
      imageAlt: "طبيب بمعطف أبيض مع سمّاعة طبية",
    },
  },

  // -------------------------------------------------------------- nutrition
  "nutrition-body-composition": {
    fr: {
      name: "Composition corporelle",
      chip: "Évaluation",
      description: "Analyse du métabolisme et de la masse grasse",
      imageAlt: "Personne debout sur une balance numérique",
    },
    ar: {
      name: "تركيب الجسم",
      chip: "تقييم",
      description: "تحليل الأيض ونسبة الدهون في الجسم",
      imageAlt: "شخص يقف على ميزان رقمي",
    },
  },
  "nutrition-weight-loss": {
    fr: {
      name: "Perte de poids",
      chip: "Perte de poids",
      description: "Des programmes durables pour un changement de poids sain",
      imageAlt: "Main tenant un mètre ruban",
    },
    ar: {
      name: "إنقاص الوزن",
      chip: "إنقاص الوزن",
      description: "خطط مستدامة لتغيير صحي في الوزن",
      imageAlt: "يد تحمل شريط قياس",
    },
  },
  "nutrition-weight-gain": {
    fr: {
      name: "Prise de poids",
      chip: "Prise de poids",
      description: "Accompagnement nutritionnel pour une prise de muscle saine",
      imageAlt: "Filet de saumon avec quinoa et brocoli",
    },
    ar: {
      name: "زيادة الوزن",
      chip: "زيادة الوزن",
      description: "دعم غذائي لبناء عضلي صحي",
      imageAlt: "شريحة سلمون مع الكينوا والبروكلي",
    },
  },
  "nutrition-medical-nutrition-therapy": {
    fr: {
      name: "Thérapie nutritionnelle médicale",
      chip: "Thérapie",
      description: "Une nutrition personnalisée selon votre état de santé",
      imageAlt: "Bol coloré de légumes et de pois chiches",
    },
    ar: {
      name: "العلاج الغذائي الطبي",
      chip: "علاج",
      description: "تغذية مخصّصة للحالات الصحية",
      imageAlt: "وعاء ملوّن من الخضار والحمّص",
    },
  },
  "nutrition-food-allergies": {
    fr: {
      name: "Allergies alimentaires",
      chip: "Allergies",
      description: "Tests et prise en charge des réactions allergiques",
      imageAlt: "Mélange de noix et de canneberges séchées",
    },
    ar: {
      name: "حساسية الطعام",
      chip: "الحساسية",
      description: "فحوصات وإدارة لتفاعلات الحساسية",
      imageAlt: "مكسّرات مشكّلة وتوت برّي مجفّف",
    },
  },
  "nutrition-food-intolerances": {
    fr: {
      name: "Intolérances alimentaires",
      chip: "Intolérances",
      description: "Identifier et gérer les déclencheurs de sensibilité",
      imageAlt: "Pains rustiques avec des épis de blé",
    },
    ar: {
      name: "عدم تحمّل الطعام",
      chip: "عدم التحمّل",
      description: "تحديد مسبّبات الحساسية الغذائية وإدارتها",
      imageAlt: "أرغفة خبز ريفية مع سنابل قمح",
    },
  },
  "nutrition-ibs": {
    fr: {
      name: "Syndrome de l’intestin irritable",
      chip: "Santé intestinale",
      description: "Santé intestinale et gestion des symptômes",
      imageAlt: "Bols de smoothie aux fruits et au granola",
    },
    ar: {
      name: "القولون العصبي",
      chip: "صحة الأمعاء",
      description: "صحة الأمعاء وإدارة الأعراض",
      imageAlt: "أوعية سموذي بالفواكه والغرانولا",
    },
  },
  "nutrition-crohns-disease": {
    fr: {
      name: "Maladie de Crohn",
      chip: "Santé intestinale",
      description: "Santé intestinale et soulagement des symptômes",
      imageAlt: "Bocaux de légumes fermentés",
    },
    ar: {
      name: "داء كرون",
      chip: "صحة الأمعاء",
      description: "صحة الأمعاء وتخفيف الأعراض",
      imageAlt: "مرطبانات من الخضار المخمّرة",
    },
  },
  "nutrition-diabetes": {
    fr: {
      name: "Diabète",
      chip: "Diabète",
      description: "Gestion de la glycémie et plan nutritionnel",
      imageAlt: "Contrôle de la glycémie avec un glucomètre",
    },
    ar: {
      name: "السكري",
      chip: "السكري",
      description: "ضبط سكر الدم وخطة غذائية",
      imageAlt: "قياس سكر الدم بجهاز قياس السكر",
    },
  },
  "nutrition-kidney-disease": {
    fr: {
      name: "Maladie rénale",
      chip: "Santé rénale",
      description: "Accompagnement nutritionnel pour la santé des reins",
      imageAlt: "Verre d’eau",
    },
    ar: {
      name: "أمراض الكلى",
      chip: "صحة الكلى",
      description: "دعم غذائي لصحة الكلى",
      imageAlt: "كوب من الماء",
    },
  },
  "nutrition-liver-disease": {
    fr: {
      name: "Maladie du foie",
      chip: "Santé du foie",
      description: "Suivi nutritionnel pour la santé du foie",
      imageAlt: "Betterave fraîche, pomme et légumes verts",
    },
    ar: {
      name: "أمراض الكبد",
      chip: "صحة الكبد",
      description: "رعاية غذائية لصحة الكبد",
      imageAlt: "شمندر طازج وتفاح وخضار ورقية",
    },
  },
  "nutrition-pregnancy": {
    fr: {
      name: "Grossesse",
      bookingLabel: "Nutrition de la grossesse",
      chip: "Grossesse",
      description: "Conseils nutritionnels pour une grossesse en bonne santé",
      imageAlt: "Femme enceinte tenant son ventre",
    },
    ar: {
      name: "الحمل",
      bookingLabel: "تغذية الحمل",
      chip: "الحمل",
      description: "إرشاد غذائي لحمل صحي",
      imageAlt: "امرأة حامل تحتضن بطنها",
    },
  },
  "nutrition-pcos-polycystic-ovary-syndrome": {
    fr: {
      name: "SOPK (syndrome des ovaires polykystiques)",
      bookingLabel: "SOPK",
      chip: "Santé hormonale",
      description: "Accompagnement hormonal et nutritionnel",
      imageAlt: "Femme s’étirant en plein air au coucher du soleil",
    },
    ar: {
      name: "تكيّس المبايض (متلازمة المبيض المتعدّد الكيسات)",
      bookingLabel: "تكيّس المبايض",
      chip: "الصحة الهرمونية",
      description: "دعم هرموني وغذائي",
      imageAlt: "امرأة تتمدّد في الهواء الطلق عند الغروب",
    },
  },
  "nutrition-pediatric-nutrition": {
    fr: {
      name: "Nutrition pédiatrique",
      chip: "Pédiatrie",
      description: "Croissance et développement en bonne santé",
      imageAlt: "Enfant attrapant des fraises dans la cuisine",
    },
    ar: {
      name: "تغذية الأطفال",
      chip: "طب الأطفال",
      description: "نموّ وتطوّر صحيّان",
      imageAlt: "طفل يمدّ يده إلى الفراولة في المطبخ",
    },
  },

  // ----------------------------------------------------------------- dental
  "dental-general-dentist": {
    fr: {
      name: "Dentiste généraliste",
      bookingLabel: "Dentisterie générale",
      chip: "Général",
      description: "Examens de routine, détartrages et soins préventifs",
      imageAlt: "Examen dentaire avec miroir et sonde",
    },
    ar: {
      name: "طبيب الأسنان العام",
      bookingLabel: "طب الأسنان العام",
      chip: "عام",
      description: "فحوصات دورية، تنظيف ورعاية وقائية",
      imageAlt: "فحص أسنان بالمرآة والمسبار",
    },
  },
  "dental-endodontist": {
    fr: {
      name: "Endodontiste",
      bookingLabel: "Endodontie",
      chip: "Endodontie",
      description: "Traitement de canal et soins de la dent",
      imageAlt: "Miroir et sonde dentaires sur une surface blanche",
    },
    ar: {
      name: "أخصائي علاج العصب",
      bookingLabel: "علاج العصب",
      chip: "علاج العصب",
      description: "علاج قنوات الجذور والعناية بالسنّ",
      imageAlt: "مرآة ومسبار أسنان على سطح أبيض",
    },
  },
  "dental-periodontist": {
    fr: {
      name: "Parodontiste",
      bookingLabel: "Parodontie",
      chip: "Soin des gencives",
      description: "Santé des gencives, implants et soin des tissus",
      imageAlt: "Brosses à dents en bambou dans un bocal en verre",
    },
    ar: {
      name: "أخصائي اللثة",
      bookingLabel: "أمراض اللثة",
      chip: "العناية باللثة",
      description: "صحة اللثة، الزرعات والعناية بالأنسجة",
      imageAlt: "فراشي أسنان من الخيزران في وعاء زجاجي",
    },
  },
  "dental-implantology": {
    fr: {
      name: "Implantologie",
      chip: "Implants",
      description: "Implants dentaires et restauration",
      imageAlt: "Modèle d’implant dentaire",
    },
    ar: {
      name: "زراعة الأسنان",
      chip: "الزرعات",
      description: "زرعات الأسنان والترميم",
      imageAlt: "مجسّم لزرعة أسنان",
    },
  },
  "dental-oral-surgery": {
    fr: {
      name: "Chirurgie buccale",
      chip: "Chirurgie",
      description: "Dents de sagesse, extractions et interventions buccales",
      imageAlt: "Chirurgiens-dentistes réalisant une intervention",
    },
    ar: {
      name: "جراحة الفم",
      chip: "جراحة",
      description: "أضراس العقل، الخلع والإجراءات الفموية",
      imageAlt: "جرّاحو أسنان يجرون عملية",
    },
  },
  "dental-esthetic-dentistry": {
    fr: {
      name: "Dentisterie esthétique",
      chip: "Esthétique",
      description: "Blanchiment, facettes et design du sourire",
      imageAlt: "Gros plan sur un sourire éclatant et régulier",
    },
    ar: {
      name: "طب الأسنان التجميلي",
      chip: "تجميل",
      description: "تبييض، قشور خزفية وتصميم الابتسامة",
      imageAlt: "لقطة مقرّبة لابتسامة مشرقة ومتناسقة",
    },
  },
  "dental-orthodontist": {
    fr: {
      name: "Orthodontiste",
      bookingLabel: "Orthodontie",
      chip: "Orthodontie",
      description: "Appareils, gouttières et alignement de l’occlusion",
      imageAlt: "Personne posant une gouttière dentaire transparente",
    },
    ar: {
      name: "أخصائي تقويم الأسنان",
      bookingLabel: "تقويم الأسنان",
      chip: "تقويم الأسنان",
      description: "تقويم ثابت، مصفّفات شفافة وضبط الإطباق",
      imageAlt: "شخص يضع مصفّفة أسنان شفافة",
    },
  },
  "dental-pedodontist": {
    fr: {
      name: "Pédodontiste",
      bookingLabel: "Pédodontie",
      chip: "Pédodontie",
      description: "Des soins dentaires tout en douceur pour les enfants",
      imageAlt: "Fillette souriante se brossant les dents",
    },
    ar: {
      name: "طبيب أسنان الأطفال",
      bookingLabel: "طب أسنان الأطفال",
      chip: "أسنان الأطفال",
      description: "رعاية أسنان لطيفة للأطفال",
      imageAlt: "فتاة مبتسمة تنظّف أسنانها",
    },
  },
  "dental-panoramic-x-ray": {
    fr: {
      name: "Radio panoramique",
      description:
        "Notre clinique est équipée d’une radio panoramique pour une imagerie dentaire précise et complète – le tout au même endroit.",
      imageAlt: "Dentiste examinant des radios dentaires panoramiques sur un négatoscope",
    },
    ar: {
      name: "الأشعة البانورامية",
      description: "عيادتنا مجهّزة بجهاز أشعة بانورامية لتصوير دقيق وشامل للأسنان – كل ذلك في مكان واحد.",
      imageAlt: "طبيب أسنان يراجع صور أشعة بانورامية على لوح مضيء",
    },
  },
  "dental-flash-teeth-whitening": {
    fr: {
      name: "Blanchiment dentaire flash",
      description: "Un blanchiment professionnel en clinique pour un sourire plus éclatant.",
      imageAlt: "Femme au sourire blanc et éclatant",
    },
    ar: {
      name: "تبييض الأسنان السريع",
      description: "تبييض احترافي في العيادة لابتسامة أكثر إشراقاً.",
      imageAlt: "امرأة بابتسامة بيضاء مشرقة",
    },
  },

  // -------------------------------------------------------------- esthetics
  "esthetics-fat-free-fat-dissolving-injections": {
    fr: {
      name: "Fat Free – injections lipolytiques",
      bookingLabel: "Injections Fat Free",
      imageAlt: "Main gantée tenant une fine aiguille d’injection",
    },
    ar: {
      name: "Fat Free – حقن إذابة الدهون",
      bookingLabel: "حقن Fat Free",
      imageAlt: "يد بقفّاز تحمل إبرة حقن دقيقة",
    },
  },
  "esthetics-exosomes-cellular-regeneration": {
    fr: {
      name: "Régénération cellulaire par exosomes",
      bookingLabel: "Régénération par exosomes",
      tags: ["Cheveux", "Peau", "Articulations"],
      imageAlt: "Image au microscope de cellules bleues lumineuses",
    },
    ar: {
      name: "التجديد الخلوي بالإكسوزومات",
      bookingLabel: "التجديد بالإكسوزومات",
      tags: ["الشعر", "البشرة", "المفاصل"],
      imageAlt: "صورة مجهرية لخلايا زرقاء متوهّجة",
    },
  },

  // --------------------------------------------------------------- movement
  "movement-physiotherapy": {
    fr: {
      name: "Physiothérapie",
      chip: "Physiothérapie",
      description: "Mobilité, récupération et gestion de la douleur",
      imageAlt: "Physiothérapeute guidant un exercice de résistance",
    },
    ar: {
      name: "العلاج الفيزيائي",
      chip: "العلاج الفيزيائي",
      description: "الحركة، التعافي وإدارة الألم",
      imageAlt: "معالج فيزيائي يوجّه تمرين مقاومة",
    },
  },
  "movement-osteopathy": {
    fr: {
      name: "Ostéopathie",
      chip: "Ostéopathie",
      description: "Thérapie manuelle pour les articulations et la posture",
      imageAlt: "Ostéopathe pratiquant une thérapie manuelle sur le dos d’un patient",
    },
    ar: {
      name: "الأوستيوباثي",
      chip: "الأوستيوباثي",
      description: "علاج يدوي للمفاصل ووضعية الجسم",
      imageAlt: "معالج أوستيوباثي يطبّق علاجاً يدوياً على ظهر مريض",
    },
  },
  "movement-medical-gym": {
    fr: {
      name: "Gym médicale",
      chip: "Rééducation",
      description: "Exercices encadrés pour la récupération et le renforcement",
      imageAlt: "Exercice de rééducation encadré avec des haltères légers",
    },
    ar: {
      name: "النادي الرياضي الطبي",
      chip: "إعادة تأهيل",
      description: "تمارين بإشراف مختص للتعافي والقوة",
      imageAlt: "تمرين إعادة تأهيل بإشراف مختص بأوزان خفيفة",
    },
  },
  "movement-pilates": {
    fr: {
      name: "Pilates",
      chip: "Pilates",
      description: "Renforcement du centre, souplesse et mouvement en pleine conscience",
      imageAlt: "Exercice de Pilates sur un appareil Reformer",
    },
    ar: {
      name: "بيلاتس",
      chip: "بيلاتس",
      description: "تقوية عضلات الجذع، المرونة والحركة الواعية",
      imageAlt: "تمرين بيلاتس على جهاز الريفورمر",
    },
  },
};

export const clinicTranslations: Record<string, Copies<ClinicText>> = {
  "clinic-clinical-psychology-clinic": {
    fr: {
      name: "Clinique de psychologie clinique",
      chip: "Psychologie",
      description: "Thérapie et soutien en santé mentale",
      imageAlt: "Thérapeute en conversation avec un patient",
    },
    ar: {
      name: "عيادة علم النفس العيادي",
      chip: "علم النفس",
      description: "علاج نفسي ودعم للصحة النفسية",
      imageAlt: "معالج نفسي في حوار مع مراجع",
    },
  },
  "clinic-gynecology": {
    fr: {
      name: "Gynécologie",
      chip: "Gynécologie",
      description: "Santé des femmes, bien-être et prévention",
      imageAlt: "Future maman tenant une échographie",
    },
    ar: {
      name: "الأمراض النسائية",
      chip: "النسائية",
      description: "صحة المرأة، العافية والرعاية الوقائية",
      imageAlt: "أم حامل تحمل صورة الأشعة الصوتية",
    },
  },
  "clinic-cardiology": {
    fr: {
      name: "Cardiologie",
      chip: "Cardiologie",
      description: "Santé du cœur, rythme cardiaque et prévention",
      imageAlt: "Moniteur patient affichant le rythme cardiaque",
    },
    ar: {
      name: "أمراض القلب",
      chip: "أمراض القلب",
      description: "صحة القلب، انتظام النبض والرعاية الوقائية",
      imageAlt: "شاشة مراقبة تعرض نبض القلب",
    },
  },
};

// The seeded team members are placeholders, and so are their translations.
export const doctorTranslations: Record<string, Copies<DoctorText>> = {
  "team-medical": {
    fr: {
      name: "[Dr Prénom Nom]",
      specialty: "Médecin spécialiste",
      bio: "Soins préventifs et santé au quotidien",
    },
    ar: {
      name: "[د. الاسم الكامل]",
      specialty: "طبيب اختصاصي",
      bio: "رعاية وقائية وصحة يومية",
    },
  },
  "team-nutrition": {
    fr: {
      name: "[Dr Prénom Nom]",
      specialty: "Spécialiste en nutrition",
      bio: "Plans nutritionnels personnalisés et accompagnement",
    },
    ar: {
      name: "[د. الاسم الكامل]",
      specialty: "أخصائي تغذية",
      bio: "خطط غذائية مخصّصة ومتابعة",
    },
  },
  "team-dental": {
    fr: {
      name: "[Dr Prénom Nom]",
      specialty: "Spécialiste dentaire",
      bio: "Soins dentaires généraux, préventifs et restaurateurs",
    },
    ar: {
      name: "[د. الاسم الكامل]",
      specialty: "اختصاصي أسنان",
      bio: "رعاية أسنان عامة، وقائية وترميمية",
    },
  },
  "team-movement": {
    fr: {
      name: "[Dr Prénom Nom]",
      specialty: "Spécialiste du mouvement",
      bio: "Mobilité, récupération et gestion de la douleur",
    },
    ar: {
      name: "[د. الاسم الكامل]",
      specialty: "اختصاصي حركة",
      bio: "الحركة، التعافي وإدارة الألم",
    },
  },
};
