export const siteConfig = {
  name: "Bluey's Creations",
  tagline: "VRChat avatar edits • Blender work • Unity setup",
  description: "Clean, stylish, performance-friendly avatars built for VRChat.",
  websiteUrl: "https://www.blueycommissions.website/",
  discord: "BlueyBarks",
  discordUrl: "https://discord.gg/zt48MZm5kD",
  commissionPath: "/commission",
  /**
   * Single source of truth for site navigation.
   *
   * Desktop, mobile and footer all derive from these arrays. Do not add a
   * second parallel list — that was the cause of five divergent nav
   * definitions (nav / moreMenu / mobileNav / footerNav / navLinks).
   */
  nav: [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/adoptables", label: "Adoptables" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
  ],
  /** Secondary/legal pages, shown in the footer and the mobile overflow menu. */
  footerLinks: [
    { href: "/contact", label: "Contact" },
    { href: "/tos", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
    { href: "/credits", label: "Credits" },
    { href: "/links", label: "Links" },
  ],
  /** Age-restricted page. Kept out of primary nav. */
  moreMenu: [{ href: "/nsfw", label: "NSFW" }],
  /**
   * Mobile menu = primary + secondary + CTA. Derived, never hand-maintained.
   */
  mobileNav: [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/adoptables", label: "Adoptables" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/nsfw", label: "NSFW" },
    { href: "/contact", label: "Contact" },
    { href: "/tos", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
    { href: "/credits", label: "Credits" },
    { href: "/links", label: "Links" },
    { href: "/commission", label: "Start a Commission" },
  ],
  footerNav: [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/adoptables", label: "Adoptables" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
  ],
  footerInfo: [
    { href: "/contact", label: "Contact" },
    { href: "/tos", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
    { href: "/credits", label: "Credits" },
    { href: "/links", label: "Links" },
  ],
  hero: {
    eyebrow: "VRChat Avatar Work",
    title: "Avatars that feel unmistakably yours",
    subtitle: "Bluey's Creations — handcrafted VRChat avatars built in Blender and Unity. Clean, stylish, and performance-friendly, tailored around your vision.",
    primaryCta: "Commission Me",
    secondaryCta: "View My Work",
    // Commission status is NOT stored here. It is read at runtime from the
    // `site_config` queue keys via useCommissionStatus() so the Hero, the
    // availability panel and the admin panel can never disagree.
  },
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
    price: "£15–£25",
    badge: null,
    popular: false,
    description: "Quick edits and small adjustments for existing avatar bases.",
    features: [
      "Accessory additions",
      "Simple clothing fitting",
      "Texture recolours",
      "Material edits",
      "Small Blender fixes",
      "Minor Unity setup",
      "Basic PhysBone setup",
      "Small avatar adjustments",
    ],
  },
  {
    id: "standard",
    name: "Standard Avatar Work",
    emoji: "🛠",
    price: "£30–£55",
    badge: "Most Requested",
    popular: true,
    description: "The most common tier — multiple asset additions with full Unity setup.",
    features: [
      "Multiple asset additions",
      "Clothing fitting",
      "Hair swaps",
      "Toggle setup",
      "Material setup",
      "Weight painting",
      "Avatar optimisation",
      "Shader setup",
      "Unity setup",
      "Moderate Blender work",
    ],
  },
  {
    id: "advanced",
    name: "Advanced Avatar Work",
    emoji: "🔥",
    price: "£60–£90",
    badge: null,
    popular: false,
    description: "Full avatar overhauls with heavy customisation and large Blender edits.",
    features: [
      "Full avatar overhauls",
      "Large Blender edits",
      "Heavy customisation",
      "Multiple clothing pieces",
      "Complex weight painting",
      "Extensive optimisation",
      "Complete Unity setup",
      "Large toggle systems",
      "Texture work",
      "Advanced modifications",
    ],
  },
];

export const additionalServices = [
  {
    emoji: "🚀",
    title: "Optimisation",
    description: "Avatar optimisation is available separately.",
    examples: [
      "Quest optimisation",
      "Performance improvements",
      "Mesh cleanup",
      "Material optimisation",
      "Texture optimisation",
      "Unity optimisation",
    ],
    note: "Pricing depends on the current state of the avatar and the amount of optimisation required.",
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

/**
 * @deprecated UNUSED — DO NOT RENDER. Retained only as historical reference.
 *
 * The canonical Terms of Service are the `tos_sections` rows in Supabase and are
 * published exclusively on /tos.
 *
 * This shorter copy was previously used as an offline fallback and was also
 * duplicated into the /pricing, /services and /commission pages. It must not be
 * displayed, because a silent fallback would publish a DIFFERENT legal document
 * than the one in force.
 *
 * Conflict status:
 *   - Payment methods: RESOLVED by the owner on 2026-10-01 — PayPal only, and
 *     clients must join the Discord server before a commission is accepted. The
 *     canonical Terms were updated to match. This copy happens to agree on
 *     "PayPal only" but does not mention the Discord requirement.
 *   - Revision request window: STILL UNRESOLVED. The canonical Terms contradict
 *     themselves (7 days in "Revisions" vs 48 hours in "Acceptance of Completed
 *     Work"). Do not edit either side until the owner confirms the policy.
 *
 * Once the revision window is settled this constant should simply be deleted.
 */
export const tosSections = [
  {
    title: "General Terms",
    icon: "📋",
    number: "01",
    description: "Basic terms and conditions for all commission requests",
    section_type: "bullets",
    content: "",
    items: [
      "Bluey's Creation reserves the right to accept or refuse any commission request.",
      "Clients must provide accurate information and references.",
      "Prices may change depending on commission complexity.",
      "Estimated completion times are estimates only.",
      "Communication must remain respectful.",
    ],
    highlight_box: null,
    box_type: "info",
    box_title: null,
  },
  {
    title: "Services",
    icon: "🛠",
    number: "02",
    description: "Services offered by Bluey's Creation",
    section_type: "bullets",
    content: "",
    items: [
      "VRChat Avatar Editing",
      "FBX Editing",
      "Adoptables (custom avatar designs and edits)",
      "Clothing Creation",
      "Avatar Optimisation",
      "Unity Setup",
      "Blender Work",
      "Texture Editing",
      "Material Setup",
      "Quest Optimisation",
    ],
    highlight_box: null,
    box_type: "info",
    box_title: null,
  },
  {
    title: "Asset Ownership",
    icon: "🧩",
    number: "03",
    description: "Client responsibilities for provided assets",
    section_type: "bullets",
    content: "",
    items: [
      "Clients must legally own or have permission to use every asset they provide.",
      "This includes Avatar Bases, Clothing, Accessories, Textures, Models, Materials, and any third-party assets.",
      "Providing a file does not automatically prove ownership.",
      "Bluey's Creation may request proof of ownership before beginning or continuing a commission.",
    ],
    highlight_box: "You must own or have the rights to all provided assets.",
    box_type: "error",
    box_title: "Client Responsibility",
  },
  {
    title: "Adoptables",
    icon: "🔗",
    number: "04",
    description: "Requirements and proof for Adoptable commissions",
    section_type: "bullets",
    content: "",
    items: [
      "For Adoptable commissions, clients must own every original avatar base or asset used.",
      "Acceptable proof: Store receipts, Marketplace receipts, Creator receipts.",
      "If ownership cannot be verified, the commission may be refused.",
      "No leaked, ripped, pirated, stolen, or unauthorised assets are accepted.",
    ],
    highlight_box: "Proof of ownership is required for all Adoptable commissions.",
    box_type: "warning",
    box_title: "Adoptable Requirements",
  },
  {
    title: "Payments",
    icon: "💳",
    number: "05",
    description: "Payment methods, invoices, and deposit requirements",
    section_type: "paragraphs",
    content: "Bluey's Creation accepts **PayPal only**.\n\nAll commission payments must be made through a PayPal invoice issued by Bluey's Creation. No other payment methods are accepted unless explicitly agreed to by Bluey's Creation.\n\nA commission is not considered paid until the PayPal invoice has been successfully paid.\n\nPayment is required before work begins unless otherwise agreed. Prices are based on the agreed scope of work. Additional work may require additional payment.",
    items: [],
    highlight_box: null,
    box_type: "info",
    box_title: null,
  },
  {
    title: "Refund Policy",
    icon: "💸",
    number: "06",
    description: "Refund eligibility and limitations",
    section_type: "bullets",
    content: "",
    items: [
      "Refunds are considered on a case-by-case basis.",
      "Refunds are generally not available once work has started.",
      "Refund decisions depend on: Time spent, Amount of work completed, Project progress.",
    ],
    highlight_box: "Refunds are limited once work has begun.",
    box_type: "warning",
    box_title: "Limited Refunds",
  },
  {
    title: "Revisions",
    icon: "🔁",
    number: "07",
    description: "Revision policies and additional change costs",
    section_type: "bullets",
    content: "",
    items: [
      "Reasonable revisions are included where appropriate.",
      "Large changes outside the original request may require additional payment.",
      "Unlimited revisions are not included.",
    ],
    highlight_box: null,
    box_type: "info",
    box_title: null,
  },
  {
    title: "Delivery",
    icon: "📦",
    number: "08",
    description: "File formats, delivery methods, and source file policies",
    section_type: "bullets",
    content: "",
    items: [
      "Delivered files depend on the purchased service.",
      "Unless agreed otherwise, source files are not included.",
    ],
    highlight_box: null,
    box_type: "info",
    box_title: null,
  },
  {
    title: "Usage Rights",
    icon: "🚫",
    number: "09",
    description: "How completed work may and may not be used",
    section_type: "bullets",
    content: "",
    items: [
      "Clients may use completed work for personal use.",
      "Clients may not: Claim the work as their own, Redistribute files, Sell my work, Remove required credits, Use my work commercially without permission.",
    ],
    highlight_box: "You may use the finished avatar for personal VRChat use only.",
    box_type: "error",
    box_title: null,
  },
  {
    title: "Portfolio Rights",
    icon: "🎨",
    number: "10",
    description: "Rights to display completed commissions",
    section_type: "bullets",
    content: "",
    items: [
      "Bluey's Creation may display completed commissions in: Portfolio, Website, Social Media, Advertising.",
      "Private commissions must be agreed before work begins.",
    ],
    highlight_box: null,
    box_type: "info",
    box_title: null,
  },
  {
    title: "Client Conduct",
    icon: "🤝",
    number: "11",
    description: "Expected behavior and communication standards",
    section_type: "bullets",
    content: "",
    items: [
      "Clients are expected to remain respectful.",
      "The following behaviour is not accepted: Harassment, Abuse, Threats, Discrimination, Spam, Manipulation, Repeated disrespect.",
    ],
    highlight_box: "Respectful communication is required at all times.",
    box_type: "warning",
    box_title: "Code of Conduct",
  },
  {
    title: "Blacklist Policy",
    icon: "🚫",
    number: "12",
    description: "Consequences for Terms violations",
    section_type: "bullets",
    content: "",
    items: [
      "Bluey's Creation reserves the right to refuse future work.",
      "Reasons include: Harassment, Abuse, Threats, Fraud, Chargeback abuse, Lying about asset ownership, Providing stolen assets, Redistributing my work, Claiming my work as your own, Removing required credits, Repeated Terms violations.",
      "Blacklisted users may lose access to: Future commissions, Support, Updates, Any future services.",
    ],
    highlight_box: "Violations may result in a permanent blacklist.",
    box_type: "error",
    box_title: "Strict Enforcement",
  },
  {
    title: "Intellectual Property",
    icon: "🛡",
    number: "13",
    description: "Ownership of original work and third-party assets",
    section_type: "bullets",
    content: "",
    items: [
      "Bluey's Creation retains ownership of all original work unless otherwise agreed.",
      "Third-party assets remain the property of their original creators.",
    ],
    highlight_box: null,
    box_type: "info",
    box_title: null,
  },
  {
    title: "Privacy",
    icon: "🔒",
    number: "14",
    description: "Client data handling and privacy exceptions",
    section_type: "bullets",
    content: "",
    items: [
      "Client information will remain private unless: Permission is given, Required by law, Required to report stolen or unauthorised assets.",
    ],
    highlight_box: null,
    box_type: "info",
    box_title: null,
  },
  {
    title: "Limitation of Liability",
    icon: "⚠️",
    number: "15",
    description: "Scope of Bluey's Creation's responsibility",
    section_type: "bullets",
    content: "",
    items: [
      "Bluey's Creation is not responsible for: Client misuse of files, Copyright issues caused by client-supplied assets, Third-party software updates, Delays caused by missing assets or poor communication.",
    ],
    highlight_box: null,
    box_type: "info",
    box_title: null,
  },
  {
    title: "Changes to these Terms",
    icon: "📝",
    number: "16",
    description: "How and when Terms may be updated",
    section_type: "bullets",
    content: "",
    items: [
      "These Terms of Service may be updated at any time.",
      "The latest published version will apply to future commissions.",
    ],
    highlight_box: null,
    box_type: "info",
    box_title: null,
  },
  {
    title: "Agreement",
    icon: "✅",
    number: "17",
    description: "Confirmation of Terms acceptance",
    section_type: "bullets",
    content: "",
    items: [
      "By commissioning Bluey's Creation, the client confirms: They have read the Terms of Service, They agree to the Terms of Service, They legally own every supplied asset, They understand proof of ownership may be requested, They understand refunds are limited after work begins, They understand stolen or leaked assets are prohibited.",
    ],
    highlight_box: "By commissioning, you confirm you have read and agree to all listed terms.",
    box_type: "warning",
    box_title: null,
  },
];

export const nsfwRules = {
  ageRequirement: "You must be 18 years or older",
  allowed: ["Mature avatar textures", "Suggestive clothing variants", "Adult-themed toggles"],
  notAllowed: ["Anything involving minors (zero tolerance)", "Illegal or exploitative content", "Extreme, violent or disturbing themes"],
  requirements: ["Avatar base name", "Clear reference images", "Detailed description of request", "All required assets provided"],
  note: "Age verification may be requested. Failure to verify = automatic refusal.",
};

export const faqCategories = [
  { id: "general", label: "General" },
  { id: "commissions", label: "Commissions" },
  { id: "pricing", label: "Pricing" },
  { id: "blender", label: "Blender" },
  { id: "unity", label: "Unity" },
  { id: "avatar-uploads", label: "Avatar Uploads" },
  { id: "delivery", label: "Delivery" },
  { id: "revisions", label: "Revisions" },
  { id: "payments", label: "Payments" },
  { id: "refunds", label: "Refunds" },
];

export const faqItems = [
  { question: "What do I need to provide?", answer: "What you want done, avatar base name, reference images, and any required assets provided.", category: "general" },
  { question: "How long does a commission take?", answer: "Depends on the tier and complexity. Light work is faster, full overhauls take longer.", category: "delivery" },
  { question: "Do you work on Quest?", answer: "Quest compatibility depends on the tier. Overhauls include Quest optimisation.", category: "general" },
  { question: "What payment methods?", answer: "PayPal only, via a PayPal invoice issued by Bluey's Creation. A 50% deposit is required before work begins.", category: "payments" },
  { question: "Can I request NSFW work?", answer: "Limited NSFW commissions are accepted case-by-case for 18+ clients. See NSFW page for details.", category: "general" },
  { question: "What files do I get?", answer: "Unity-ready VRChat avatar files. Blender source files on request.", category: "delivery" },
  { question: "Can I request revisions?", answer: "Minor revisions are included for up to 2 rounds per commission. Major changes may incur additional fees.", category: "revisions" },
  { question: "What happens after I submit?", answer: "I review your request, confirm details, and provide a quote before starting any work.", category: "commissions" },
  { question: "Do I need to own the assets?", answer: "Yes, you must legally own or have permission for every asset you provide. Proof may be requested.", category: "commissions" },
  { question: "How much does a simple edit cost?", answer: "Light Blender Work starts at £15–£25 depending on scope and complexity.", category: "pricing" },
  { question: "What is included in Standard tier?", answer: "Multiple asset additions, clothing fitting, hair swaps, toggle setup, material setup, weight painting, and more.", category: "pricing" },
  { question: "Can I upgrade my tier later?", answer: "Yes, you can upgrade at any point before work begins. The price difference will be calculated.", category: "pricing" },
  { question: "Do you do Blender modelling?", answer: "Yes, Blender work is available for custom modelling, retopology, UV unwrapping, and asset creation.", category: "blender" },
  { question: "Do you do Unity setup?", answer: "Yes, Unity setup includes material configuration, toggles, optimisation, viseme setup, and VRChat packaging.", category: "unity" },
  { question: "How do I upload my avatar?", answer: "After delivery, I send files via Discord or Google Drive. You import them into Unity/VRChat yourself.", category: "avatar-uploads" },
  { question: "What if my avatar doesn't work?", answer: "Minor import bugs within 7 days of delivery are fixed at no extra cost. Contact me if you have issues.", category: "avatar-uploads" },
  { question: "When will my avatar be delivered?", answer: "Estimated completion times are provided as approximations. Factors include complexity, queue, and your response time.", category: "delivery" },
  { question: "How do I request a revision?", answer: "Submit revision requests within 7 days of delivery via Discord or email. Minor revisions are included.", category: "revisions" },
  { question: "Are refunds available?", answer: "Refunds are limited. Full deposit refunds before work begins; no refunds once work has started.", category: "refunds" },
  { question: "How do I pay?", answer: "Payment is via a PayPal invoice. You must join the Discord server first, as the invoice and payment details are sent there. 50% deposit required before work starts, balance before delivery.", category: "payments" },
  { question: "Do I need to join the Discord server?", answer: "Yes. Clients must join the Bluey's Creation Discord server before a commission can be accepted, because invoices and payment details are provided there.", category: "general" },
];

export const reviews: any[] = [];

/* =============================================================================
   Removed: fabricated placeholder data
   -----------------------------------------------------------------------------
   mockPortfolioImages, mockNsfwPortfolioImages, mockAdoptables,
   mockAdoptableGallery, mockReviews and mockCredits were previously exported
   from here and used as production fallbacks in src/lib/db.ts.

   They contained invented customer names (Astra, Kai, Rin, Val), invented
   people (Nova, Rift, Luna, Orion, Starfall) and picsum.photos placeholder
   imagery. That is fake production content and it has been removed.

   Zero real records must render a real empty state instead. Editorial content
   Bluey authored (pricing tiers, FAQ answers, process steps, branding) is
   unaffected and remains below.
   ============================================================================ */

// NOTE: the standalone `navLinks` export that used to live here was dead code
// (nothing imported it) and was a duplicate source of navigation truth. All
// navigation now derives from `siteConfig.nav` / `siteConfig.footerLinks`.

export const creditsData = {
  websiteDev: {
    title: "Website & Development",
    items: [
      { name: "Next.js", description: "Framework", url: "https://nextjs.org" },
      { name: "Tailwind CSS", description: "Styling", url: "https://tailwindcss.com" },
      { name: "Lucide Icons", description: "Icon library", url: "https://lucide.dev" },
      { name: "Supabase", description: "Backend & database", url: "https://supabase.com" },
    ],
  },
  icons: {
    title: "Icons",
    items: [
      { name: "Lucide", description: "Primary icon library", url: "https://lucide.dev" },
    ],
  },
  fonts: {
    title: "Fonts",
    items: [
      { name: "Inter", description: "Body font", url: "https://fonts.google.com/specimen/Inter" },
      { name: "Space Grotesk", description: "Display font", url: "https://fonts.google.com/specimen/Space+Grotesk" },
    ],
  },
  visualAssets: {
    title: "Visual Assets",
    items: [],
  },
  specialThanks: {
    title: "Special Thanks",
    items: [
      { name: "Beta testers", description: "Early feedback and testing" },
      { name: "Community", description: "Support and encouragement" },
    ],
  },
};
