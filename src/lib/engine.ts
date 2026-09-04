import { 
  Machine, 
  Grinder, 
  Accessory, 
  UserProfile, 
  ScoredPair, 
  RecommendationOutput 
} from '../types/index.ts';
import gearData from '../data/gear.json' with { type: 'json' };
import accessoriesData from '../data/accessories.json' with { type: 'json' };

const typedGear = gearData as { machines: Machine[]; grinders: Grinder[] };
const typedAccessories = accessoriesData as { essential: Accessory[]; optional_later: Accessory[] };

/**
 * Calculates essential accessories required based on user's drink choice.
 */
export function getEssentialAccessories(drinkPref: UserProfile['drink_preference']): Accessory[] {
  const needsPitcher = drinkPref === 'milk_drinks' || drinkPref === 'both';
  return typedAccessories.essential.filter(acc => {
    if (acc.id === 'milk-pitcher') {
      return needsPitcher;
    }
    return true;
  });
}

export function calculateAccessoriesCost(drinkPref: UserProfile['drink_preference']): number {
  const essentials = getEssentialAccessories(drinkPref);
  return essentials.reduce((sum, item) => sum + item.price, 0);
}

/**
 * Hard filtering for machines based on constraints
 */
function isMachineFeasible(machine: Machine, profile: UserProfile, maxEquipmentBudget: number): boolean {
  // Budget ceiling check
  if (machine.price >= maxEquipmentBudget) {
    return false;
  }

  // Deal-breakers
  if (profile.dealbreakers?.must_have_pid && !machine.has_pid) {
    return false;
  }
  if (profile.dealbreakers?.no_manual_levers && machine.boiler_type === 'manual_lever') {
    return false;
  }
  if (profile.dealbreakers?.small_counter_only && machine.footprint === 'large') {
    return false;
  }
  if (profile.dealbreakers?.fast_warmup_only && machine.warmup_minutes > 5) {
    return false;
  }
  if (profile.dealbreakers?.no_single_boiler && machine.boiler_type === 'single_boiler') {
    return false;
  }

  // Workflow preference check: simple push-button users shouldn't get manual levers
  if (profile.tinkering_preference === 'simple' && machine.boiler_type === 'manual_lever') {
    return false;
  }

  // Drink preference: manual levers without steam should not be primary for milk-only drinkers
  if (profile.drink_preference === 'milk_drinks' && machine.steam_capability === 'none') {
    return false;
  }

  return true;
}

/**
 * Hard filtering for grinders based on constraints
 */
function isGrinderFeasible(grinder: Grinder, profile: UserProfile, maxEquipmentBudget: number): boolean {
  // Budget ceiling check
  if (grinder.price >= maxEquipmentBudget) {
    return false;
  }

  // Workflow preference check: simple users shouldn't be forced into manual hand grinding
  if (profile.tinkering_preference === 'simple' && grinder.type === 'manual_hand') {
    return false;
  }

  // Bean handling check: if user wants hopper, don't recommend a pure hand grinder
  if (profile.bean_handling === 'hopper' && grinder.type === 'manual_hand') {
    return false;
  }

  return true;
}

/**
 * Scores a machine (0-100) based on user profile
 */
