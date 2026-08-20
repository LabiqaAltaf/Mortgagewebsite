/**
 * Central data file for the Mortgage Website.
 *
 * All reusable content (headings, copy, lists, testimonials, experts, images)
 * lives here so components stay clean and content is easy to update.
 * Image URLs are centralized here so they can be swapped later.
 */

// ----- IMAGES -----------------------------------------------------------------
export const websiteImages = {
  // Target hero visual: bright architectural composition with THREE modern
  // wooden gabled houses side by side - warm wood exterior, large glass
  // windows, trees/greenery around, natural daylight.
  // This URL is the single swap point if the exact reference asset changes.
  hero: 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?auto=format&fit=crop&w=1600&q=80',
  // Reference "What we do?" collage: large image = light wooden dining
  // table + chairs interior. Small image = single chair on a dark/grey wall.
  interiorLarge:
    'https://images.unsplash.com/photo-1634253539586-c1f20bdeca7d?auto=format&fit=crop&w=1200&q=80',
  interiorSmall:
    'https://images.unsplash.com/photo-1612372603963-403340a8942b?auto=format&fit=crop&w=800&q=80',
  finalCTA:
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
}

// ----- NAVIGATION --------------------------------------------------------------
export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'How It Works', href: '#steps' },
  { label: 'Approach', href: '#approach' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact', href: '#contact' },
]

// ----- HERO --------------------------------------------------------------------
export const hero = {
  heading1: 'EXPERTS IN GETTING',
  heading2: 'YOU APPROVED',
  description:
    'Struggling to get a mortgage? We specialize in approvals for complex cases — even when others say no.',
  primaryCta: { label: 'Get Start Online', href: '/apply' },
  secondaryCta: { label: 'Learn More', href: '/learn-more' },
}

// ----- TRUST / GOOGLE REVIEWS --------------------------------------------------
export const reviews = {
  eyebrow: 'Google Reviews',
  heading1: "ONE OF THE UK'S TOP RATED",
  heading2: 'MORTGAGE BROKERS',
  paragraph:
    'Every client gets a dedicated expert who understands their situation and works hard to secure the best possible outcome. Simple, transparent and personal from start to finish.',
  reviewerName: 'Brain Dominal',
  reviewerLocation: 'Barcelona, Spain',
}

export const reviewStats = [
  { value: '19+', label: 'Monthly project finished' },
  { value: '4.8', label: 'Rating on Crunchbase' },
]


// ----- APPROVAL STEPS ----------------------------------------------------------
export const stepsHeading = {
  eyebrow: 'HOW IT WORKS',
  heading1: 'SIMPLE STEPS TO GET',
  heading2: 'YOU APPROVED',
  description: 'Easy process. Quick approval.',
  cta: { label: 'Get Start Online', href: '#contact' },
}

export const steps = [
  {
    number: '01',
    title: 'Get In Touch',
    icon: 'bi-chat-dots',
    description:
      'Let us know if you\'re remortgaging or buying a property. We\'ll ask a few questions and handle the rest.',
  },
  {
    number: '02',
    title: 'Criteria Check',
    icon: 'bi-search',
    description:
      'We\'ll review the mortgage products available and match you with the right one based on your needs and eligibility.',
  },
    {
    number: '03',
    title: 'Applications',
    icon: 'bi-file-text',
    description:
      'Once you\'re happy, we\'ll get a decision in principle, submit your application and keep you updated throughout.',
  },
]

// ----- APPROACH ("What we do?") --------------------------------------------------
export const approachHeading = {
  eyebrow: 'What we do?',
  paragraph:
    "We specialise in arranging mortgages for people who've been turned down elsewhere, using our expertise to find the right solution when others can't.",
}

export const approachWords = [
  { number: '01', label: 'Understanding' },
  { number: '02', label: 'Practical' },
  { number: '03', label: 'Creative' },
  { number: '04', label: 'Reliable' },
]

export const approachCta = {
  label: 'Get Start Online',
  href: '/apply',
}

