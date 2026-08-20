import PublicContent from '../models/PublicContent.js';
import TeamMember from '../models/TeamMember.js';
import Testimonial from '../models/Testimonial.js';
import Lender from '../models/Lender.js';
import { writeAudit, getIp } from '../utils/audit.js';

/**
 * Default content — mirrors frontend/src/data/websiteData.js fallback values.
 */
const DEFAULTS = {
  hero: {
    heading1: 'EXPERTS IN GETTING',
    heading2: 'YOU APPROVED',
    description: 'Struggling to get a mortgage? We specialize in approvals for complex cases — even when others say no.',
    primaryCta: { label: 'Get Start Online', href: '/apply' },
    secondaryCta: { label: 'Learn More', href: '/learn-more' },
  },
  navLinks: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'How It Works', href: '#steps' },
    { label: 'Approach', href: '#approach' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Contact', href: '#contact' },
  ],
  reviews: {
    eyebrow: 'Google Reviews',
    heading1: "ONE OF THE UK'S TOP RATED",
    heading2: 'MORTGAGE BROKERS',
    paragraph: 'Every client gets a dedicated expert who understands their situation and works hard to secure the best possible outcome. Simple, transparent and personal from start to finish.',
    reviewerName: 'Brain Dominal',
    reviewerLocation: 'Barcelona, Spain',
  },
  reviewStats: [
    { value: '19+', label: 'Monthly project finished' },
    { value: '4.8', label: 'Rating on Crunchbase' },
  ],
  aboutEntries: [],
  stepsHeading: {
    eyebrow: 'HOW IT WORKS',
    heading1: 'SIMPLE STEPS TO GET',
    heading2: 'YOU APPROVED',
    description: 'Easy process. Quick approval.',
    cta: { label: 'Get Start Online', href: '/apply' },
  },
  steps: [
    { number: '01', title: 'Get In Touch', icon: 'bi-chat-dots', description: "Let us know if you're remortgaging or buying a property. We'll ask a few questions and handle the rest." },
    { number: '02', title: 'Criteria Check', icon: 'bi-search', description: "We'll review the mortgage products available and match you with the right one based on your needs and eligibility." },
    { number: '03', title: 'Applications', icon: 'bi-file-text', description: "Once you're happy, we'll get a decision in principle, submit your application and keep you updated throughout." },
  ],
  approachHeading: {
    eyebrow: 'What we do?',
    paragraph: "We specialise in arranging mortgages for people who've been turned down elsewhere, using our expertise to find the right solution when others can't.",
  },
  approachWords: [
    { number: '01', label: 'Understanding' },
    { number: '02', label: 'Practical' },
    { number: '03', label: 'Creative' },
    { number: '04', label: 'Reliable' },
  ],
  approachCta: {
    label: 'Get Start Online',
    href: '/apply',
  },
     badCredit: {
    heading: 'Bad Credit?',
    subheading: 'we will still help.',
    tagRows: [
      ['Low / Poor Credit Score', 'Missed Payments', "CCJ's"],
      ['Debt Management (dmp)', 'Defaults'],
    ],
  },
  badCreditPages: [
    {
      slug: 'low-credit-score',
      label: 'Low / Poor Credit Score',
      tag: 'Low / Poor Credit Score',
      eyebrow: 'BAD CREDIT MORTGAGE HELP',
      heading: 'Low Credit Score? You Can Still Get Approved.',
      description: 'A low credit score need not end your home ownership plans. Specialist lenders weigh your income, deposit and outgoings alongside your score.',
      image: 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?auto=format&fit=crop&w=1200&q=80',
      items: [
        { title: 'Why scores are only one factor', text: 'Credit scores are a guide, not a gate. Many bad-credit lenders weight deposit, income stability and the cause of past issues far more heavily.' },
        { title: 'Quick wins to lift your score', text: 'Paying down card balances, fixing report errors and joining the electoral role can lift your score within weeks.' },
        { title: 'Deals for imperfect credit', text: 'Fixed and variable mortgages from lenders who actively underwrite adverse credit, including secured and guarantor-backed options.' },
      ],
      cta: { label: 'Check My Options', href: '/apply' },
    },
    {
      slug: 'missed-payments',
      label: 'Missed Payments',
      tag: 'Missed Payments',
      eyebrow: 'BAD CREDIT MORTGAGE HELP',
      heading: 'Missed Payments? It Can Still Be Approved.',
      description: 'One or two missed payments is a very common reason for a decline — and one of the easiest to recover from once you know the right lenders.',
      image: 'https://images.unsplash.com/photo-1522704893643-8f76c0f2330e?auto=format&fit=crop&w=1600&q=80',
      items: [
        { title: 'How lenders read your history', text: 'Mainstream lenders often draw a hard line, but specialists look at how recent, how many and why payments were missed.' },
        { title: 'Getting back on track', text: 'Bring arrears current, prove affordability and explain the cause — many specialists proceed once the pattern has stopped.' },
        { title: 'Deals that still fit you', text: 'Secured mortgages, guarantor mortgages and selected high-cost lenders often stay available with recent late payments.' },
      ],
      cta: { label: 'See If You Qualify', href: '/apply' },
    },
    {
      slug: 'ccjs',
      label: "CCJ's",
      tag: "CCJ's",
      eyebrow: 'BAD CREDIT MORTGAGE HELP',
      heading: 'CCJ? Recent Judgments Can Still Qualify.',
      description: 'A County Court Judgment stains your file, but several specialist lenders will still consider you based on amount, age and reason.',
      image: 'https://images.unsplash.com/photo-1581091022453-c9b3c7c6a3d8?auto=format&fit=crop&w=1200&q=80',
      items: [
        { title: 'When lenders say yes anyway', text: 'Lenders look at whether the CCJ is satisfied or outstanding, its age, and an income that covers all commitments.' },
        { title: 'Satisfying a CCJ', text: 'Getting a CCJ discharged or marked paid in full markedly improves your options — we can advise on the best route.' },
        { title: 'Specialist bad-credit mortgages', text: 'High-cost lenders and secured loan providers often accept recent CCJs, typically at higher rates until the judgment clears.' },
      ],
      cta: { label: 'Talk To An Expert', href: '/apply' },
    },
    {
      slug: 'debt-management',
      label: 'Debt Management (dmp)',
      tag: 'Debt Management (dmp)',
      eyebrow: 'BAD CREDIT MORTGAGE HELP',
      heading: 'Debt Management Plans & Mortgages.',
      description: 'Being on a Debt Management Plan is not a mortgage barrier. Many specialists lend once your essential bills are covered and the plan is affordable.',
      image: 'https://images.unsplash.com/photo-1454165801066-f0124c1c4f0f?auto=format&fit=crop&w=1600&q=80',
      items: [
        { title: 'What a DMP looks like to lenders', text: 'Lenders want to see your DMP is affordable and that income covers both the plan and a new mortgage payment.' },
        { title: 'Proving affordability', text: 'Budget trackers, bank statements and a DMP provider letter showing agreed payments demonstrate you can handle the commitment.' },
        { title: 'Where to find a lender', text: 'Secured bad-credit mortgages and high-cost lenders are often accessible to DMP customers, usually at higher rates until the plan ends.' },
      ],
      cta: { label: 'Get Free Advice', href: '/apply' },
    },
    {
      slug: 'defaults',
      label: 'Defaults',
      tag: 'Defaults',
      eyebrow: 'BAD CREDIT MORTGAGE HELP',
      heading: 'Defaults on Your Credit? Specialist Help Exists.',
      description: 'Defaults on cards or utility bills hurt your score, but bad-credit mortgage brokers know exactly which lenders still approve.',
      image: 'https://images.unsplash.com/photo-1449197189642-4d6333e1f781?auto=format&fit=crop&w=1200&q=80',
      items: [
        { title: 'Why defaults are not the end', text: 'Key factors are the age of the default, whether it is settled, and your overall affordability since.' },
        { title: 'Rebuilding credibility', text: 'Clear arrears, keep other accounts current and show a stable income to rebuild lender confidence quickly.' },
        { title: 'Who still lends', text: 'Secured and high-cost mortgage providers regularly accept settled defaults, often at higher rates until the marks drop off.' },
      ],
      cta: { label: 'Find A Solution', href: '/apply' },
    },
  ],
  reasonsHeading: { heading1: 'REASONS WHY YOU SHOULD', heading2: 'CHOOSE US' },
  reasons: [
    { illustration: 'regulated', title: 'We Are Regulated', description: "We're fully regulated by the FCA, and our qualified mortgage experts are here to guide you every step of the way. Your finances are in safe hands.", cta: { label: 'Learn More', href: '/learn-more' } },
    { illustration: 'happen', title: 'We Make It Happen', description: "We keep things simple and straightforward, using every resource to get the job done — and keeping you informed every step of the way.", cta: { label: 'Learn More', href: '/learn-more' } },
    { illustration: 'experts', title: 'We Are Experts', description: "We specialise in mortgages for those with past credit or employment issues, taking a common-sense approach to find solutions that fit your needs.", cta: { label: 'Learn More', href: '/learn-more' } },
  ],
  expertsHeading: {
    eyebrow: 'THE TEAM',
    heading: 'MEET OUR MORTGAGE EXPERTS',
    description: 'Meet the specialists who make getting approved simple, personal and stress-free.',
  },
  testimonialsHeading: {
    eyebrow: 'TESTIMONIALS',
    heading: 'WHAT OUR LOVING CLIENT SAY',
  },
  lendersHeading: {
    heading: 'POPULAR LENDERS WE USE',
    description: 'Our commitment to excellence, trusted lending partners.',
  },
  finalCta: {
    heading: 'Get In Touch For Your Free Consultation',
    paragraph: 'Speak to one of our mortgage experts so we can show you what your options are.',
    primaryCta: { label: 'Get Started', href: '#contact' },
    secondaryCta: { label: 'Get Updates', href: '#contact' },
  },
  footer: {
    description: 'A whole-of-market UK mortgage brokerage helping thousands of people get approved — whether your credit is perfect or you need a little extra help.',
    quickLinks: [
      { label: 'Home', href: '#home' },
      { label: 'About Us', href: '#about' },
      { label: 'How It Works', href: '#steps' },
      { label: 'Our Approach', href: '#approach' },
      { label: 'Reviews', href: '#reviews' },
    ],
    contact: { phone: '+44 20 7946 0958', email: 'hello@mortgagewebsite.co.uk', address: '123 Lending Street, London, UK' },
    socials: [
      { label: 'Facebook', icon: 'bi-facebook', href: '#' },
      { label: 'Twitter', icon: 'bi-twitter-x', href: '#' },
      { label: 'Instagram', icon: 'bi-instagram', href: '#' },
      { label: 'LinkedIn', icon: 'bi-linkedin', href: '#' },
    ],
    legal: 'Your home may be repossessed if you do not keep up repayments on your mortgage.',
  },
  learnMore: {
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
  },
  websiteImages: {
    hero: 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?auto=format&fit=crop&w=1600&q=80',
    interiorLarge: 'https://images.unsplash.com/photo-1634253539586-c1f20bdeca7d?auto=format&fit=crop&w=1200&q=80',
    interiorSmall: 'https://images.unsplash.com/photo-1612372603963-403340a8942b?auto=format&fit=crop&w=800&q=80',
    finalCTA: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
};

