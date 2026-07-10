export const commissions = [
  {
    id: "1",
    name: "Cyber Fox Avatar",
    description: "Full avatar overhaul with cyberpunk aesthetic. Custom materials, glowing accents, and complete VRChat setup.",
    tags: ["Blender", "Unity", "Quest", "PC", "Overhaul"],
    platforms: ["PC", "Quest"],
    blenderWork: true,
    unityWork: true,
    features: ["Advanced toggles", "Full PBR materials", "Performance optimised", "PhysBones", "Visemes"],
    optimization: "Quest compatible under 8k tris",
    primaryRender: "🦊",
    mediaType: "image",
    beforeAfter: true,
  },
  {
    id: "2",
    name: "Fantasy Warrior",
    description: "Armour fitting and weapon integration for an existing fantasy base. Clean topology and toggles for alternate armour sets.",
    tags: ["Clothing", "Accessories", "Blender", "PC"],
    platforms: ["PC"],
    blenderWork: true,
    unityWork: true,
    features: ["Armour fitting", "Weapon rigging", "Toggle system", "Material tweaks"],
    optimization: "Optimised for full body tracking",
    primaryRender: "⚔️",
    mediaType: "image",
    beforeAfter: true,
  },
  {
    id: "3",
    name: "Anime Style Edit",
    description: "Complete restyle of an anime base with custom hair, accessories, and shader work. Smooth shading and vibrant toggles.",
    tags: ["Hair", "Toggles", "Blender", "Unity", "PC", "Quest"],
    platforms: ["PC", "Quest"],
    blenderWork: true,
    unityWork: true,
    features: ["Custom hair", "Shader work", "Multiple toggles", "Material adjustments"],
    optimization: "Quest ready",
    primaryRender: "✨",
    mediaType: "image",
    beforeAfter: false,
  },
  {
    id: "4",
    name: "Casual Streetwear",
    description: "Modern streetwear fitting for a popular base. Clean clothing, custom textures, and relaxed optimization for everyday use.",
    tags: ["Clothing", "Texture", "Blender", "PC"],
    platforms: ["PC"],
    blenderWork: true,
    unityWork: false,
    features: ["Clothing fitting", "Texture recolour", "Accessory addition"],
    optimization: "Light optimisation",
    primaryRender: "👕",
    mediaType: "image",
    beforeAfter: false,
  },
  {
    id: "5",
    name: "Sci-Fi Helmet",
    description: "Custom helmet accessory with HUD visor effect. Toggles for visor state and integrated PhysBones for dynamic movement.",
    tags: ["Accessories", "Blender", "PhysBones", "PC", "Quest"],
    platforms: ["PC", "Quest"],
    blenderWork: true,
    unityWork: true,
    features: ["Custom accessory", "HUD shader", "PhysBones", "Toggle visor"],
    optimization: "Quest compatible",
    primaryRender: "🪖",
    mediaType: "image",
    beforeAfter: false,
  },
  {
    id: "6",
    name: "Royal Gown Edit",
    description: "Elegant gown fitting with flowing fabric simulation in Unity. Multiple colour variants and jewellery accessories.",
    tags: ["Clothing", "Unity", "PC", "Accessories"],
    platforms: ["PC"],
    blenderWork: true,
    unityWork: true,
    features: ["Gown fitting", "Fabric setup", "Jewellery", "Colour variants"],
    optimization: "Standard optimisation",
    primaryRender: "👑",
    mediaType: "image",
    beforeAfter: true,
  },
];

