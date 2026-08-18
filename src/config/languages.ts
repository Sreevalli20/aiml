export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  direction: 'ltr' | 'rtl';
  greeting: string;
  samplePrompt: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    direction: 'ltr',
    greeting: 'Hello! How can I assist you with your school needs today?',
    samplePrompt: 'What is my attendance?'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    direction: 'ltr',
    greeting: 'नमस्ते! मैं आज आपकी स्कूल संबंधी किस प्रकार सहायता कर सकता हूँ?',
    samplePrompt: 'मेरी उपस्थिति क्या है?'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    direction: 'ltr',
    greeting: 'నమస్కారం! ఈరోజు మీ పాఠశాల అవసరాలకు నేను ఎలా సహాయపడగలను?',
    samplePrompt: 'నా హాజరు శాతం ఎంత?'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    direction: 'ltr',
    greeting: 'வணக்கம்! இன்று உங்கள் பள்ளித் தேவைகளுக்கு நான் எவ்வாறு உதவ முடியும்?',
    samplePrompt: 'எனது வருகை விவரம் என்ன?'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    direction: 'ltr',
    greeting: 'नमस्कार! आज मी तुम्हाला शाळेच्या संदर्भात कशी मदत करू शकतो?',
    samplePrompt: 'माझी उपस्थिती किती आहे?'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali',
    direction: 'ltr',
    greeting: 'নমস্কার! আজ আপনার স্কুলের প্রয়োজনে কীভাবে সাহায্য করতে পারি?',
    samplePrompt: 'আমার উপস্থিতি কত?'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'Gujarati',
    direction: 'ltr',
    greeting: 'નમસ્તે! આજે હું તમારી શાળા સંબંધિત શું મદદ કરી શકું?',
    samplePrompt: 'મારી હાજરી કેટલી છે?'
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    script: 'Gurmukhi',
    direction: 'ltr',
    greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਸਕੂਲ ਨਾਲ ਸੰਬੰਧਿਤ ਕੀ ਸਹਾਇਤਾ ਕਰ ਸਕਦਾ ਹਾਂ?',
    samplePrompt: 'ਮੇਰੀ ਹਾਜ਼ਰੀ ਕੀ ਹੈ?'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'Kannada',
    direction: 'ltr',
    greeting: 'ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಶಾಲಾ ಅಗತ್ಯಗಳಿಗೆ ನಾನು ಇಂದು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    samplePrompt: 'ನನ್ನ ಹಾಜರಾತಿ ಎಷ್ಟು?'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'Malayalam',
    direction: 'ltr',
    greeting: 'നമസ്കാരം! നിങ്ങളുടെ സ്കൂൾ ആവശ്യങ്ങളിൽ ഇന്ന് ഞാൻ എങ്ങനെ സഹായിക്കണം?',
    samplePrompt: 'എന്റെ ഹാജർ എത്രയാണ്?'
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    script: 'Arabic/Perso-Arabic',
    direction: 'rtl',
    greeting: 'آداب! آج میں آپ کی اسکول کی ضروریات میں کس طرح مدد کر سکتا ہوں؟',
    samplePrompt: 'میری حاضری کی تفصیل کیا ہے؟'
  }
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0];
