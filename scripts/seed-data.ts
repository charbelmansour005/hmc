// Generated from the original static site (legacy/index.html, see git history).
// This is the day-one content of the CMS.
// Used by `npm run seed`; after the first run the CMS owns all of it.
import type { Accent, Category, ServiceDisplay } from "../lib/categories";

export type SeedImage = { url: string; alt: string };

export type SeedService = {
  slug: string;
  category: Category;
  display: ServiceDisplay;
  name: string;
  bookingLabel: string | null;
  chip: string | null;
  description: string | null;
  tags: string[];
  image: SeedImage;
  /** slug of the service this card books instead of itself */
  bookAs: string | null;
  sortOrder: number;
};

export type SeedClinic = {
  slug: string;
  name: string;
  chip: string;
  description: string;
  image: SeedImage;
  /** slug of the bookable service */
  service: string;
  sortOrder: number;
};

export type SeedDoctor = {
  slug: string;
  name: string;
  specialty: string;
  bio: string;
  accent: Accent;
  sortOrder: number;
};

export const SEED_VERSION = 1;

export const seedServices: SeedService[] = [
  {
    "slug": "specialists-internal-and-general-medicine",
    "category": "specialists",
    "display": "card",
    "name": "Internal & General Medicine",
    "bookingLabel": null,
    "chip": "Medicine",
    "description": "Preventive care and everyday health",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Doctor talking with a patient in a consultation room"
    },
    "bookAs": null,
    "sortOrder": 10
  },
  {
    "slug": "specialists-allergist",
    "category": "specialists",
    "display": "card",
    "name": "Allergist",
    "bookingLabel": "Allergy",
    "chip": "Allergies",
    "description": "Testing and treatment for allergies and sensitivities",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1529386317747-0a2a51add902?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Man with seasonal allergies holding a tissue"
    },
    "bookAs": null,
    "sortOrder": 20
  },
  {
    "slug": "specialists-cardiologist",
    "category": "specialists",
    "display": "card",
    "name": "Cardiologist",
    "bookingLabel": "Cardiology",
    "chip": "Cardiology",
    "description": "Heart health, rhythm, and preventive care",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1618939304347-e91b1f33d2ab?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Anatomical model of a human heart"
    },
    "bookAs": null,
    "sortOrder": 30
  },
  {
    "slug": "specialists-endocrinologist",
    "category": "specialists",
    "display": "card",
    "name": "Endocrinologist",
    "bookingLabel": "Endocrinology",
    "chip": "Endocrinology",
    "description": "Hormones, diabetes, and metabolic balance",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1683727186226-910f31a9da45?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Blood glucose test with a glucometer"
    },
    "bookAs": null,
    "sortOrder": 40
  },
  {
    "slug": "specialists-orthopedist",
    "category": "specialists",
    "display": "card",
    "name": "Orthopedist",
    "bookingLabel": "Orthopedics",
    "chip": "Orthopedics",
    "description": "Joints, bones, and movement care",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1649751361457-01d3a696c7e6?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Specialist examining a patient's knee"
    },
    "bookAs": null,
    "sortOrder": 50
  },
  {
    "slug": "specialists-pediatrician",
    "category": "specialists",
    "display": "card",
    "name": "Pediatrician",
    "bookingLabel": "Pediatrics",
    "chip": "Pediatrics",
    "description": "Care for children from checkups to growth support",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1632053002928-1919605ee6f7?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Pediatrician examining a baby held by their mother"
    },
    "bookAs": null,
    "sortOrder": 60
  },
  {
    "slug": "specialists-dietitian",
    "category": "specialists",
    "display": "card",
    "name": "Dietitian",
    "bookingLabel": null,
    "chip": "Nutrition",
    "description": "Personalized nutrition planning and support",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Balanced plate with eggs, avocado and vegetables"
    },
    "bookAs": "nutrition-medical-nutrition-therapy",
    "sortOrder": 70
  },
  {
    "slug": "specialists-psychologist",
    "category": "specialists",
    "display": "card",
    "name": "Psychologist",
    "bookingLabel": "Psychology",
    "chip": "Psychology",
    "description": "Mental health support and therapy",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1758273241086-f3585ef8c2f8?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Psychologist listening to a patient during a session"
    },
    "bookAs": null,
    "sortOrder": 80
  },
  {
    "slug": "specialists-physiotherapist",
    "category": "specialists",
    "display": "card",
    "name": "Physiotherapist",
    "bookingLabel": null,
    "chip": "Physiotherapy",
    "description": "Recovery, mobility, and movement therapy",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1645005512968-0c1fe99f0093?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Physiotherapist treating a patient's shoulder"
    },
    "bookAs": "movement-physiotherapy",
    "sortOrder": 90
  },
  {
    "slug": "specialists-dentists",
    "category": "specialists",
    "display": "card",
    "name": "Dentists",
    "bookingLabel": null,
    "chip": "Dentistry",
    "description": "General, preventive, and restorative dental care",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Bright, modern dental treatment room"
    },
    "bookAs": "dental-general-dentist",
    "sortOrder": 100
  },
  {
    "slug": "specialists-dermatology",
    "category": "specialists",
    "display": "card",
    "name": "Dermatology",
    "bookingLabel": null,
    "chip": "Dermatology",
    "description": "Skin, hair, and nail care",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1713085085470-fba013d67e65?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Patient receiving a dermatology skin treatment"
    },
    "bookAs": null,
    "sortOrder": 110
  },
  {
    "slug": "specialists-gynecology",
    "category": "specialists",
    "display": "card",
    "name": "Gynecology",
    "bookingLabel": null,
    "chip": "Gynecology",
    "description": "Women's health, wellness, and preventive care",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Doctor in a white coat with a stethoscope"
    },
    "bookAs": null,
    "sortOrder": 120
  },
  {
    "slug": "nutrition-body-composition",
    "category": "nutrition",
    "display": "card",
    "name": "Body Composition",
    "bookingLabel": null,
    "chip": "Assessment",
    "description": "Metabolism and body fat analysis",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1522844990619-4951c40f7eda?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Person standing on a digital scale"
    },
    "bookAs": null,
    "sortOrder": 10
  },
  {
    "slug": "nutrition-weight-loss",
    "category": "nutrition",
    "display": "card",
    "name": "Weight Loss",
    "bookingLabel": null,
    "chip": "Weight Loss",
    "description": "Sustainable plans for healthy weight change",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1470167290877-7d5d3446de4c?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Hand holding a measuring tape"
    },
    "bookAs": null,
    "sortOrder": 20
  },
  {
    "slug": "nutrition-weight-gain",
    "category": "nutrition",
    "display": "card",
    "name": "Weight Gain",
    "bookingLabel": null,
    "chip": "Weight Gain",
    "description": "Nutrition support for healthy muscle gain",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Salmon fillet with quinoa and broccoli"
    },
    "bookAs": null,
    "sortOrder": 30
  },
  {
    "slug": "nutrition-medical-nutrition-therapy",
    "category": "nutrition",
    "display": "card",
    "name": "Medical Nutrition Therapy",
    "bookingLabel": null,
    "chip": "Therapy",
    "description": "Personalized nutrition for health conditions",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Colorful bowl of vegetables and chickpeas"
    },
    "bookAs": null,
    "sortOrder": 40
  },
  {
    "slug": "nutrition-food-allergies",
    "category": "nutrition",
    "display": "card",
    "name": "Food Allergies",
    "bookingLabel": null,
    "chip": "Allergies",
    "description": "Testing and management for allergic reactions",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1543158181-1274e5362710?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Mixed nuts and dried cranberries"
    },
    "bookAs": null,
    "sortOrder": 50
  },
  {
    "slug": "nutrition-food-intolerances",
    "category": "nutrition",
    "display": "card",
    "name": "Food Intolerances",
    "bookingLabel": null,
    "chip": "Intolerances",
    "description": "Identifying and managing sensitivity triggers",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Rustic loaves of bread with wheat"
    },
    "bookAs": null,
    "sortOrder": 60
  },
  {
    "slug": "nutrition-ibs",
    "category": "nutrition",
    "display": "card",
    "name": "IBS",
    "bookingLabel": null,
    "chip": "Gut Health",
    "description": "Gut health and symptom management",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1627308594190-a057cd4bfac8?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Smoothie bowls with fruit and granola"
    },
    "bookAs": null,
    "sortOrder": 70
  },
  {
    "slug": "nutrition-crohns-disease",
    "category": "nutrition",
    "display": "card",
    "name": "Crohn's Disease",
    "bookingLabel": null,
    "chip": "Gut Health",
    "description": "Gut health and symptom support",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1576020301507-5d5a00982053?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Jars of fermented vegetables"
    },
    "bookAs": null,
    "sortOrder": 80
  },
  {
    "slug": "nutrition-diabetes",
    "category": "nutrition",
    "display": "card",
    "name": "Diabetes",
    "bookingLabel": null,
    "chip": "Diabetes",
    "description": "Blood sugar management and nutrition planning",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1684156486280-ff59f07fc5bb?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Blood sugar check with a glucometer"
    },
    "bookAs": null,
    "sortOrder": 90
  },
  {
    "slug": "nutrition-kidney-disease",
    "category": "nutrition",
    "display": "card",
    "name": "Kidney Disease",
    "bookingLabel": null,
    "chip": "Kidney Care",
    "description": "Nutrition support for kidney health",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Glass of water"
    },
    "bookAs": null,
    "sortOrder": 100
  },
  {
    "slug": "nutrition-liver-disease",
    "category": "nutrition",
    "display": "card",
    "name": "Liver Disease",
    "bookingLabel": null,
    "chip": "Liver Care",
    "description": "Nutrition care for liver health",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1542814784-133212a2e378?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Fresh beetroot, apple and greens"
    },
    "bookAs": null,
    "sortOrder": 110
  },
  {
    "slug": "nutrition-pregnancy",
    "category": "nutrition",
    "display": "card",
    "name": "Pregnancy",
    "bookingLabel": "Pregnancy Nutrition",
    "chip": "Pregnancy",
    "description": "Nutrition guidance for a healthy pregnancy",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1457342813143-a1ae27448a82?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Pregnant woman cradling her belly"
    },
    "bookAs": null,
    "sortOrder": 120
  },
  {
    "slug": "nutrition-pcos-polycystic-ovary-syndrome",
    "category": "nutrition",
    "display": "card",
    "name": "PCOS (Polycystic Ovary Syndrome)",
    "bookingLabel": "PCOS",
    "chip": "Hormonal Care",
    "description": "Hormone and nutrition support",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1567013514336-6de53c9e7e63?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Woman stretching outdoors at sunset"
    },
    "bookAs": null,
    "sortOrder": 130
  },
  {
    "slug": "nutrition-pediatric-nutrition",
    "category": "nutrition",
    "display": "card",
    "name": "Pediatric Nutrition",
    "bookingLabel": null,
    "chip": "Pediatrics",
    "description": "Healthy growth and development",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1487795924438-a3cb4b7a5556?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Child reaching for strawberries in the kitchen"
    },
    "bookAs": null,
    "sortOrder": 140
  },
  {
    "slug": "dental-general-dentist",
    "category": "dental",
    "display": "card",
    "name": "General Dentist",
    "bookingLabel": "General Dentistry",
    "chip": "General",
    "description": "Routine exams, cleanings, and preventive care",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Dental exam with mirror and probe"
    },
    "bookAs": null,
    "sortOrder": 10
  },
  {
    "slug": "dental-endodontist",
    "category": "dental",
    "display": "card",
    "name": "Endodontist",
    "bookingLabel": "Endodontics",
    "chip": "Endodontics",
    "description": "Root canal treatment and tooth care",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1606811856475-5e6fcdc6e509?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Dental mirror and explorer on a white surface"
    },
    "bookAs": null,
    "sortOrder": 20
  },
  {
    "slug": "dental-periodontist",
    "category": "dental",
    "display": "card",
    "name": "Periodontist",
    "bookingLabel": "Periodontics",
    "chip": "Gum Care",
    "description": "Gum health, implants, and tissue care",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Bamboo toothbrushes in a glass jar"
    },
    "bookAs": null,
    "sortOrder": 30
  },
  {
    "slug": "dental-implantology",
    "category": "dental",
    "display": "card",
    "name": "Implantology",
    "bookingLabel": null,
    "chip": "Implants",
    "description": "Dental implants and restoration",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1593022356769-11f762e25ed9?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Dental implant model"
    },
    "bookAs": null,
    "sortOrder": 40
  },
  {
    "slug": "dental-oral-surgery",
    "category": "dental",
    "display": "card",
    "name": "Oral Surgery",
    "bookingLabel": null,
    "chip": "Surgery",
    "description": "Wisdom teeth, extractions, and oral procedures",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Dental surgeons performing a procedure"
    },
    "bookAs": null,
    "sortOrder": 50
  },
  {
    "slug": "dental-esthetic-dentistry",
    "category": "dental",
    "display": "card",
    "name": "Esthetic Dentistry",
    "bookingLabel": null,
    "chip": "Esthetics",
    "description": "Whitening, veneers, and smile design",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1654373535457-383a0a4d00f9?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Close-up of a bright, even smile"
    },
    "bookAs": null,
    "sortOrder": 60
  },
  {
    "slug": "dental-orthodontist",
    "category": "dental",
    "display": "card",
    "name": "Orthodontist",
    "bookingLabel": "Orthodontics",
    "chip": "Orthodontics",
    "description": "Braces, aligners, and bite alignment",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Person fitting a clear dental aligner"
    },
    "bookAs": null,
    "sortOrder": 70
  },
  {
    "slug": "dental-pedodontist",
    "category": "dental",
    "display": "card",
    "name": "Pedodontist",
    "bookingLabel": "Pedodontics",
    "chip": "Pedodontics",
    "description": "Gentle dental care for children",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1609840113564-ab4aba4956c4?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Smiling girl brushing her teeth"
    },
    "bookAs": null,
    "sortOrder": 80
  },
  {
    "slug": "dental-panoramic-x-ray",
    "category": "dental",
    "display": "feature",
    "name": "Panoramic X-ray",
    "bookingLabel": null,
    "chip": null,
    "description": "Our clinic is equipped with a panoramic X-ray for accurate, full-view dental imaging – all in one place.",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1400&h=620&q=72",
      "alt": "Dentist reviewing panoramic dental X-rays on a light box"
    },
    "bookAs": null,
    "sortOrder": 90
  },
  {
    "slug": "dental-flash-teeth-whitening",
    "category": "dental",
    "display": "feature",
    "name": "Flash teeth whitening",
    "bookingLabel": "Flash Teeth Whitening",
    "chip": null,
    "description": "Professional in-clinic whitening for a brighter smile.",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?auto=format&fit=crop&w=1400&h=620&q=72",
      "alt": "Woman with a bright white smile"
    },
    "bookAs": null,
    "sortOrder": 100
  },
  {
    "slug": "esthetics-fat-free-fat-dissolving-injections",
    "category": "esthetics",
    "display": "feature",
    "name": "Fat Free – fat-dissolving injections",
    "bookingLabel": "Fat Free Injections",
    "chip": null,
    "description": null,
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1651493773334-5d10f8bcf89e?auto=format&fit=crop&w=1400&h=620&q=72",
      "alt": "Gloved hand holding a fine injection needle"
    },
    "bookAs": null,
    "sortOrder": 10
  },
  {
    "slug": "esthetics-exosomes-cellular-regeneration",
    "category": "esthetics",
    "display": "feature",
    "name": "Exosomes cellular regeneration",
    "bookingLabel": "Exosomes Regeneration",
    "chip": null,
    "description": null,
    "tags": [
      "Hair",
      "Skin",
      "Joints"
    ],
    "image": {
      "url": "https://images.unsplash.com/photo-1631556097152-c39479bbff93?auto=format&fit=crop&w=1400&h=620&q=72",
      "alt": "Microscope image of glowing blue cells"
    },
    "bookAs": null,
    "sortOrder": 20
  },
  {
    "slug": "movement-physiotherapy",
    "category": "movement",
    "display": "card",
    "name": "Physiotherapy",
    "bookingLabel": null,
    "chip": "Physiotherapy",
    "description": "Mobility, recovery, and pain management",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1645005513709-77336f075dc8?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Physiotherapist guiding a resistance exercise"
    },
    "bookAs": null,
    "sortOrder": 10
  },
  {
    "slug": "movement-osteopathy",
    "category": "movement",
    "display": "card",
    "name": "Osteopathy",
    "bookingLabel": null,
    "chip": "Osteopathy",
    "description": "Manual therapy for joints and posture",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1699523229208-be1e1dd9252d?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Osteopath applying manual therapy to a patient's back"
    },
    "bookAs": null,
    "sortOrder": 20
  },
  {
    "slug": "movement-medical-gym",
    "category": "movement",
    "display": "card",
    "name": "Medical Gym",
    "bookingLabel": null,
    "chip": "Rehab",
    "description": "Supervised exercise for recovery and strength",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1645005513713-9e2b92a687d3?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Supervised rehabilitation exercise with light dumbbells"
    },
    "bookAs": null,
    "sortOrder": 30
  },
  {
    "slug": "movement-pilates",
    "category": "movement",
    "display": "card",
    "name": "Pilates",
    "bookingLabel": null,
    "chip": "Pilates",
    "description": "Core strength, flexibility, and mindful movement",
    "tags": [],
    "image": {
      "url": "https://images.unsplash.com/photo-1747239069226-55382c570116?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Pilates exercise on a reformer machine"
    },
    "bookAs": null,
    "sortOrder": 40
  }
];

