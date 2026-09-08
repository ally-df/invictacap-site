/**
 * All homepage copy for invictacap.co, restructured into a numbered manifesto.
 * Source: the previous invictacap.co homepage (Sept 2026). Keep facts unchanged.
 */

export const brand = {
  name: "Invicta Capital",
  legalName: "Invicta Capital Partners LLC",
  wordmark: "INVICTA CAPITAL",
  tagline: "Private Markets Investment Fund",
  domain: "invictacap.co",
  email: "contact@invictacap.co",
  linkedin: "https://www.linkedin.com/company/invicta-cap/",
  soundNotice: "Sound is played on this site.",
  enterLabel: "Enter",
  copyright: "© 2026 Invicta Capital. All rights reserved.",
} as const;

export type NavItem = { id: string; label: string; number: string };

export const nav: NavItem[] = [
  { id: "statement", label: "Statement", number: "01" },
  { id: "strategy", label: "Strategy", number: "02" },
  { id: "sectors", label: "Sectors", number: "03" },
  { id: "approach", label: "Approach", number: "04" },
  { id: "notes", label: "Notes", number: "05" },
  { id: "partners", label: "Partners", number: "06" },
  { id: "contact", label: "Contact", number: "07" },
];

export const statement = {
  number: "01",
  label: "Statement",
  /** Voxel headline, rendered in cubes. Uppercase, short lines. */
  voxelHeadline: ["CONVICTION", "CAPITAL"],
  /** HTML headline with the italic brand em. */
  headline: "Conviction Capital for",
  headlineEm: "Private Markets",
  body: "We deploy capital into high-growth, pre-IPO technology companies through structured secondary transactions and purpose-built investment vehicles.",
} as const;

export const strategy = {
  number: "02",
  label: "Strategy",
  voxelHeadline: ["WE INVEST", "WHERE OTHERS", "SEE COMPLEXITY"],
  headline: "We Invest Where Others See Complexity",
  paragraphs: [
    "Invicta Capital is a private markets investment fund focused on secondary transactions in late-stage, pre-IPO technology companies. We identify high-conviction opportunities where timing, structuring, and deep sector knowledge produce asymmetric returns for our investors.",
    "Our strategy is concentrated and deliberate. We lead investments in category-defining companies, structuring each position through purpose-built investment vehicles with institutional-grade governance, transparency, and reporting.",
    "We invest alongside family offices, institutional allocators, and qualified purchasers who share our conviction that the most compelling returns in technology are captured before companies reach public markets — not after.",
  ],
  pillars: [
    {
      number: "01",
      title: "Direct Secondary Investments",
      body: "We source and lead secondary positions in late-stage technology companies with strong fundamentals, proven revenue, and clear paths to liquidity events.",
    },
    {
      number: "02",
      title: "Strategic Capital Partnerships",
      body: "We cultivate long-term relationships with sophisticated allocators who value deep diligence, concentrated conviction, and consistent deal flow at the highest level.",
    },
  ],
  stats: [
    { value: "$100M+", label: "Capital Deployed", voxel: "$100M+" },
    { value: "Late-Stage", label: "Investment Focus", voxel: "LATE-STAGE" },
    { value: "Pre-IPO", label: "Transaction Type", voxel: "PRE-IPO" },
  ],
} as const;

export type SectorKey = "ai" | "fintech" | "frontier";

export const sectors = {
  number: "03",
  label: "Sectors",
  voxelHeadline: ["CATEGORY-", "DEFINING", "COMPANIES"],
  headline: "Investing in Category-Defining Technology Companies",
  items: [
    {
      key: "ai" as SectorKey,
      number: "01",
      title: "Enterprise AI & Infrastructure",
      body: "Artificial intelligence infrastructure, enterprise automation, and machine learning platforms with proven revenue and defensible market positions.",
    },
    {
      key: "fintech" as SectorKey,
      number: "02",
      title: "Fintech & Digital Finance",
      body: "Next-generation payments infrastructure, digital banking, and financial technology platforms redefining how capital moves globally.",
    },
    {
      key: "frontier" as SectorKey,
      number: "03",
      title: "Frontier Technology & Aerospace",
      body: "Space, defense technology, advanced computing, and deep tech companies building critical infrastructure with long-duration competitive advantages.",
    },
  ],
} as const;

export const approach = {
  number: "04",
  label: "Approach",
  voxelHeadline: ["DISCIPLINE", "OVER VOLUME"],
  headline: "Discipline Over Volume",
  paragraphs: [
    "Invicta Capital maintains a concentrated portfolio of positions in companies we have the highest conviction in, supported by rigorous diligence and institutional-grade structuring. We believe the strongest returns in private markets are generated through selectivity, discipline, and deep domain expertise.",
    "Our investment process is built around three principles: independent sourcing, thorough due diligence, and disciplined portfolio construction. We invest our own capital alongside our limited partners in every vehicle we manage.",
  ],
  principles: ["Independent sourcing", "Thorough due diligence", "Disciplined portfolio construction"],
  stats: [
    { label: "Investment Horizon", value: "Medium-Term" },
    { label: "Portfolio Approach", value: "Concentrated" },
    { label: "GP Co-Investment", value: "Every Vehicle" },
  ],
} as const;

export const notes = {
  number: "05",
  label: "Notes",
  voxelHeadline: ["NOTES FROM", "THE DESK"],
  headline: "Notes From the Desk",
  featured: {
    slug: "a-bullet-that-thinks",
    href: "/insights/a-bullet-that-thinks",
    category: "Defense Technology",
    year: "2026",
    title: "A Bullet That Thinks",
    dek: "Notes on drones, autonomy, and the coming architecture of deterrence. Why value migrates from the airframe to the software, and how the sky is getting cheaper.",
    cta: "Read the essay",
  },
} as const;

export const partners = {
  number: "06",
  label: "Partners",
  voxelHeadline: ["THE", "PARTNERS"],
  headline: "The Partners",
  people: [
    { initials: "JV", name: "Jake Valentine", title: "Founding Partner", email: "jake@invictacap.co" },
    { initials: "AR", name: "Allahyar Rehman", title: "Founding Partner", email: "ally@invictacap.co" },
    { initials: "GA", name: "Grant Adams", title: "Founding Partner", email: "grant@invictacap.co" },
  ],
} as const;

export const contact = {
  number: "07",
  label: "Contact",
  voxelHeadline: ["PARTNER WITH", "INVICTA"],
  headline: "Partner With Invicta Capital",
  body: "For inquiries regarding fund participation, co-investment opportunities, or general information, please contact our investor relations team.",
  cta: "Investor Relations",
  email: "contact@invictacap.co",
} as const;

export const disclaimer =
  "This website is for informational purposes only and does not constitute an offer to sell, a solicitation of an offer to buy, or a recommendation for any security, nor does it constitute an offer to provide investment advisory or other services by Invicta Capital or its affiliates. Any such offer may only be made through a private placement memorandum, subscription agreement, or other similar documents which may be furnished to qualified investors on a confidential basis. Past performance is not indicative of future results. All investments involve risk, including the loss of principal. Invicta Capital does not guarantee any specific outcome or profit. Securities offered through Invicta Capital are available only to accredited investors and qualified purchasers as defined under applicable securities laws.";

export const seo = {
  title: "Invicta Capital | Private Markets Investment Fund",
  description:
    "Invicta Capital is a private markets investment fund focused on secondary transactions in late-stage, pre-IPO technology companies.",
  url: "https://invictacap.co",
} as const;
