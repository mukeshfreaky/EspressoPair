export type BoilerType = 
  | 'thermojet' 
  | 'thermoblock' 
  | 'single_boiler' 
  | 'heat_exchanger' 
  | 'dual_boiler' 
  | 'dual_thermoblock' 
  | 'manual_lever';

export type GrinderType = 
  | 'manual_hand' 
  | 'electric_single_dose' 
  | 'electric_hopper' 
  | 'electric_direct_grind';

export type BurrType = 'flat' | 'conical';

export type FootprintSize = 'compact' | 'medium' | 'large';

export interface RetailerLink {
  retailer_id: string;
  name: string;
  url: string;
  in_stock: boolean;
  notes?: string;
}

export interface Machine {
  id: string;
  name: string;
  brand: string;
  price: number;
  boiler_type: BoilerType;
  warmup_minutes: number;
  has_pid: boolean;
  opv_pressure_bar: number;
  steam_capability: 'none' | 'slow_entry' | 'manual_decent' | 'commercial_strong' | 'auto_microfoam';
  portafilter_size_mm: number;
  back_to_back_capacity: number; // number of milk drinks before waiting
  footprint: FootprintSize;
  dimensions_in: { width: number; depth: number; height: number };
  
  // Editorial attributes
  workflow_complexity: 1 | 2 | 3 | 4 | 5; // 1 = press button, 5 = manual lever profiling
  espresso_capability: 1 | 2 | 3 | 4 | 5;
  steam_power_score: 1 | 2 | 3 | 4 | 5;
  beginner_friendliness: 1 | 2 | 3 | 4 | 5;
  pros: string[];
  cons: string[];
  best_for: string[];
  not_for: string[];
  my_take: string;
  
  // Source tracking
  source_url: string;
  last_verified: string;
  verification_status: 'verified' | 'needs_review';
  retailers: RetailerLink[];
}

export interface Grinder {
  id: string;
  name: string;
  brand: string;
  price: number;
  type: GrinderType;
  burr_type: BurrType;
  burr_size_mm: number;
  is_stepless: boolean;
  retention_grams: number; // approximate grams retained
  retention_level: 'near_zero' | 'low' | 'moderate' | 'high';
  footprint: FootprintSize;
  
  // Editorial attributes
  workflow_complexity: 1 | 2 | 3 | 4 | 5;
  espresso_capability: 1 | 2 | 3 | 4 | 5;
  bean_switching_friendliness: 1 | 2 | 3 | 4 | 5;
  noise_level: 'quiet' | 'moderate' | 'loud';
  best_roast_alignment: ('light' | 'medium' | 'dark')[];
  pros: string[];
  cons: string[];
  best_for: string[];
  not_for: string[];
  my_take: string;
  
  // Source tracking
  source_url: string;
  last_verified: string;
  verification_status: 'verified' | 'needs_review';
  retailers: RetailerLink[];
}

export interface Accessory {
  id: string;
  name: string;
  price: number;
  category: 'essential' | 'optional_later';
  why_needed: string;
  skip_reason?: string;
  search_query: string;
}

export interface UserProfile {
  drink_preference: 'espresso' | 'milk_drinks' | 'both' | 'americanos';
  volume_back_to_back: 1 | 2 | 3 | 4; // 1 = just me, 2 = 2-3 drinks, 4 = 4+ / crowd
  tinkering_preference: 'simple' | 'willing_to_learn' | 'enjoys_ritual' | 'rabbit_hole';
  bean_handling: 'hopper' | 'single_dose' | 'either';
  budget: number; // Total system budget in USD
  priority?: 'convenience' | 'espresso_quality' | 'milk_performance' | 'looks' | 'balanced';
  dealbreakers?: {
    must_have_pid?: boolean;
    no_manual_levers?: boolean;
    small_counter_only?: boolean;
    fast_warmup_only?: boolean;
    no_single_boiler?: boolean;
  };
}

export interface ScoredPair {
  machine: Machine;
  grinder: Grinder;
  accessories_cost: number;
  total_cost: number;
  pair_score: number;
  machine_score: number;
  grinder_score: number;
  compatibility_score: number;
  grinder_budget_ratio: number;
  tradeoff_notes: string[];
  alternative_reasoning?: string; // Clear explanation for Spend Less compromise or Spend More capability
}

export type RecommendationStatus = 'MATCHED' | 'NO_FEASIBLE_SETUP';

export interface RecommendationOutput {
  status: RecommendationStatus;
  primary: ScoredPair;
  spend_less: ScoredPair | null;
  spend_more: ScoredPair | null;
  editorial_reasoning: {
    why_this_machine: string;
    why_this_grinder: string;
    why_this_pairing: string;
    budget_allocation_rationale: string;
    unspent_budget_rationale?: string;
  };
  accessories: {
    actually_needed: Accessory[];
    dont_need_yet: Accessory[];
    total_accessories_cost: number;
  };
}