export const seedClinics: SeedClinic[] = [
  {
    "slug": "clinic-clinical-psychology-clinic",
    "name": "Clinical Psychology Clinic",
    "chip": "Psychology",
    "description": "Therapy and mental health support",
    "image": {
      "url": "https://images.unsplash.com/photo-1714976694810-85add1a29c96?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Therapist in conversation with a client"
    },
    "service": "specialists-psychologist",
    "sortOrder": 10
  },
  {
    "slug": "clinic-gynecology",
    "name": "Gynecology",
    "chip": "Gynecology",
    "description": "Women's health, wellness, and preventive care",
    "image": {
      "url": "https://images.unsplash.com/photo-1654931800911-7a9cfb3b7c17?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Expecting mother holding an ultrasound scan"
    },
    "service": "specialists-gynecology",
    "sortOrder": 20
  },
  {
    "slug": "clinic-cardiology",
    "name": "Cardiology",
    "chip": "Cardiology",
    "description": "Heart health, rhythm, and preventive care",
    "image": {
      "url": "https://images.unsplash.com/photo-1513224502586-d1e602410265?auto=format&fit=crop&w=560&h=385&q=70",
      "alt": "Patient monitor displaying heart rhythm"
    },
    "service": "specialists-cardiologist",
    "sortOrder": 30
  }
];

