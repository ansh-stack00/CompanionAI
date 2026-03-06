import FAQ from "./(landing)/_components/faq";
import Features from "./(landing)/_components/featues";
import Footer from "./(landing)/_components/footer";
import Hero from "./(landing)/_components/hero";
import HowItWorks from "./(landing)/_components/howItWorks";
import Navbar from "./(landing)/_components/navBar";


export default function LandingPage() {
  return (
    <main className="bg-[#050508] text-white min-h-screen overflow-x-hidden">
      <Navbar/>
      <Hero/>
      <Features/>
      <HowItWorks/>
      <FAQ/>
      <Footer/>
    </main>
  )
}