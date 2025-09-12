import { format, parseISO, getHours, getDayOfWeek } from 'date-fns';

export function detectTemporalPatterns(logs) {
  if (!logs || logs.length < 3) return [];

  const patterns = [];
  const timeOfDayEmotions = {};
  const dayOfWeekEmotions = {};

  logs.forEach(log => {
    const date = parseISO(log.createdAt || log.date);
    const hour = getHours(date);
    const dayOfWeek = getDayOfWeek(date);

    // Group by time of day
    const timeSlot = getTimeSlot(hour);
    if (!timeOfDayEmotions[timeSlot]) timeOfDayEmotions[timeSlot] = [];
    
    log.detectedEmotions?.forEach(emotion => {
      timeOfDayEmotions[timeSlot].push(emotion.emotion);
    });

    // Group by day of week
    const dayName = getDayName(dayOfWeek);
    if (!dayOfWeekEmotions[dayName]) dayOfWeekEmotions[dayName] = [];
    
    log.detectedEmotions?.forEach(emotion => {
      dayOfWeekEmotions[dayName].push(emotion.emotion);
    });
  });

  // Analyze time of day patterns
  const timePatterns = analyzeEmotionGroups(timeOfDayEmotions);
  if (timePatterns.length > 0) {
    patterns.push({
      type: 'temporal_time',
      title: 'Time of Day Patterns',
      data: timePatterns,
      insight: generateTimePatternInsight(timePatterns)
    });
  }

  // Analyze day of week patterns
  const dayPatterns = analyzeEmotionGroups(dayOfWeekEmotions);
  if (dayPatterns.length > 0) {
    patterns.push({
      type: 'temporal_day',
      title: 'Day of Week Patterns',
      data: dayPatterns,
      insight: generateDayPatternInsight(dayPatterns)
    });
  }

  return patterns;
}

export function detectSituationalTriggers(logs) {
  if (!logs || logs.length < 5) return [];

  const triggers = {};
  const emotionContexts = {};

  logs.forEach(log => {
    const text = log.userText.toLowerCase();
    const emotions = log.detectedEmotions?.map(e => e.emotion) || [];

    // Common trigger words/phrases
    const triggerWords = [
      'work', 'meeting', 'deadline', 'project',
      'family', 'friend', 'relationship', 'social',
      'tired', 'stressed', 'overwhelmed', 'busy',
      'change', 'new', 'different', 'unexpected',
      'loud', 'bright', 'crowded', 'quiet'
    ];

    triggerWords.forEach(trigger => {
      if (text.includes(trigger)) {
        if (!triggers[trigger]) triggers[trigger] = [];
        triggers[trigger].push(...emotions);
      }
    });

    // Extract contexts for specific emotions
    emotions.forEach(emotion => {
      if (!emotionContexts[emotion]) emotionContexts[emotion] = [];
      emotionContexts[emotion].push({
        text: text.substring(0, 100),
        date: log.date
      });
    });
  });

  const significantTriggers = Object.entries(triggers)
    .filter(([trigger, emotions]) => emotions.length >= 2)
    .map(([trigger, emotions]) => ({
      trigger,
      emotions: [...new Set(emotions)],
      frequency: emotions.length,
      dominantEmotion: getMostFrequent(emotions)
    }))
    .sort((a, b) => b.frequency - a.frequency);

  if (significantTriggers.length === 0) return [];

  return [{
    type: 'situational',
    title: 'Situational Triggers',
    data: significantTriggers,
    insight: generateTriggerInsight(significantTriggers)
  }];
}

export function detectPhysicalCorrelations(logs) {
  if (!logs || logs.length < 3) return [];

  const physicalTerms = {
    'head': ['headache', 'head', 'migraine'],
    'stomach': ['stomach', 'nausea', 'sick', 'gut'],
    'chest': ['chest', 'heart', 'breathing', 'breath'],
    'shoulders': ['shoulders', 'neck', 'tension', 'tight'],
    'energy': ['tired', 'exhausted', 'energy', 'fatigue'],
    'sleep': ['sleep', 'insomnia', 'rest', 'wake']
  };

  const correlations = {};

  logs.forEach(log => {
    const text = log.userText.toLowerCase();
    const emotions = log.detectedEmotions?.map(e => e.emotion) || [];

    Object.entries(physicalTerms).forEach(([category, terms]) => {
      const hasPhysicalMention = terms.some(term => text.includes(term));
      
      if (hasPhysicalMention && emotions.length > 0) {
        if (!correlations[category]) correlations[category] = [];
        correlations[category].push(...emotions);
      }
    });
  });

  const significantCorrelations = Object.entries(correlations)
    .filter(([category, emotions]) => emotions.length >= 2)
    .map(([category, emotions]) => ({
      physicalAspect: category,
      emotions: [...new Set(emotions)],
      frequency: emotions.length,
      dominantEmotion: getMostFrequent(emotions)
    }))
    .sort((a, b) => b.frequency - a.frequency);

  if (significantCorrelations.length === 0) return [];

  return [{
    type: 'physical',
    title: 'Physical-Emotional Correlations',
    data: significantCorrelations,
    insight: generatePhysicalInsight(significantCorrelations)
  }];
}

// Helper functions

function getTimeSlot(hour) {
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function getDayName(dayOfWeek) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

function analyzeEmotionGroups(groups) {
  return Object.entries(groups)
    .filter(([key, emotions]) => emotions.length >= 2)
    .map(([key, emotions]) => ({
      period: key,
      emotions: [...new Set(emotions)],
      frequency: emotions.length,
      dominantEmotion: getMostFrequent(emotions)
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

function getMostFrequent(array) {
  const frequency = {};
  array.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
  });
  return Object.entries(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b)[0];
}

function generateTimePatternInsight(patterns) {
  const mostActiveTime = patterns[0];
  return `You tend to experience "${mostActiveTime.dominantEmotion}" most frequently during ${mostActiveTime.period} hours.`;
}

function generateDayPatternInsight(patterns) {
  const mostActiveDay = patterns[0];
  return `${mostActiveDay.period}s show the highest emotional activity, with "${mostActiveDay.dominantEmotion}" being most common.`;
}

function generateTriggerInsight(triggers) {
  const topTrigger = triggers[0];
  return `"${topTrigger.trigger}" appears to be a significant situational trigger, often associated with "${topTrigger.dominantEmotion}".`;
}

function generatePhysicalInsight(correlations) {
  const topCorrelation = correlations[0];
  return `${topCorrelation.physicalAspect} sensations frequently correlate with "${topCorrelation.dominantEmotion}" emotional experiences.`;
}