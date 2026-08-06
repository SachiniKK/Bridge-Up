const LEVELS = [
  { level: 1, name: "Starter", threshold: 0 },
  { level: 2, name: "Learner", threshold: 200 },
  { level: 3, name: "Builder", threshold: 600 },
  { level: 4, name: "Achiever", threshold: 1500 },
  { level: 5, name: "Specialist", threshold: 3000 },
  { level: 6, name: "Industry-Ready", threshold: 6000 }
];

const MISSED_DAY_PENALTY = 5;

function getLevelForXP(xp) {
  const currentXP = Math.max(0, xp);
  
  let currentLevelObj = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (currentXP >= LEVELS[i].threshold) {
      currentLevelObj = LEVELS[i];
      break;
    }
  }
  
  const levelIndex = LEVELS.indexOf(currentLevelObj);
  const nextLevelObj = levelIndex < LEVELS.length - 1 ? LEVELS[levelIndex + 1] : null;
  
  let progressPercent = 100;
  let nextThreshold = null;
  if (nextLevelObj) {
    nextThreshold = nextLevelObj.threshold;
    const range = nextThreshold - currentLevelObj.threshold;
    const earnedInRange = currentXP - currentLevelObj.threshold;
    progressPercent = Math.min(100, Math.max(0, Math.floor((earnedInRange / range) * 100)));
  }
  
  return {
    level: currentLevelObj.level,
    name: currentLevelObj.name,
    currentThreshold: currentLevelObj.threshold,
    nextThreshold,
    progressPercent
  };
}

module.exports = {
  LEVELS,
  MISSED_DAY_PENALTY,
  getLevelForXP
};
