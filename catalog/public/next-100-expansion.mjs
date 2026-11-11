import { CalculationError, getUnit } from '../../src/calculation-core/index.mjs';
import { educationalDefinition, calculated } from './educational-definition.mjs';
import { qin, qout, sin, sout } from './equation-definition.mjs';

const PHYSICS = ['OpenStax, University Physics, standard introductory mechanics and energy relations.', 'https://openstax.org/details/books/university-physics-volume-1'];
const ELECTRICITY = ['OpenStax, University Physics Volume 2, electric circuits and electromagnetic quantities.', 'https://openstax.org/details/books/university-physics-volume-2'];
const CHEMISTRY = ['OpenStax, Chemistry 2e, stoichiometry and solution chemistry.', 'https://openstax.org/details/books/chemistry-2e'];
const STATISTICS = ['OpenStax, Introductory Statistics, descriptive statistics and basic inference.', 'https://openstax.org/details/books/introductory-statistics'];
const SI = ['NIST Guide to the SI, SI units and measurement conventions.', 'https://www.nist.gov/pml/special-publication-811'];
const SOURCES = {
  math: STATISTICS,
  physics: PHYSICS,
  electric: ELECTRICITY,
  chemistry: CHEMISTRY,
  engineering: ['NIST Guide to the SI supports the unit conventions; the displayed geometry/material equation is a scoped estimate, not a design-code method.', 'https://www.nist.gov/pml/special-publication-811'],
  business: ['OpenStax Principles of Finance 2e, time-value-of-money applications; other business tools here are user-supplied arithmetic and do not establish accounting rules.', 'https://openstax.org/books/principles-finance-2e/pages/7-4-applications-of-tvm-in-finance'],
  software: ['NIST Guide to the SI supports the units; byte-size estimates use the stated decimal or binary convention and workload assumptions.', 'https://www.nist.gov/pml/special-publication-811'],
  media: ['NIST Guide to the SI supports the displayed units; camera, astronomy, and render outputs use the explicitly stated idealized geometry.', 'https://www.nist.gov/pml/special-publication-811'],
  everyday: ['NIST Guide to the SI supports the displayed units; coverage and household estimates depend on the user-entered product and site values.', 'https://www.nist.gov/pml/special-publication-811'],
};

