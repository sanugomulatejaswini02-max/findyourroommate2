/**
 * Roommate compatibility scoring engine in TypeScript.
 */

export interface LifestyleHabits {
  sleep?: 'early' | 'night';
  cleanliness?: 'high' | 'medium' | 'low';
  smoking?: 'no' | 'outside' | 'yes';
  drinking?: 'no' | 'outside' | 'yes';
  food?: 'veg' | 'non-veg' | 'any';
  noise?: 'low' | 'medium' | 'high';
  guests?: 'no' | 'weekends' | 'anytime';
  work?: 'day' | 'night' | 'flexible';
  study?: 'regular' | 'flexible';
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  age?: number;
  gender?: string;
  occupation?: string;
  college_company?: string;
  profile_pic?: string;
  bio?: string;
  city?: string;
  preferred_area?: string;
  budget?: number;
  lifestyle_habits?: string | LifestyleHabits;
  roommate_prefs?: string;
}

export async function calculateRoommateCompatibility(userA: UserProfile, userB: UserProfile): Promise<{ score: number; explanation: string }> {
  // Parse lifestyle habits safely
  let habitsA: LifestyleHabits = {};
  let habitsB: LifestyleHabits = {};

  try {
    if (typeof userA.lifestyle_habits === 'string') {
      habitsA = JSON.parse(userA.lifestyle_habits || '{}');
    } else if (userA.lifestyle_habits) {
      habitsA = userA.lifestyle_habits;
    }

    if (typeof userB.lifestyle_habits === 'string') {
      habitsB = JSON.parse(userB.lifestyle_habits || '{}');
    } else if (userB.lifestyle_habits) {
      habitsB = userB.lifestyle_habits;
    }
  } catch (e) {
    console.error('Error parsing lifestyle habits in compatibility engine:', e);
  }

  const budgetA = Number(userA.budget || 0);
  const budgetB = Number(userB.budget || 0);

  // 1. Budget Score (out of 100)
  let budgetScore = 100;
  if (budgetA > 0 && budgetB > 0) {
    const diff = Math.abs(budgetA - budgetB);
    const maxBudget = Math.max(budgetA, budgetB);
    budgetScore = Math.max(0, Math.round(100 - (diff / maxBudget) * 150));
  }

  // 2. Location Score (out of 100)
  let locationScore = 0;
  const areaA = (userA.preferred_area || '').trim().toLowerCase();
  const areaB = (userB.preferred_area || '').trim().toLowerCase();
  const cityA = (userA.city || '').trim().toLowerCase();
  const cityB = (userB.city || '').trim().toLowerCase();

  if (cityA && cityB && cityA === cityB) {
    locationScore = 50;
    if (areaA && areaB && areaA === areaB) {
      locationScore = 100;
    }
  } else if (!cityA || !cityB) {
    locationScore = 70;
  }

  // 3. Lifestyle Scores
  const sleepScore = habitsA.sleep === habitsB.sleep ? 100 : 30;
  
  let cleanlinessScore = 100;
  if (habitsA.cleanliness && habitsB.cleanliness) {
    if (habitsA.cleanliness !== habitsB.cleanliness) {
      if ((habitsA.cleanliness === 'high' && habitsB.cleanliness === 'low') ||
          (habitsA.cleanliness === 'low' && habitsB.cleanliness === 'high')) {
        cleanlinessScore = 20;
      } else {
        cleanlinessScore = 60;
      }
    }
  }

  let smokingScore = 100;
  if (habitsA.smoking && habitsB.smoking) {
    if (habitsA.smoking !== habitsB.smoking) {
      if (habitsA.smoking === 'no' || habitsB.smoking === 'no') {
        smokingScore = 10;
      } else {
        smokingScore = 70;
      }
    }
  }

  let foodScore = 100;
  if (habitsA.food && habitsB.food) {
    if (habitsA.food !== habitsB.food) {
      if ((habitsA.food === 'veg' && habitsB.food === 'non-veg') ||
          (habitsA.food === 'non-veg' && habitsB.food === 'veg')) {
        foodScore = 40;
      }
    }
  }

  let noiseScore = 100;
  if (habitsA.noise && habitsB.noise) {
    if (habitsA.noise !== habitsB.noise) {
      if ((habitsA.noise === 'high' && habitsB.noise === 'low') ||
          (habitsA.noise === 'low' && habitsB.noise === 'high')) {
        noiseScore = 15;
      } else {
        noiseScore = 60;
      }
    }
  }

  const lifestyleAvg = Math.round(
    (sleepScore + cleanlinessScore + smokingScore + foodScore + noiseScore) / 5
  );

  let finalScore = Math.round((budgetScore * 0.3) + (locationScore * 0.3) + (lifestyleAvg * 0.4));
  finalScore = Math.min(100, Math.max(0, finalScore));

  // Generate deterministic explanation
  const matches: string[] = [];
  const mismatches: string[] = [];

  if (cityA && cityB && cityA === cityB) {
    if (areaA && areaB && areaA === areaB) {
      matches.push(`both prefer ${userA.preferred_area}`);
    } else {
      matches.push(`both live in ${userA.city}`);
    }
  }

  if (budgetScore >= 80) {
    matches.push('have matching budget expectations');
  } else if (budgetScore < 50) {
    mismatches.push('have a budget mismatch');
  }

  if (habitsA.sleep && habitsB.sleep && habitsA.sleep === habitsB.sleep) {
    matches.push(`share a similar sleep pattern (${habitsA.sleep === 'early' ? 'early riser' : 'night owl'})`);
  } else if (habitsA.sleep && habitsB.sleep) {
    mismatches.push(`have opposite sleep patterns (${habitsA.sleep} vs ${habitsB.sleep})`);
  }

  if (habitsA.smoking && habitsB.smoking && habitsA.smoking === 'no' && habitsB.smoking === 'no') {
    matches.push('are both non-smokers');
  } else if (habitsA.smoking !== habitsB.smoking) {
    mismatches.push('have different views on smoking');
  }

  if (habitsA.cleanliness && habitsB.cleanliness && habitsA.cleanliness === habitsB.cleanliness) {
    matches.push(`both value a ${habitsA.cleanliness} level of cleanliness`);
  }

  let explanation = '';
  if (matches.length > 0) {
    explanation = `${finalScore}% Compatible because you ${matches.slice(0, 3).join(', ')}`;
    if (mismatches.length > 0) {
      explanation += `, though you ${mismatches.slice(0, 2).join(' and ')}`;
    }
    explanation += '.';
  } else {
    explanation = `${finalScore}% Compatible based on shared city goals and roommate profiles.`;
  }

  // Support direct client-side Gemini queries if VITE_GEMINI_API_KEY is configured
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY') {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const prompt = `
        Compare user profiles for roommate sharing and output:
        1. A compatibility score (0-100).
        2. A friendly and clear explanation (max 2 sentences).
        
        User 1 (${userA.name}): Budget: ${userA.budget}, Location: ${userA.preferred_area}, Habits: ${JSON.stringify(habitsA)}, Bio: ${userA.bio || ''}
        User 2 (${userB.name}): Budget: ${userB.budget}, Location: ${userB.preferred_area}, Habits: ${JSON.stringify(habitsB)}, Bio: ${userB.bio || ''}
        
        Return ONLY a raw JSON string like: {"score": 92, "explanation": "Explanation text."}
        No markdown, no backticks, no wrap.
      `;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (res.ok) {
        const resultJson = await res.json();
        const jsonText = resultJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText.trim());
          if (parsed && typeof parsed.score === 'number' && parsed.explanation) {
            return {
              score: Math.min(100, Math.max(0, parsed.score)),
              explanation: parsed.explanation
            };
          }
        }
      }
    } catch (e) {
      console.warn('Vite client-side Gemini AI matching failed, using rule-based fallback:', e);
    }
  }

  return { score: finalScore, explanation };
}
