export const EMOTION_COLORS = {
  joy: '#fbbf24',
  happiness: '#fbbf24',
  sadness: '#3b82f6',
  anger: '#ef4444',
  fear: '#8b5cf6',
  anxiety: '#8b5cf6',
  surprise: '#f59e0b',
  disgust: '#10b981',
  neutral: '#6b7280',
  uncertain: '#6b7280'
};

export const EMOTION_CATEGORIES = {
  positive: ['joy', 'happiness', 'excitement', 'contentment', 'gratitude', 'love'],
  negative: ['sadness', 'anger', 'fear', 'anxiety', 'frustration', 'disappointment'],
  neutral: ['neutral', 'calm', 'thoughtful', 'curious'],
  complex: ['bittersweet', 'nostalgic', 'conflicted', 'overwhelmed']
};

export function getEmotionColor(emotion) {
  return EMOTION_COLORS[emotion?.toLowerCase()] || EMOTION_COLORS.neutral;
}

export function getEmotionCategory(emotion) {
  const emotionLower = emotion?.toLowerCase();
  for (const [category, emotions] of Object.entries(EMOTION_CATEGORIES)) {
    if (emotions.includes(emotionLower)) {
      return category;
    }
  }
  return 'neutral';
}

export function calculateEmotionIntensity(emotions) {
  if (!emotions || emotions.length === 0) return 0;
  
  const totalConfidence = emotions.reduce((sum, emotion) => sum + (emotion.confidence || 0), 0);
  return totalConfidence / emotions.length;
}

export function groupEmotionsByCategory(emotions) {
  const grouped = {
    positive: [],
    negative: [],
    neutral: [],
    complex: []
  };

  emotions.forEach(emotion => {
    const category = getEmotionCategory(emotion.emotion);
    grouped[category].push(emotion);
  });

  return grouped;
}

export function findEmotionPatterns(logs) {
  if (!logs || logs.length === 0) return [];

  const patterns = [];
  const emotionFrequency = {};
  const emotionsByDate = {};

  logs.forEach(log => {
    const date = new Date(log.date).toISOString().split('T')[0];
    emotionsByDate[date] = log.detectedEmotions || [];

    log.detectedEmotions?.forEach(emotion => {
      emotionFrequency[emotion.emotion] = (emotionFrequency[emotion.emotion] || 0) + 1;
    });
  });

  // Find most frequent emotions
  const sortedEmotions = Object.entries(emotionFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (sortedEmotions.length > 0) {
    patterns.push({
      type: 'frequency',
      title: 'Most Common Emotions',
      data: sortedEmotions,
      insight: `Your most frequently detected emotion is "${sortedEmotions[0][0]}" appearing ${sortedEmotions[0][1]} times.`
    });
  }

  // Find emotional consistency
  const dates = Object.keys(emotionsByDate).sort();
  if (dates.length >= 3) {
    let consistentDays = 0;
    for (let i = 1; i < dates.length; i++) {
      const prevEmotions = emotionsByDate[dates[i - 1]].map(e => e.emotion);
      const currEmotions = emotionsByDate[dates[i]].map(e => e.emotion);
      
      const overlap = prevEmotions.filter(emotion => currEmotions.includes(emotion));
      if (overlap.length > 0) {
        consistentDays++;
      }
    }

    if (consistentDays > 0) {
      patterns.push({
        type: 'consistency',
        title: 'Emotional Consistency',
        data: { consistentDays, totalDays: dates.length - 1 },
        insight: `You showed consistent emotional patterns across ${consistentDays} day transitions.`
      });
    }
  }

  return patterns;
}

export function analyzeEmotionalVocabulary(logs) {
  if (!logs || logs.length === 0) return {};

  const vocabulary = new Set();
  const emotionEvolution = {};
  const metaphors = [];

  logs.forEach(log => {
    log.detectedEmotions?.forEach(emotion => {
      vocabulary.add(emotion.emotion);
      
      const date = new Date(log.date).toISOString().split('T')[0];
      if (!emotionEvolution[emotion.emotion]) {
        emotionEvolution[emotion.emotion] = [];
      }
      emotionEvolution[emotion.emotion].push(date);
    });

    // Extract potential metaphors from text
    const text = log.userText.toLowerCase();
    const metaphorPatterns = [
      /like (a|an) ([^.!?]+)/g,
      /feels? like ([^.!?]+)/g,
      /as if ([^.!?]+)/g
    ];

    metaphorPatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        metaphors.push({
          text: match[0],
          date: log.date,
          context: log.userText.substring(Math.max(0, match.index - 50), match.index + 50)
        });
      });
    });
  });

  return {
    vocabularySize: vocabulary.size,
    uniqueEmotions: Array.from(vocabulary),
    emotionEvolution,
    metaphors: metaphors.slice(0, 10), // Keep most recent 10
    growthRate: logs.length > 1 ? vocabulary.size / logs.length : 0
  };
}