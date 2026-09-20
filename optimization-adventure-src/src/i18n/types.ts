export interface Translation {
  meta: {
    appName: string
    tagline: string
  }
  common: {
    close: string
    cancel: string
    confirm: string
    back: string
    next: string
    reset: string
    save: string
    loading: string
    stage: string
    level: string
    score: string
    yes: string
    no: string
    home: string
    continue: string
    start: string
    tryAgain: string
    submit: string
    optional: string
    km: string
  }
  header: {
    home: string
    player: string
    language: string
    sound: string
    soundOn: string
    soundOff: string
    progress: string
    resetProgress: string
    backToWebsite: string
  }
  footer: {
    developedBy: string
    privacyNote: string
    contactPrompt: string
  }
  landing: {
    title: string
    subtitle: string
    intro: string
    namePrompt: string
    namePlaceholder: string
    nameCta: string
    nameRequired: string
    welcomeBack: string
    progressOverview: string
    knapsackStageLabel: string
    tspStageLabel: string
    achievementsEarned: string
    soundControl: string
    resetConfirmTitle: string
    resetConfirmBody: string
  }
  games: {
    knapsack: { title: string; short: string; cta: string }
    tsp: { title: string; short: string; cta: string }
  }
  terminology: {
    title: string
    objective: { term: string; def: string }
    constraint: { term: string; def: string }
    solution: { term: string; def: string }
    feasible: { term: string; def: string }
    optimal: { term: string; def: string }
    searchSpace: { term: string; def: string }
  }
  tutorial: {
    skip: string
    showAgain: string
    knapsack: { title: string; steps: string[] }
    tsp: { title: string; steps: string[] }
  }
  modes: {
    learn: string
    challenge: string
    learnDesc: string
    challengeDesc: string
  }
  items: {
    camera: string
    book: string
    laptop: string
    water: string
    toy: string
    watch: string
    chocolate: string
    telescope: string
    headphones: string
    compass: string
    medicine: string
    flashlight: string
    tablet: string
    jacket: string
    binoculars: string
    battery: string
    food: string
    map: string
    rope: string
    tent: string
  }
  cities: {
    tehran: string
    shiraz: string
    tabriz: string
    mashhad: string
    isfahan: string
    yazd: string
    kerman: string
    rasht: string
    ahvaz: string
    kish: string
    qom: string
    urmia: string
    hamedan: string
    zahedan: string
  }
  knapsack: {
    objectiveLabel: string
    objectiveValue: string
    constraintLabel: string
    constraintValue: string
    capacity: string
    used: string
    remaining: string
    totalValue: string
    itemsCount: string
    shelfTitle: string
    backpackTitle: string
    emptyBackpack: string
    weightUnit: string
    weightLabel: string
    valueLabel: string
    addToBackpack: string
    removeFromBackpack: string
    capacityExceeded: string
    submitCta: string
    showSolverCta: string
    hideSolverCta: string
    nextStage: string
    playAgain: string
    resultsTitle: string
    yourValue: string
    yourWeight: string
    optimalValue: string
    optimalWeight: string
    efficiency: string
    optimalCombination: string
    yourCombination: string
    takeaway: string
    hint: string
    stageComplete: string
    difficultyItems: string
    solverExplanation: string
  }
  tsp: {
    objectiveValue: string
    constraintValue: string
    startCity: string
    currentCity: string
    visited: string
    remaining: string
    currentRoute: string
    totalDistance: string
    youAreHere: string
    startBadge: string
    visitedBadge: string
    notVisitedBadge: string
    alreadyVisited: string
    mustFinishFirst: string
    returnPrompt: string
    showDistances: string
    routesDiscoveredTitle: string
    foundOf: string
    duplicateRoute: string
    routeHistoryTitle: string
    bestRoute: string
    attempt: string
    distance: string
    valid: string
    invalid: string
    completeTourCta: string
    resetStageCta: string
    showOptimalCta: string
    hideOptimalCta: string
    yourBestDistance: string
    optimalDistance: string
    difference: string
    attemptsCount: string
    nextStage: string
    stageComplete: string
    takeaway: string
    hint: string
    combinatorialTitle: string
    combinatorialBody: string
    difficultyCities: string
    yourRoute: string
    optimalRoute: string
  }
  achievements: {
    title: string
    unlocked: string
    'smart-packer': { name: string; desc: string }
    'optimization-explorer': { name: string; desc: string }
    'route-finder': { name: string; desc: string }
    'route-master': { name: string; desc: string }
    'constraint-champion': { name: string; desc: string }
    'search-space-explorer': { name: string; desc: string }
  }
  certificate: {
    title: string
    participated: string
    player: string
    date: string
    game: string
    stageReached: string
    bestResult: string
    badgesEarned: string
    saveImage: string
    saveResult: string
    shareTitleKnapsack: string
    shareTitleTsp: string
  }
  errors: {
    generic: string
    storageUnavailable: string
    screenshotFailed: string
    audioBlocked: string
  }
  a11y: {
    skipToContent: string
    closeDialog: string
  }
}
