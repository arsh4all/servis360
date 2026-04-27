// ─────────────────────────────────────────────────────────────────────────────
// Keyword-to-category mapping for smart search.
// Replace or extend SUGGESTION_DEFS to enhance matching — no other files need
// to change.  AI can later replace getSuggestions() with a semantic scorer.
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchSuggestion {
  label: string;
  category: string;
  categorySlug: string;
  href: string;
  icon: string;
}

interface SuggestionDef extends SearchSuggestion {
  keywords: string[];
}

// Stop-words stripped before matching so "I need someone to iron my clothes"
// reduces to the meaningful words ["iron", "clothes"].
const STOP_WORDS = new Set([
  'i','me','my','we','our','you','your','a','an','the','is','it',
  'to','for','with','need','want','looking','find','get','some',
  'someone','help','please','can','do','have','at','in','on','of',
  'and','or','not','would','could','should','like','just','very',
]);

const SUGGESTION_DEFS: SuggestionDef[] = [
  // ── Cleaning ──────────────────────────────────────────────────────────────
  {
    label: 'House Cleaning', category: 'Cleaning', categorySlug: 'cleaning',
    href: '/services?category=cleaning', icon: '🧹',
    keywords: ['clean','cleaning','house','mop','sweep','vacuum','dust','dirty','tidy','hygiene','scrub','spotless'],
  },
  {
    label: 'Deep Cleaning', category: 'Cleaning', categorySlug: 'cleaning',
    href: '/services?category=cleaning', icon: '🧽',
    keywords: ['deep clean','deep cleaning','thorough','spring clean','move out','end of lease','disinfect'],
  },
  {
    label: 'Sofa Cleaning', category: 'Cleaning', categorySlug: 'cleaning',
    href: '/services?q=sofa+cleaning', icon: '🛋️',
    keywords: ['sofa','couch','upholstery','sofa clean','carpet'],
  },

  // ── Electrician ──────────────────────────────────────────────────────────
  {
    label: 'Electrical Wiring', category: 'Electrician', categorySlug: 'electrician',
    href: '/services?category=electrician', icon: '⚡',
    keywords: ['wire','wiring','electric','electricity','power','socket','outlet','switch','voltage','short circuit','breaker','fuse','circuit'],
  },
  {
    label: 'Light Installation', category: 'Electrician', categorySlug: 'electrician',
    href: '/services?category=electrician', icon: '💡',
    keywords: ['light','lighting','bulb','lamp','led','ceiling light','fan light','downlight','chandelier'],
  },

  // ── Plumbing ──────────────────────────────────────────────────────────────
  {
    label: 'Leak Repair', category: 'Plumbing', categorySlug: 'plumbing',
    href: '/services?category=plumbing', icon: '💧',
    keywords: ['leak','leaking','drip','dripping','pipe','pipes','burst','water damage','overflow'],
  },
  {
    label: 'Sink & Tap Repair', category: 'Plumbing', categorySlug: 'plumbing',
    href: '/services?category=plumbing', icon: '🚿',
    keywords: ['sink','tap','faucet','toilet','flush','drain','clog','blocked','bathroom','shower','plumb','plumbing','water','boiler','geyser'],
  },

  // ── CCTV ──────────────────────────────────────────────────────────────────
  {
    label: 'CCTV Installation', category: 'CCTV Installation', categorySlug: 'cctv-installation',
    href: '/services?category=cctv-installation', icon: '📷',
    keywords: ['cctv','camera','cameras','security camera','surveillance','monitor','alarm','doorbell','intercom','nvr','dvr','security system','ip camera'],
  },

  // ── Nanny ─────────────────────────────────────────────────────────────────
  {
    label: 'Babysitting', category: 'Nanny', categorySlug: 'nanny',
    href: '/services?category=nanny', icon: '👶',
    keywords: ['baby','babysit','babysitter','infant','toddler','nanny','nursery','newborn'],
  },
  {
    label: 'Childcare', category: 'Nanny', categorySlug: 'nanny',
    href: '/services?category=nanny', icon: '🧒',
    keywords: ['child','children','kid','kids','childcare','after school','school pickup','look after','play'],
  },

  // ── Elderly Care ──────────────────────────────────────────────────────────
  {
    label: 'Elderly Care', category: 'Elderly Care', categorySlug: 'elderly-care',
    href: '/services?category=elderly-care', icon: '🤝',
    keywords: ['elderly','elder','old','senior','grandparent','nurse','nursing','care','companion','aged','disability','caregiver','assist'],
  },

  // ── Home Help ─────────────────────────────────────────────────────────────
  {
    label: 'Ironing Clothes', category: 'Home Help', categorySlug: 'home-help',
    href: '/services?q=ironing', icon: '👔',
    keywords: ['iron','ironing','press','pressing','clothes iron','shirt','wrinkle','crease','linen'],
  },
  {
    label: 'Laundry Service', category: 'Home Help', categorySlug: 'home-help',
    href: '/services?q=laundry', icon: '🧺',
    keywords: ['laundry','wash','washing','clothes wash','dry clean','drying','fold','bed sheet','bedding'],
  },
  {
    label: 'Errand & Assistance', category: 'Home Help', categorySlug: 'home-help',
    href: '/services?q=errand', icon: '🛍️',
    keywords: ['errand','grocery','groceries','shopping','pickup','delivery','assistance','collect','run errand','market'],
  },
  {
    label: 'Gardening', category: 'Home Help', categorySlug: 'home-help',
    href: '/services?q=gardening', icon: '🌿',
    keywords: ['garden','gardening','plant','plants','lawn','grass','yard','mow','mowing','trim','pruning','weed','weeding','flower','hedge'],
  },

  // ── Handyman ──────────────────────────────────────────────────────────────
  {
    label: 'Small Repairs', category: 'Handyman', categorySlug: 'handyman',
    href: '/services?q=repairs', icon: '🔨',
    keywords: ['fix','repair','repairs','broken','damage','door','window','hinge','crack','hole','wall','floor','tile','handyman','maintenance','patch'],
  },
  {
    label: 'Furniture Assembly', category: 'Handyman', categorySlug: 'handyman',
    href: '/services?q=furniture-assembly', icon: '🪑',
    keywords: ['assemble','assembly','furniture','ikea','cabinet','wardrobe','shelf','shelves','table','bed','desk','chair','flat pack'],
  },
  {
    label: 'Wall Mounting', category: 'Handyman', categorySlug: 'handyman',
    href: '/services?q=wall-mounting', icon: '📺',
    keywords: ['mount','mounting','wall mount','tv mount','television','drill','hang','curtain','curtain rod','picture','frame','bracket','screw','shelf mount'],
  },
  {
    label: 'AC Servicing', category: 'Handyman', categorySlug: 'handyman',
    href: '/services?q=ac-servicing', icon: '❄️',
    keywords: ['ac','air condition','air conditioning','aircon','cool','cooling','hvac','filter clean','service ac','climate'],
  },
];

