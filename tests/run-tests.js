import { recommendSetup } from '../src/lib/engine.ts';

console.log('🧪 Running EspressoPair Automated Behavioral Test Suite...\n');

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

// -------------------------------------------------------------
// TEST 1: Strict Total System Budget Integrity
// -------------------------------------------------------------
console.log('1. Testing Budget Integrity (totalCost <= budget):');
const testBudgets = [400, 500, 750, 1000, 1500, 2000, 3000];

for (const budget of testBudgets) {
  const res = recommendSetup({
    drink_preference: 'milk_drinks',
    volume_back_to_back: 2,
    tinkering_preference: 'willing_to_learn',
    bean_handling: 'single_dose',
    budget: budget
  });

  assert(
    res.primary.total_cost <= budget,
    `Budget $${budget} strict ceiling test`,
    `Total cost: $${res.primary.total_cost}, Budget: $${budget}`
  );
  
  assert(
    res.primary.total_cost === res.primary.machine.price + res.primary.grinder.price + res.primary.accessories_cost,
    `Budget $${budget} math reconciliation`,
    `Expected sum: ${res.primary.machine.price + res.primary.grinder.price + res.primary.accessories_cost}, Got: ${res.primary.total_cost}`
  );
}

// -------------------------------------------------------------
// TEST 2: Deal-breaker Enforcement
// -------------------------------------------------------------
console.log('\n2. Testing Deal-breakers:');

// Deal-breaker: must_have_pid
const pidTest = recommendSetup({
  drink_preference: 'espresso',
  volume_back_to_back: 1,
  tinkering_preference: 'willing_to_learn',
  bean_handling: 'single_dose',
  budget: 1500,
  dealbreakers: { must_have_pid: true }
});
assert(pidTest.primary.machine.has_pid === true, 'Dealbreaker: must_have_pid respected', `Got: ${pidTest.primary.machine.name}`);

// Deal-breaker: no_manual_levers
const noLeverTest = recommendSetup({
  drink_preference: 'espresso',
  volume_back_to_back: 1,
  tinkering_preference: 'enjoys_ritual',
  bean_handling: 'single_dose',
  budget: 1000,
  dealbreakers: { no_manual_levers: true }
});
assert(noLeverTest.primary.machine.boiler_type !== 'manual_lever', 'Dealbreaker: no_manual_levers respected', `Got: ${noLeverTest.primary.machine.name}`);

// Deal-breaker: small_counter_only
const smallCounterTest = recommendSetup({
  drink_preference: 'milk_drinks',
  volume_back_to_back: 2,
  tinkering_preference: 'willing_to_learn',
  bean_handling: 'either',
  budget: 2200,
  dealbreakers: { small_counter_only: true }
});
assert(smallCounterTest.primary.machine.footprint !== 'large', 'Dealbreaker: small_counter_only excludes large footprint machines', `Got: ${smallCounterTest.primary.machine.footprint}`);

// -------------------------------------------------------------
// TEST 3: Workflow Filter (Simple push-button users)
// -------------------------------------------------------------
console.log('\n3. Testing Workflow Compatibility:');
const simpleUser = recommendSetup({
  drink_preference: 'milk_drinks',
  volume_back_to_back: 1,
  tinkering_preference: 'simple',
  bean_handling: 'hopper',
  budget: 900
});
assert(simpleUser.primary.machine.boiler_type !== 'manual_lever', 'Simple workflow excludes manual lever machines', `Got: ${simpleUser.primary.machine.name}`);
assert(simpleUser.primary.grinder.type !== 'manual_hand', 'Simple workflow excludes manual hand grinding', `Got: ${simpleUser.primary.grinder.name}`);

// -------------------------------------------------------------
// TEST 4: Volume & Back-to-Back Capacity
// -------------------------------------------------------------
console.log('\n4. Testing High-Volume Milk Demands:');
const highVolumeMilk = recommendSetup({
  drink_preference: 'milk_drinks',
  volume_back_to_back: 4, // 4+ drinks
  tinkering_preference: 'willing_to_learn',
  bean_handling: 'either',
  budget: 2200
});
assert(
  highVolumeMilk.primary.machine.boiler_type === 'dual_boiler' || 
  highVolumeMilk.primary.machine.boiler_type === 'dual_thermoblock' || 
  highVolumeMilk.primary.machine.boiler_type === 'heat_exchanger',
  '4+ back-to-back milk drinks receives multi-circuit steaming (dual boiler/HX/dual thermoblock)',
  `Got: ${highVolumeMilk.primary.machine.name} (${highVolumeMilk.primary.machine.boiler_type})`
);

