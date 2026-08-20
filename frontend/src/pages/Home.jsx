import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import TrustSection from '../components/TrustSection.jsx'
import ApprovalSteps from '../components/ApprovalSteps.jsx'
import ApproachSection from '../components/ApproachSection.jsx'
import BadCreditBanner from '../components/BadCreditBanner.jsx'
import ReasonsSection from '../components/ReasonsSection.jsx'
import ExpertsSection from '../components/ExpertsSection.jsx'
import TestimonialsSection from '../components/TestimonialsSection.jsx'
import LendersSection from '../components/LendersSection.jsx'
import FinalCTA from '../components/FinalCTA.jsx'
import { WebsiteContentProvider } from '../context/WebsiteContentContext.jsx'

/**
 * Home page.
 *
 * Hero, Trust, How It Works, Approach, Bad Credit and Reasons all read
 * their copy from WebsiteContentProvider, which fetches the admin-managed
 * content bundle from GET /api/content/public once and falls back to the
 * static websiteData.js defaults if the API/DB is unavailable.
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <WebsiteContentProvider>
        <Hero />
        <TrustSection />
        <ApprovalSteps />
        <ApproachSection />
        <BadCreditBanner />
        <ReasonsSection />
      </WebsiteContentProvider>
      <ExpertsSection />
      <TestimonialsSection />
      <LendersSection />
      <FinalCTA />
    </>
  )
}