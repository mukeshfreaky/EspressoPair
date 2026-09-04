import React, { useState } from 'react';
import { RecommendationOutput, UserProfile, ScoredPair, RetailerLink } from '../types/index.ts';
import { 
  Check, 
  ExternalLink, 
  Share2, 
  RotateCcw, 
  Sparkles, 
  ArrowDownRight, 
  ArrowUpRight, 
  ChevronRight,
  Info,
  AlertTriangle,
  PiggyBank
} from 'lucide-react';
import { trackEvent } from '../lib/analytics.ts';

interface ResultsViewProps {
  results: RecommendationOutput;
  userProfile: UserProfile;
  onRetake: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  results,
  userProfile,
  onRetake
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedAlt, setSelectedAlt] = useState<ScoredPair | null>(null);

  // Active display pair (either primary or selected alternative)
  const activePair = selectedAlt || results.primary;
  const isAlternativeActive = selectedAlt !== null;

  const handleCopyLink = () => {
    const params = new URLSearchParams({
      drinks: userProfile.drink_preference,
      volume: String(userProfile.volume_back_to_back),
      tinkering: userProfile.tinkering_preference,
      beans: userProfile.bean_handling,
      budget: String(userProfile.budget),
      pid: String(!!userProfile.dealbreakers?.must_have_pid),
      levers: String(!!userProfile.dealbreakers?.no_manual_levers),
      counter: String(!!userProfile.dealbreakers?.small_counter_only)
    });

    const shareUrl = `${window.location.origin}/#build?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    trackEvent('share_clicked', { url: shareUrl });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRetailerClick = (itemType: 'machine' | 'grinder', retailer: RetailerLink) => {
    trackEvent('retailer_clicked', {
      product_id: itemType === 'machine' ? activePair.machine.id : activePair.grinder.id,
      retailer: retailer.name,
      url: retailer.url
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      
      {/* Top Header & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-coffee-200">
        <div>
          <span className="text-xs font-semibold text-crema uppercase tracking-wider block mb-1">
            {results.status === 'NO_FEASIBLE_SETUP' ? 'Budget Reality Check' : 'Deterministic Match Result'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-coffee-950">
            {isAlternativeActive 
              ? 'Alternative Setup' 
              : results.status === 'NO_FEASIBLE_SETUP' 
                ? 'Closest Viable Entry Setup (Exceeds Budget)' 
                : 'Your Recommended Setup'}
          </h1>
          <p className="text-coffee-600 text-sm mt-0.5">
            {results.status === 'NO_FEASIBLE_SETUP' ? (
              <span>Target budget was <strong>${userProfile.budget.toLocaleString()}</strong>. Showing the lowest-cost capable setup found.</span>
            ) : (
              <span>
                Calibrated for <strong>{userProfile.drink_preference.replace('_', ' ')}</strong>, up to{' '}
                <strong>{userProfile.volume_back_to_back === 4 ? '4+' : userProfile.volume_back_to_back} drinks</strong>, within a strict{' '}
                <strong>${userProfile.budget.toLocaleString()}</strong> ceiling.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-white hover:bg-coffee-50 border border-coffee-200 text-coffee-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-coffee-600" />}
            <span>{copied ? 'Link Copied!' : 'Share Setup'}</span>
          </button>

          <button
            onClick={onRetake}
            className="px-3.5 py-2 bg-coffee-100 hover:bg-coffee-200 text-coffee-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake</span>
          </button>
        </div>
      </div>

      {/* No Feasible Setup Explicit Banner */}
      {results.status === 'NO_FEASIBLE_SETUP' && (
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-5 text-amber-950 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>I couldn't build a new setup within ${userProfile.budget.toLocaleString()}</span>
          </div>
          <p className="text-xs text-amber-900/90 leading-relaxed">
            The cheapest viable new setup I found is approximately <strong>${results.primary.total_cost.toLocaleString()}</strong> (including essentials like a digital scale and tamper).
          </p>
          <p className="text-xs text-amber-800 leading-relaxed">
            Below this threshold, new electric machines use pressurized false-crema baskets that produce bitter, thin coffee. If <strong>${userProfile.budget.toLocaleString()}</strong> is a strict ceiling, I'd strongly suggest hunting the used market (e.g. a used Breville Bambino or Gaggia Classic) rather than settling for department-store fake espresso.
          </p>
        </div>
      )}

      {/* 1. HERO GEAR PAIR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Machine Card */}
        <div className="bg-white rounded-xl border border-coffee-200/90 shadow-sm p-6 flex flex-col justify-between hover:border-coffee-300 transition-all">
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="text-[11px] font-bold text-coffee-500 uppercase tracking-wider block">Espresso Machine</span>
                <h3 className="font-serif text-xl font-bold text-coffee-950 leading-tight">
                  {activePair.machine.name}
                </h3>
              </div>
              <span className="font-serif text-xl font-bold text-coffee-950 bg-coffee-50 px-2.5 py-1 rounded border border-coffee-200/60">
                ${activePair.machine.price}
              </span>
            </div>

            {/* Core Specs Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-coffee-100 my-3 text-coffee-700">
              <div>
                <span className="text-coffee-500 block text-[10px] uppercase">Boiler / Heat</span>
                <strong className="capitalize">{activePair.machine.boiler_type.replace('_', ' ')}</strong>
              </div>
              <div>
                <span className="text-coffee-500 block text-[10px] uppercase">Warm-up Time</span>
                <strong>{activePair.machine.warmup_minutes === 0 ? 'Instant (Kettle)' : `${activePair.machine.warmup_minutes} min`}</strong>
              </div>
              <div>
                <span className="text-coffee-500 block text-[10px] uppercase">PID Temp Control</span>
                <strong>{activePair.machine.has_pid ? 'Yes (Digital)' : 'No (Thermostat)'}</strong>
              </div>
              <div>
                <span className="text-coffee-500 block text-[10px] uppercase">Steam Power</span>
                <strong className="capitalize">{activePair.machine.steam_capability.replace('_', ' ')}</strong>
              </div>
            </div>

            {/* Machine My Take */}
            <div className="bg-coffee-50/70 p-3.5 rounded-lg border border-coffee-100/80 mb-4 text-xs leading-relaxed text-coffee-800">
              <span className="font-bold text-coffee-900 block mb-0.5 text-[11px] uppercase tracking-wide">Editor's Take:</span>
              "{activePair.machine.my_take}"
            </div>
          </div>

          {/* Retailer Direct Links */}
          <div>
            <div className="text-[11px] font-medium text-coffee-500 mb-1.5 flex items-center justify-between">
              <span>Where to buy verified:</span>
              <span className="text-[10px] text-coffee-400">Direct & Affiliates</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activePair.machine.retailers.map(ret => (
                <a
                  key={ret.retailer_id}
                  href={ret.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleRetailerClick('machine', ret)}
                  className="px-3 py-1.5 bg-coffee-100 hover:bg-coffee-200 text-coffee-900 text-xs font-medium rounded flex items-center gap-1 transition-colors"
                >
                  <span>{ret.name}</span>
                  <ExternalLink className="w-3 h-3 text-coffee-500" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Grinder Card */}
        <div className="bg-white rounded-xl border border-coffee-200/90 shadow-sm p-6 flex flex-col justify-between hover:border-coffee-300 transition-all">
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="text-[11px] font-bold text-coffee-500 uppercase tracking-wider block">Espresso Grinder</span>
                <h3 className="font-serif text-xl font-bold text-coffee-950 leading-tight">
                  {activePair.grinder.name}
                </h3>
              </div>
              <span className="font-serif text-xl font-bold text-coffee-950 bg-coffee-50 px-2.5 py-1 rounded border border-coffee-200/60">
                ${activePair.grinder.price}
              </span>
            </div>

            {/* Core Specs Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-coffee-100 my-3 text-coffee-700">
              <div>
                <span className="text-coffee-500 block text-[10px] uppercase">Burr Geometry</span>
                <strong className="capitalize">{activePair.grinder.burr_type} ({activePair.grinder.burr_size_mm}mm)</strong>
              </div>
              <div>
                <span className="text-coffee-500 block text-[10px] uppercase">Workflow Type</span>
                <strong className="capitalize">{activePair.grinder.type.replace('_', ' ')}</strong>
              </div>
              <div>
                <span className="text-coffee-500 block text-[10px] uppercase">Retention</span>
                <strong className="capitalize">{activePair.grinder.retention_level.replace('_', ' ')} ({activePair.grinder.retention_grams}g)</strong>
              </div>
              <div>
                <span className="text-coffee-500 block text-[10px] uppercase">Adjustment</span>
                <strong>{activePair.grinder.is_stepless ? 'Stepless Micrometric' : 'Micro-stepped'}</strong>
              </div>
            </div>

            {/* Grinder My Take */}
            <div className="bg-coffee-50/70 p-3.5 rounded-lg border border-coffee-100/80 mb-4 text-xs leading-relaxed text-coffee-800">
              <span className="font-bold text-coffee-900 block mb-0.5 text-[11px] uppercase tracking-wide">Editor's Take:</span>
              "{activePair.grinder.my_take}"
            </div>
          </div>

          {/* Retailer Direct Links */}
          <div>
            <div className="text-[11px] font-medium text-coffee-500 mb-1.5 flex items-center justify-between">
              <span>Where to buy verified:</span>
              <span className="text-[10px] text-coffee-400">Direct & Affiliates</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activePair.grinder.retailers.map(ret => (
                <a
                  key={ret.retailer_id}
                  href={ret.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleRetailerClick('grinder', ret)}
                  className="px-3 py-1.5 bg-coffee-100 hover:bg-coffee-200 text-coffee-900 text-xs font-medium rounded flex items-center gap-1 transition-colors"
                >
                  <span>{ret.name}</span>
                  <ExternalLink className="w-3 h-3 text-coffee-500" />
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 2. WHY I PICKED THIS (PERSONALIZED EDITORIAL EXPLANATION) */}
      <div className="bg-white border border-coffee-200/90 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-crema" />
          <h2 className="font-serif text-2xl font-bold text-coffee-950">
            Why I picked this setup for you
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-sm">
          <div className="p-4 rounded-lg bg-coffee-50/60 border border-coffee-100 space-y-1.5">
            <span className="font-serif font-bold text-coffee-900 text-sm block">Machine Logic:</span>
            <p className="text-coffee-700 text-xs leading-relaxed">
              {results.editorial_reasoning.why_this_machine}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-coffee-50/60 border border-coffee-100 space-y-1.5">
            <span className="font-serif font-bold text-coffee-900 text-sm block">Grinder Logic:</span>
            <p className="text-coffee-700 text-xs leading-relaxed">
              {results.editorial_reasoning.why_this_grinder}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-coffee-50/60 border border-coffee-100 space-y-1.5">
            <span className="font-serif font-bold text-coffee-900 text-sm block">Budget Allocation:</span>
            <p className="text-coffee-700 text-xs leading-relaxed">
              {results.editorial_reasoning.budget_allocation_rationale}
            </p>
          </div>
        </div>

        {/* Unspent Budget Identity Card */}
        {results.editorial_reasoning.unspent_budget_rationale && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-50/70 border border-emerald-200/70 space-y-1 text-xs">
            <span className="font-serif font-bold text-emerald-950 text-sm flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-emerald-600" />
              Why I wouldn't spend your remaining ${userProfile.budget - results.primary.total_cost}:
            </span>
            <p className="text-emerald-900/90 leading-relaxed pt-0.5">
              {results.editorial_reasoning.unspent_budget_rationale}
            </p>
          </div>
        )}
      </div>

      {/* 3. WHAT YOU'LL SPEND (HONEST TOTAL COST BREAKDOWN) */}
      <div className="bg-coffee-100/60 border border-coffee-200 rounded-xl p-6 sm:p-8 space-y-4">
        <h2 className="font-serif text-xl font-bold text-coffee-950">
          What you'll actually spend (Total System Cost)
        </h2>
        <p className="text-xs text-coffee-600">
          Most sites only price the machine, forgetting that espresso requires a dedicated grinder and tools to pull repeatable shots. Here is your true out-of-pocket setup total:
        </p>

        <div className="bg-white rounded-lg border border-coffee-200 p-4 space-y-2.5 text-sm">
          <div className="flex justify-between items-center text-coffee-700">
            <span>{activePair.machine.name}</span>
            <span className="font-medium">${activePair.machine.price}</span>
          </div>

          <div className="flex justify-between items-center text-coffee-700">
            <span>{activePair.grinder.name}</span>
            <span className="font-medium">${activePair.grinder.price}</span>
          </div>

          <div className="flex justify-between items-center text-coffee-700">
            <span className="flex items-center gap-1">
              Essential Tools (0.1g Scale, WDT tool, Leveling tamper, Pitcher)
            </span>
            <span className="font-medium">${activePair.accessories_cost}</span>
          </div>

          <div className="pt-3 border-t border-coffee-200 flex justify-between items-center text-coffee-950 font-bold text-base sm:text-lg">
            <span>Total Setup Cost:</span>
            <div className="text-right">
              <span className="text-crema">${activePair.total_cost}</span>
              {activePair.total_cost > userProfile.budget ? (
                <span className="text-xs font-semibold text-amber-700 block">
                  (${activePair.total_cost - userProfile.budget} over your ${userProfile.budget} target)
                </span>
              ) : (
                <span className="text-xs font-normal text-coffee-500 block">
                  (${userProfile.budget - activePair.total_cost} remaining under your ${userProfile.budget} budget)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. "I'D BUY THIS INSTEAD" ALTERNATIVES */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-coffee-950">
          "I'd buy this instead" Alternatives
        </h2>
        <p className="text-xs text-coffee-600">
          Every espresso setup involves a tradeoff. If you want to modify your spending slightly, here are the two logical alternatives:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Spend Less */}
          {results.spend_less && (
            <div 
              onClick={() => setSelectedAlt(results.spend_less)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                selectedAlt?.machine.id === results.spend_less.machine.id && selectedAlt?.grinder.id === results.spend_less.grinder.id
                  ? 'border-crema bg-crema-light/40 ring-1 ring-crema'
                  : 'border-coffee-200 bg-white hover:border-coffee-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4" /> Spend Less Alternative
                </span>
                <span>Save ${results.primary.total_cost - results.spend_less.total_cost}</span>
              </div>
              <h4 className="font-serif font-bold text-coffee-950 text-base mb-1">
                {results.spend_less.machine.name} + {results.spend_less.grinder.name}
              </h4>
              <p className="text-xs text-coffee-600 leading-relaxed mb-3">
                {results.spend_less.alternative_reasoning || `Total: $${results.spend_less.total_cost}. Keeps cash in your pocket with minor compromises.`}
              </p>
              <span className="text-xs font-medium text-crema flex items-center gap-1">
                View this setup <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          {/* Spend More */}
          {results.spend_more && (
            <div 
              onClick={() => setSelectedAlt(results.spend_more)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                selectedAlt?.machine.id === results.spend_more.machine.id && selectedAlt?.grinder.id === results.spend_more.grinder.id
                  ? 'border-crema bg-crema-light/40 ring-1 ring-crema'
                  : 'border-coffee-200 bg-white hover:border-coffee-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" /> Spend More Alternative
                </span>
                <span>+${results.spend_more.total_cost - results.primary.total_cost}</span>
              </div>
              <h4 className="font-serif font-bold text-coffee-950 text-base mb-1">
                {results.spend_more.machine.name} + {results.spend_more.grinder.name}
              </h4>
              <p className="text-xs text-coffee-600 leading-relaxed mb-3">
                {results.spend_more.alternative_reasoning || `Total: $${results.spend_more.total_cost}. Unlocks dual-boiler simultaneous steaming or larger commercial burrs.`}
              </p>
              <span className="text-xs font-medium text-crema flex items-center gap-1">
                View this setup <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </div>

        {selectedAlt && (
          <button
            onClick={() => setSelectedAlt(null)}
            className="text-xs font-medium text-coffee-600 hover:text-coffee-950 underline block mt-2"
          >
            ← Switch back to primary recommendation
          </button>
        )}
      </div>

      {/* 5. ACCESSORIES: WHAT YOU NEED VS WHAT YOU DON'T */}
      <div className="bg-white border border-coffee-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <h2 className="font-serif text-2xl font-bold text-coffee-950">
            Accessories: What you actually need (and what to skip)
          </h2>
          <p className="text-xs text-coffee-600 mt-1">
            Coffee gear marketing is notorious for selling you $200 gadgets you don't need. Here is the honest truth:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Useful additions */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-emerald-800 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Useful Additions (Included in setup total)
            </h4>
            <div className="space-y-2.5">
              {results.accessories.actually_needed.map(acc => (
                <div key={acc.id} className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-100 text-xs">
                  <div className="flex justify-between font-bold text-coffee-950 mb-0.5">
                    <span>{acc.name}</span>
                    <span className="text-emerald-700">~${acc.price}</span>
                  </div>
                  <p className="text-coffee-600 leading-relaxed">{acc.why_needed}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Things you don't need yet */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-coffee-700 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-coffee-500" />
              Things you absolutely DO NOT need yet
            </h4>
            <div className="space-y-2.5">
              {results.accessories.dont_need_yet.map(acc => (
                <div key={acc.id} className="p-3 bg-coffee-50/70 rounded-lg border border-coffee-200/60 text-xs">
                  <div className="flex justify-between font-bold text-coffee-800 mb-0.5">
                    <span>{acc.name}</span>
                    <span className="line-through text-coffee-400">${acc.price}</span>
                  </div>
                  <p className="text-coffee-600 leading-relaxed">{acc.skip_reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
