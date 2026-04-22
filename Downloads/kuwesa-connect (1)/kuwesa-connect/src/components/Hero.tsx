import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/kuwesa-logo.png";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-24 pb-16">
      {/* Decorative blobs */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary-glow rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container-custom relative z-10 text-center px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-medium mb-8 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Kehancha · Ikerege · Mabera · Isebania</span>
        </div>

        <div className="flex justify-center mb-8 animate-scale-in">
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full" />
            <img
              src={logo}
              alt="KUWESA — Kuria West Students Association logo"
              className="relative h-32 w-32 sm:h-40 sm:w-40 object-contain drop-shadow-2xl animate-float"
            />
          </div>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white text-balance mb-4 animate-fade-in-up">
          Kuria West Students <br className="hidden sm:block" />
          <span className="text-accent">Association</span>
        </h1>
        <p className="text-white/80 text-sm sm:text-base font-medium tracking-wider uppercase mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          KUWESA
        </p>

        <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto text-balance mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Empowering Students. Building Leaders. Transforming Communities.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <a href="#membership">
            <Button variant="gold" size="xl" className="group">
              Join KUWESA
              <ArrowRight className="h-5 w-5 transition-bounce group-hover:translate-x-1" />
            </Button>
          </a>
          <a href="#about">
            <Button
              size="xl"
              className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 backdrop-blur-md"
            >
              Learn More
            </Button>
          </a>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          {[
            { n: "4", l: "Wards United" },
            { n: "5", l: "Programs" },
            { n: "200", l: "KES Membership" },
            { n: "1", l: "Strong Family" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-white">{s.n}</div>
              <div className="text-xs sm:text-sm text-white/70 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
