import type { LeadLanguage } from "@/lib/types/lead";

const translations = {
  en: {
    sms: {
      initial: (name: string, url: string) =>
        `Hi ${name}! Thanks for reaching out. We help buyers and sellers in Montreal, Longueuil & South Shore. Book your free consultation: ${url}`,
      appointmentConfirm: (name: string, time: string) =>
        `Hi ${name}, your appointment is confirmed for ${time}. Looking forward to speaking with you!`,
      followUp1: (name: string, url: string) =>
        `Hi ${name}, just following up! Are you still looking for help with real estate in the Montreal area? Book a time: ${url}`,
      followUp2: (name: string) =>
        `Hi ${name}, we haven't heard back. Whether you're buying or selling, we're here to help. Reply YES if you'd like to chat.`,
      missedCall: (name: string, url: string) =>
        `Hi ${name}, sorry we missed you! Book a time that works for you: ${url}`,
    },
    email: {
      subject: (name: string) => `${name}, let's find your perfect property`,
      subjectSeller: (name: string) => `${name}, let's get your property sold`,
    },
    voice: {
      greeting: (name: string) =>
        `Hi ${name}, this is your AI real estate assistant from Rushanet. Thanks for reaching out! I'd love to help you. Are you looking to buy or sell a property?`,
      buyerBudget:
        "That's great! What's your approximate budget for your new property?",
      buyerArea:
        "And which area are you most interested in? We cover Montreal, Longueuil, and the entire South Shore.",
      sellerProperty:
        "Wonderful! Can you tell me a bit about your property? What type is it and where is it located?",
      bookingOffer:
        "Based on what you've told me, I think we can definitely help. Would you like to book a free consultation with one of our agents?",
      bookingConfirm: (time: string) =>
        `Perfect, I've booked you in for ${time}. You'll receive a confirmation by text and email. Is there anything else I can help with?`,
      goodbye:
        "Thank you so much for your time! We look forward to helping you. Have a great day!",
      noAnswer:
        "I'll send you a text with a link to book at your convenience. Thank you!",
    },
  },
  fr: {
    sms: {
      initial: (name: string, url: string) =>
        `Bonjour ${name}! Merci de nous avoir contactés. Nous aidons les acheteurs et vendeurs à Montréal, Longueuil et la Rive-Sud. Réservez votre consultation gratuite: ${url}`,
      appointmentConfirm: (name: string, time: string) =>
        `Bonjour ${name}, votre rendez-vous est confirmé pour le ${time}. Au plaisir de vous parler!`,
      followUp1: (name: string, url: string) =>
        `Bonjour ${name}, je fais un suivi! Cherchez-vous toujours de l'aide en immobilier dans la région de Montréal? Réservez un moment: ${url}`,
      followUp2: (name: string) =>
        `Bonjour ${name}, nous n'avons pas eu de nouvelles. Que vous achetiez ou vendiez, nous sommes là pour vous aider. Répondez OUI pour discuter.`,
      missedCall: (name: string, url: string) =>
        `Bonjour ${name}, désolé de vous avoir manqué! Réservez un moment qui vous convient: ${url}`,
    },
    email: {
      subject: (name: string) =>
        `${name}, trouvons votre propriété idéale`,
      subjectSeller: (name: string) =>
        `${name}, vendons votre propriété`,
    },
    voice: {
      greeting: (name: string) =>
        `Bonjour ${name}, je suis votre assistant immobilier IA de Rushanet. Merci de nous avoir contactés! J'aimerais beaucoup vous aider. Cherchez-vous à acheter ou à vendre une propriété?`,
      buyerBudget:
        "C'est super! Quel est votre budget approximatif pour votre nouvelle propriété?",
      buyerArea:
        "Et quel secteur vous intéresse le plus? Nous couvrons Montréal, Longueuil et toute la Rive-Sud.",
      sellerProperty:
        "Merveilleux! Pouvez-vous me parler un peu de votre propriété? Quel type est-ce et où est-elle située?",
      bookingOffer:
        "D'après ce que vous m'avez dit, je pense que nous pouvons définitivement vous aider. Aimeriez-vous réserver une consultation gratuite avec un de nos agents?",
      bookingConfirm: (time: string) =>
        `Parfait, je vous ai réservé pour le ${time}. Vous recevrez une confirmation par texto et courriel. Y a-t-il autre chose que je puisse vous aider?`,
      goodbye:
        "Merci beaucoup pour votre temps! Nous avons hâte de vous aider. Bonne journée!",
      noAnswer:
        "Je vais vous envoyer un texto avec un lien pour réserver à votre convenance. Merci!",
    },
  },
} as const;

export function t(lang: LeadLanguage) {
  return translations[lang];
}

export function detectLanguage(text: string): LeadLanguage {
  const frenchIndicators = [
    "bonjour",
    "merci",
    "oui",
    "je",
    "nous",
    "vous",
    "est-ce",
    "propriété",
    "maison",
    "acheter",
    "vendre",
    "salut",
    "cherche",
    "combien",
    "quartier",
    "secteur",
  ];
  const lower = text.toLowerCase();
  const frCount = frenchIndicators.filter((w) => lower.includes(w)).length;
  return frCount >= 2 ? "fr" : "en";
}