const EDITABLE_KEYS = [
  'hero', 'navLinks', 'reviews', 'reviewStats', 'aboutEntries', 'stepsHeading', 'steps',
  'approachHeading', 'approachWords', 'approachCta', 'badCredit', 'reasonsHeading', 'reasons',
  'expertsHeading', 'testimonialsHeading', 'lendersHeading', 'finalCta',
  'footer', 'websiteImages', 'learnMore',
];

/** Build content object: defaults merged with DB overrides. */
function buildContent(settings) {
  const content = JSON.parse(JSON.stringify(DEFAULTS));
  for (const s of settings) {
    if (EDITABLE_KEYS.includes(s.key)) content[s.key] = s.value;
  }
  return content;
}

/**
 * GET /api/content/public (PUBLIC)
 * Returns all approved content + team + testimonials + lenders.
 */
export const getPublicContent = async (_req, res, next) => {
  try {
    const [settings, team, testimonials, lenders] = await Promise.all([
      PublicContent.find(),
      TeamMember.find({ active: true }).sort({ displayOrder: 1, name: 1 }),
      Testimonial.find({ verified: true, active: true }).sort({ createdAt: -1 }),
      Lender.find({ active: true }).sort({ displayOrder: 1, name: 1 }),
    ]);

    res.status(200).json({
      success: true,
      content: buildContent(settings),
      team,
      testimonials,
      lenders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/content (admin)
 */
export const getContent = async (_req, res, next) => {
  try {
    const settings = await PublicContent.find();
    res.status(200).json({ success: true, content: buildContent(settings), editableKeys: EDITABLE_KEYS });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/content (admin)
 */
export const updateContent = async (req, res, next) => {
  try {
    const body = req.body && req.body.content ? req.body.content : req.body || {};
    const allowed = Object.keys(body).filter((key) => EDITABLE_KEYS.includes(key));

    if (allowed.length === 0) {
      return res.status(400).json({ success: false, message: 'No editable content fields provided.' });
    }

    const now = new Date();
    const ops = allowed.map((key) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value: body[key], updatedAt: now } },
        upsert: true,
      },
    }));
    await PublicContent.bulkWrite(ops);

    await writeAudit({
      actor: req.user?.email || '',
      actorId: req.user?._id || null,
      action: 'content.updated',
      targetType: 'content',
      details: { fields: allowed },
      ip: getIp(req),
    });

    res.status(200).json({ success: true, message: 'Website content updated.' });
  } catch (error) {
    next(error);
  }
};