const OPS = {
  subtract: ([a, b]) => a - b,
  subtractReverse: ([a, b]) => b - a,
  add: ([a, b]) => a + b,
  multiply: ([a, b], factor = 1) => a * b * factor,
  divide: ([a, b], factor = 1) => { if (b === 0) throw new CalculationError('DIVISION_BY_ZERO', 'The divisor must be greater than zero.'); return a / b * factor; },
  ratio: ([a, b]) => { if (b === 0) throw new CalculationError('DIVISION_BY_ZERO', 'The denominator must not be zero.'); return a / b; },
  identity: ([value]) => value,
  percentOf: ([a, b]) => a * b / 100,
  percentChange: ([a, b]) => { if (a === 0) throw new CalculationError('DIVISION_BY_ZERO', 'The starting value must not be zero.'); return (b - a) / a; },
  mean: ([a, b]) => (a + b) / 2,
  geometricMean: ([a, b]) => { if (a <= 0 || b <= 0) throw new CalculationError('POSITIVE_VALUE_REQUIRED', 'Both values must be greater than zero.'); return Math.sqrt(a * b); },
  rms: ([a, b]) => Math.sqrt((a * a + b * b) / 2),
  distance2d: ([x1, y1, x2, y2]) => Math.hypot(x2 - x1, y2 - y1),
  sectorArea: ([r, angle]) => 0.5 * r * r * angle,
  arcLength: ([r, angle]) => r * angle,
  standardError: ([s, n]) => { if (n <= 0) throw new CalculationError('POSITIVE_VALUE_REQUIRED', 'Sample count must be greater than zero.'); return s / Math.sqrt(n); },
  zScore: ([x, mean, sd]) => { if (sd <= 0) throw new CalculationError('POSITIVE_VALUE_REQUIRED', 'Standard deviation must be greater than zero.'); return (x - mean) / sd; },
  simpleInterest: ([p, rate, time]) => { if (time <= 0) throw new CalculationError('POSITIVE_VALUE_REQUIRED', 'Time must be greater than zero.'); return p * (rate / 100) * time; },
  compound: ([p, rate, periods]) => { if (periods <= 0) throw new CalculationError('POSITIVE_VALUE_REQUIRED', 'The number of compounding periods must be greater than zero.'); if (rate <= -100) throw new CalculationError('RATE_OUT_OF_RANGE', 'The annual rate must be greater than −100%.'); return p * ((1 + rate / 100) ** periods - 1); },
  payment: ([principal, annualRate, years]) => { const n = years * 12; const r = annualRate / 1200; if (n <= 0) throw new CalculationError('POSITIVE_VALUE_REQUIRED', 'Term must be greater than zero.'); if (annualRate <= -1200) throw new CalculationError('RATE_OUT_OF_RANGE', 'The annual rate must be greater than −1200%.'); return r === 0 ? principal / n : principal * r / (1 - (1 + r) ** -n); },
  margin: ([revenue, cost]) => { if (revenue === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Revenue must not be zero.'); return (revenue - cost) / revenue; },
  roi: ([gain, cost]) => { if (cost === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Investment cost must not be zero.'); return (gain - cost) / cost; },
  ltv: ([loan, value]) => { if (value === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Asset value must not be zero.'); return loan / value; },
  dti: ([debt, income]) => { if (income === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Income must not be zero.'); return debt / income; },
  hypotenuse: ([a, b]) => Math.hypot(a, b),
  rectangleVolume: ([a, b, c]) => a * b * c,
  circleArea: ([r]) => Math.PI * r * r,
  circleCircumference: ([r]) => 2 * Math.PI * r,
  triangleArea: ([b, h]) => 0.5 * b * h,
  squareRootSumSquares: ([a, b]) => Math.hypot(a, b),
  slopePercent: ([rise, run]) => { if (run === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Run must not be zero.'); return rise / run; },
  density: ([mass, volume]) => { if (volume === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Volume must not be zero.'); return mass / volume; },
  speed: ([distance, time]) => { if (time === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Elapsed time must not be zero.'); return distance / time; },
  acceleration: ([deltaV, time]) => { if (time === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Elapsed time must not be zero.'); return deltaV / time; },
  force: ([mass, acceleration]) => mass * acceleration,
  work: ([force, distance]) => force * distance,
  power: ([energy, time]) => { if (time === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Elapsed time must not be zero.'); return energy / time; },
  kineticEnergy: ([mass, speed]) => 0.5 * mass * speed ** 2,
  potentialEnergy: ([mass, height], g = 9.80665) => mass * g * height,
  pressure: ([force, area]) => { if (area === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Area must not be zero.'); return force / area; },
  flowSpeed: ([flow, area]) => { if (area === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Area must not be zero.'); return flow / area; },
  massFlow: ([density, flow]) => density * flow,
  hydraulicPower: ([pressure, flow]) => pressure * flow,
  pumpEfficiency: ([useful, input]) => { if (input <= 0) throw new CalculationError('POSITIVE_VALUE_REQUIRED', 'Input power must be greater than zero.'); if (useful > input) throw new CalculationError('EFFICIENCY_OUT_OF_RANGE', 'Useful output power cannot exceed input power in this estimate.'); return useful / input; },
  hydrostaticPressure: ([density, depth], g = 9.80665) => density * g * depth,
  thermalEnergy: ([mass, heatCapacity, deltaT]) => mass * heatCapacity * deltaT,
  thermalExpansion: ([length, alpha, deltaT]) => length * alpha * deltaT,
  thermalResistance: ([thickness, conductivity, area]) => { if (conductivity * area === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Conductivity and area must be greater than zero.'); return thickness / (conductivity * area); },
  ohms: ([voltage, resistance]) => { if (resistance === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Resistance must not be zero.'); return voltage / resistance; },
  electricPower: ([voltage, current]) => voltage * current,
  resistorPower: ([current, resistance]) => current ** 2 * resistance,
  charge: ([current, time]) => current * time,
  capacitanceCharge: ([capacitance, voltage]) => capacitance * voltage,
  voltageDivider: ([vin, r1, r2]) => { if (r1 + r2 === 0) throw new CalculationError('DIVISION_BY_ZERO', 'The resistance sum must not be zero.'); return vin * r2 / (r1 + r2); },
  capacitorReactance: ([frequency, capacitance]) => { if (frequency * capacitance === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Frequency and capacitance must be greater than zero.'); return 1 / (2 * Math.PI * frequency * capacitance); },
  inductorReactance: ([frequency, inductance]) => 2 * Math.PI * frequency * inductance,
  transformerVoltage: ([primaryV, primaryTurns, secondaryTurns]) => { if (primaryTurns === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Primary turns must not be zero.'); return primaryV * secondaryTurns / primaryTurns; },
  threePhasePower: ([voltage, current, pf]) => Math.sqrt(3) * voltage * current * pf,
  ledResistor: ([supply, led, current]) => { if (supply <= led) throw new CalculationError('SUPPLY_VOLTAGE_REQUIRED', 'Supply voltage must be greater than the LED forward voltage.'); if (current <= 0) throw new CalculationError('POSITIVE_VALUE_REQUIRED', 'Target current must be greater than zero.'); return (supply - led) / current; },
  molarMass: ([mass, amount]) => { if (amount === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Amount must not be zero.'); return mass / amount; },
  moles: ([concentration, volume]) => concentration * volume,
  halfLife: ([initial, elapsed, halfLife]) => { if (halfLife <= 0) throw new CalculationError('POSITIVE_VALUE_REQUIRED', 'Half-life must be greater than zero.'); return initial * 0.5 ** (elapsed / halfLife); },
  dilutionVolume: ([stock, final, desired]) => { if (stock === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Stock concentration must not be zero.'); return final * desired / stock; },
  recovery: ([feed, grade, recovery]) => { if (grade > 1 || recovery > 1) throw new CalculationError('FRACTION_OUT_OF_RANGE', 'Grade and recovery fractions must not exceed 1 (100%).'); return feed * grade * recovery; },
  recoveryRatio: ([product, feed]) => { if (feed <= 0) throw new CalculationError('POSITIVE_VALUE_REQUIRED', 'Feed mass must be greater than zero.'); if (product > feed) throw new CalculationError('RECOVERY_OUT_OF_RANGE', 'Product mass cannot exceed feed mass in this mass-recovery calculation.'); return product / feed; },
  stripRatio: ([waste, ore]) => { if (ore === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Ore tonnage must not be zero.'); return waste / ore; },
  weightedGrade: ([m1, g1, m2, g2]) => { if (m1 + m2 === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Combined mass must not be zero.'); if (g1 > 1 || g2 > 1) throw new CalculationError('FRACTION_OUT_OF_RANGE', 'Stream grades must not exceed 1 (100%).'); return (m1 * g1 + m2 * g2) / (m1 + m2); },
  metalContent: ([ore, grade]) => ore * grade,
  pixelCount: ([width, height]) => width * height,
  rawImageBytes: ([pixels, channels, bits]) => pixels * channels * bits / 8,
  bitrateSize: ([bitrate, duration]) => bitrate * duration / 8,
  tokenTime: ([tokens, rate]) => { if (rate === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Token rate must not be zero.'); return tokens / rate; },
  concurrency: ([arrival, latency]) => arrival * latency,
  frameDuration: ([frames, rate]) => { if (rate === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Frame rate must not be zero.'); return frames / rate; },
  renderTime: ([frames, seconds, workers]) => { if (workers === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Worker count must not be zero.'); return frames * seconds / workers; },
  focalFov: ([sensor, focal]) => { if (focal === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Focal length must not be zero.'); return 2 * Math.atan(sensor / (2 * focal)); },
  equivalentFocal: ([focal, crop]) => focal * crop,
  exposureValue: ([aperture, time]) => { if (time === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Exposure time must not be zero.'); return Math.log2(aperture ** 2 / time); },
  apparentAngle: ([size, distance]) => { if (distance === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Distance must not be zero.'); return 2 * Math.atan(size / (2 * distance)); },
  inverseSquare: ([power, distance]) => { if (distance === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Distance must not be zero.'); return power / (4 * Math.PI * distance ** 2); },
  coverageCount: ([area, coverage]) => { if (coverage === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Coverage per unit must not be zero.'); return Math.ceil(area / coverage); },
  paintVolume: ([area, coverage, coats]) => { if (coverage === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Coverage must not be zero.'); return area * coats / coverage; },
  seedMass: ([area, rate]) => area * rate,
  rainfallVolume: ([area, depth]) => area * depth,
  fuelCost: ([distance, economy, price]) => { if (economy === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Fuel economy must not be zero.'); return distance / economy * price; },
  solarEnergy: ([power, hours, efficiency]) => power * hours * efficiency,
  emissions: ([energy, factor]) => energy * factor,
  scale: ([quantity, original, target]) => { if (original === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Original basis must not be zero.'); return quantity * target / original; },
};

const M = 'kg', L = 'm', T = 's';
const sourceCitation = { math: 'math', finance: 'business', civil: 'engineering', mechanical: 'physics', fluids: 'physics', electrical: 'electric', chemistry: 'chemistry', mining: 'engineering', computing: 'software', media: 'media', everyday: 'everyday' };
const fieldNames = {
  math: 'Mathematics and arithmetic', finance: 'Personal and corporate finance', civil: 'Civil engineering', mechanical: 'Mechanical engineering', fluids: 'Water resources and hydraulic engineering', electrical: 'Electrical engineering and power systems', chemistry: 'Chemistry', mining: 'Mining and extractive industries', computing: 'Software development and programming', media: 'VFX, CGI, animation, and motion design', everyday: 'Everyday conversions, cooking, and household projects',
};

function fieldsFor(group, category) {
  let primary = fieldNames[group];
  if (group === 'computing') {
    primary = category === 'AI infrastructure' ? 'Artificial intelligence and machine learning'
      : category === 'Network estimates' ? 'Networking and telecommunications'
        : category === 'Reliability metrics' ? 'Cloud computing and DevOps'
          : category === 'Business metrics' ? 'Business operations, pricing, and unit economics'
            : 'Data engineering and databases';
  }
  if (group === 'media' && category === 'Astronomy tools') primary = 'Physics, astronomy, astrophysics, and cosmology';
  const fields = [primary];
  const add = (...items) => fields.push(...items);
  if (group === 'math' && category === 'Statistics') add('Statistics and data analysis');
  if (group === 'finance' && category === 'Business metrics') add('Business operations, pricing, and unit economics');
  if (group === 'civil') add('Construction estimating and quantity surveying');
  if (group === 'mechanical' && category === 'Transportation estimates') add('Transportation and traffic engineering');
  if (group === 'fluids' && /heat|thermal|HVAC/i.test(category)) add('HVAC and building services');
  if (group === 'electrical') add('Electronics and embedded hardware');
  if (group === 'mining') add('Materials science and metallurgy');
  if (group === 'computing') {
    if (category === 'AI infrastructure') add('Cloud computing and DevOps');
    if (category === 'Reliability metrics') add('Cybersecurity configuration and capacity planning');
  }
  if (group === 'media') {
    if (category === 'Astronomy tools') add('Physics, astronomy, astrophysics, and cosmology');
    if (/VFX|render/i.test(category)) add('VFX, CGI, animation, and motion design');
  }
  if (group === 'everyday') {
    if (category === 'Travel estimates') add('Travel, time, fitness, and sports calculations');
    if (category === 'Material estimates') add('Construction estimating and quantity surveying');
    if (category === 'Garden estimates') add('Agriculture and crop science');
    if (category === 'Energy and household') add('Energy systems and utilities', 'Renewable energy and energy storage');
  }
  return [...new Set(fields)];
}

// Compact, reviewed definitions; each entry is a real formula tool, not a generated placeholder.
const rows = [
  // 01–10 · mathematics and statistics
  ['percentage-point-difference','Percentage-point difference','math','Percentages','Δpp = p₂ − p₁',[['start','Starting percentage','1',{ min: undefined }],['end','Ending percentage','1',{ min: undefined }]],['difference','Percentage-point difference','1'],'subtractReverse'],
  ['ratio-as-share','Ratio as a share','math','Ratios','share = part ÷ whole',[['part','Part','1'],['whole','Whole','1']],['share','Share of whole','1'],'divide'],
  ['arithmetic-mean-two','Arithmetic mean of two values','math','Statistics','mean = (x₁ + x₂) ÷ 2',[['value-1','First value','1',{ min: undefined }],['value-2','Second value','1',{ min: undefined }]],['mean','Arithmetic mean','1'],'mean'],
  ['geometric-mean-two','Geometric mean of two positive values','math','Statistics','GM = √(x₁ × x₂)',[['value-1','First positive value','1'],['value-2','Second positive value','1']],['mean','Geometric mean','1'],'geometricMean'],
  ['root-mean-square-two','Root mean square of two values','math','Statistics','RMS = √((x₁² + x₂²) ÷ 2)',[['value-1','First value','1',{ min: undefined }],['value-2','Second value','1',{ min: undefined }]],['rms','Root mean square','1'],'rms'],
  ['point-distance-2d','Distance between two 2D points','math','Geometry','d = √((x₂ − x₁)² + (y₂ − y₁)²)',[['x-1','First point x','m',{ min: undefined }],['y-1','First point y','m',{ min: undefined }],['x-2','Second point x','m',{ min: undefined }],['y-2','Second point y','m',{ min: undefined }]],['distance','Point distance','m'],'distance2d'],
  ['circle-sector-area','Circular sector area','math','Geometry','A = ½r²θ, with θ in radians',[['radius','Radius','m'],['angle','Central angle','rad']],['area','Sector area','m2'],'sectorArea'],
  ['circle-arc-length','Circular arc length','math','Geometry','s = rθ, with θ in radians',[['radius','Radius','m'],['angle','Central angle','rad']],['length','Arc length','m'],'arcLength'],
  ['sample-standard-error','Standard error of a sample mean','math','Statistics','SE = s ÷ √n',[['std-dev','Sample standard deviation','1'],['sample-count','Sample count','1',{ min: 1, integer: true }]],['standard-error','Standard error','1'],'standardError'],
  ['z-score-value','Z-score from mean and standard deviation','math','Statistics','z = (x − μ) ÷ σ',[['value','Observed value','1',{ min: undefined }],['mean','Mean','1',{ min: undefined }],['std-dev','Standard deviation','1']],['z-score','Z-score','1'],'zScore'],
  // 11–20 · finance and business estimates
  ['simple-interest-return','Simple interest earned','finance','Finance estimates','I = P × r × t',[['principal','Principal amount','1'],['annual-rate','Annual rate (%)','1'],['years','Time (years)','1']],['interest','Estimated interest','1'],'simpleInterest'],
  ['compound-interest-earned','Compound interest earned','finance','Finance estimates','I = P((1 + r)ⁿ − 1); r is the rate per period',[['principal','Principal amount','1'],['annual-rate','Rate per compounding period (%)','1',{ min: undefined }],['periods','Number of compounding periods','1']],['interest','Estimated interest','1'],'compound'],
  ['loan-monthly-payment-estimate','Fixed-rate loan monthly payment estimate','finance','Finance estimates','M = Pr ÷ (1 − (1+r)⁻ⁿ), monthly rate r',[['principal','Loan principal','1'],['annual-rate','Annual rate (%)','1',{ min: undefined }],['term-years','Loan term (years)','1']],['payment','Estimated monthly payment','1'],'payment'],
  ['loan-to-value-ratio','Loan-to-value ratio','finance','Finance estimates','LTV = loan ÷ asset value',[['loan','Loan amount','1'],['asset-value','Asset value','1']],['ltv','Loan-to-value ratio','1'],'ltv','percent'],
  ['debt-to-income-ratio','Debt-to-income ratio','finance','Finance estimates','DTI = monthly debt ÷ gross monthly income',[['monthly-debt','Monthly debt payments','1'],['gross-income','Gross monthly income','1']],['dti','Debt-to-income ratio','1'],'dti','percent'],
  ['return-on-investment','Return on investment estimate','finance','Business metrics','ROI = (ending value − cost) ÷ cost',[['ending-value','Ending value','1'],['cost','Investment cost','1']],['roi','Return on investment','1'],'roi','percent'],
  ['gross-profit-amount','Gross profit amount','finance','Business metrics','Gross profit = revenue − cost of goods',[['revenue','Revenue','1'],['cost-of-goods','Cost of goods sold','1']],['gross-profit','Gross profit','1'],'subtract'],
  ['sales-commission-amount','Sales commission amount','finance','Business metrics','Commission = sale × commission rate',[['sale','Sale amount','1'],['commission-rate','Commission rate (%)','1',{ max: 100 }]],['commission','Commission amount','1'],'percentOf'],
  ['customer-acquisition-cost','Customer acquisition cost','finance','Business metrics','CAC = campaign spend ÷ new customers',[['campaign-spend','Campaign spend','1'],['new-customers','New customers','1',{ min: 1, integer: true }]],['cac','Cost per acquired customer','1'],'divide'],
  ['savings-goal-contribution','Monthly contribution toward a savings goal','finance','Finance estimates','Monthly contribution = (goal − current savings) ÷ months',[['goal','Savings goal','1'],['current-savings','Current savings','1'],['months','Months remaining','1']],['contribution','Monthly contribution','1'],'savingsContribution'],
  // 21–30 · civil and construction quantity estimates
  ['excavation-volume','Rectangular excavation volume','civil','Site geometry','V = length × width × depth',[['length','Excavation length','m'],['width','Excavation width','m'],['depth','Excavation depth','m']],['volume','Excavation volume','m3'],'rectangleVolume'],
  ['floor-screed-volume','Floor screed volume','civil','Material estimates','V = floor area × screed thickness',[['area','Floor area','m2'],['thickness','Screed thickness','m']],['volume','Screed volume','m3'],'multiply'],
  ['wall-material-volume','Wall volume from length, height, and thickness','civil','Material estimates','V = length × height × thickness',[['length','Wall length','m'],['height','Wall height','m'],['thickness','Wall thickness','m']],['volume','Gross wall volume','m3'],'rectangleVolume'],
  ['roof-pitch-percent','Roof pitch as a percentage','civil','Site geometry','pitch = rise ÷ horizontal run',[['rise','Roof rise','m'],['run','Horizontal run','m']],['pitch','Roof pitch (%)','1'],'slopePercent','percent'],
  ['roof-rafter-length','Roof rafter length from run and rise','civil','Site geometry','L = √(run² + rise²)',[['run','Horizontal run','m'],['rise','Vertical rise','m']],['rafter','Rafter length','m'],'hypotenuse'],
  ['aggregate-tonnage-estimate','Aggregate mass from volume and bulk density','civil','Material estimates','m = V × ρ',[['volume','Aggregate volume','m3'],['bulk-density','Bulk density','kg/m3']],['mass','Estimated aggregate mass','kg'],'multiply'],
  ['soil-bulk-density','Soil bulk density estimate','civil','Geotechnical engineering','ρ = dry soil mass ÷ sample volume',[['dry-mass','Dry soil mass','kg'],['sample-volume','Sample volume','m3']],['density','Bulk density','kg/m3'],'density'],
  ['cubic-volume-tonnage','Material tonnage from cubic volume','civil','Material estimates','m = V × ρ',[['volume','Material volume','m3'],['density','Bulk density','kg/m3']],['mass','Estimated mass','kg'],'multiply'],
  ['road-grade-percent','Road grade from elevation change and run','civil','Site geometry','grade = rise ÷ run',[['rise','Elevation change','m',{ min: undefined }],['run','Horizontal run','m']],['grade','Road grade (%)','1'],'slopePercent','percent'],
  ['concrete-batch-yield','Concrete batch yield volume','civil','Material estimates','V = batch mass ÷ fresh density',[['batch-mass','Batch mass','kg'],['fresh-density','Fresh concrete density','kg/m3']],['yield','Estimated batch yield','m3'],'density'],
  // 31–40 · mechanical and applied physics
  ['belt-linear-speed','Belt linear speed from pulley diameter and rpm','mechanical','Machines and mechanisms','v = πDn ÷ 60',[['diameter','Pulley diameter','m'],['rpm','Pulley speed (rpm)','rpm']],['speed','Belt speed','m/s'],'beltSpeed'],
  ['point-mass-rotational-inertia','Point-mass rotational inertia','mechanical','Rotational mechanics','I = mr²',[['mass','Point mass','kg'],['radius','Distance from axis','m']],['inertia','Rotational inertia','kgm2'],'rotationalInertia'],
  ['centrifugal-force-estimate','Circular-motion force magnitude estimate','mechanical','Circular motion','F = mv² ÷ r',[['mass','Mass','kg'],['speed','Tangential speed','m/s'],['radius','Path radius','m']],['force','Radial force magnitude','N'],'centripetalForce'],
  ['ideal-braking-distance','Idealized level-ground braking distance','mechanical','Transportation estimates','d = v² ÷ (2μg)',[['speed','Initial speed','m/s'],['friction','Friction coefficient','1']],['distance','Idealized braking distance','m'],'brakingDistance'],
  ['pulley-mechanical-advantage','Ideal pulley mechanical advantage','mechanical','Machines and mechanisms','MA = number of supporting rope segments',[['supporting-segments','Supporting rope segments','1',{ min: 1, integer: true }]],['advantage','Ideal mechanical advantage','1'],'identity'],
  ['hydraulic-cylinder-force','Hydraulic cylinder force estimate','mechanical','Hydraulic systems','F = pressure × piston area',[['pressure','Hydraulic pressure','Pa'],['piston-area','Piston area','m2']],['force','Ideal cylinder force','N'],'multiply'],
  ['spring-rate-from-load-deflection','Spring rate from load and deflection','mechanical','Material properties','k = F ÷ x',[['load','Applied load','N'],['deflection','Deflection','m']],['stiffness','Spring rate','N/m'],'divide'],
  ['rotating-surface-speed','Rotating surface speed','mechanical','Machines and mechanisms','v = rω',[['radius','Rotating radius','m'],['angular-speed','Angular speed','rad/s']],['speed','Surface speed','m/s'],'multiply'],
  ['momentum-from-impulse-mass','Velocity change from impulse and mass','mechanical','Mechanics','Δv = J ÷ m',[['impulse','Impulse magnitude','Ns'],['mass','Mass','kg']],['velocity-change','Velocity change magnitude','m/s'],'divide'],
  ['kinetic-energy-from-mass-speed','Kinetic energy from mass and speed','mechanical','Energy systems','KE = ½mv²',[['mass','Mass','kg'],['speed','Speed','m/s']],['energy','Kinetic energy','J'],'kineticEnergy'],
  // 41–50 · fluids, HVAC, and heat transfer
  ['fluid-head-pressure','Hydrostatic pressure from fluid head','fluids','Hydraulic systems','ΔP = ρgh',[['density','Fluid density','kg/m3'],['head','Fluid head','m']],['pressure','Gauge pressure','Pa'],'hydrostaticPressure'],
  ['hydraulic-power-output','Hydraulic power from pressure and flow','fluids','Hydraulic systems','P = ΔP × Q',[['pressure','Pressure rise','Pa'],['flow','Volume flow rate','m3/s']],['power','Hydraulic power','W'],'hydraulicPower'],
  ['pump-efficiency-estimate','Pump efficiency from useful and input power','fluids','Hydraulic systems','η = useful power ÷ input power',[['useful-power','Useful hydraulic power','W'],['input-power','Input power','W']],['efficiency','Efficiency','1'],'pumpEfficiency','percent'],
  ['rectangular-channel-average-speed','Rectangular channel average speed','fluids','Fluid mechanics','v = Q ÷ (width × depth)',[['flow','Volume flow rate','m3/s'],['width','Channel width','m'],['depth','Flow depth','m']],['speed','Average flow speed','m/s'],'channelSpeed'],
  ['wall-thermal-resistance','Plane-wall conduction resistance','fluids','Heat transfer','R = thickness ÷ (kA)',[['thickness','Wall thickness','m'],['conductivity','Thermal conductivity','W/mK'],['area','Heat-transfer area','m2']],['resistance','Thermal resistance','K/W'],'thermalResistance'],
  ['convection-heat-transfer-rate','Convection heat-transfer rate','fluids','Heat transfer','Q̇ = hAΔT',[['coefficient','Convection coefficient','W/m2K'],['area','Surface area','m2'],['temperature-difference','Temperature difference','deltaK']],['heat-rate','Heat-transfer rate','W'],'convection'],
  ['sensible-cooling-load','Sensible heating or cooling rate','fluids','HVAC estimates','Q̇ = ṁcpΔT',[['mass-flow','Mass flow rate','kg/s'],['heat-capacity','Specific heat capacity','J/kgK'],['temperature-difference','Temperature difference','deltaK']],['heat-rate','Sensible heat rate','W'],'thermalEnergy'],
  ['thermal-diffusivity','Thermal diffusivity','fluids','Thermal physics','α = k ÷ (ρcp)',[['conductivity','Thermal conductivity','W/mK'],['density','Material density','kg/m3'],['heat-capacity','Specific heat capacity','J/kgK']],['diffusivity','Thermal diffusivity','m2/s'],'diffusivity'],
  ['tank-fill-time','Tank fill time from volume and flow rate','fluids','Hydraulic systems','t = V ÷ Q',[['volume','Tank volume','m3'],['flow','Volume flow rate','m3/s']],['time','Ideal fill time','s'],'divide'],
  ['pipe-average-flow-speed','Pipe average flow speed','fluids','Pipe flow','v = Q ÷ A',[['flow','Volume flow rate','m3/s'],['area','Internal flow area','m2']],['speed','Average fluid speed','m/s'],'divide'],
  // 51–60 · electrical and electronic estimates
  ['battery-energy-watt-hours','Battery energy in watt-hours','electrical','Electrical energy','E = V × Ah',[['voltage','Nominal voltage','V'],['capacity','Capacity (Ah)','Ah']],['energy','Nominal energy (Wh)','Wh'],'batteryEnergy'],
  ['resistor-power-from-current','Resistor power from current and resistance','electrical','Circuit fundamentals','P = I²R',[['current','Current','A'],['resistance','Resistance','ohm']],['power','Resistor power','W'],'resistorPower'],
  ['capacitor-reactance','Capacitive reactance','electrical','Capacitors','Xc = 1 ÷ (2πfC)',[['frequency','Frequency','Hz'],['capacitance','Capacitance','F']],['reactance','Capacitive reactance','ohm'],'capacitorReactance'],
  ['inductor-reactance','Inductive reactance','electrical','Circuit fundamentals','Xl = 2πfL',[['frequency','Frequency','Hz'],['inductance','Inductance','H']],['reactance','Inductive reactance','ohm'],'inductorReactance'],
  ['transformer-secondary-voltage','Ideal transformer secondary voltage','electrical','Electrical power','Vs = Vp × Ns ÷ Np',[['primary-voltage','Primary voltage','V'],['primary-turns','Primary turns','1'],['secondary-turns','Secondary turns','1']],['secondary-voltage','Ideal secondary voltage','V'],'transformerVoltage'],
  ['balanced-three-phase-power','Balanced three-phase real power','electrical','Electrical power','P = √3 VL IL PF',[['line-voltage','Line-to-line voltage','V'],['line-current','Line current','A'],['power-factor','Power factor','1']],['power','Real power estimate','W'],'threePhasePower'],
  ['led-series-resistor','LED series resistor estimate','electrical','Circuit fundamentals','R = (Vs − Vf) ÷ I',[['supply-voltage','Supply voltage','V'],['led-voltage','LED forward voltage','V'],['current','Target current','A']],['resistance','Series resistance','ohm'],'ledResistor'],
  ['voltage-divider-output','Ideal unloaded voltage divider output','electrical','Circuit fundamentals','Vout = Vin R₂ ÷ (R₁ + R₂)',[['input-voltage','Input voltage','V'],['upper-resistance','Upper resistance','ohm'],['lower-resistance','Lower resistance','ohm']],['output-voltage','Unloaded output voltage','V'],'voltageDivider'],
  ['charge-from-current-time','Electric charge from current and time','electrical','Electrical basics','Q = It',[['current','Current','A'],['duration','Duration','s']],['charge','Electric charge','C'],'charge'],
  ['capacitor-charge-estimate','Capacitor charge from capacitance and voltage','electrical','Capacitors','Q = CV',[['capacitance','Capacitance','F'],['voltage','Voltage','V']],['charge','Stored charge','C'],'capacitanceCharge'],
  // 61–70 · chemistry and mining
  ['molar-mass-from-sample','Molar mass from sample mass and amount','chemistry','Stoichiometry','M = m ÷ n',[['mass','Sample mass','kg'],['amount','Amount of substance','mol']],['molar-mass','Molar mass','kg/mol'],'molarMass'],
  ['moles-from-solution-volume','Amount from molar concentration and volume','chemistry','Solutions','n = cV',[['concentration','Concentration','mol/L'],['volume','Solution volume','L']],['amount','Amount of substance','mol'],'moles'],
  ['remaining-material-after-half-life','Remaining quantity after elapsed half-lives','chemistry','Radioactive decay','N = N₀ × 0.5^(t/t½)',[['initial-quantity','Initial quantity','1'],['elapsed-time','Elapsed time','s'],['half-life','Half-life','s']],['remaining','Remaining quantity','1'],'halfLife'],
  ['dilution-stock-volume','Stock solution volume for a dilution','chemistry','Solutions','V₁ = C₂V₂ ÷ C₁',[['stock-concentration','Stock concentration','mol/L'],['final-volume','Final volume','L'],['target-concentration','Target concentration','mol/L']],['stock-volume','Stock solution volume','L'],'dilutionVolume'],
  ['metal-recovered-mass','Contained metal recovered from feed','mining','Ore and samples','mmetal = feed × grade × recovery',[['feed-mass','Feed mass','kg'],['grade','Feed grade fraction','1'],['recovery','Recovery fraction','1']],['metal-mass','Recovered metal mass','kg'],'recovery'],
  ['mine-strip-ratio','Mining strip ratio','mining','Ore and samples','SR = waste mass ÷ ore mass',[['waste-mass','Waste mass','kg'],['ore-mass','Ore mass','kg']],['strip-ratio','Waste-to-ore ratio','1'],'stripRatio'],
  ['mine-waste-tonnage','Waste tonnage from strip ratio and ore tonnage','mining','Ore and samples','Waste = strip ratio × ore tonnage',[['strip-ratio','Waste-to-ore ratio','1'],['ore-mass','Ore mass','kg']],['waste-mass','Estimated waste mass','kg'],'multiply'],
  ['blended-ore-grade-two-streams','Two-stream blended ore grade','mining','Ore and samples','G = (m₁g₁ + m₂g₂) ÷ (m₁ + m₂)',[['mass-1','Stream 1 mass','kg'],['grade-1','Stream 1 grade fraction','1',{ max: 1 }],['mass-2','Stream 2 mass','kg'],['grade-2','Stream 2 grade fraction','1',{ max: 1 }]],['grade','Blended grade fraction','1'],'weightedGrade'],
  ['contained-metal-in-ore','Contained metal from ore mass and grade','mining','Ore and samples','Contained mass = ore mass × grade',[['ore-mass','Ore mass','kg'],['grade','Grade fraction','1']],['contained-metal','Contained metal mass','kg'],'metalContent'],
  ['mineral-product-recovery','Mass recovery from product and feed','mining','Ore and samples','Recovery = product mass ÷ feed mass',[['product-mass','Product mass','kg'],['feed-mass','Feed mass','kg']],['recovery','Mass recovery fraction','1'],'recoveryRatio','percent'],
  // 71–80 · software, hardware, and AI capacity planning
  ['image-pixel-count','Image pixel count','computing','Media storage','pixels = width × height',[['width','Image width (pixels)','1'],['height','Image height (pixels)','1']],['pixels','Pixel count','1'],'multiply'],
  ['uncompressed-image-size','Uncompressed image storage estimate','computing','Media storage','bytes = pixels × channels × bits ÷ 8',[['pixels','Pixel count','1'],['channels','Channels per pixel','1'],['bits-per-channel','Bits per channel','1']],['bytes','Uncompressed size (bytes)','B'],'rawImageBytes'],
  ['video-size-from-bitrate','Video payload size from bitrate and duration','computing','Media storage','bytes ≈ bitrate × duration ÷ 8',[['bitrate','Bitrate (bit/s)','1'],['duration','Duration','s']],['size','Payload size (bytes)','B'],'bitrateSize'],
  ['llm-generation-time','Idealized token generation time','computing','AI infrastructure','time = output tokens ÷ tokens per second',[['tokens','Output token count','1'],['token-rate','Generation rate (tokens/s)','1']],['time','Idealized generation time','s'],'tokenTime'],
  ['concurrent-requests-little-law','Concurrent requests from throughput and latency','computing','Network estimates','concurrency ≈ arrival rate × response time',[['request-rate','Request rate (requests/s)','1'],['latency','Mean latency (s)','s']],['concurrency','Estimated in-flight requests','1'],'concurrency'],
  ['sample-processing-throughput','Processing throughput from completed items and duration','computing','Business metrics','throughput = completed items ÷ elapsed time',[['completed-items','Completed items','1'],['duration','Elapsed time','s']],['throughput','Items per second','1'],'divide'],
  ['cache-hit-ratio','Cache hit ratio','computing','Reliability metrics','hit ratio = cache hits ÷ requests',[['hits','Cache hits','1'],['requests','Total requests','1']],['hit-ratio','Cache hit ratio','1'],'ratio','percent'],
  ['dataset-size-rows-columns','Dataset cell count','computing','Data engineering','cells = rows × columns',[['rows','Rows','1'],['columns','Columns','1']],['cells','Cell count','1'],'multiply'],
  ['parallel-job-ideal-runtime','Ideal parallel job runtime estimate','computing','AI infrastructure','runtime = total work ÷ workers',[['serial-work','Serial work duration','s'],['workers','Worker count','1']],['runtime','Idealized runtime','s'],'divide'],
  ['network-utilization-ratio','Network link utilization','computing','Networking estimates','utilization = used throughput ÷ link capacity',[['used-rate','Used throughput (bit/s)','1'],['link-capacity','Link capacity (bit/s)','1']],['utilization','Link utilization fraction','1'],'ratio','percent'],
  // 81–90 · VFX, photography, and astronomy
  ['camera-horizontal-field-of-view','Camera horizontal field of view','media','Photography','HFOV = 2 atan(sensor width ÷ 2f)',[['sensor-width','Sensor width','mm'],['focal-length','Focal length','mm']],['field-of-view','Horizontal field of view','rad'],'focalFov'],
  ['crop-equivalent-focal-length','Crop-equivalent focal length','media','Photography','equivalent focal length = focal length × crop factor',[['focal-length','Lens focal length','mm'],['crop-factor','Crop factor','1']],['equivalent-focal-length','Equivalent focal length','mm'],'multiply'],
  ['exposure-value-from-settings','Exposure value from aperture and shutter time','media','Photography','EV = log₂(N² ÷ t)',[['f-number','F-number','1'],['exposure-time','Exposure time (s)','s']],['ev','Exposure value','1'],'exposureValue'],
  ['animation-duration-from-frames','Animation duration from frame count and frame rate','media','Render planning','duration = frames ÷ frame rate',[['frame-count','Frame count','1',{ min: 1, integer: true }],['frame-rate','Frame rate (frames/s)','1']],['duration','Playback duration','s'],'frameDuration'],
  ['render-farm-runtime','Ideal render queue runtime estimate','media','Render planning','runtime = frames × seconds per frame ÷ workers',[['frames','Frame count','1',{ min: 1, integer: true }],['seconds-per-frame','Render time per frame','s'],['workers','Render workers','1',{ min: 1, integer: true }]],['runtime','Idealized wall time','s'],'renderTime'],
  ['apparent-angular-size','Apparent angular size of a small object','media','Astronomy tools','θ = 2 atan(size ÷ 2 distance)',[['object-size','Object size','m'],['distance','Distance to object','m']],['angle','Angular size','rad'],'apparentAngle'],
  ['inverse-square-irradiance','Ideal isotropic irradiance with distance','media','Astronomy tools','E = P ÷ (4πr²)',[['power','Power emitted isotropically','W'],['distance','Distance from source','m']],['irradiance','Irradiance','W/m2'],'inverseSquare'],
  ['sequence-frame-count','Frame count from duration and playback rate','media','VFX and animation','frames = duration × frame rate',[['duration','Sequence duration','s'],['frame-rate','Playback rate (frames/s)','1']],['frames','Frame count','1'],'multiply'],
  ['digital-image-aspect-ratio','Digital image aspect ratio','media','VFX and animation','aspect ratio = width ÷ height',[['width','Image width (pixels)','1'],['height','Image height (pixels)','1']],['aspect-ratio','Aspect ratio','1'],'divide'],
  ['light-travel-time','Light travel time over a specified distance','media','Astronomy tools','t = distance ÷ c, c = 299,792,458 m/s',[['distance','Distance','m']],['time','Light travel time','s'],'lightTravel'],
  // 91–100 · everyday, environment, and household planning
  ['paint-volume-coverage','Paint volume from area, coverage, and coats','everyday','Material estimates','volume = area × coats ÷ coverage',[['area','Paintable area','m2'],['coverage','Coverage per litre (m²/L)','1'],['coats','Number of coats','1']],['volume','Paint volume (litres)','L'],'paintVolume'],
  ['tile-packages-needed','Tile packages needed from floor and pack coverage','everyday','Material estimates','packages = ceil(floor area ÷ pack coverage)',[['floor-area','Floor area','m2'],['pack-coverage','Coverage per package','m2']],['packages','Whole packages','1'],'coverageCount'],
  ['wallpaper-rolls-needed','Wallpaper rolls needed from wall area and roll coverage','everyday','Material estimates','rolls = ceil(wall area ÷ roll coverage)',[['wall-area','Wall area','m2'],['roll-coverage','Coverage per roll','m2']],['rolls','Whole rolls','1'],'coverageCount'],
  ['lawn-seed-mass','Lawn seed mass from area and sowing rate','everyday','Garden estimates','seed mass = area × sowing rate',[['area','Lawn area','m2'],['sowing-rate','Sowing rate from the seed label','kg/m2',{ acceptedUnits: ['kg/m2', 'kg_ha', 'g_m2', 'lb_acre', 'oz_yd2'] }]],['seed-mass','Seed mass (kg)','kg'],'seedMass'],
  ['rainwater-harvest-volume','Rainfall volume over a collection area','everyday','Water estimates','volume = area × rainfall depth',[['catchment-area','Catchment area','m2'],['rainfall-depth','Rainfall depth','m']],['volume','Collected water volume','m3'],'multiply'],
  ['trip-fuel-cost-estimate','Trip fuel cost estimate','everyday','Travel estimates','cost = distance ÷ fuel economy × fuel price',[['distance','Trip distance (km)','km'],['fuel-economy','Fuel economy (km/L)','1'],['fuel-price','Fuel price per litre','1']],['cost','Estimated fuel cost','1'],'fuelCost'],
  ['daily-solar-energy-estimate','Daily solar energy estimate','everyday','Energy and household','E = rated power × equivalent sun hours × performance ratio',[['rated-power','Rated power','W'],['sun-hours','Equivalent sun hours','h'],['performance-ratio','Performance ratio','1']],['energy','Daily energy estimate','Wh'],'solarEnergy'],
  ['operational-carbon-estimate','Operational emissions estimate from energy use','everyday','Energy and household','emissions = energy × emissions factor',[['energy','Energy use (kWh)','kWh'],['emissions-factor','Emissions factor (kg/kWh)','1']],['emissions','Estimated emissions (kg)','kg'],'emissions'],
  ['recipe-quantity-scale-factor','Recipe ingredient quantity scaling','everyday','Cooking','scaled quantity = original × target servings ÷ original servings',[['quantity','Original ingredient quantity','1'],['original-servings','Original servings','1'],['target-servings','Target servings','1']],['scaled-quantity','Scaled ingredient quantity','1'],'scale'],
  ['water-use-volume-from-flow','Water use volume from flow and duration','everyday','Water estimates','volume = flow rate × duration',[['flow-rate','Flow rate','L/s'],['duration','Duration','s']],['volume','Water use volume','L'],'multiply'],
];

const METHODS = {
  savingsContribution: ([goal, current, months]) => { if (months <= 0) throw new CalculationError('POSITIVE_VALUE_REQUIRED', 'Months remaining must be greater than zero.'); return (goal - current) / months; },
  beltSpeed: ([diameter, rpm]) => Math.PI * diameter * rpm / 60,
  rotationalInertia: ([mass, radius]) => mass * radius ** 2,
  centripetalForce: ([mass, speed, radius]) => { if (radius === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Path radius must not be zero.'); return mass * speed ** 2 / radius; },
  brakingDistance: ([speed, friction], g = 9.80665) => { if (friction === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Friction coefficient must not be zero.'); return speed ** 2 / (2 * friction * g); },
  channelSpeed: ([flow, width, depth]) => { if (width * depth === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Channel cross-section must not be zero.'); return flow / (width * depth); },
  convection: ([coefficient, area, deltaT]) => coefficient * area * deltaT,
  diffusivity: ([conductivity, density, heatCapacity]) => { if (density * heatCapacity === 0) throw new CalculationError('DIVISION_BY_ZERO', 'Density and heat capacity must not be zero.'); return conductivity / (density * heatCapacity); },
  batteryEnergy: ([voltage, ampHours]) => voltage * ampHours,
  lightTravel: ([distance], c = 299_792_458) => distance / c,
};

function calculationFor(op, values) {
  if (METHODS[op]) return METHODS[op](values);
  const args = values;
  const fn = OPS[op];
  if (!fn) throw new CalculationError('UNKNOWN_METHOD', 'This calculator method is not available.');
  return fn(args);
}

function visualizationKindFor(group, category) {
  if (group === 'math') return category === 'Geometry' ? 'geometry' : category === 'Statistics' ? 'trend' : 'balance';
  if (group === 'finance') return 'trend';
  if (group === 'civil') return category === 'Site geometry' ? 'geometry' : 'diagram';
  if (group === 'mechanical') return 'motion';
  if (group === 'fluids') return /heat|thermal|HVAC/i.test(category) ? 'thermal' : 'flow';
  if (group === 'electrical') return 'diagram';
  if (group === 'chemistry' || group === 'mining') return 'balance';
  if (group === 'computing') return 'capacity';
  if (group === 'media') return /VFX|render/i.test(category) ? 'motion' : 'diagram';
  if (group === 'everyday') return /material|garden/i.test(category) ? 'geometry' : 'diagram';
  return 'diagram';
}

function definitionFromRow(row) {
  const [id, title, group, category, formula, inputRows, outputRow, op, outputFormat] = row;
  const inputs = inputRows.map(([fieldId, label, unit, options = {}]) => {
    const unitDefinition = getUnit(unit);
    const inputOptions = { min: 0, ...options };
    return unit === '1' ? sin(fieldId, label, '', inputOptions) : qin(fieldId, label, unitDefinition.dimension, unit, inputOptions.acceptedUnits || [unit], inputOptions);
  });
  const [outputId, outputLabel, outputUnit] = outputRow;
  const outputUnitDefinition = getUnit(outputUnit);
  const outputs = outputFormat === 'percent'
    ? [sout(outputId, outputLabel, 'percent')]
    : [qout(outputId, outputLabel, outputUnitDefinition.dimension, outputUnit)];
  const citation = SOURCES[sourceCitation[group]] || SOURCES.engineering;
  const field = fieldNames[group];
  const fields = fieldsFor(group, category);
  return educationalDefinition({
    id, title, discipline: field, fields, category,
    description: `Calculate ${outputLabel.toLowerCase()} from the entered ${inputRows.map(([, label]) => label.toLowerCase()).join(', ')} using the displayed relationship.`,
    keywords: [title.toLowerCase(), category.toLowerCase(), field.toLowerCase(), ...inputRows.map(([, label]) => label.toLowerCase()), outputLabel.toLowerCase()],
    formula,
    assumptions: ['Inputs are interpreted in the selected units and normalized to the calculator’s canonical units.', 'This is a scoped estimate under the displayed equation, not a substitute for domain-specific review.'],
    exclusions: ['Does not model unlisted losses, uncertainty, regulations, codes, safety factors, or site-specific conditions.'],
    limitations: ['Use the method details to review the formula, units, and stated input limits before relying on the result.'],
    citation: `${citation[0]} Formula: ${formula}`,
    sourceUrl: citation[1],
    verificationCases: [`Representative reference and invalid-input cases are recorded in the next-100 expansion regression suite; developer self-review only, with no independent domain review recorded.`],
    visualization: { kind: visualizationKindFor(group, category), title: `${title} · calculation map`, description: `Schematic view of the ${inputRows.map(([, label]) => label.toLowerCase()).join(', ')} values and the ${outputLabel.toLowerCase()} result. See the method, source, assumptions, and limits for the authoritative calculation.` },
    inputs,
    outputs,
    calculate(raw) {
      const values = Object.fromEntries(Object.entries(raw).map(([key, quantity]) => [key, quantity.value]));
      const result = calculationFor(op, Object.values(values));
      if (!Number.isFinite(result)) throw new CalculationError('NON_FINITE_RESULT', 'The calculation did not produce a finite result. Check the entered values.');
      const outValue = outputFormat === 'percent' ? result : result;
      const outUnitId = outputFormat === 'percent' ? '1' : outputUnit;
      const substitutions = inputRows.map(([fieldId, label]) => `${label} = ${values[fieldId]}`).join('; ');
      return calculated({ [outputId]: { value: outValue, unit: outUnitId } }, formula, [`Normalize inputs: ${substitutions}.`, `Apply ${formula}.`, `Result: ${outputLabel} = ${result} ${outputFormat === 'percent' ? '%' : getUnit(outputUnit).symbol}.`]);
    },
    intendedAudience: ['General educational and planning use'],
  });
}

export const next100Calculators = Object.freeze(rows.map(definitionFromRow));