function scoreMachine(machine: Machine, profile: UserProfile, equipmentBudget: number): number {
  let score = 50;

  // 1. Beverage Fit
  if (profile.drink_preference === 'milk_drinks') {
    if (machine.boiler_type === 'dual_boiler' || machine.boiler_type === 'dual_thermoblock') {
      score += 30;
    } else if (machine.boiler_type === 'heat_exchanger') {
      score += 25;
    } else if (machine.steam_capability === 'auto_microfoam') {
      score += 22;
    } else if (machine.steam_capability === 'manual_decent') {
      score += 5;
    } else if (machine.steam_capability === 'none') {
      score -= 40;
    }

    // Single-boiler penalty for milk-first drinks if budget allows dual circuit
    if (machine.boiler_type === 'single_boiler' && equipmentBudget >= 1200) {
      score -= 15;
    }
  } else if (profile.drink_preference === 'both') {
    if (machine.boiler_type === 'dual_boiler' || machine.boiler_type === 'dual_thermoblock') {
      score += 25;
    } else if (machine.boiler_type === 'heat_exchanger') {
      score += 20;
    } else if (machine.steam_capability === 'auto_microfoam') {
      score += 20;
    } else if (machine.steam_capability === 'manual_decent') {
      score += 10;
    } else if (machine.steam_capability === 'none') {
      score -= 35;
    }
  } else if (profile.drink_preference === 'espresso') {
    // Espresso capability and temp control matter most
    if (machine.espresso_capability === 5) score += 25;
    else if (machine.espresso_capability === 4) score += 18;
    if (machine.has_pid) score += 10;
  }

  // 2. Volume & Back-to-back capacity
  if (profile.volume_back_to_back >= 3) {
    // 3-4 drinks or more
    if (machine.back_to_back_capacity >= 3) {
      score += 30;
    } else {
      score -= 35; // Severe bottleneck when attempting 3-4+ drinks on a compact 1-2 cup machine
    }
  } else if (profile.volume_back_to_back === 2 && profile.drink_preference === 'milk_drinks') {
    // 2 milk drinks back-to-back
    if (machine.back_to_back_capacity >= 2 && machine.boiler_type !== 'single_boiler') {
      score += 15;
    }
  }

  // 3. Tinkering / Workflow fit
  if (profile.tinkering_preference === 'simple') {
    if (machine.warmup_minutes <= 3) score += 15;
    if (machine.beginner_friendliness >= 4) score += 15;
  } else if (profile.tinkering_preference === 'rabbit_hole') {
    if (machine.espresso_capability === 5 || machine.has_pid) score += 15;
  }

  // 4. Budget Proximity (doesn't waste money, but utilizes budget effectively)
  const targetMachineBudget = equipmentBudget * 0.60;
  const budgetRatio = machine.price / targetMachineBudget;
  if (budgetRatio >= 0.60 && budgetRatio <= 1.25) {
    score += 15;
  } else if (budgetRatio < 0.4) {
    score -= 10; // Under-utilizing available budget
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Scores a grinder (0-100) based on user profile
 */
function scoreGrinder(grinder: Grinder, profile: UserProfile, equipmentBudget: number): number {
  let score = 50;

  // 1. Bean Handling
  if (profile.bean_handling === 'single_dose') {
    if (grinder.retention_level === 'near_zero') score += 25;
    if (grinder.type === 'electric_single_dose' || grinder.type === 'manual_hand') score += 15;
    if (grinder.type === 'electric_hopper') score -= 20;
  } else if (profile.bean_handling === 'hopper') {
    if (grinder.type === 'electric_hopper') score += 25;
    if (grinder.type === 'manual_hand') score -= 25;
  }

  // 2. Tinkering & Capability
  if (profile.tinkering_preference === 'rabbit_hole' || profile.drink_preference === 'espresso') {
    if (grinder.is_stepless) score += 15;
    if (grinder.burr_type === 'flat' && grinder.burr_size_mm >= 54) score += 15;
  }

  // Beverage & Burr profile synergy: Conicals shine in traditional milk drinks for chocolate/caramel body
  if (profile.drink_preference === 'milk_drinks' && grinder.burr_type === 'conical') {
    score += 12;
  }

  // 3. Ease of use
  if (profile.tinkering_preference === 'simple') {
    if (grinder.type === 'manual_hand') score -= 25;
    if (grinder.workflow_complexity <= 2) score += 15;
  }

  // 4. Budget Proximity
  const targetGrinderBudget = equipmentBudget * 0.40;
  const budgetRatio = grinder.price / targetGrinderBudget;
  if (budgetRatio >= 0.48 && budgetRatio <= 1.30) {
    score += 15;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Evaluates the compatibility and synergy of a machine + grinder pairing
 */
function calculatePairCompatibility(machine: Machine, grinder: Grinder, profile: UserProfile): { compatibility: number; notes: string[] } {
  let compatibility = 80;
  const notes: string[] = [];

  const equipmentTotal = machine.price + grinder.price;
  const grinderRatio = grinder.price / equipmentTotal;

  // Synergy Rule 1: High-end machine with poor grinder bottleneck
  if (machine.price >= 1000 && grinder.espresso_capability <= 3) {
    compatibility -= 30;
    notes.push("The grinder would bottleneck this machine's extraction potential.");
  }

  // Synergy Rule 2: Healthy budget balance
  if (grinderRatio >= 0.28 && grinderRatio <= 0.50) {
    compatibility += 15;
  } else if (grinderRatio < 0.20 && equipmentTotal > 800) {
    compatibility -= 15;
    notes.push("Grinder budget is slightly low relative to machine price.");
  }

  // Synergy Rule 3: Single-dose pairing harmony
  if (profile.bean_handling === 'single_dose' && (grinder.type === 'electric_single_dose' || grinder.type === 'manual_hand')) {
    compatibility += 10;
  }

  // Synergy Rule 4: Workflow harmony & hand grinder effort trade-offs
  if (grinder.type === 'manual_hand') {
    if (machine.warmup_minutes <= 3) {
      notes.push("The machine is ready in seconds, but the hand grinder requires 35–45 seconds of physical hand cranking per dose.");
    }
    if (profile.volume_back_to_back >= 2) {
      compatibility -= 10;
      notes.push("Manual hand cranking takes ~40s per shot, which can feel repetitive when making 2+ drinks back-to-back.");
    }
  } else if (machine.warmup_minutes <= 3 && grinder.type === 'electric_single_dose') {
    compatibility += 5;
  }

  return {
    compatibility: Math.max(0, Math.min(100, compatibility)),
    notes
  };
}

/**
 * Synthesizes genuine, human editorial reasoning for the recommendation
 */
function synthesizeEditorialReasoning(pair: ScoredPair, profile: UserProfile): RecommendationOutput['editorial_reasoning'] {
  const { machine, grinder, grinder_budget_ratio } = pair;
  const grinderPct = Math.round(grinder_budget_ratio * 100);

  let whyMachine = '';
  if (profile.drink_preference === 'milk_drinks' || profile.drink_preference === 'both') {
    if (machine.boiler_type === 'dual_boiler' || machine.boiler_type === 'dual_thermoblock') {
      whyMachine = `Because you make milk drinks and prioritize a smooth morning routine, I picked the ${machine.name}. Its dual heating circuits brew espresso and steam milk simultaneously—no waiting for temperature transitions.`;
    } else if (machine.boiler_type === 'heat_exchanger') {
      whyMachine = `The ${machine.name} gives you simultaneous brewing and steaming from an Italian commercial-heritage group, making back-to-back drinks smooth without the price tag of a full dual boiler.`;
    } else if (machine.id === 'breville-bambino-plus') {
      whyMachine = `I picked the Bambino Plus for its 3-second instant heat-up and automated milk texturing. It delivers silky microfoam with virtually no fuss.`;
    } else {
      whyMachine = `The ${machine.name} keeps machine costs accessible while still providing a factory 9-bar over-pressure valve and a capable steam wand for latte art.`;
    }
  } else {
    // Espresso focus
    if (machine.boiler_type === 'manual_lever') {
      whyMachine = `Since you drink straight espresso and enjoy the hands-on ritual, the ${machine.name} is one of the strongest options. Manual pressure control lets you pull gentle pre-infusion blooms that highlight subtle fruit and floral notes.`;
    } else if (machine.has_pid) {
      whyMachine = `The ${machine.name} gives you digital PID temperature stability and commercial 58mm group architecture, ensuring your extractions are repeatable shot after shot.`;
    } else {
      whyMachine = `The ${machine.name} delivers genuine 9-bar espresso without charging you for digital screens you don't strictly need.`;
    }
  }

  let whyGrinder = '';
  if (grinder.type === 'manual_hand') {
    whyGrinder = `I chose the ${grinder.name} hand grinder because precision CNC steel burrs outperform motorized grinders anywhere near this price. It runs almost silently and takes up minimal counter space, though you do have to spend 35–45 seconds hand-cranking each dose.`;
  } else if (grinder.id === 'turin-df54' || grinder.id === 'turin-df64-gen2') {
    whyGrinder = `The ${grinder.name} is one of the most competitive single-dose flat burr grinders. Its anti-static plasma generator and near-zero retention keep daily coffee waste to a minimum.`;
  } else if (grinder.burr_type === 'conical') {
    whyGrinder = `The ${grinder.name} was chosen for its classic velvety mouthfeel. Conical burrs produce rich, chocolatey, traditional espresso that pairs exceptionally well with milk drinks.`;
  } else {
    whyGrinder = `The ${grinder.name} delivers dependable, stepless particle consistency with an uncomplicated daily workflow.`;
  }

  const whyPairing = `Together, the ${machine.name} and ${grinder.name} form a balanced setup. Neither component bottlenecks the other, and your morning routine remains predictable.`;

  const budgetAllocationRationale = `I allocated ${grinderPct}% of your equipment budget to the grinder ($${grinder.price}) and the remaining $${machine.price} to the machine. In home espresso, the grinder dictates extraction consistency far more than shiny exterior finishes.`;

  let unspentBudgetRationale: string | undefined = undefined;
  const unspent = profile.budget - pair.total_cost;
  if (unspent >= 150) {
    unspentBudgetRationale = `You have another $${unspent.toLocaleString()} available in your budget, but I wouldn't spend it here. The extra money would buy a fancier machine or extra buttons, but it doesn't solve the specific workflow you asked for. I'd keep that money in your pocket for fresh specialty coffee beans or future upgrades.`;
  }

  return {
    why_this_machine: whyMachine,
    why_this_grinder: whyGrinder,
    why_this_pairing: whyPairing,
    budget_allocation_rationale: budgetAllocationRationale,
    unspent_budget_rationale: unspentBudgetRationale
  };
}

/**
 * Main Deterministic Recommendation Engine
 */
export function recommendSetup(profile: UserProfile): RecommendationOutput {
  const accessories = getEssentialAccessories(profile.drink_preference);
  const accessoriesCost = calculateAccessoriesCost(profile.drink_preference);
  
  // CRITICAL RULE: Budget must mean TOTAL SYSTEM COST
  // totalCost = machine.price + grinder.price + accessoriesCost <= profile.budget
  const maxEquipmentBudget = profile.budget - accessoriesCost;

  // 1. Hard filter feasible machines and grinders
  const feasibleMachines = typedGear.machines.filter(m => isMachineFeasible(m, profile, maxEquipmentBudget));
  const feasibleGrinders = typedGear.grinders.filter(g => isGrinderFeasible(g, profile, maxEquipmentBudget));

  // 2. Generate all feasible pairs that respect TOTAL SYSTEM BUDGET
  const feasiblePairs: ScoredPair[] = [];

  for (const machine of feasibleMachines) {
    for (const grinder of feasibleGrinders) {
      const equipmentCost = machine.price + grinder.price;
      const totalSystemCost = equipmentCost + accessoriesCost;

      // STRICT CHECK: NEVER EXCEED USER BUDGET
      if (totalSystemCost <= profile.budget) {
        const mScore = scoreMachine(machine, profile, maxEquipmentBudget);
        const gScore = scoreGrinder(grinder, profile, maxEquipmentBudget);
        const { compatibility, notes } = calculatePairCompatibility(machine, grinder, profile);

        // Weighted Pair Formula: 40% machine + 40% grinder + 20% compatibility
        const pairScore = (mScore * 0.40) + (gScore * 0.40) + (compatibility * 0.20);

        feasiblePairs.push({
          machine,
          grinder,
          accessories_cost: accessoriesCost,
          total_cost: totalSystemCost,
          pair_score: pairScore,
          machine_score: mScore,
          grinder_score: gScore,
          compatibility_score: compatibility,
          grinder_budget_ratio: grinder.price / equipmentCost,
          tradeoff_notes: notes
        });
      }
    }
  }

  // Sort pairs by pair_score descending
  feasiblePairs.sort((a, b) => b.pair_score - a.pair_score);

  // If no pair fits within the user's budget ceiling or constraints, gracefully fallback
  // to the absolute lowest-cost verified pairing and flag status as NO_FEASIBLE_SETUP
  if (feasiblePairs.length === 0) {
    const sortedMachines = [...typedGear.machines].sort((a, b) => a.price - b.price);
    const sortedGrinders = [...typedGear.grinders].sort((a, b) => a.price - b.price);
    
    // Choose the cheapest machine that fits drink preference if possible
    const bestFallbackMachine = sortedMachines.find(m => 
      profile.drink_preference === 'milk_drinks' ? m.steam_capability !== 'none' : true
    ) || sortedMachines[0];

    const bestFallbackGrinder = sortedGrinders.find(g =>
      profile.tinkering_preference === 'simple' ? g.type !== 'manual_hand' : true
    ) || sortedGrinders[0];

    const fallbackCost = bestFallbackMachine.price + bestFallbackGrinder.price + accessoriesCost;
    
    const fallbackPair: ScoredPair = {
      machine: bestFallbackMachine,
      grinder: bestFallbackGrinder,
      accessories_cost: accessoriesCost,
      total_cost: fallbackCost,
      pair_score: 50,
      machine_score: 50,
      grinder_score: 50,
      compatibility_score: 50,
      grinder_budget_ratio: bestFallbackGrinder.price / (bestFallbackMachine.price + bestFallbackGrinder.price),
      tradeoff_notes: [
        `Budget ($${profile.budget}) is below the minimum viable total setup cost ($${fallbackCost}) for this workflow.`,
        "Showing the closest verified entry setup."
      ]
    };

    return {
      status: 'NO_FEASIBLE_SETUP',
      primary: fallbackPair,
      spend_less: null,
      spend_more: null,
      editorial_reasoning: {
        why_this_machine: `At $${bestFallbackMachine.price}, the ${bestFallbackMachine.name} is one of the most accessible starting points capable of genuine 9-bar espresso.`,
        why_this_grinder: `At $${bestFallbackGrinder.price}, the ${bestFallbackGrinder.name} provides the minimum burr precision needed to dial in unpressurized espresso.`,
        why_this_pairing: `I couldn't build a new setup within $${profile.budget}. The cheapest viable setup I found is approximately $${fallbackCost} (including essential accessories).`,
        budget_allocation_rationale: `If $${profile.budget} is a strict ceiling, I would strongly suggest looking for a pre-owned Breville Bambino or Gaggia Classic rather than buying a sub-$100 department store appliance.`
      },
      accessories: {
        actually_needed: accessories,
        dont_need_yet: typedAccessories.optional_later,
        total_accessories_cost: accessoriesCost
      }
    };
  }

  const primary = feasiblePairs[0];

  // 3. Find "Spend Less" Alternative (saves at least $70-$200 while maintaining acceptable compatibility)
  const spendLessCandidates = feasiblePairs.filter(p => 
    p.total_cost <= primary.total_cost - 70 &&
    (p.machine.id !== primary.machine.id || p.grinder.id !== primary.grinder.id)
  );
  
  let spendLess: ScoredPair | null = null;
  if (spendLessCandidates.length > 0) {
    const candidate = spendLessCandidates[0];
    const diff = primary.total_cost - candidate.total_cost;
    
    let reason = '';
    if (primary.grinder.type !== 'manual_hand' && candidate.grinder.type === 'manual_hand') {
      reason = `Saves $${diff} by switching from the electric ${primary.grinder.name} to the manual ${candidate.grinder.name}. Grind quality remains excellent, but you trade push-button convenience for 40 seconds of physical hand cranking.`;
    } else if (primary.machine.boiler_type !== candidate.machine.boiler_type) {
      reason = `Saves $${diff} by choosing the ${candidate.machine.name} over the ${primary.machine.name}. You give up ${candidate.machine.boiler_type === 'single_boiler' ? 'simultaneous milk steaming' : 'some thermal recovery speed'}, but retain core shot quality.`;
    } else {
      reason = `Saves $${diff} with a more stripped-down setup that still satisfies your primary drink preferences.`;
    }

    spendLess = {
      ...candidate,
      alternative_reasoning: reason
    };
  }

  // 4. Find "Spend More" Alternative (unlocks a distinct upgrade if user stretches slightly)
  // Search slightly above primary cost (even if stretching budget by up to 15-20% for transparency)
  const allStretchPairs: ScoredPair[] = [];
  for (const machine of typedGear.machines) {
    for (const grinder of typedGear.grinders) {
      const cost = machine.price + grinder.price + accessoriesCost;
      if (cost >= primary.total_cost + 80 && cost <= profile.budget * 1.30) {
        const mScore = scoreMachine(machine, profile, profile.budget * 1.30);
        const gScore = scoreGrinder(grinder, profile, profile.budget * 1.30);
        const { compatibility, notes } = calculatePairCompatibility(machine, grinder, profile);
        allStretchPairs.push({
          machine,
          grinder,
          accessories_cost: accessoriesCost,
          total_cost: cost,
          pair_score: (mScore * 0.40) + (gScore * 0.40) + (compatibility * 0.20),
          machine_score: mScore,
          grinder_score: gScore,
          compatibility_score: compatibility,
          grinder_budget_ratio: grinder.price / (machine.price + grinder.price),
          tradeoff_notes: notes
        });
      }
    }
  }
  allStretchPairs.sort((a, b) => b.pair_score - a.pair_score);
  
  let spendMore: ScoredPair | null = null;
  if (allStretchPairs.length > 0) {
    const candidate = allStretchPairs[0];
    const diff = candidate.total_cost - primary.total_cost;
    
    let reason = '';
    if ((candidate.machine.boiler_type === 'dual_boiler' || candidate.machine.boiler_type === 'dual_thermoblock') && primary.machine.boiler_type === 'single_boiler') {
      reason = `Stretches your budget by $${diff} to step up to the ${candidate.machine.name}. This unlocks true simultaneous brewing and steaming—essential if you host or make multiple milk drinks daily.`;
    } else if (candidate.grinder.burr_size_mm >= 64 && primary.grinder.burr_size_mm < 64) {
      reason = `Stretches your budget by $${diff} to upgrade to the ${candidate.grinder.name}. Its 64mm commercial burr carrier offers higher extraction clarity and access to aftermarket SSP burrs.`;
    } else if (candidate.machine.has_pid && !primary.machine.has_pid) {
      reason = `Stretches by $${diff} to add digital PID temperature control via the ${candidate.machine.name}, removing temperature surfing from your morning routine.`;
    } else {
      reason = `Stretches your budget by $${diff} to step up to the ${candidate.machine.name} + ${candidate.grinder.name}, giving you higher-grade materials and increased workflow durability.`;
    }

    spendMore = {
      ...candidate,
      alternative_reasoning: reason
    };
  }

  // 5. Generate human editorial explanations
  const editorialReasoning = synthesizeEditorialReasoning(primary, profile);

  return {
    status: 'MATCHED',
    primary,
    spend_less: spendLess,
    spend_more: spendMore,
    editorial_reasoning: editorialReasoning,
    accessories: {
      actually_needed: accessories,
      dont_need_yet: typedAccessories.optional_later,
      total_accessories_cost: accessoriesCost
    }
  };
}
