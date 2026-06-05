import dotenv from 'dotenv';
dotenv.config();

/**
 * Calculates roommate compatibility score and explanation.
 * Falls back to deterministic rule-based calculation if API key is not present.
 */
export async function calculateCompatibility(userA, userB) {
  // Parse lifestyle habits
  let habitsA = {};
  let habitsB = {};
  try {
    habitsA = typeof userA.lifestyle_habits === 'string' ? JSON.parse(userA.lifestyle_habits || '{}') : (userA.lifestyle_habits || {});
    habitsB = typeof userB.lifestyle_habits === 'string' ? JSON.parse(userB.lifestyle_habits || '{}') : (userB.lifestyle_habits || {});
  } catch (e) {
    console.error('Error parsing lifestyle habits in matching engine', e);
  }

  // Fallback Rule-Based Engine
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
    locationScore = 50; // Same city
    if (areaA && areaB && areaA === areaB) {
      locationScore = 100; // Same area
    }
  } else if (!cityA || !cityB) {
    locationScore = 70; // Missing data fallback
  }

  // 3. Lifestyle Scores (out of 100 each)
  let sleepScore = habitsA.sleep === habitsB.sleep ? 100 : 30;
  if (!habitsA.sleep || !habitsB.sleep) sleepScore = 80;

  let cleanlinessScore = 100;
  if (habitsA.cleanliness && habitsB.cleanliness) {
    if (habitsA.cleanliness !== habitsB.cleanliness) {
      if ((habitsA.cleanliness === 'high' && habitsB.cleanliness === 'low') || 
          (habitsA.cleanliness === 'low' && habitsB.cleanliness === 'high')) {
        cleanlinessScore = 20; // Extreme mismatch
      } else {
        cleanlinessScore = 60; // Moderate mismatch (e.g. medium & high)
      }
    }
  }

  let smokingScore = 100;
  if (habitsA.smoking && habitsB.smoking) {
    if (habitsA.smoking !== habitsB.smoking) {
      if (habitsA.smoking === 'no' || habitsB.smoking === 'no') {
        smokingScore = 10; // Non-smoker matching a smoker is bad
      } else {
        smokingScore = 70; // Outside smoker vs regular
      }
    }
  }

  let foodScore = 100;
  if (habitsA.food && habitsB.food) {
    if (habitsA.food !== habitsB.food) {
      if ((habitsA.food === 'veg' && habitsB.food === 'non-veg') || 
          (habitsA.food === 'non-veg' && habitsB.food === 'veg')) {
        foodScore = 50; // Kitchen sharing conflicts sometimes
      }
    }
  }

  let noiseScore = 100;
  if (habitsA.noise && habitsB.noise) {
    if (habitsA.noise !== habitsB.noise) {
      if ((habitsA.noise === 'high' && habitsB.noise === 'low') || 
          (habitsA.noise === 'low' && habitsB.noise === 'high')) {
        noiseScore = 20;
      } else {
        noiseScore = 60;
      }
    }
  }

  const lifestyleAvg = Math.round(
    (sleepScore + cleanlinessScore + smokingScore + foodScore + noiseScore) / 5
  );

  // Overall Score weighting: 30% Budget, 30% Location, 40% Lifestyle
  let finalScore = Math.round((budgetScore * 0.3) + (locationScore * 0.3) + (lifestyleAvg * 0.4));
  if (finalScore < 0) finalScore = 0;
  if (finalScore > 100) finalScore = 100;

  // Generate deterministic explanation
  const matches = [];
  const mismatches = [];

  if (cityA && cityB && cityA === cityB) {
    if (areaA && areaB && areaA === areaB) {
      matches.push(`both prefer the area of ${userA.preferred_area}`);
    } else {
      matches.push(`both want to live in the same city (${userA.city})`);
    }
  }

  if (budgetScore >= 80) {
    matches.push('have compatible budget expectations');
  } else if (budgetScore < 50) {
    mismatches.push('have a significant budget difference');
  }

  if (habitsA.sleep && habitsB.sleep && habitsA.sleep === habitsB.sleep) {
    matches.push(`share a similar sleeping schedule (${habitsA.sleep})`);
  } else if (habitsA.sleep && habitsB.sleep) {
    mismatches.push(`have different sleep preferences (${habitsA.sleep} vs ${habitsB.sleep})`);
  }

  if (habitsA.smoking && habitsB.smoking && habitsA.smoking === 'no' && habitsB.smoking === 'no') {
    matches.push('are both non-smokers');
  } else if (habitsA.smoking !== habitsB.smoking) {
    mismatches.push('have different smoking preferences');
  }

  if (habitsA.cleanliness && habitsB.cleanliness && habitsA.cleanliness === habitsB.cleanliness) {
    matches.push(`have identical standards of cleanliness (${habitsA.cleanliness})`);
  }

  let localExplanation = '';
  if (matches.length > 0) {
    localExplanation = `${finalScore}% Compatible because you ${matches.slice(0, 3).join(', ')}`;
    if (mismatches.length > 0) {
      localExplanation += `, though you ${mismatches.slice(0, 2).join(' and ')}`;
    }
    localExplanation += '.';
  } else {
    localExplanation = `${finalScore}% Compatible. General match based on shared profile tags and background requirements.`;
  }

  // Attempt Gemini API call if GEMINI_API_KEY is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const model = 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const prompt = `
        You are an AI roommate matching assistant. Analyze these two user profiles and generate:
        1. A final compatibility score (0-100%).
        2. A human-friendly explanation of why they are matching/mismatched in 2 sentences max. Keep it positive but honest.
        
        User A:
        - Name: ${userA.name}
        - Age/Gender: ${userA.age}/${userA.gender}
        - Occupation: ${userA.occupation}
        - City/Preferred Area: ${userA.city}/${userA.preferred_area}
        - Budget: ${userA.budget}
        - Lifestyle: ${JSON.stringify(habitsA)}
        - Bio: ${userA.bio || 'None'}

        User B:
        - Name: ${userB.name}
        - Age/Gender: ${userB.age}/${userB.gender}
        - Occupation: ${userB.occupation}
        - City/Preferred Area: ${userB.city}/${userB.preferred_area}
        - Budget: ${userB.budget}
        - Lifestyle: ${JSON.stringify(habitsB)}
        - Bio: ${userB.bio || 'None'}

        Based on these, return a valid JSON object in the exact format:
        {
          "score": 85,
          "explanation": "Example explanation text."
        }
        Do not return any markdown formatting outside of the JSON block.
      `;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          const parsed = JSON.parse(responseText.trim());
          if (parsed && typeof parsed.score === 'number' && parsed.explanation) {
            return {
              score: Math.min(100, Math.max(0, parsed.score)),
              explanation: parsed.explanation
            };
          }
        }
      }
    } catch (apiError) {
      console.warn('Gemini API call failed, falling back to rule-based matching score:', apiError.message);
    }
  }

  // Default fallback returns
  return {
    score: finalScore,
    explanation: localExplanation
  };
}
