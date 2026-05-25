import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import LogoMarquee from './sections/LogoMarquee';
import Features from './sections/Features';
import HowItWorks from './sections/HowItWorks';
import Showcase from './sections/Showcase';
import TechStack from './sections/TechStack';
import UseCases from './sections/UseCases';
import Testimonials from './sections/Testimonials';
import CTA from './sections/CTA';
import Footer from './sections/Footer';

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background orbs (fixed for the whole page) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="glow-orb"
          style={{
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
            top: '-150px',
            left: '-100px',
          }}
        />
        <div
          className="glow-orb"
          style={{
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, #4c1d95 0%, transparent 70%)',
            top: '40%',
            right: '-200px',
            opacity: 0.45,
          }}
        />
        <div
          className="glow-orb"
          style={{
            width: 500,
            height: 500,
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            bottom: '-100px',
            left: '30%',
            opacity: 0.35,
          }}
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <LogoMarquee />
          <Features />
          <HowItWorks />
          <Showcase />
          <TechStack />
          <UseCases />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