export const seedDoctors: SeedDoctor[] = [
  {
    "slug": "team-medical",
    "name": "[Dr. First Last]",
    "specialty": "Medical specialist",
    "bio": "Preventive care and everyday health",
    "accent": "teal",
    "sortOrder": 10
  },
  {
    "slug": "team-nutrition",
    "name": "[Dr. First Last]",
    "specialty": "Nutrition specialist",
    "bio": "Personalized nutrition planning and support",
    "accent": "green",
    "sortOrder": 20
  },
  {
    "slug": "team-dental",
    "name": "[Dr. First Last]",
    "specialty": "Dental specialist",
    "bio": "General, preventive, and restorative dental care",
    "accent": "coral",
    "sortOrder": 30
  },
  {
    "slug": "team-movement",
    "name": "[Dr. First Last]",
    "specialty": "Movement specialist",
    "bio": "Mobility, recovery, and pain management",
    "accent": "blue",
    "sortOrder": 40
  }
];

// Keep in step with SETTINGS_DEFAULTS in lib/settings.ts. The Place ID is the
// clinic's Google Maps listing (the only Places data Google lets us store).
export const seedSettings = {
  phone: "+961 4 520 065",
  email: null,
  address: "Ground floor, Naccache, Green Zone A, bldg, 71, Naqqache",
  openingHours: "Mon–Fri, 8:30 AM – 6:00 PM · Sat & Sun closed",
  mapQuery: "33.9285959, 35.5966253",
  bookingChannel: "whatsapp" as const,
  whatsapp: null,
  googlePlaceIds: ["ChIJF7o0ARI_HxURCkCkKINPVC8"],
  hiddenSections: [] as Category[],
  translations: {
    fr: {
      address: "Rez-de-chaussée, immeuble 71, Green Zone A, Naccache",
      openingHours: "Lun–Ven, 8h30 – 18h00 · Sam et dim fermé",
    },
    ar: {
      address: "الطابق الأرضي، مبنى 71، Green Zone A، النقاش",
      openingHours: "الإثنين–الجمعة، 8:30 ص – 6:00 م · السبت والأحد مغلق",
    },
  },
};
