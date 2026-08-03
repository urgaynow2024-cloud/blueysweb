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
    { href: "/fbx-mashups", label: "FBX Mashups" },
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

export const nsfwPricingTiers = [
  {
    id: "nsfw-light",
    name: "NSFW Texture Work",
    emoji: "🔞",
    price: "£25 - £40",
    badge: null,
    popular: false,
    features: [
      "Mature texture edits",
      "Suggestive clothing variants",
      "Basic adult toggles",
      "Texture recolours",
      "Asset additions",
    ],
  },
  {
    id: "nsfw-custom",
    name: "NSFW Avatar Customisation",
    emoji: "🛠",
    price: "£45 - £80",
    badge: "Most Requested",
    popular: true,
    features: [
      "Advanced adult toggles",
      "Multiple mature variants",
      "Full body customisation",
      "Performance optimisation",
      "Quest compatible options",
      "Private delivery",
    ],
  },
  {
    id: "nsfw-overhaul",
    name: "NSFW Full Overhaul",
    emoji: "🔥",
    price: "£90 - £150",
    badge: null,
    popular: false,
    features: [
      "Complete avatar redesign",
      "Advanced toggle systems",
      "Multiple style variants",
      "Full body sculpting",
      "Custom rigging if needed",
      "Priority support",
    ],
  },
];

export const tosSections = [
  {
    title: "General Terms",
    icon: "📋",
    items: [
      "Bluey Commissions reserves the right to accept or refuse any commission request.",
      "Clients must provide accurate information and references.",
      "Prices may change depending on commission complexity.",
      "Estimated completion times are estimates only.",
      "Communication must remain respectful.",
    ],
    highlight_box: null,
  },
  {
    title: "Services",
    icon: "🛠",
    items: [
      "VRChat Avatar Editing",
      "FBX Editing",
      "FBX Mashups",
      "Clothing Creation",
      "Avatar Optimisation",
      "Unity Setup",
      "Blender Work",
      "Texture Editing",
      "Material Setup",
      "Quest Optimisation",
    ],
    highlight_box: null,
  },
  {
    title: "Asset Ownership",
    icon: "🧩",
    items: [
      "Clients must legally own or have permission to use every asset they provide.",
      "This includes Avatar Bases, Clothing, Accessories, Textures, Models, Materials, and any third-party assets.",
      "Providing a file does not automatically prove ownership.",
      "Bluey Commissions may request proof of ownership before beginning or continuing a commission.",
    ],
    highlight_box: "You must own or have the rights to all provided assets.",
  },
  {
    title: "FBX Mashup Policy",
    icon: "🔄",
    items: [
      "For FBX Mashup commissions, clients must own every original avatar base being used.",
      "Accepted proof includes: Store receipts, Marketplace receipts, Creator receipts, Purchase confirmations.",
      "If ownership cannot be verified, the commission may be refused.",
      "Bluey Commissions does not work with leaked avatars, ripped avatars, stolen assets, pirated files, or unauthorised conversions.",
    ],
    highlight_box: "Proof of ownership is required for all FBX Mashup commissions.",
  },
  {
    title: "Payments",
    icon: "💳",
    items: [
      "Payment is required before work begins unless otherwise agreed.",
      "Prices are based on the agreed scope of work.",
      "Additional work may require additional payment.",
    ],
    highlight_box: null,
  },
  {
    title: "Refund Policy",
    icon: "💸",
    items: [
      "Refunds are considered on a case-by-case basis.",
      "Refunds are generally not available once work has started.",
      "Refund decisions depend on: Time spent, Amount of work completed, Project progress.",
    ],
    highlight_box: "Refunds are limited once work has begun.",
  },
  {
    title: "Revisions",
    icon: "🔁",
    items: [
      "Reasonable revisions are included where appropriate.",
      "Large changes outside the original request may require additional payment.",
      "Unlimited revisions are not included.",
    ],
    highlight_box: null,
  },
  {
    title: "Delivery",
    icon: "📦",
    items: [
      "Delivered files depend on the purchased service.",
      "Unless agreed otherwise, source files are not included.",
    ],
    highlight_box: null,
  },
  {
    title: "Usage Rights",
    icon: "🚫",
    items: [
      "Clients may use completed work for personal use.",
      "Clients may not: Claim the work as their own, Redistribute files, Sell my work, Remove required credits, Use my work commercially without permission.",
    ],
    highlight_box: "You may use the finished avatar for personal VRChat use only.",
  },
  {
    title: "Portfolio Rights",
    icon: "🎨",
    items: [
      "Bluey Commissions may display completed commissions in: Portfolio, Website, Social Media, Advertising.",
      "Private commissions must be agreed before work begins.",
    ],
    highlight_box: null,
  },
  {
    title: "Client Conduct",
    icon: "🤝",
    items: [
      "Clients are expected to remain respectful.",
      "The following behaviour is not accepted: Harassment, Abuse, Threats, Discrimination, Spam, Manipulation, Repeated disrespect.",
    ],
    highlight_box: "Respectful communication is required at all times.",
  },
  {
    title: "Blacklist Policy",
    icon: "🚫",
    items: [
      "Bluey Commissions reserves the right to refuse future work.",
      "Reasons include: Harassment, Harassment of other clients, Abuse, Threats, Fraud, Chargeback abuse, Lying about asset ownership, Providing stolen assets, Asset theft, Redistributing my work, Claiming my work as your own, Removing required credits, Repeated Terms of Service violations.",
      "Blacklisted users may lose access to: Future commissions, Support, Updates, Any future services.",
    ],
    highlight_box: "Violations may result in a permanent blacklist.",
  },
  {
    title: "Intellectual Property",
    icon: "🛡",
    items: [
      "Bluey Commissions retains ownership of all original work unless otherwise agreed.",
      "Third-party assets remain the property of their original creators.",
    ],
    highlight_box: null,
  },
  {
    title: "Privacy",
    icon: "🔒",
    items: [
      "Client information will remain private unless: Permission is given, Required by law, Required to report stolen or unauthorised assets.",
    ],
    highlight_box: null,
  },
  {
    title: "Limitation of Liability",
    icon: "⚠️",
    items: [
      "Bluey Commissions is not responsible for: Client misuse of files, Copyright issues caused by client-supplied assets, Third-party software updates, Delays caused by missing assets or poor communication.",
    ],
    highlight_box: null,
  },
  {
    title: "Changes to these Terms",
    icon: "📝",
    items: [
      "These Terms of Service may be updated at any time.",
      "The latest published version will apply to future commissions.",
    ],
    highlight_box: null,
  },
  {
    title: "Agreement",
    icon: "✅",
    items: [
      "By commissioning Bluey Commissions, the client confirms: They have read the Terms of Service, They agree to the Terms of Service, They legally own every supplied asset, They understand proof of ownership may be requested, They understand refunds are limited after work begins, They understand stolen or leaked assets are prohibited.",
    ],
    highlight_box: "By commissioning, you confirm you have read and agree to all listed terms.",
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
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/fbx-mashups", label: "FBX Mashups" },
  { href: "/pricing", label: "Pricing" },
  { href: "/links", label: "Links" },
  { href: "/nsfw", label: "NSFW" },
  { href: "/faq", label: "FAQ" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];