// -------------------------------------------------------------
// TEST 5: Single-Dose Bean Handling
// -------------------------------------------------------------
console.log('\n5. Testing Single-Dosing Workflow:');
const singleDoseUser = recommendSetup({
  drink_preference: 'espresso',
  volume_back_to_back: 1,
  tinkering_preference: 'enjoys_ritual',
  bean_handling: 'single_dose',
  budget: 1200
});
assert(
  singleDoseUser.primary.grinder.retention_level === 'near_zero' || singleDoseUser.primary.grinder.type === 'electric_single_dose',
  'Single-dose user receives low/zero-retention grinder',
  `Got: ${singleDoseUser.primary.grinder.name}`
);

// -------------------------------------------------------------
// TEST 6: Engine Determinism
// -------------------------------------------------------------
console.log('\n6. Testing Engine Determinism:');
const profileDeterministic = {
  drink_preference: 'both' as const,
  volume_back_to_back: 2 as const,
  tinkering_preference: 'willing_to_learn' as const,
  bean_handling: 'single_dose' as const,
  budget: 1500
};
const run1 = recommendSetup(profileDeterministic);
const run2 = recommendSetup(profileDeterministic);
assert(
  run1.primary.machine.id === run2.primary.machine.id && run1.primary.grinder.id === run2.primary.grinder.id,
  'Deterministic output: Run 1 and Run 2 match identically',
  `Machine: ${run1.primary.machine.id}, Grinder: ${run1.primary.grinder.id}`
);

// -------------------------------------------------------------
// TEST 7: Persona Behavioral Scenarios
// -------------------------------------------------------------
console.log('\n7. Persona Scenario Validation:');

// Persona A: Beginner milk-drink user ($650 total budget)
const personaA = recommendSetup({
  drink_preference: 'milk_drinks',
  volume_back_to_back: 2,
  tinkering_preference: 'simple',
  bean_handling: 'either',
  budget: 650
});
assert(personaA.primary.total_cost <= 650, 'Persona A: Respects $650 budget ceiling');
assert(personaA.primary.machine.steam_capability !== 'none', 'Persona A: Machine has milk steaming capability');
assert(personaA.primary.grinder.type !== 'manual_hand', 'Persona A: Does not force beginner into manual hand grinding');

// Persona B: Straight espresso enthusiast ($1,000 budget, light roast single-dose)
const personaB = recommendSetup({
  drink_preference: 'espresso',
  volume_back_to_back: 1,
  tinkering_preference: 'enjoys_ritual',
  bean_handling: 'single_dose',
  budget: 1000
});
assert(personaB.primary.total_cost <= 1000, 'Persona B: Respects $1,000 budget ceiling');
assert(personaB.primary.grinder.retention_level === 'near_zero', 'Persona B: Grinder has near-zero retention for single dosing');

// Persona C: High-volume household ($2,000 budget, 4+ milk drinks)
const personaC = recommendSetup({
  drink_preference: 'milk_drinks',
  volume_back_to_back: 4,
  tinkering_preference: 'willing_to_learn',
  bean_handling: 'either',
  budget: 2000
});
assert(personaC.primary.total_cost <= 2000, 'Persona C: Respects $2,000 budget ceiling');
assert(personaC.primary.machine.back_to_back_capacity >= 3, 'Persona C: Machine handles back-to-back milk drinks');

// Persona D: Budget-conscious beginner ($500 total budget)
const personaD = recommendSetup({
  drink_preference: 'both',
  volume_back_to_back: 1,
  tinkering_preference: 'willing_to_learn',
  bean_handling: 'either',
  budget: 500
});
assert(personaD.primary.total_cost <= 500, 'Persona D: Respects $500 total system budget ceiling');

// Summary
console.log(`\n========================================`);
if (failed === 0) {
  console.log(`🎉 ALL ${passed} TESTS PASSED SUCCESSFULLY!`);
  process.exit(0);
} else {
  console.error(`❌ ${failed} TEST(S) FAILED out of ${passed + failed}`);
  process.exit(1);
}

