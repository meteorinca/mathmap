/**
 * Math Skills Tree Data
 * 
 * Tree grows BOTTOM → TOP.
 * y = 0 is the BOTTOM (foundations).
 * Higher y values go UP visually.
 *
 * Each course has:
 *   - name: display name
 *   - id: unique slug
 *   - icon: emoji
 *   - branch: color branch group ("foundations", "elementary", "middle", "algebra", "geometry", "statistics", "calculus", "advanced")
 *   - topics: array of { name, link }
 *   - x, y: position on the skill tree canvas (grid units)
 *   - prereqs: array of course IDs that should be completed first
 */

// Branch color themes
const BRANCH_COLORS = {
  foundations: { main: "#ff6b9d", glow: "rgba(255,107,157,0.5)", bg: "rgba(255,107,157,0.15)" },
  elementary:  { main: "#ffd166", glow: "rgba(255,209,102,0.5)", bg: "rgba(255,209,102,0.15)" },
  middle:      { main: "#06d6a0", glow: "rgba(6,214,160,0.5)",   bg: "rgba(6,214,160,0.15)" },
  algebra:     { main: "#118ab2", glow: "rgba(17,138,178,0.5)",  bg: "rgba(17,138,178,0.15)" },
  geometry:    { main: "#ef476f", glow: "rgba(239,71,111,0.5)",  bg: "rgba(239,71,111,0.15)" },
  statistics:  { main: "#8338ec", glow: "rgba(131,56,236,0.5)",  bg: "rgba(131,56,236,0.15)" },
  calculus:    { main: "#ff6b35", glow: "rgba(255,107,53,0.5)",  bg: "rgba(255,107,53,0.15)" },
  advanced:    { main: "#00b4d8", glow: "rgba(0,180,216,0.5)",   bg: "rgba(0,180,216,0.15)" }
};

