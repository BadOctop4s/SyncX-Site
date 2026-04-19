import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import EvilEye from '@/components/canvas/EvilEye'
import Cursor from '@/components/layout/Cursor'
import Hero from '@/components/sections/Hero'
import Marquee from '@/components/sections/Marquee'
import Products from '@/components/sections/Products'
import Features from '@/components/sections/Features'
import Changelog from '@/components/sections/Changelog'
import Community from '@/components/sections/Community'
import HowTo from '@/components/sections/HowTo'
import FAQ from '@/components/sections/FAQ'
import CTA from '@/components/sections/CTA'
import { ToastProvider } from '@/components/ui/Toast'

export default function Home() {
  return (
    <ToastProvider>
      <Cursor />
      <EvilEye />
      <Nav />
      <Hero />
      <Marquee />
      <div className="divider" />
      <Products />
      <div className="divider" />
      <Features />
      <div className="divider" />
      <Changelog />
      <div className="divider" />
      <Community />
      <div className="divider" />
      <HowTo />
      <div className="divider" />
      <FAQ />
      <div className="divider" />
      <CTA />
      <Footer />
    </ToastProvider>
  )
}
