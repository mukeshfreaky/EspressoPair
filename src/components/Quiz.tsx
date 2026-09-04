import React, { useState } from 'react';
import { UserProfile } from '../types/index.ts';
import { 
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';

interface QuizProps {
  initialProfile?: Partial<UserProfile>;
  onComplete: (profile: UserProfile) => void;
  onCancel: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ initialProfile, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Profile State
  const [drinkPref, setDrinkPref] = useState<UserProfile['drink_preference']>(
    initialProfile?.drink_preference || 'both'
  );
  const [volume, setVolume] = useState<UserProfile['volume_back_to_back']>(
    initialProfile?.volume_back_to_back || 2
  );
  const [tinkering, setTinkering] = useState<UserProfile['tinkering_preference']>(
    initialProfile?.tinkering_preference || 'willing_to_learn'
  );
  const [beanHandling, setBeanHandling] = useState<UserProfile['bean_handling']>(
    initialProfile?.bean_handling || 'either'
  );
  const [budget, setBudget] = useState<number>(
    initialProfile?.budget || 1200
  );
  const [priority] = useState<UserProfile['priority']>(
    initialProfile?.priority || 'balanced'
  );
  const [dealbreakers, setDealbreakers] = useState<NonNullable<UserProfile['dealbreakers']>>({
    must_have_pid: initialProfile?.dealbreakers?.must_have_pid || false,
    no_manual_levers: initialProfile?.dealbreakers?.no_manual_levers || false,
    small_counter_only: initialProfile?.dealbreakers?.small_counter_only || false,
    fast_warmup_only: initialProfile?.dealbreakers?.fast_warmup_only || false,
    no_single_boiler: initialProfile?.dealbreakers?.no_single_boiler || false,
  });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const finalProfile: UserProfile = {
        drink_preference: drinkPref,
        volume_back_to_back: volume,
        tinkering_preference: tinkering,
        bean_handling: beanHandling,
        budget: budget,
        priority: priority,
        dealbreakers: dealbreakers
      };
      onComplete(finalProfile);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  const toggleDealbreaker = (key: keyof NonNullable<UserProfile['dealbreakers']>) => {
    setDealbreakers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-coffee-600 mb-2 font-medium">
          <span>Question {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}% completed</span>
        </div>
        <div className="w-full h-1.5 bg-coffee-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-crema transition-all duration-300 ease-out rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Drink Type */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold text-crema uppercase tracking-wider block mb-1">Step 1: Your Coffee</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-coffee-950">
              What do you actually drink?
            </h2>
            <p className="text-coffee-600 text-sm mt-1">
              Be honest. This is the single biggest factor in choosing boiler and steam architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'milk_drinks', title: 'Mostly milk drinks', desc: 'Lattes, flat whites, cappuccinos. Steam power and fast recovery matter.' },
              { id: 'espresso', title: 'Mostly straight espresso', desc: 'Double shots, macchiatos. Temperature stability and clarity matter most.' },
              { id: 'both', title: 'A bit of everything', desc: 'Espresso on weekends, lattes on weekdays. Balanced versatility.' },
              { id: 'americanos', title: 'Americanos & Long Blacks', desc: 'Espresso topped with clean hot water without weird mineral taste.' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setDrinkPref(opt.id as UserProfile['drink_preference'])}
                className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                  drinkPref === opt.id
                    ? 'border-crema bg-crema-light/50 shadow-sm ring-1 ring-crema'
                    : 'border-coffee-200 bg-white hover:border-coffee-300'
                }`}
              >
                <div>
                  <div className="font-serif font-bold text-coffee-950 text-base mb-0.5">{opt.title}</div>
                  <div className="text-xs text-coffee-600 leading-relaxed">{opt.desc}</div>
                </div>
                {drinkPref === opt.id && <Check className="w-5 h-5 text-crema shrink-0 mt-0.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Volume & Speed */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold text-crema uppercase tracking-wider block mb-1">Step 2: Morning Volume</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-coffee-950">
              How many drinks do you normally make back-to-back?
            </h2>
            <p className="text-coffee-600 text-sm mt-1">
              Single-boiler machines have to switch temperatures between brewing and steaming. Dual boilers and thermojets don't.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { val: 1, title: 'Just me (1 drink)', desc: 'Pull a shot, steam milk once, clean up. Single boilers are totally fine here.' },
              { val: 2, title: '2 to 3 drinks in a row', desc: 'Coffee for me and my partner. Need decent steam recovery.' },
              { val: 4, title: '4+ drinks / Whole household', desc: 'Hosting brunch or making coffee for a crowd. Requires dual heating circuits or instant thermoblocks.' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setVolume(opt.val as UserProfile['volume_back_to_back'])}
                className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                  volume === opt.val
                    ? 'border-crema bg-crema-light/50 shadow-sm ring-1 ring-crema'
                    : 'border-coffee-200 bg-white hover:border-coffee-300'
                }`}
              >
                <div>
                  <div className="font-serif font-bold text-coffee-950 text-base mb-0.5">{opt.title}</div>
                  <div className="text-xs text-coffee-600 leading-relaxed">{opt.desc}</div>
                </div>
                {volume === opt.val && <Check className="w-5 h-5 text-crema shrink-0 mt-0.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Coffee Faff & Tinkering */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold text-crema uppercase tracking-wider block mb-1">Step 3: Workflow Reality</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-coffee-950">
              How much coffee faff are you willing to tolerate?
            </h2>
            <p className="text-coffee-600 text-sm mt-1">
              Some people love the mechanical meditation of manual lever profiling. Others just want caffeine at 6:30 AM without thinking.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'simple', title: 'Press button → coffee', desc: 'Minimum morning friction. 3-second warmup, no temperature surfing, quick cleanup.' },
              { id: 'willing_to_learn', title: 'Happy to learn proper technique', desc: 'Willing to weigh beans, use a WDT needle tool, and learn to steam microfoam.' },
              { id: 'enjoys_ritual', title: 'I actually enjoy the ritual', desc: 'I enjoy dialling in grind sizes, watching bottomless portafilters, and testing different origins.' },
              { id: 'rabbit_hole', title: 'I have watched 47 Hoffmann videos. I am beyond help.', desc: 'Give me PID temperature profiling, stepless flat burrs, and high extraction potential.' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setTinkering(opt.id as UserProfile['tinkering_preference'])}
                className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                  tinkering === opt.id
                    ? 'border-crema bg-crema-light/50 shadow-sm ring-1 ring-crema'
                    : 'border-coffee-200 bg-white hover:border-coffee-300'
                }`}
              >
                <div>
                  <div className="font-serif font-bold text-coffee-950 text-base mb-0.5">{opt.title}</div>
                  <div className="text-xs text-coffee-600 leading-relaxed">{opt.desc}</div>
                </div>
                {tinkering === opt.id && <Check className="w-5 h-5 text-crema shrink-0 mt-0.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Bean Handling */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold text-crema uppercase tracking-wider block mb-1">Step 4: Grinder Style</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-coffee-950">
              How do you want to handle your coffee beans?
            </h2>
            <p className="text-coffee-600 text-sm mt-1">
              Hopper grinders hold a full bag. Single-dose grinders require weighing each dose before grinding, but let you switch beans anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'single_dose', title: 'Single-Dosing (Weigh 18g every shot)', desc: 'Zero retention. Switch between decaf and regular, or light and dark beans shot-to-shot with zero waste.' },
              { id: 'hopper', title: 'Hopper (Fill it and grind on demand)', desc: 'Dump half a bag in the hopper. Press the portafilter against the button for a timed dose.' },
              { id: 'either', title: 'Either is fine with me', desc: 'Match whatever gives me the highest grind quality for my budget.' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setBeanHandling(opt.id as UserProfile['bean_handling'])}
                className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                  beanHandling === opt.id
                    ? 'border-crema bg-crema-light/50 shadow-sm ring-1 ring-crema'
                    : 'border-coffee-200 bg-white hover:border-coffee-300'
                }`}
              >
                <div>
                  <div className="font-serif font-bold text-coffee-950 text-base mb-0.5">{opt.title}</div>
                  <div className="text-xs text-coffee-600 leading-relaxed">{opt.desc}</div>
                </div>
                {beanHandling === opt.id && <Check className="w-5 h-5 text-crema shrink-0 mt-0.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: Budget */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold text-crema uppercase tracking-wider block mb-1">Step 5: Total System Cost</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-coffee-950">
              What is your total setup budget?
            </h2>
            <p className="text-coffee-600 text-sm mt-1">
              We treat budget as a strict ceiling for <strong>Machine + Grinder + Essential Accessories</strong>. We will never recommend a setup that exceeds this number.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-coffee-200 shadow-sm space-y-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-coffee-600">Total System Budget:</span>
              <span className="font-serif text-3xl font-bold text-coffee-950">
                ${budget.toLocaleString()}
              </span>
            </div>

            {/* Slider */}
            <input 
              type="range"
              min="350"
              max="3500"
              step="50"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-crema cursor-pointer h-2 bg-coffee-200 rounded-lg"
            />

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { label: 'Sub-$500 Entry', val: 500 },
                { label: '$750 Sweet Spot', val: 750 },
                { label: '$1,000 Enthusiast Entry', val: 1000 },
                { label: '$1,500 Prosumer', val: 1500 },
                { label: '$2,000 Dual Boiler', val: 2000 },
                { label: '$3,000+ Endgame', val: 3200 },
              ].map(chip => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => setBudget(chip.val)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    budget === chip.val
                      ? 'bg-coffee-900 text-white border-coffee-900 font-medium'
                      : 'bg-coffee-50 text-coffee-700 border-coffee-200 hover:border-coffee-300'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-coffee-500 border-t border-coffee-100 pt-3">
              💡 <em>Includes estimated $56–$70 for essential accessories (0.1g digital scale, WDT distribution needle, self-leveling tamper).</em>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Priorities & Dealbreakers */}
      {step === 6 && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold text-crema uppercase tracking-wider block mb-1">Step 6: Fine-Tuning</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-coffee-950">
              Any non-negotiable deal-breakers?
            </h2>
            <p className="text-coffee-600 text-sm mt-1">
              Select any constraints that apply to your kitchen or morning routine. Leave unchecked if flexible.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { key: 'must_have_pid', label: 'Must have digital PID temperature display', desc: 'No guessing temperatures or temperature-surfing rituals.' },
              { key: 'no_manual_levers', label: 'No manual levers (Flair / Robot)', desc: 'I want an electric water pump doing the extraction pressure work.' },
              { key: 'small_counter_only', label: 'Small kitchen counter only (Compact footprint)', desc: 'Exclude large dual-boiler or commercial-sized machines.' },
              { key: 'fast_warmup_only', label: 'Fast warmup only (Under 5 minutes)', desc: 'Exclude traditional E61 machines that require 20+ minutes of boiler heat-soak.' },
              { key: 'no_single_boiler', label: 'No single-boiler machines', desc: 'Must be able to steam milk without waiting for boiler temperature transitions.' },
            ].map(item => (
              <label
                key={item.key}
                onClick={() => toggleDealbreaker(item.key as keyof NonNullable<UserProfile['dealbreakers']>)}
                className={`p-3.5 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${
                  dealbreakers[item.key as keyof NonNullable<UserProfile['dealbreakers']>]
                    ? 'border-crema bg-crema-light/40'
                    : 'border-coffee-200 bg-white hover:border-coffee-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!dealbreakers[item.key as keyof NonNullable<UserProfile['dealbreakers']>]}
                  onChange={() => {}} // Handled by label onClick
                  className="accent-crema w-4 h-4 mt-0.5 rounded"
                />
                <div>
                  <div className="font-medium text-coffee-900 text-sm">{item.label}</div>
                  <div className="text-xs text-coffee-500">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-8 border-t border-coffee-200 mt-8">
        <button
          onClick={handlePrev}
          className="px-4 py-2.5 text-coffee-700 hover:text-coffee-950 font-medium text-sm rounded flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 1 ? 'Cancel' : 'Back'}</span>
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-3 bg-crema hover:bg-crema-hover text-white font-medium rounded-lg text-sm shadow-sm flex items-center gap-2 transition-all"
        >
          <span>{step === totalSteps ? 'See My Setup' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
