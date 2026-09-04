import { recommendSetup } from '../src/lib/engine.ts';
import { UserProfile } from '../src/types/index.ts';

interface Scenario {
  name: string;
  description: string;
  profile: UserProfile;
}

const scenarios: Scenario[] = [
  {
    name: "Profile 1: Beginner Latte Lover",
    description: "Daily morning latte, 1-2 drinks, wants simple push-button workflow, budget $600",
    profile: {
      drink_preference: 'milk_drinks',
      volume_back_to_back: 1,
      tinkering_preference: 'simple',
      bean_handling: 'either',
      budget: 600
    }
  },
  {
    name: "Profile 2: Hands-On Budget Purist",
    description: "Budget-constrained student, straight espresso, enjoys hands-on manual ritual, single-dosing, budget $350",
    profile: {
      drink_preference: 'espresso',
      volume_back_to_back: 1,
      tinkering_preference: 'enjoys_ritual',
      bean_handling: 'single_dose',
      budget: 350
    }
  },
  {
    name: "Profile 3: Light Roast Clarity Seeker",
    description: "Work-from-home espresso purist, light roasts, straight espresso, precise single dosing with flat burrs, budget $1,200",
    profile: {
      drink_preference: 'espresso',
      volume_back_to_back: 1,
      tinkering_preference: 'rabbit_hole',
      bean_handling: 'single_dose',
      budget: 1200
    }
  },
  {
    name: "Profile 4: Busy Morning Couple",
    description: "2 lattes every morning in a rush, hates long warmups, simple workflow, budget $1,500",
    profile: {
      drink_preference: 'milk_drinks',
      volume_back_to_back: 2,
      tinkering_preference: 'simple',
      bean_handling: 'either',
      budget: 1500,
      dealbreakers: { fast_warmup_only: true }
    }
  },
  {
    name: "Profile 5: Dinner Party Host",
    description: "Entertaining host, 4+ milk drinks back-to-back, willing to learn, wants hopper convenience, budget $2,200",
    profile: {
      drink_preference: 'milk_drinks',
      volume_back_to_back: 4,
      tinkering_preference: 'willing_to_learn',
      bean_handling: 'hopper',
      budget: 2200
    }
  },
  {
    name: "Profile 6: Compact Counter Apartment",
    description: "Tiny counter space, drinks Americanos/espresso, prefers quiet morning workflow, budget $800",
    profile: {
      drink_preference: 'both',
      volume_back_to_back: 1,
      tinkering_preference: 'willing_to_learn',
      bean_handling: 'single_dose',
      budget: 800,
      dealbreakers: { small_counter_only: true }
    }
  },
  {
    name: "Profile 7: Classic Italian Tinkerer",
    description: "Tinkerer & DIY enthusiast, wants Italian heirloom metal, willing to mod, single-dose, budget $750",
    profile: {
      drink_preference: 'both',
      volume_back_to_back: 1,
      tinkering_preference: 'rabbit_hole',
      bean_handling: 'single_dose',
      budget: 750
    }
  },
  {
    name: "Profile 8: Endgame Flow-Profiling Geek",
    description: "Endgame straight espresso geek, light roasts, wants manual flow profiling, zero retention, budget $3,500",
    profile: {
      drink_preference: 'espresso',
      volume_back_to_back: 1,
      tinkering_preference: 'rabbit_hole',
      bean_handling: 'single_dose',
      budget: 3500
    }
  },
  {
    name: "Profile 9: Velvet Milk & Traditional Body",
    description: "Medium-roast milk drink lover, loves chocolatey body, classic conical single doser, budget $2,400",
    profile: {
      drink_preference: 'milk_drinks',
      volume_back_to_back: 2,
      tinkering_preference: 'willing_to_learn',
      bean_handling: 'single_dose',
      budget: 2400
    }
  },
  {
    name: "Profile 10: Absolute Entry Threshold",
    description: "Strict low budget ($280 total), genuine espresso, willing to hand grind",
    profile: {
      drink_preference: 'espresso',
      volume_back_to_back: 1,
      tinkering_preference: 'willing_to_learn',
      bean_handling: 'single_dose',
      budget: 280
    }
  }
];

console.log("=== EXECUTING 10 REALISTIC BUYER PROFILES ===\n");

for (const scenario of scenarios) {
  try {
    const res = recommendSetup(scenario.profile);
    const p = res.primary;
    const grinderRatio = Math.round(p.grinder_budget_ratio * 100);
    console.log(`------------------------------------------------------------`);
    console.log(`📌 ${scenario.name}`);
    console.log(`Context: ${scenario.description}`);
    console.log(`Budget: $${scenario.profile.budget}`);
    console.log(`Machine: ${p.machine.name} ($${p.machine.price}) [${p.machine.boiler_type}, PID: ${p.machine.has_pid}]`);
    console.log(`Grinder: ${p.grinder.name} ($${p.grinder.price}) [${p.grinder.type}, ${p.grinder.burr_size_mm}mm ${p.grinder.burr_type}]`);
    console.log(`Accessories: $${p.accessories_cost}`);
    console.log(`TOTAL COST: $${p.total_cost} (Remaining: $${scenario.profile.budget - p.total_cost})`);
    console.log(`Grinder Split: ${grinderRatio}% equipment budget`);
    console.log(`Tradeoff Notes: ${p.tradeoff_notes.length ? p.tradeoff_notes.join(' | ') : 'None'}`);
    console.log(`Spend Less: ${res.spend_less ? `${res.spend_less.machine.name} + ${res.spend_less.grinder.name} ($${res.spend_less.total_cost})` : 'None'}`);
    console.log(`Spend More: ${res.spend_more ? `${res.spend_more.machine.name} + ${res.spend_more.grinder.name} ($${res.spend_more.total_cost})` : 'None'}`);
  } catch (err: any) {
    console.error(`❌ CRASH ON ${scenario.name}:`, err.message);
  }
}

console.log("\n=== TESTING BUDGET EDGE CASES ===");
const edgeBudgets = [200, 240, 250, 260, 300, 350, 400, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000];

for (const b of edgeBudgets) {
  try {
    const res = recommendSetup({
      drink_preference: 'both',
      volume_back_to_back: 1,
      tinkering_preference: 'willing_to_learn',
      bean_handling: 'either',
      budget: b
    });
    console.log(`Budget $${b}: ${res.primary ? `OK -> ${res.primary.machine.name} + ${res.primary.grinder.name} = $${res.primary.total_cost}` : 'FAILED (null primary)'}`);
  } catch (err: any) {
    console.log(`Budget $${b}: ❌ EXCEPTION -> ${err.message}`);
  }
}