const MATH_DATA = [
  // ══════════════════════════════════════════════════
  // ROW 0 (BOTTOM) — Foundations
  // ══════════════════════════════════════════════════
  {
    name: "Early Math Review",
    id: "early-math-review",
    icon: "🧒",
    branch: "foundations",
    x: 3, y: 0,
    prereqs: [],
    topics: [
      { name: "Counting", link: "" },
      { name: "Addition and subtraction intro", link: "" },
      { name: "Place value (tens and hundreds)", link: "" },
      { name: "Addition and subtraction within 20", link: "" },
      { name: "Addition and subtraction within 100", link: "" },
      { name: "Addition and subtraction within 1000", link: "" },
      { name: "Measurement and data", link: "" },
      { name: "Geometry", link: "" }
    ]
  },
  {
    name: "Kindergarten",
    id: "kindergarten-math",
    icon: "🎨",
    branch: "foundations",
    x: 5, y: 0,
    prereqs: [],
    topics: [
      { name: "Counting and place value", link: "" },
      { name: "Addition and subtraction", link: "" },
      { name: "Measurement and geometry", link: "" }
    ]
  },

  // ══════════════════════════════════════════════════
  // ROW 1 — Elementary begins
  // ══════════════════════════════════════════════════
  {
    name: "1st Grade",
    id: "1st-grade-math",
    icon: "1️⃣",
    branch: "elementary",
    x: 4, y: 1,
    prereqs: ["early-math-review", "kindergarten-math"],
    topics: [
      { name: "Place value", link: "" },
      { name: "Addition and subtraction", link: "" },
      { name: "Measurement, data, and geometry", link: "" }
    ]
  },
  {
    name: "2nd Grade",
    id: "2nd-grade-math",
    icon: "2️⃣",
    branch: "elementary",
    x: 4, y: 2,
    prereqs: ["1st-grade-math"],
    topics: [
      { name: "Add and subtract within 20", link: "" },
      { name: "Place value", link: "" },
      { name: "Add and subtract within 100", link: "" },
      { name: "Add and subtract within 1,000", link: "" },
      { name: "Money and time", link: "" },
      { name: "Measurement", link: "" },
      { name: "Data", link: "" },
      { name: "Geometry", link: "" }
    ]
  },

  // ══════════════════════════════════════════════════
  // ROW 3 — Branching point
  // ══════════════════════════════════════════════════
  {
    name: "3rd Grade",
    id: "3rd-grade-math",
    icon: "3️⃣",
    branch: "elementary",
    x: 3, y: 3,
    prereqs: ["2nd-grade-math"],
    topics: [
      { name: "Intro to multiplication", link: "" },
      { name: "1-digit multiplication", link: "" },
      { name: "Addition, subtraction, and estimation", link: "" },
      { name: "Intro to division", link: "" },
      { name: "Understand fractions", link: "" },
      { name: "Equivalent fractions and comparing fractions", link: "" },
      { name: "More with multiplication and division", link: "" },
      { name: "Arithmetic patterns and problem solving", link: "" },
      { name: "Quadrilaterals", link: "" },
      { name: "Area", link: "" },
      { name: "Perimeter", link: "" },
      { name: "Time", link: "" },
      { name: "Measurement", link: "" },
      { name: "Represent and interpret data", link: "" }
    ]
  },
  {
    name: "Arithmetic",
    id: "arithmetic",
    icon: "➕",
    branch: "elementary",
    x: 5, y: 3,
    prereqs: ["2nd-grade-math"],
    topics: [
      { name: "Intro to multiplication", link: "" },
      { name: "1-digit multiplication", link: "" },
      { name: "Intro to division", link: "" },
      { name: "Understand fractions", link: "" },
      { name: "Place value through 1,000,000", link: "" },
      { name: "Add and subtract through 1,000,000", link: "" },
      { name: "Multiply 1- and 2-digit numbers", link: "" },
      { name: "Divide with remainders", link: "" },
      { name: "Add and subtract fractions (like denominators)", link: "" },
      { name: "Multiply fractions", link: "" },
      { name: "Decimals and place value", link: "" },
      { name: "Add and subtract decimals", link: "" },
      { name: "Add and subtract fractions (different denominators)", link: "" },
      { name: "Multiply and divide multi-digit numbers", link: "" },
      { name: "Divide fractions", link: "" },
      { name: "Multiply and divide decimals", link: "" },
      { name: "Exponents and powers of ten", link: "" },
      { name: "Add and subtract negative numbers", link: "" },
      { name: "Multiply and divide negative numbers", link: "" }
    ]
  },

  // ══════════════════════════════════════════════════
  // ROW 4–5
  // ══════════════════════════════════════════════════
  {
    name: "4th Grade",
    id: "4th-grade-math",
    icon: "4️⃣",
    branch: "elementary",
    x: 2, y: 4,
    prereqs: ["3rd-grade-math"],
    topics: [
      { name: "Place value", link: "" },
      { name: "Addition, subtraction, and estimation", link: "" },
      { name: "Multiply by 1-digit numbers", link: "" },
      { name: "Multiply by 2-digit numbers", link: "" },
      { name: "Division", link: "" },
      { name: "Factors, multiples and patterns", link: "" },
      { name: "Equivalent fractions and comparing fractions", link: "" },
      { name: "Add and subtract fractions", link: "" },
      { name: "Multiply fractions", link: "" },
      { name: "Understand decimals", link: "" },
      { name: "Plane figures", link: "" },
      { name: "Measuring angles", link: "" },
      { name: "Area and perimeter", link: "" },
      { name: "Units of measurement", link: "" }
    ]
  },
  {
    name: "5th Grade",
    id: "5th-grade-math",
    icon: "5️⃣",
    branch: "middle",
    x: 2, y: 5,
    prereqs: ["4th-grade-math"],
    topics: [
      { name: "Decimal place value", link: "" },
      { name: "Add decimals", link: "" },
      { name: "Subtract decimals", link: "" },
      { name: "Add and subtract fractions", link: "" },
      { name: "Multi-digit multiplication and division", link: "" },
      { name: "Multiply fractions", link: "" },
      { name: "Divide fractions", link: "" },
      { name: "Multiply decimals", link: "" },
      { name: "Divide decimals", link: "" },
      { name: "Powers of ten", link: "" },
      { name: "Volume", link: "" },
      { name: "Coordinate plane", link: "" },
      { name: "Algebraic thinking", link: "" },
      { name: "Converting units of measure", link: "" },
      { name: "Line plots", link: "" },
      { name: "Properties of shapes", link: "" }
    ]
  },
  {
    name: "Basic Geo & Measurement",
    id: "basic-geometry-measurement",
    icon: "📐",
    branch: "geometry",
    x: 6, y: 5,
    prereqs: ["arithmetic"],
    topics: [
      { name: "Intro to area and perimeter", link: "" },
      { name: "Intro to mass and volume", link: "" },
      { name: "Measuring angles", link: "" },
      { name: "Plane figures", link: "" },
      { name: "Units of measurement", link: "" },
      { name: "Volume", link: "" },
      { name: "Coordinate plane", link: "" },
      { name: "Decomposing to find area", link: "" },
      { name: "3D figures", link: "" },
      { name: "Circles, cylinders, cones, and spheres", link: "" },
      { name: "Angle relationships", link: "" },
      { name: "Scale", link: "" },
      { name: "Triangle side lengths", link: "" },
      { name: "Geometric transformations", link: "" }
    ]
  },

  // ══════════════════════════════════════════════════
  // ROW 6–8 — Middle School
  // ══════════════════════════════════════════════════
  {
    name: "6th Grade",
    id: "6th-grade-math",
    icon: "6️⃣",
    branch: "middle",
    x: 2, y: 6,
    prereqs: ["5th-grade-math"],
    topics: [
      { name: "Ratios", link: "" },
      { name: "Arithmetic with rational numbers", link: "" },
      { name: "Rates and percentages", link: "" },
      { name: "Exponents and order of operations", link: "" },
      { name: "Negative numbers", link: "" },
      { name: "Variables & expressions", link: "" },
      { name: "Equations & inequalities", link: "" },
      { name: "Plane figures", link: "" },
      { name: "Coordinate plane", link: "" },
      { name: "3D figures", link: "" },
      { name: "Data and statistics", link: "" }
    ]
  },
  {
    name: "7th Grade",
    id: "7th-grade-math",
    icon: "7️⃣",
    branch: "middle",
    x: 1, y: 7,
    prereqs: ["6th-grade-math"],
    topics: [
      { name: "Proportional relationships", link: "" },
      { name: "Rates and percentages", link: "" },
      { name: "Integers: addition and subtraction", link: "" },
      { name: "Rational numbers: addition and subtraction", link: "" },
      { name: "Negative numbers: multiplication and division", link: "" },
      { name: "Expressions, equations, & inequalities", link: "" },
      { name: "Statistics and probability", link: "" },
      { name: "Scale copies", link: "" },
      { name: "Geometry", link: "" }
    ]
  },
  {
    name: "Pre-Algebra",
    id: "pre-algebra",
    icon: "🔢",
    branch: "algebra",
    x: 5, y: 7,
    prereqs: ["6th-grade-math", "basic-geometry-measurement"],
    topics: [
      { name: "Factors and multiples", link: "" },
      { name: "Patterns", link: "" },
      { name: "Ratios and rates", link: "" },
      { name: "Percentages", link: "" },
      { name: "Exponents intro and order of operations", link: "" },
      { name: "Variables & expressions", link: "" },
      { name: "Equations & inequalities introduction", link: "" },
      { name: "Percent & rational number word problems", link: "" },
      { name: "Proportional relationships", link: "" },
      { name: "One-step and two-step equations & inequalities", link: "" },
      { name: "Roots, exponents, & scientific notation", link: "" },
      { name: "Multi-step equations", link: "" },
      { name: "Two-variable equations", link: "" },
      { name: "Functions and linear models", link: "" },
      { name: "Systems of equations", link: "" }
    ]
  },
  {
    name: "8th Grade",
    id: "8th-grade-math",
    icon: "8️⃣",
    branch: "middle",
    x: 1, y: 8,
    prereqs: ["7th-grade-math"],
    topics: [
      { name: "Numbers and operations", link: "" },
      { name: "Solving equations with one unknown", link: "" },
      { name: "Linear equations and functions", link: "" },
      { name: "Systems of equations", link: "" },
      { name: "Geometry", link: "" },
      { name: "Geometric transformations", link: "" },
      { name: "Data and modeling", link: "" }
    ]
  },

  // ══════════════════════════════════════════════════
  // ROW 9 — High School Track
  // ══════════════════════════════════════════════════
  {
    name: "Algebra 1",
    id: "algebra-1",
    icon: "📊",
    branch: "algebra",
    x: 1, y: 9,
    prereqs: ["8th-grade-math"],
    topics: [
      { name: "Algebra foundations", link: "" },
      { name: "Solving equations & inequalities", link: "" },
      { name: "Working with units", link: "" },
      { name: "Linear equations & graphs", link: "" },
      { name: "Forms of linear equations", link: "" },
      { name: "Systems of equations", link: "" },
      { name: "Inequalities (systems & graphs)", link: "" },
      { name: "Functions", link: "" },
      { name: "Sequences", link: "" },
      { name: "Absolute value & piecewise functions", link: "" },
      { name: "Exponents & radicals", link: "" },
      { name: "Exponential growth & decay", link: "" },
      { name: "Quadratics: Multiplying & factoring", link: "" },
      { name: "Quadratic functions & equations", link: "" },
      { name: "Irrational numbers", link: "" }
    ]
  },
  {
    name: "Algebra Basics",
    id: "algebra-basics",
    icon: "🅰️",
    branch: "algebra",
    x: 5, y: 9,
    prereqs: ["pre-algebra"],
    topics: [
      { name: "Foundations", link: "" },
      { name: "Algebraic expressions", link: "" },
      { name: "Linear equations and inequalities", link: "" },
      { name: "Graphing lines and slope", link: "" },
      { name: "Systems of equations", link: "" },
      { name: "Expressions with exponents", link: "" },
      { name: "Quadratics and polynomials", link: "" },
      { name: "Equations and geometry", link: "" }
    ]
  },

  // ══════════════════════════════════════════════════
  // ROW 10 — Core High School
  // ══════════════════════════════════════════════════
  {
    name: "Algebra 2",
    id: "algebra-2",
    icon: "📈",
    branch: "algebra",
    x: 0, y: 10,
    prereqs: ["algebra-1"],
    topics: [
      { name: "Polynomial arithmetic", link: "" },
      { name: "Complex numbers", link: "" },
      { name: "Polynomial factorization", link: "" },
      { name: "Polynomial division", link: "" },
      { name: "Polynomial graphs", link: "" },
      { name: "Rational exponents and radicals", link: "" },
      { name: "Exponential models", link: "" },
      { name: "Logarithms", link: "" },
      { name: "Transformations of functions", link: "" },
      { name: "Equations", link: "" },
      { name: "Trigonometry", link: "" },
      { name: "Modeling", link: "" }
    ]
  },
  {
    name: "HS Geometry",
    id: "hs-geometry",
    icon: "📏",
    branch: "geometry",
    x: 4, y: 10,
    prereqs: ["algebra-basics", "algebra-1"],
    topics: [
      { name: "Performing transformations", link: "" },
      { name: "Transformation properties and proofs", link: "" },
      { name: "Congruence", link: "" },
      { name: "Similarity", link: "" },
      { name: "Right triangles & trigonometry", link: "" },
      { name: "Analytic geometry", link: "" },
      { name: "Conic sections", link: "" },
      { name: "Circles", link: "" },
      { name: "Solid geometry", link: "" }
    ]
  },
  {
    name: "HS Statistics",
    id: "hs-statistics",
    icon: "📊",
    branch: "statistics",
    x: 7, y: 10,
    prereqs: ["algebra-1"],
    topics: [
      { name: "Displaying a single quantitative variable", link: "" },
      { name: "Analyzing a single quantitative variable", link: "" },
      { name: "Two-way tables", link: "" },
      { name: "Scatterplots", link: "" },
      { name: "Study design", link: "" },
      { name: "Probability", link: "" },
      { name: "Probability distributions & expected value", link: "" }
    ]
  },

  // ══════════════════════════════════════════════════
  // ROW 11 — Trigonometry
  // ══════════════════════════════════════════════════
  {
    name: "Trigonometry",
    id: "trigonometry",
    icon: "📐",
    branch: "calculus",
    x: 0, y: 11,
    prereqs: ["algebra-2"],
    topics: [
      { name: "Right triangles & trigonometry", link: "" },
      { name: "Trigonometric functions", link: "" },
      { name: "Non-right triangles & trigonometry", link: "" },
      { name: "Trigonometric equations and identities", link: "" }
    ]
  },

  // ══════════════════════════════════════════════════
  // ROW 12 — Pre-College / College Prep
  // ══════════════════════════════════════════════════
  {
    name: "Precalculus",
    id: "precalculus",
    icon: "🧮",
    branch: "calculus",
    x: 0, y: 12,
    prereqs: ["trigonometry"],
    topics: [
      { name: "Composite and inverse functions", link: "" },
      { name: "Trigonometry", link: "" },
      { name: "Complex numbers", link: "" },
      { name: "Rational functions", link: "" },
      { name: "Conic sections", link: "" },
      { name: "Vectors", link: "" },
      { name: "Matrices", link: "" },
      { name: "Probability and combinatorics", link: "" },
      { name: "Series", link: "" },
      { name: "Limits and continuity", link: "" }
    ]
  },
  {
    name: "College Algebra",
    id: "college-algebra",
    icon: "🎓",
    branch: "algebra",
    x: 4, y: 12,
    prereqs: ["algebra-2", "hs-geometry"],
    topics: [
      { name: "Linear equations and inequalities", link: "" },
      { name: "Graphs and forms of linear equations", link: "" },
      { name: "Functions", link: "" },
      { name: "Quadratics: Multiplying and factoring", link: "" },
      { name: "Quadratic functions and equations", link: "" },
      { name: "Complex numbers", link: "" },
      { name: "Exponents and radicals", link: "" },
      { name: "Rational expressions and equations", link: "" },
      { name: "Relating algebra and geometry", link: "" },
      { name: "Polynomial arithmetic", link: "" },
      { name: "Advanced function types", link: "" },
      { name: "Transformations of functions", link: "" },
      { name: "Rational exponents and radicals", link: "" },
      { name: "Logarithms", link: "" }
    ]
  },
  {
    name: "Stats & Probability",
    id: "statistics-probability",
    icon: "🎲",
    branch: "statistics",
    x: 7, y: 12,
    prereqs: ["hs-statistics"],
    topics: [
      { name: "Analyzing categorical data", link: "" },
      { name: "Displaying and comparing quantitative data", link: "" },
      { name: "Summarizing quantitative data", link: "" },
      { name: "Modeling data distributions", link: "" },
      { name: "Exploring bivariate numerical data", link: "" },
      { name: "Study design", link: "" },
      { name: "Probability", link: "" },
      { name: "Counting, permutations, and combinations", link: "" },
      { name: "Random variables", link: "" },
      { name: "Sampling distributions", link: "" },
      { name: "Confidence intervals", link: "" },
      { name: "Significance tests (hypothesis testing)", link: "" },
      { name: "Two-sample inference for the difference between groups", link: "" },
      { name: "Inference for categorical data (chi-square tests)", link: "" },
      { name: "Advanced regression (inference and transforming)", link: "" },
      { name: "Analysis of variance (ANOVA)", link: "" }
    ]
  },

  // ══════════════════════════════════════════════════
  // ROW 14 — Calculus
  // ══════════════════════════════════════════════════
  {
    name: "AP Calculus AB",
    id: "ap-calculus-ab",
    icon: "🅰️",
    branch: "calculus",
    x: 0, y: 14,
    prereqs: ["precalculus"],
    topics: [
      { name: "Limits and continuity", link: "" },
      { name: "Differentiation: definition and basic derivative rules", link: "" },
      { name: "Differentiation: composite, implicit, and inverse functions", link: "" },
      { name: "Contextual applications of differentiation", link: "" },
      { name: "Applying derivatives to analyze functions", link: "" },
      { name: "Integration and accumulation of change", link: "" },
      { name: "Differential equations", link: "" },
      { name: "Applications of integration", link: "" }
    ]
  },
  {
    name: "Calculus 1",
    id: "calculus-1",
    icon: "🧮",
    branch: "calculus",
    x: 3, y: 14,
    prereqs: ["precalculus", "college-algebra"],
    topics: [
      { name: "Limits and continuity", link: "" },
      { name: "Derivatives: definition and basic rules", link: "" },
      { name: "Derivatives: chain rule and other advanced topics", link: "" },
      { name: "Applications of derivatives", link: "" },
      { name: "Analyzing functions", link: "" },
      { name: "Integrals", link: "" },
      { name: "Differential equations", link: "" },
      { name: "Applications of integrals", link: "" }
    ]
  },
  {
    name: "AP Statistics",
    id: "ap-statistics",
    icon: "📉",
    branch: "statistics",
    x: 7, y: 14,
    prereqs: ["statistics-probability"],
    topics: [
      { name: "Exploring categorical data", link: "" },
      { name: "Exploring one-variable quantitative data", link: "" },
      { name: "Exploring two-variable quantitative data", link: "" },
      { name: "Collecting data", link: "" },
      { name: "Probability", link: "" },
      { name: "Random variables and probability distributions", link: "" },
      { name: "Sampling distributions", link: "" },
      { name: "Inference for categorical data: Proportions", link: "" },
      { name: "Inference for quantitative data: Means", link: "" },
      { name: "Inference for categorical data: Chi-square", link: "" },
      { name: "Inference for quantitative data: slopes", link: "" }
    ]
  },

  // ══════════════════════════════════════════════════
  // ROW 15 — Calculus continued
  // ══════════════════════════════════════════════════
  {
    name: "AP Calculus BC",
    id: "ap-calculus-bc",
    icon: "🅱️",
    branch: "calculus",
    x: 0, y: 15,
    prereqs: ["ap-calculus-ab"],
    topics: [
      { name: "Limits and continuity", link: "" },
      { name: "Differentiation: definition and basic derivative rules", link: "" },
      { name: "Differentiation: composite, implicit, and inverse functions", link: "" },
      { name: "Contextual applications of differentiation", link: "" },
      { name: "Applying derivatives to analyze functions", link: "" },
      { name: "Integration and accumulation of change", link: "" },
      { name: "Differential equations", link: "" },
      { name: "Applications of integration", link: "" },
      { name: "Parametric equations, polar coordinates, and vector-valued functions", link: "" },
      { name: "Infinite sequences and series", link: "" }
    ]
  },
  {
    name: "Calculus 2",
    id: "calculus-2",
    icon: "🧮",
    branch: "calculus",
    x: 3, y: 15,
    prereqs: ["calculus-1"],
    topics: [
      { name: "Integrals review", link: "" },
      { name: "Integration techniques", link: "" },
      { name: "Differential equations", link: "" },
      { name: "Applications of integrals", link: "" },
      { name: "Parametric equations, polar coordinates, and vector-valued functions", link: "" },
      { name: "Series", link: "" }
    ]
  },

  // ══════════════════════════════════════════════════
  // ROW 17 — Advanced College
  // ══════════════════════════════════════════════════
  {
    name: "Multivariable Calculus",
    id: "multivariable-calculus",
    icon: "🌐",
    branch: "advanced",
    x: 0, y: 17,
    prereqs: ["ap-calculus-bc", "calculus-2"],
    topics: [
      { name: "Thinking about multivariable functions", link: "" },
      { name: "Derivatives of multivariable functions", link: "" },
      { name: "Applications of multivariable derivatives", link: "" },
      { name: "Integrating multivariable functions", link: "" },
      { name: "Green's, Stokes', and the divergence theorems", link: "" }
    ]
  },
  {
    name: "Differential Equations",
    id: "differential-equations",
    icon: "🔄",
    branch: "advanced",
    x: 3, y: 17,
    prereqs: ["calculus-2"],
    topics: [
      { name: "First order differential equations", link: "" },
      { name: "Second order linear equations", link: "" },
      { name: "Laplace transform", link: "" }
    ]
  },
  {
    name: "Linear Algebra",
    id: "linear-algebra",
    icon: "🔢",
    branch: "advanced",
    x: 6, y: 17,
    prereqs: ["calculus-1"],
    topics: [
      { name: "Vectors and spaces", link: "" },
      { name: "Matrix transformations", link: "" },
      { name: "Alternate coordinate systems (bases)", link: "" }
    ]
  }
];