export const siteConfig = {
  name: "Bluey's Avatar Commissions",
  tagline: "VRChat Avatar Edits • Blender Work • Unity Setup",
  description: "Clean, stylish, performance-friendly avatars built for VRChat.",
  discord: "BlueyBarks",
  discordUrl: "https://discord.com/",
  nav: [
    { href: "/", label: "Work" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ],
};

export const about = {
  name: "Bluey",
  experience: "around 2 years",
  description:
    "I'm Bluey, a VRChat avatar creator with around 2 years of experience working with Unity and Blender. I specialise in avatar edits, customisation, optimisation, accessories, clothing fitting, and making avatars feel unique while staying comfortable for everyday VRChat use.",
  tools: ["Unity", "Blender"],
};

export const workflowSteps = [
  { emoji: "💬", title: "Request", desc: "Message me with what you're looking for and your avatar base" },
  { emoji: "📋", title: "Planning", desc: "We discuss details and I provide a detailed quote" },
  { emoji: "🎨", title: "Development", desc: "I work on your avatar with regular progress updates" },
  { emoji: "🔁", title: "Revisions", desc: "You review the work and request any changes" },
  { emoji: "📦", title: "Delivery", desc: "Final files sent after payment is complete" },
];

export const pricingTiers = [
  {
    id: "light",
    name: "Light Blender Work",
    emoji: "✨",
    price: "£15 - £25",
    badge: null,
    popular: false,
    features: [
      "Easy asset additions",
      "Custom jewellery",
      "Simple clothing fitting",
      "Texture recolours",
      "Minor avatar fixes",
      "Accessory setup",
    ],
  },
  {
    id: "custom",
    name: "Avatar Customisation",
    emoji: "🛠",
    price: "£30 - £55",
    badge: "Most Requested",
    popular: true,
    features: [
      "Multiple asset additions",
      "Advanced clothing fitting",
      "Hair combinations",
      "Toggles setup",
      "Material adjustments",
      "Basic optimisation",
    ],
  },
  {
    id: "overhaul",
    name: "Avatar Overhaul",
    emoji: "🔥",
    price: "£60 - £90",
    badge: null,
    popular: false,
    features: [
      "Heavy Blender work",
      "Full avatar redesign",
      "Advanced toggle systems",
      "Large asset integration",
      "Performance optimisation",
      "Complete Unity setup",
    ],
  },
];

export const tosSections = [
  {
    title: "Payment Terms",
    icon: "💳",
    items: [
      "50% deposit is required before any work begins",
      "Remaining 50% must be paid before final file delivery",
      "Work will not be fully transferred until payment is complete",
      "Payments accepted via PayPal or Payhip only",
      "Chargebacks will result in blacklist from future commissions",
    ],
  },
  {
    title: "Delivery & Workflow",
    icon: "📦",
    items: [
      "Estimated completion time will be given per commission",
      "Delays may occur depending on workload or complexity",
      "You will receive progress updates when appropriate",
      "Final delivery includes Unity-ready VRChat avatar files (if applicable)",
    ],
  },
  {
    title: "Revisions",
    icon: "🔁",
    items: [
      "Minor adjustments are included during development",
      "Major changes after approval may cost extra",
      "Once final delivery is accepted, free revisions are no longer included",
    ],
  },
  {
    title: "Refund Policy",
    icon: "💸",
    items: [
      "Refunds are based on work completed at time of request",
      "No full refund after significant progress has been made",
      "If I cancel the commission, a partial refund will be issued",
    ],
  },
  {
    title: "Assets & Ownership",
    icon: "🧩",
    items: [
      "You must own or have rights to all provided assets",
      "I am not responsible for stolen or unlicensed content",
      "Client-provided assets are used at your own risk",
    ],
  },
  {
    title: "Rights & Usage",
    icon: "🚫",
    items: [
      "I reserve the right to decline any commission",
      "I may cancel work if rules are broken or disrespect occurs",
      "I may showcase finished work in my portfolio unless requested otherwise",
      "You may use the finished avatar for personal VRChat use only",
    ],
  },
  {
    title: "Final Notes",
    icon: "⚠️",
    items: [
      "These terms may be updated at any time",
      "Commissioning me means you agree to all listed terms",
      "Failure to follow rules may result in refusal of service",
    ],
  },
];

export const nsfwRules = {
  ageRequirement: "You must be 18 years or older",
  allowed: ["Mature avatar textures", "Suggestive clothing variants", "Adult-themed toggles"],
  notAllowed: ["Anything involving minors (zero tolerance)", "Illegal or exploitative content", "Extreme, violent or disturbing themes"],
  requirements: ["Avatar base name", "Clear reference images", "Detailed description of request", "All required assets provided"],
  note: "Age verification may be requested. Failure to verify = automatic refusal.",
};

export const faqItems = [
  { question: "What do I need to provide?", answer: "What you want done, avatar base name, reference images, and any required assets provided." },
  { question: "How long does a commission take?", answer: "Depends on the tier and complexity. Light work is faster, full overhauls take longer." },
  { question: "Do you work on Quest?", answer: "Quest compatibility depends on the tier. Overhauls include Quest optimisation." },
  { question: "What payment methods?", answer: "PayPal and Payhip only. 50% deposit before work begins." },
  { question: "Can I request NSFW work?", answer: "Limited NSFW commissions are accepted case-by-case for 18+ clients. See NSFW page for details." },
  { question: "What files do I get?", answer: "Unity-ready VRChat avatar files. Blender source files on request." },
];

export const reviews: any[] = [];

export const navLinks = [
  { href: "/", label: "Work" },
  { href: "/gallery", label: "Gallery" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];