// ----- BAD CREDIT BANNER --------------------------------------------------------
export const badCredit = {
  heading: 'Bad Credit?',
  subheading: 'we will still help.',
  tagRows: [
    ['Low / Poor Credit Score', 'Missed Payments', "CCJ's"],
    ['Debt Management (dmp)', 'Defaults'],
  ],
}

// ----- REASONS -------------------------------------------------------------------
export const reasonsHeading = {
  eyebrow: 'WHY CHOOSE US',
  heading1: 'REASONS WHY YOU SHOULD',
  heading2: 'CHOOSE US',
}

export const reasons = [
  {
    illustration: 'regulated',
    title: 'We Are Regulated',
    description:
      "We're fully regulated by the FCA, and our qualified mortgage experts are here to guide you every step of the way. Your finances are in safe hands.",
    cta: { label: 'Learn More', href: '/learn-more' },
  },
  {
    illustration: 'happen',
    title: 'We Make It Happen',
    description:
      'We keep things simple and straightforward, using every resource to get the job done — and keeping you informed every step of the way.',
    cta: { label: 'Learn More', href: '/learn-more' },
  },
  {
    illustration: 'experts',
    title: 'We Are Experts',
    description:
      'We specialise in mortgages for those with past credit or employment issues, taking a common-sense approach to find solutions that fit your needs.',
    cta: { label: 'Learn More', href: '/learn-more' },
  },
]

// ----- EXPERTS -------------------------------------------------------------------
export const expertsHeading = {
  eyebrow: 'THE TEAM',
  heading: 'MEET OUR MORTGAGE EXPERTS',
  description:
    'Meet the specialists who make getting approved simple, personal and stress-free.',
}

