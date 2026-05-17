import Hero from '@/components/hero/Hero';
import Manifesto from '@/components/sections/Manifesto';
import Services from '@/components/sections/Services';
import Rooms from '@/components/sections/Rooms';
import Process from '@/components/sections/Process';
import Works from '@/components/sections/Works';
import Voices from '@/components/sections/Voices';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import SignalDivider from '@/components/SignalDivider';

export default function LandingPage() {
  return (
    <main>
      {/* Sticky 3D hero — content below slides over it. */}
      <Hero />

      <div className="relative z-20">
        {/* Cinematic dissolve: the hero fades out through this gradient
            instead of being cut off by a hard opaque edge. Kept short so
            the spiral doesn't linger behind the navbar while reading. */}
        <div
          aria-hidden
          className="h-[clamp(140px,25vh,280px)] bg-gradient-to-b from-bg/0 via-bg/70 to-bg"
        />

        <Manifesto />
        <SignalDivider />
        <Services />
        <SignalDivider />
        <Rooms />
        <SignalDivider />
        <Process />
        <SignalDivider />
        <Works />
        <SignalDivider />
        <Voices />
        <SignalDivider />
        <Contact />
        <SignalDivider />
        <Footer />
      </div>
    </main>
  );
}
