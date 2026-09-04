import { useState, useEffect } from 'react';
import { UserProfile, RecommendationOutput } from './types/index.ts';
import { recommendSetup } from './lib/engine.ts';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { Hero } from './components/Hero.tsx';
import { Quiz } from './components/Quiz.tsx';
import { ResultsView } from './components/ResultsView.tsx';
import { GearCatalogView } from './components/GearCatalogView.tsx';
import { EditorialPages } from './components/EditorialPages.tsx';
import { trackEvent } from './lib/analytics.ts';

export function App() {
  const [view, setView] = useState<'hero' | 'quiz' | 'results' | 'catalog'>('hero');
  const [editorialTab, setEditorialTab] = useState<'none' | 'founder' | 'how_it_works' | 'grinder_budget' | 'boilers'>('none');
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    drink_preference: 'both',
    volume_back_to_back: 2,
    tinkering_preference: 'willing_to_learn',
    bean_handling: 'either',
    budget: 1200
  });

  const [results, setResults] = useState<RecommendationOutput | null>(null);

  // URL Parameter Hydration (for shared links like /#build?budget=1500&drinks=milk...)
  useEffect(() => {
    trackEvent('homepage_view');

    const parseUrlState = () => {
      const hash = window.location.hash;
      const search = window.location.search || (hash.includes('?') ? hash.substring(hash.indexOf('?')) : '');
      
      if (search) {
        const params = new URLSearchParams(search);
        const budgetParam = params.get('budget');
        const drinksParam = params.get('drinks');
        const volumeParam = params.get('volume');
        const tinkeringParam = params.get('tinkering');
        const beansParam = params.get('beans');

        if (budgetParam || drinksParam) {
          const parsedBudget = Number(budgetParam);
          const validBudget = !isNaN(parsedBudget) && parsedBudget >= 100 && parsedBudget <= 10000 ? parsedBudget : 1200;
          
          const validDrinks: UserProfile['drink_preference'] = 
            drinksParam === 'espresso' || drinksParam === 'milk_drinks' || drinksParam === 'both' 
              ? drinksParam 
              : 'both';

          const parsedVol = Number(volumeParam);
          const validVol: UserProfile['volume_back_to_back'] = 
            parsedVol === 1 || parsedVol === 2 || parsedVol === 3 || parsedVol === 4 
              ? parsedVol 
              : 2;

          const validTinkering: UserProfile['tinkering_preference'] =
            tinkeringParam === 'simple' || tinkeringParam === 'willing_to_learn' || tinkeringParam === 'rabbit_hole' || tinkeringParam === 'enjoys_ritual'
              ? tinkeringParam
              : 'willing_to_learn';

          const validBeans: UserProfile['bean_handling'] =
            beansParam === 'single_dose' || beansParam === 'hopper' || beansParam === 'either'
              ? beansParam
              : 'either';

          const profileFromUrl: UserProfile = {
            budget: validBudget,
            drink_preference: validDrinks,
            volume_back_to_back: validVol,
            tinkering_preference: validTinkering,
            bean_handling: validBeans,
            dealbreakers: {
              must_have_pid: params.get('pid') === 'true',
              no_manual_levers: params.get('levers') === 'true',
              small_counter_only: params.get('counter') === 'true'
            }
          };

          setUserProfile(profileFromUrl);
          const computed = recommendSetup(profileFromUrl);
          setResults(computed);
          setView('results');
          trackEvent('recommendation_viewed', { from_shared_link: true });
        }
      }
    };

    parseUrlState();
    window.addEventListener('hashchange', parseUrlState);
    return () => {
      window.removeEventListener('hashchange', parseUrlState);
    };
  }, []);

  const handleStartQuiz = () => {
    trackEvent('quiz_started');
    setView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    const computed = recommendSetup(profile);
    setResults(computed);
    trackEvent('quiz_completed', { budget: profile.budget, drinks: profile.drink_preference });
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-coffee-50 font-sans text-coffee-950">
      
      {/* Header */}
      <Header
        onGoHome={() => setView('hero')}
        onOpenHowItWorks={() => setEditorialTab('how_it_works')}
        onOpenGuides={() => setEditorialTab('grinder_budget')}
        onOpenCatalog={() => setView('catalog')}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {view === 'hero' && (
          <Hero
            onStartQuiz={handleStartQuiz}
            onOpenHowItWorks={() => setEditorialTab('founder')}
          />
        )}

        {view === 'quiz' && (
          <Quiz
            initialProfile={userProfile}
            onComplete={handleQuizComplete}
            onCancel={() => setView('hero')}
          />
        )}

        {view === 'results' && results && (
          <ResultsView
            results={results}
            userProfile={userProfile}
            onRetake={() => setView('quiz')}
          />
        )}

        {view === 'catalog' && (
          <GearCatalogView
            onBack={() => setView('hero')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenHowItWorks={() => setEditorialTab('how_it_works')}
        onOpenGuides={() => setEditorialTab('grinder_budget')}
        onOpenCatalog={() => setView('catalog')}
      />

      {/* Editorial & Transparency Modal */}
      {editorialTab !== 'none' && (
        <EditorialPages
          initialTab={editorialTab}
          onClose={() => setEditorialTab('none')}
        />
      )}

    </div>
  );
}
export default App;
