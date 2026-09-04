import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onStartQuiz: () => void;
  onOpenHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartQuiz, onOpenHowItWorks }) => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coffee-100 text-coffee-800 text-xs font-medium mb-6 border border-coffee-200">
        <Sparkles className="w-3.5 h-3.5 text-crema" />
        <span>Deterministic Rule Engine • Zero AI Jargon</span>
      </div>

      {/* Main Headline */}
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-coffee-950 leading-[1.15] mb-6">
        Find an espresso setup that <span className="italic text-crema font-normal">actually makes sense.</span>
      </h1>

      {/* Subhead */}
      <p className="text-base sm:text-lg md:text-xl text-coffee-700 max-w-2xl mx-auto leading-relaxed mb-8">
        Machine + grinder recommendations based on <strong>how you drink coffee</strong>, your <strong>real budget</strong>, and <strong>how much faff you’re willing to tolerate.</strong>
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
        <button
          onClick={onStartQuiz}
          className="w-full sm:w-auto px-7 py-3.5 bg-crema hover:bg-crema-hover text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group text-base"
        >
          <span>Build my setup</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={onOpenHowItWorks}
          className="w-full sm:w-auto px-6 py-3.5 bg-coffee-100/80 hover:bg-coffee-200/80 text-coffee-800 font-medium rounded-lg transition-colors text-base"
        >
          How this works
        </button>
      </div>

      {/* Founder Rationale Card */}
      <div className="bg-coffee-100/50 border border-coffee-200/90 rounded-xl p-6 sm:p-8 text-left max-w-2xl mx-auto mb-16 shadow-sm">
        <h3 className="font-serif font-bold text-coffee-950 text-base mb-2">
          Why I built EspressoPair
        </h3>
        <div className="space-y-3 text-coffee-700 text-sm leading-relaxed">
          <p>
            I wanted to make good espresso at home. Then I made the mistake of reading espresso forums.
          </p>
          <p>
            Suddenly I was lost in 40-page flame wars about PID temp surfing, 64mm flat burr geometry, thermojet recovery rates, retention bellows, and approximately 900 people who disagreed on literally everything.
          </p>
          <p className="font-medium text-coffee-900">
            I realized the problem wasn't a lack of information. There was way too much of it. This is my attempt to turn that noise into one simple answer: <em>"Given how YOU drink coffee, what would I actually buy?"</em>
          </p>
        </div>
      </div>

      {/* 3-Step Explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
        <div className="bg-white/60 p-5 rounded-lg border border-coffee-200/70 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-crema/10 text-crema font-serif font-bold flex items-center justify-center mb-3 text-sm">
            1
          </div>
          <h4 className="font-serif font-bold text-coffee-950 text-sm mb-1">
            Tell me what you drink
          </h4>
          <p className="text-xs text-coffee-600 leading-relaxed">
            Morning lattes? 3-shot straight espresso? Quick button push or hands-on mechanical lever?
          </p>
        </div>

        <div className="bg-white/60 p-5 rounded-lg border border-coffee-200/70 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-crema/10 text-crema font-serif font-bold flex items-center justify-center mb-3 text-sm">
            2
          </div>
          <h4 className="font-serif font-bold text-coffee-950 text-sm mb-1">
            Set your real budget
          </h4>
          <p className="text-xs text-coffee-600 leading-relaxed">
            Total system cost including scale and tamper. Never an upsell past your stated limit.
          </p>
        </div>

        <div className="bg-white/60 p-5 rounded-lg border border-coffee-200/70 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-crema/10 text-crema font-serif font-bold flex items-center justify-center mb-3 text-sm">
            3
          </div>
          <h4 className="font-serif font-bold text-coffee-950 text-sm mb-1">
            Get the pairing I'd buy
          </h4>
          <p className="text-xs text-coffee-600 leading-relaxed">
            A machine and grinder balanced so neither bottlenecks the other, with plain-English reasoning.
          </p>
        </div>
      </div>
    </section>
  );
};