export const experts = [
  { name: 'James Carter', role: 'Senior Mortgage Advisor', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Sophie Bennett', role: 'Mortgage Advisor', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Oliver Hayes', role: 'Lead Underwriter', image: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { name: 'Amelia Turner', role: 'Advisor', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { name: 'Daniel Price', role: 'Senior Advisor', image: 'https://randomuser.me/api/portraits/men/75.jpg' },
  { name: 'Charlotte Reid', role: 'Compliance Officer', image: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { name: 'Harry Lawson', role: 'Mortgage Consultant', image: 'https://randomuser.me/api/portraits/men/11.jpg' },
  { name: 'Isabella Moore', role: 'Client Success Manager', image: 'https://randomuser.me/api/portraits/women/29.jpg' },
]

// ----- TESTIMONIALS ----------------------------------------------------------------
export const testimonialsHeading = {
  eyebrow: 'TESTIMONIALS',
  heading: 'WHAT OUR LOVING CLIENT SAY',
}

export const testimonials = [
  {
    name: 'Sarah Mitchell',
    info: 'First-time buyer · Manchester',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    text: 'The whole process was completely stress-free. They found me a brilliant deal and kept me informed every single step of the way.',
  },
  {
    name: 'David Thompson',
    info: 'Remortgage · Leeds',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    text: 'Honest, friendly and incredibly efficient. They saved me a significant amount compared to my previous lender.',
  },
  {
    name: 'Priya Sharma',
    info: 'Buy-to-let · Birmingham',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    text: 'Even with a fairly complicated case, they found a solution when other brokers said it was impossible. Highly recommended.',
  },
  {
    name: 'Mark Williams',
    info: 'Moving home · Bristol',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/51.jpg',
    text: 'Professional from start to finish. They handled everything and we moved into our dream home without any drama.',
  },
]

// ----- LENDERS ----------------------------------------------------------------------
// ----- LENDERS ----------------------------------------------------------------------
export const lendersHeading = {
  heading: 'POPULAR LENDERS WE USE',
  description: 'Our commitment to excellence, trusted lending partners.',
}

export const lenders = [
  { name: 'Nationwide', icon: 'bi-bank2', color: '#2563eb' },
  { name: 'Halifax', icon: 'bi-shield-check', color: '#16a34a' },
  { name: 'Santander', icon: 'bi-hexagon-fill', color: '#dc2626' },
  { name: 'Barclays', icon: 'bi-building', color: '#0891b2' },
  { name: 'NatWest', icon: 'bi-star-fill', color: '#ea580c' },
]

// ----- FINAL CTA -------------------------------------------------------------------
export const finalCta = {
  heading: 'Get In Touch For Your Free Consultation',
  paragraph: 'Speak to one of our mortgage experts so we can show you what your options are.',
  primaryCta: { label: 'Get Started', href: '#contact' },
  secondaryCta: { label: 'Get Updates', href: '#contact' },
}

// ----- LEARN MORE PAGE --------------------------------------------------------------
export const learnMore = {
  hero: {
    eyebrow: 'WHY CHOOSE MAINLY MORTGAGES',
    heading: 'Your mortgage journey, made simple',
    subheading:
      'We help the people other lenders turn away. Independent, whole-of-market and fully FCA regulated — straight answers and real results.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80',
    cta: { label: 'Get Start Online', href: '/apply' },
  },
  benefitsHeading: 'WHY WORK WITH US',
  benefitsSubheading: 'Everything you need to know about how we help people just like you get approved.',
  benefits: [
    { icon: 'bi-shield-check', title: 'FCA Regulated', description: 'We are fully regulated by the Financial Conduct Authority, so your case is always handled to the highest standards.' },
    { icon: 'bi-graph-up-arrow', title: 'Whole of Market', description: 'We search the whole market — not just a handful of lenders — to find the right fit for your situation.' },
    { icon: 'bi-person-heart', title: 'Dedicated Expert', description: 'One named specialist works your case from start to finish, so you never repeat your story.' },
    { icon: 'bi-stars', title: 'Complex Cases Welcome', description: 'Adverse credit, self-employed, or previously refused — difficult cases are what we do best.' },
  ],
  sections: [
    {
      title: 'A simple, transparent process',
      description: 'Tell us about your situation once and we handle everything else — from criteria checks to chasing the right lender. You will always know exactly where your application stands and why.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Honest advice you can trust',
      description: 'No jargon, no pressure, no unrealistic promises. We give you honest, clear advice based on your real circumstances — even if that means telling you a mortgage is not right for you right now.',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Support in every situation',
      description: 'First-time buyers, remortgaging, buy-to-let, moved home, or self-employed — our experience spans the full range of UK lending, so you are always in capable hands.',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
    },
  ],
  cta: {
    eyebrow: 'READY TO GET STARTED?',
    heading: 'Let us get you approved today',
    paragraph: 'Get in touch for a free, no obligation consultation with one of our mortgage experts.',
    buttonLabel: 'Get Start Online',
    buttonHref: '/apply',
  },
}

// ----- FOOTER -----------------------------------------------------------------------
export const footer = {
  description:
    'A whole-of-market UK mortgage brokerage helping thousands of people get approved — whether your credit is perfect or you need a little extra help.',
  quickLinks: [
    { label: 'Home', href: '#home' },
    { label: 'About Us', href: '#about' },
    { label: 'How It Works', href: '#steps' },
    { label: 'Our Approach', href: '#approach' },
    { label: 'Reviews', href: '#reviews' },
  ],
  contact: {
    phone: '+44 20 7946 0958',
    email: 'hello@mortgagewebsite.co.uk',
    address: '123 Lending Street, London, UK',
  },
  socials: [
    { label: 'Facebook', icon: 'bi-facebook', href: '#' },
    { label: 'Twitter', icon: 'bi-twitter-x', href: '#' },
    { label: 'Instagram', icon: 'bi-instagram', href: '#' },
    { label: 'LinkedIn', icon: 'bi-linkedin', href: '#' },
  ],
  legal:
    'Your home may be repossessed if you do not keep up repayments on your mortgage.',
  copyright: `© ${new Date().getFullYear()} Mortgage Website. All rights reserved.`,
}

export default {
  websiteImages,
  navLinks,
  hero,
  reviews,
  reviewStats,
    stepsHeading,
  steps,
  approachHeading,
  approachWords,
  approachCta,
  badCredit,
  reasonsHeading,
  reasons,
  expertsHeading,
  experts,
  testimonialsHeading,
  testimonials,
  lendersHeading,
  lenders,
  finalCta,
  learnMore,
  footer,
}