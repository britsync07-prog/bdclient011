export const STORAGE_KEYS = {
  FAVORITES: "casino-favorites",
  TOKEN: "token",
  USER: "user-data",
} as const;

export const ANIMATION_DURATION = {
  SHORT: 200,
  MEDIUM: 300,
  LONG: 500,
} as const;

export const TOAST_DURATION = 3000;
export const LOADING_DELAY = 1000;

export const BDT_SYMBOL = "৳";

export const BANGLA_TEXT = {
  HOME: "হোম",
  PROMOTIONS: "প্রমোশন",
  WINNERS: "বিজয়ীদের তালিকা",
  VIP: "ভিআইপি",
  REFERRAL: "রেফার বোনাস",
  DOWNLOAD: "ডাউনলোড",
  CONTACT: "যোগাযোগ করুন",
  SOCIAL_MEDIA: "সোশ্যাল মিডিয়া",
  LOGIN: "লগ ইন",
  SIGNUP: "সাইন আপ",
  LOGOUT: "লগ আউট",
  BALANCE: "ব্যালেন্স",
  GAMES: "গেমস",
  FAVORITES: "পছন্দসই",
  SEARCH_PLACEHOLDER: "গেম বা প্রোভাইডার খুঁজুন...",
  NO_GAMES_FOUND: "কোন গেম পাওয়া যায়নি",
  RESET_FILTERS: "ফিল্টার মুছে ফেলুন",
  LOADING: "লোড হচ্ছে...",
  SHOW_MORE: "আরো দেখুন",
  PLAY_NOW: "এখন খেলুন",
  BY: "কর্তৃক",
  PREMIUM: "প্রিমিয়াম",
  HOT_GAMES: "গরম খেলা",
  SPORTS: "স্পোর্ট",
  CASINO: "ক্যাসিনো",
  SLOTS: "স্লট",
  TABLE: "টেবিল",
  CRASH: "ক্রাশ",
  LOTTERY: "লটারী",
  FISHING: "ফিসিং",
  ARCADE: "আর্কেড",
  ALL_GAMES: "সব গেম",
  RESPONSIBLE_GAMING: "দায়িত্বশীল গেম্বলিং",
  COPYRIGHT: "সর্বস্বত্ব সংরক্ষিত।",
  BEST_QUALITY: "Best Quality Platform for iGaming",
  ABOUT_US: "আমাদের সম্পর্কে",
  TERMS: "শর্তাবলী",
  PRIVACY: "গোপনীয়তা নীতি",
  FAQ: "FAQ",
  PAYMENT_PARTNERS: "পেমেন্ট পার্টনার",
} as const;

export const PLACEHOLDER_MESSAGES = {
  SEARCH: BANGLA_TEXT.SEARCH_PLACEHOLDER,
  NO_GAMES: "দুঃখিত, আপনার অনুসন্ধান অনুযায়ী কোন ফলাফল পাওয়া যায়নি। অন্য কিছু চেষ্টা করুন।",
  LOADING: BANGLA_TEXT.LOADING,
  PLAY_SUCCESS: "🎮 {gameName} শুরু হচ্ছে! শুভকামনা!",
  FAVORITE_ADDED: "{gameName} পছন্দসইতে যোগ করা হয়েছে!",
  FAVORITE_REMOVED: "{gameName} পছন্দসই থেকে সরানো হয়েছে!",
  PREMIUM_CASINO_GAMES: "প্রিমিয়াম ক্যাসিনো গেমস",
  NO_GAMES_FOUND: BANGLA_TEXT.NO_GAMES_FOUND,
  RESET_FILTERS: BANGLA_TEXT.RESET_FILTERS,
} as const;

export const ARIA_LABELS = {
  SEARCH_INPUT: "গেম বা প্রোভাইডার অনুসন্ধান করুন",
  CLEAR_SEARCH: "অনুসন্ধান মুছুন",
  PLAY_GAME: "{gameName} খেলুন",
  ADD_FAVORITE: "পছন্দসইতে যোগ করুন",
  REMOVE_FAVORITE: "পছন্দসই থেকে সরান",
  CLEAR_FILTERS: "সব ফিল্টার মুছুন",
  GAME_GRID: "গেম গ্রিড",
  FILTER_CONTROLS: "গেম ফিল্টার কন্ট্রোল",
} as const;

export const FOOTER_MAIN_MESSAGES = {
    PREMIUM_GAMING_EXCELLENCE: "২০২৬ সালে ক্রিকেট বেটিংয়ের জন্য পিবিসি৮৮ ক্যাসিনো সেরা পছন্দ। আমাদের গেমগুলি এবং বিভাগগুলি চমৎকার সেবা প্রদান করে।",
    EST: "প্রতিষ্ঠিত."
};

export const FOOTER_BOTTOM_MESSAGES = {
    PLAY_RESPONSIBLY: "দায়িত্বশীল গেম্বলিং",
    PLAY_RESPONSIBLY_DETAILS: "গেম খেলা বিনোদন এবং মজার জন্য হওয়া উচিত। আপনি যদি মনে করেন আপনার জুয়ার সমস্যা হতে পারে, অনুগ্রহ করে অবিলম্বে পেশাদার সাহায্য নিন।",
    OVER18_ONLY: "১৮+ শুধুমাত্র",
    LICENSED_REGULATED: "লাইসেন্সপ্রাপ্ত এবং নিয়ন্ত্রিত",
    SECURE_GAMING: "নিরাপদ গেমিং",
    ROYAL_CASINO_CRAFTED: "২০২৬ পিবিসি৮৮ ক্যাসিনো - পিবিসি৮৮ স্পোর্টস বেটিং লবি।",
    PREMIUM_GAMING_EXPERIENCE: "অত্যাধুনিক প্রযুক্তি দ্বারা চালিত প্রিমিয়াম গেমিং অভিজ্ঞতা"
};

export const GAME_CARD_HEADER = {
    NEW: "নতুন",
    HOT: "গরম",
    PLAY: "খেলুন"
};

export const GAME_GRID_MESSAGES = {
    SHOWING_GAMES: "{totalGames} টি গেমের মধ্যে {gamesLength} টি দেখানো হচ্ছে",
    SHOW_ALL_GAMES: "সব গেম দেখান"
};

export const HEADER_MESSAGES = {
    ROYAL_CASINO: "পিবিসি৮৮ ক্যাসিনো",
    PREMIUM_GAMING_DESTINATION: "সেরা ক্রিকেট বেটিং এবং ক্যাসিনো লবি",
    GAMES: "গেমস",
    FAVORITES: "পছন্দসই",
    VIP_MEMBER: "ভিআইপি মেম্বার"
};

export const ERROR_BOUNDARY_MESSAGES = {
  SOMETHING_WENT_WRONG: "ওহ! কিছু ভুল হয়েছে",
  SOMETHING_UNEXPECTED_HAPPENED: "আমরা দুঃখিত, কিন্তু একটি অপ্রত্যাশিত সমস্যা ঘটেছে।",
  RELOAD_PAGE: "পেজ রিলোড করুন",
};

export const FILTER_CONTROLS = {
  FILTER_GAMES: "গেম ফিল্টার",
  FAVORITES_ONLY: "শুধুমাত্র পছন্দসই",
  CLEAR_ALL: "সব মুছুন",
};

export const GAME_CARD_CONTEXT = {
  BY: "কর্তৃক",
  PREMIUM: "প্রিমিয়াম",
  PLAY_NOW: "এখন খেলুন",
  OUT_OF_FIVE_STARS: "৫ স্টারের মধ্যে",
};