// Top categories shown as fallback when no match found
export const TOP_CATEGORIES: SearchSuggestion[] = [
  { label: 'Cleaning',          category: 'Cleaning',          categorySlug: 'cleaning',          href: '/services?category=cleaning',          icon: '🧹' },
  { label: 'Electrician',       category: 'Electrician',       categorySlug: 'electrician',       href: '/services?category=electrician',       icon: '⚡' },
  { label: 'Plumbing',          category: 'Plumbing',          categorySlug: 'plumbing',          href: '/services?category=plumbing',          icon: '💧' },
  { label: 'Handyman',          category: 'Handyman',          categorySlug: 'handyman',          href: '/services?category=handyman',          icon: '🔧' },
  { label: 'Home Help',         category: 'Home Help',         categorySlug: 'home-help',         href: '/services?category=home-help',         icon: '🏠' },
];

// ── Core matching function ────────────────────────────────────────────────────
export function getSuggestions(rawQuery: string): SearchSuggestion[] {
  const q = rawQuery.toLowerCase().trim();
  if (q.length < 2) return [];

  // Strip stop words so natural phrases still match
  const meaningful = q
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  // If everything was stripped, fall back to original query
  const words = meaningful.length > 0 ? meaningful : [q];

  const scored = SUGGESTION_DEFS.map((def) => {
    let score = 0;
    const label = def.label.toLowerCase();

    // Full-query matches
    if (label === q) score += 20;
    else if (label.startsWith(q)) score += 13;
    else if (label.includes(q)) score += 8;

    // Keyword matches
    for (const kw of def.keywords) {
      if (kw === q) { score += 18; continue; }
      if (kw.startsWith(q)) { score += 11; continue; }
      if (kw.includes(q)) { score += 7; continue; }

      // Per-word matches
      for (const word of words) {
        if (kw === word) score += 10;
        else if (kw.startsWith(word)) score += 6;
        else if (kw.includes(word)) score += 3;
        if (label.includes(word)) score += 2;
      }
    }

    return { def, score };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ def }) => ({
      label: def.label,
      category: def.category,
      categorySlug: def.categorySlug,
      href: def.href,
      icon: def.icon,
    }));

  return scored;
}

// Splits text into highlight segments for the component to render
export function getHighlightSegments(
  text: string,
  query: string
): { text: string; highlight: boolean }[] {
  if (!query.trim()) return [{ text, highlight: false }];
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts
    .filter((p) => p.length > 0)
    .map((part) => ({ text: part, highlight: regex.test(part) }));
}
