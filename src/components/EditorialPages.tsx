import React from 'react';
import { X, Coffee } from 'lucide-react';

interface EditorialPagesProps {
  initialTab?: 'founder' | 'how_it_works' | 'grinder_budget' | 'boilers';
  onClose: () => void;
}

export const EditorialPages: React.FC<EditorialPagesProps> = ({ 
  initialTab = 'how_it_works', 
  onClose 
}) => {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  return (
    <div className="fixed inset-0 z-50 bg-coffee-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-coffee-50 border border-coffee-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-coffee-200 bg-white">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-crema" />
            <span className="font-serif font-bold text-lg text-coffee-950">EspressoPair Editorial & Guides</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-coffee-500 hover:text-coffee-900 hover:bg-coffee-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-coffee-200 bg-coffee-100/50 px-6 gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm font-medium">
          {[
            { id: 'how_it_works', label: 'How It Works & Ethics' },
            { id: 'founder', label: 'Founder Story' },
            { id: 'grinder_budget', label: 'Grinder vs Machine Budget' },
            { id: 'boilers', label: 'Boiler Types Explained' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-crema text-crema font-bold'
                  : 'border-transparent text-coffee-600 hover:text-coffee-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-coffee-800 text-sm leading-relaxed">
          
          {/* TAB 1: HOW IT WORKS */}
          {activeTab === 'how_it_works' && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-coffee-950">
                Deterministic Matching & Commercial Ethics
              </h3>
              <p>
                EspressoPair is built on a simple premise: <strong>your equipment recommendations should be calculated by engineering constraints, not who pays the highest affiliate bounty.</strong>
              </p>

              <div className="p-4 bg-white rounded-xl border border-coffee-200 space-y-2">
                <h4 className="font-serif font-bold text-coffee-900 text-base">
                  1. Strict Total System Budget
                </h4>
                <p className="text-xs text-coffee-600">
                  When you enter a budget of $1,000, our engine treats that as the maximum total cost for the <strong>Machine + Grinder + Essential Tools</strong>. We will never recommend a $900 machine that leaves you unable to buy a capable grinder.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-coffee-200 space-y-2">
                <h4 className="font-serif font-bold text-coffee-900 text-base">
                  2. Decoupled Affiliate Architecture
                </h4>
                <p className="text-xs text-coffee-600">
                  Affiliate links live purely on the presentation layer. A product's score, compatibility rating, and recommendation ranking are completely isolated in code from whether or not an affiliate program exists. We regularly recommend products with zero affiliate compensation (like the Cafelat Robot or Niche Zero) whenever they are the best tool for the user.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-coffee-200 space-y-2">
                <h4 className="font-serif font-bold text-coffee-900 text-base">
                  3. Manually Curated Data & Real Sources
                </h4>
                <p className="text-xs text-coffee-600">
                  We do not scrape unverified Amazon listings or use AI to hallucinate product specs. Every machine and grinder has a source URL, verified physical dimensions, boiler architecture notes, and a last-verified date.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: FOUNDER STORY */}
          {activeTab === 'founder' && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-coffee-950">
                Why I Built EspressoPair
              </h3>
              <p>
                I wanted an espresso machine.
              </p>
              <p>
                Then I made the mistake of researching espresso machines.
              </p>
              <p>
                Suddenly I was comparing dual boilers, thermojets, burr geometry, PID implementations, workflow ergonomics, retention bellows, heat-up times and approximately 900 opinions from people who seemed to disagree about everything on Reddit and YouTube.
              </p>
              <p>
                One person told me you can't make real espresso without spending $2,500 on a dual boiler. Another swore you only need a $99 lever press and a hand grinder. Big-box store reviews were useless because people were reviewing cheap pressurized machines that make watery bitter foam.
              </p>
              <p className="font-medium text-coffee-950">
                I realized the problem wasn't a lack of information. There was too much of it.
              </p>
              <p>
                EspressoPair is my attempt to turn all that obsessive research into one simple question:
              </p>
              <blockquote className="border-l-4 border-crema pl-4 italic text-coffee-900 font-serif text-base my-3">
                “Given how YOU drink coffee, what would I actually buy?”
              </blockquote>
              <p className="text-xs text-coffee-500 pt-2">
                No corporate sponsor. No venture capital. Just an enthusiast who got annoyed and built the tool they wished had existed.
              </p>
            </div>
          )}

          {/* TAB 3: GRINDER BUDGET */}
          {activeTab === 'grinder_budget' && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-coffee-950">
                Machine vs. Grinder Budget: Where should the money go?
              </h3>
              <p>
                The most common mistake first-time home baristas make is spending 85% of their budget on a shiny chrome machine and buying a cheap $70 spice grinder.
              </p>
              <p>
                <strong>In espresso, the grinder is vastly more important than the machine.</strong>
              </p>
              <div className="bg-crema-light/50 p-4 rounded-xl border border-crema/40 text-xs text-coffee-800 space-y-2">
                <p>
                  <strong>Why?</strong> Espresso requires forcing 9 bars of water pressure through a dense puck of coffee grounds in approximately 25 to 30 seconds.
                </p>
                <p>
                  If your grinder produces uneven particle sizes (boulders and microscopic fines), water will find the path of least resistance and blast through weak channels. The result is espresso that is sour, bitter, and astringent at the same time.
                </p>
              </div>
              <h4 className="font-serif font-bold text-coffee-900 text-base pt-2">
                The Golden Ratio: Allocate 30% to 45% to the Grinder
              </h4>
              <p className="text-xs text-coffee-600">
                A $300 Breville Bambino paired with a $400 flat-burr DF64 will consistently pull sweeter, higher-clarity espresso than a $1,500 Italian machine paired with an entry-level spice grinder.
              </p>
            </div>
          )}

          {/* TAB 4: BOILER TYPES */}
          {activeTab === 'boilers' && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-coffee-950">
                Single Boiler vs. Heat Exchanger vs. Dual Boiler
              </h3>
              <p className="text-xs text-coffee-600">
                Understanding boiler architecture without the confusing thermodynamics:
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 bg-white rounded-lg border border-coffee-200 text-xs space-y-1">
                  <div className="font-bold text-coffee-950 text-sm">1. ThermoJet / Thermoblock (Bambino, Ascaso)</div>
                  <p className="text-coffee-600">
                    Heats water on demand through a coiled metal element like a tankless water heater. <strong>Warmup time: 3 seconds to 2 minutes.</strong> Excellent for fast morning routines.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-coffee-200 text-xs space-y-1">
                  <div className="font-bold text-coffee-950 text-sm">2. Single Boiler Dual Use (Gaggia Classic, Profitec GO, Silvia)</div>
                  <p className="text-coffee-600">
                    One water tank for both brewing and steaming. Because brewing happens at ~200°F and steaming requires ~270°F, you must wait 45-60 seconds for the boiler to climb in temperature between pulling a shot and frothing milk. <strong>Best for 1-2 drinks per morning.</strong>
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-coffee-200 text-xs space-y-1">
                  <div className="font-bold text-coffee-950 text-sm">3. Heat Exchanger / HX (Lelit Mara X, Profitec Pro 400)</div>
                  <p className="text-coffee-600">
                    A large steam boiler with a copper tube running through the center. Fresh water flashes to brew temperature inside the tube while the surrounding steam boiler is ready to steam. <strong>Can brew and steam at the same time. Warmup: 20-25 minutes.</strong>
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-coffee-200 text-xs space-y-1">
                  <div className="font-bold text-coffee-950 text-sm">4. Dual Boiler (Breville Dual Boiler, Silvia Pro X, Bianca)</div>
                  <p className="text-coffee-600">
                    Two independent, dedicated boilers with separate PID microcontrollers. The gold standard for temperature precision and continuous back-to-back latte texturing.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-coffee-100 border-t border-coffee-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-coffee-900 hover:bg-coffee-800 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
