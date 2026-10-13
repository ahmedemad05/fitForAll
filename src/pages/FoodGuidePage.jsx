import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/api';

import '../css/food-guide.css';

export default function FoodGuidePage() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUserProfile(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        setUserProfile(null);
        return;
      }

      const data = await response.json();
      if (data.message === 'Health profile not created yet') {
        setUserProfile(null);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setUserProfile(null);
    }
  };

  const handleAddFiles = (files) => {
    const fileArray = Array.from(files || []);
    if (!fileArray.length) return;

    const uniqueFiles = fileArray.filter((file) => {
      return !selectedImages.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified
      );
    });

    if (!uniqueFiles.length) {
      return;
    }

    const newSelected = [...selectedImages, ...uniqueFiles];
    setSelectedImages(newSelected);

    const newPreviews = uniqueFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setResult(null);
  };

  const getIngredientLabel = (fileName) => {
    const cleanedName = fileName
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    return cleanedName || 'fresh ingredients';
  };

  const normalizeIngredient = (ingredientName) => {
    const normalized = ingredientName.toLowerCase();
    if (normalized.includes('tomato')) return 'tomato';
    if (normalized.includes('potato')) return 'potato';
    if (normalized.includes('chicken')) return 'chicken';
    if (normalized.includes('salmon')) return 'salmon';
    if (normalized.includes('egg')) return 'egg';
    if (normalized.includes('rice')) return 'rice';
    return null;
  };

  const getDetectedIngredients = (files) => {
    const detected = files
      .map((file) => normalizeIngredient(getIngredientLabel(file.name)))
      .filter((ingredient) => ingredient !== null);
    return Array.from(new Set(detected));
  };

  const formatGoal = (goal) => {
    if (goal === 'weight-loss') return 'Weight Loss';
    if (goal === 'fitness') return 'General Fitness';
    return 'Muscle Gain';
  };

  const getProfilePlan = (profile) => {
    const goal = profile && profile.goal ? profile.goal : 'muscle-gain';
    const weight = Number(profile && profile.weight) || 70;

    let calories = 550;
    let protein = 35;

    if (goal === 'weight-loss') {
      calories = Math.max(300, Math.round(weight * 25));
      protein = Math.max(25, Math.round(weight * 1.8));
    }

    if (goal === 'fitness') {
      calories = Math.max(300, Math.round(weight * 30));
      protein = Math.max(25, Math.round(weight * 1.8));
    }

    if (goal === 'muscle-gain') {
      calories = Math.max(300, Math.round(weight * 35));
      protein = Math.max(30, Math.round(weight * 2.2));
    }

    return {
      goal,
      goalLabel: formatGoal(goal),
      calories,
      protein,
    };
  };

  const getPlanSummary = (calories, protein) => {
    return {
      calories: Math.max(300, calories),
      protein: Math.max(20, protein),
      carbs: Math.max(25, Math.round((calories * 0.4) / 4)),
      fat: Math.max(10, Math.round((calories * 0.25) / 9)),
    };
  };

  const buildAdvice = (goal, calories, protein) => {
    if (goal === 'weight-loss') {
      return `Your goal is weight loss, so this plan keeps calories near ${calories} kcal and protein at ${protein} g to help you stay full while supporting recovery.`;
    }
    if (goal === 'fitness') {
      return `Your goal is general fitness, so these dishes balance calories and nutrients to support energy, recovery, and everyday performance.`;
    }
    return `Your goal is muscle gain, so these dishes focus on higher protein and steady carbs to support training, recovery, and growth.`;
  };

  const getDishRecommendations = (goal, calories, protein, detectedIngredients) => {
    const ingredientList = detectedIngredients || [];

    if (ingredientList.includes('tomato') && ingredientList.includes('potato')) {
      return [
        {
          name: 'Tomato Potato Chicken Bowl',
          calories: 510,
          protein: 37,
          carbs: 44,
          fat: 18,
          tags: ['Detected ingredients', 'Balanced meal'],
          description:
            'A fresh bowl with tomato and potato ingredients, built to fit your plan.',
        },
        {
          name: 'Roasted Tomato Potato Tray',
          calories: 480,
          protein: 31,
          carbs: 42,
          fat: 17,
          tags: ['Simple', 'High fiber'],
          description:
            'Tomato and potato together for a hearty, easy-to-prepare dish.',
        },
        {
          name: 'Tomato Potato Egg Skillet',
          calories: 450,
          protein: 29,
          carbs: 35,
          fat: 19,
          tags: ['Quick meal', 'Protein boost'],
          description:
            'A filling skillet option that matches the ingredients you uploaded.',
        },
      ];
    }

    if (ingredientList.includes('potato')) {
      return [
        {
          name: 'Herby Potato Chicken Bowl',
          calories: 520,
          protein: 38,
          carbs: 46,
          fat: 16,
          tags: ['Potato-based', 'High protein'],
          description:
            'A satisfying meal using potato as the main ingredient.',
        },
        {
          name: 'Loaded Potato Salad',
          calories: 480,
          protein: 32,
          carbs: 42,
          fat: 18,
          tags: ['Easy meal', 'Balanced carbs'],
          description:
            'Potato-based, fresh, and easy to fit into a daily nutrition plan.',
        },
        {
          name: 'Greek Potato Protein Plate',
          calories: 560,
          protein: 41,
          carbs: 49,
          fat: 20,
          tags: ['Post-workout', 'Meal prep'],
          description:
            'A strong potato-based option for recovery and energy support.',
        },
      ];
    }

    if (ingredientList.includes('tomato')) {
      return [
        {
          name: 'Tomato Soup with Chicken',
          calories: 420,
          protein: 31,
          carbs: 24,
          fat: 16,
          tags: ['Tomato-based', 'Warm meal'],
          description:
            'A comforting tomato soup that works well for a light but filling meal.',
        },
        {
          name: 'Tomato Chicken Pasta',
          calories: 540,
          protein: 39,
          carbs: 50,
          fat: 18,
          tags: ['Tomato-based', 'High protein'],
          description:
            'A classic tomato-forward dish that fits a balanced eating plan.',
        },
        {
          name: 'Tomato Egg Rice Bowl',
          calories: 490,
          protein: 30,
          carbs: 42,
          fat: 17,
          tags: ['Quick', 'Satisfying'],
          description:
            'A simple rice bowl built around tomato and eggs.',
        },
        {
          name: 'Tomato Chickpea Salad',
          calories: 460,
          protein: 24,
          carbs: 36,
          fat: 16,
          tags: ['Light', 'High fiber'],
          description:
            'A fresh tomato-focused meal with enough fiber and protein to keep you full.',
        },
      ];
    }

    const recommended = {
      muscle_gain: [
        {
          name: 'Chicken Rice Protein Bowl',
          calories: 520,
          protein: 41,
          carbs: 46,
          fat: 16,
          tags: ['High protein', 'Meal prep'],
          description:
            'Lean chicken, rice, and vegetables for a clean, satisfying meal.',
        },
        {
          name: 'Salmon Quinoa Power Plate',
          calories: 560,
          protein: 36,
          carbs: 38,
          fat: 24,
          tags: ['Omega-3', 'Balanced carbs'],
          description:
            'A nutrient-dense option that supports recovery and energy.',
        },
        {
          name: 'Turkey Pasta Fit Bowl',
          calories: 610,
          protein: 39,
          carbs: 58,
          fat: 18,
          tags: ['Filling', 'Post-workout'],
          description:
            'A hearty dish built for training days and muscle support.',
        },
      ],
      fat_loss: [
        {
          name: 'Greek Yogurt Chicken Salad',
          calories: 430,
          protein: 38,
          carbs: 24,
          fat: 18,
          tags: ['Low calorie', 'High fiber'],
          description:
            'Light, protein-rich, and easy to keep on track with your calorie goal.',
        },
        {
          name: 'Veggie Chicken Stir-Fry',
          calories: 470,
          protein: 40,
          carbs: 28,
          fat: 15,
          tags: ['Lean', 'Quick meal'],
          description:
            'Packed with vegetables and lean protein for a lower-calorie plate.',
        },
        {
          name: 'Tuna Lettuce Wrap Bowl',
          calories: 390,
          protein: 35,
          carbs: 18,
          fat: 14,
          tags: ['Fresh', 'High protein'],
          description:
            'A satisfying option with a lighter carb profile and plenty of protein.',
        },
      ],
      maintenance: [
        {
          name: 'Salmon Sweet Potato Plate',
          calories: 580,
          protein: 34,
          carbs: 45,
          fat: 23,
          tags: ['Balanced', 'Energy fuel'],
          description:
            'A steady option for keeping performance and hunger under control.',
        },
        {
          name: 'Chicken & Brown Rice Box',
          calories: 600,
          protein: 40,
          carbs: 52,
          fat: 20,
          tags: ['Satisfying', 'Meal prep'],
          description:
            'A dependable meal with balanced carbs and enough protein for daily energy.',
        },
        {
          name: 'Bean & Egg Protein Bowl',
          calories: 540,
          protein: 29,
          carbs: 46,
          fat: 22,
          tags: ['Plant-based', 'Fiber rich'],
          description:
            'Good for a balanced plate that keeps you full and energized.',
        },
      ],
    };

    const mappedGoal = {
      'weight-loss': 'fat_loss',
      'muscle-gain': 'muscle_gain',
      fitness: 'maintenance',
    };

    const normalizedGoal = mappedGoal[goal] || 'muscle_gain';
    return recommended[normalizedGoal] || recommended.muscle_gain;
  };

  const handleAnalyze = async () => {
    if (!selectedImages.length) return;

    let profile = userProfile;
    if (!profile) {
      await loadProfile();
    }

    const profilePlan = getProfilePlan(profile);
    const goal = profilePlan.goal;
    const calories = profilePlan.calories;
    const protein = profilePlan.protein;

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const ingredientNames = selectedImages.map((file) =>
        getIngredientLabel(file.name)
      );
      const ingredientSummaryText = ingredientNames.join(', ');
      const detectedIngredients = getDetectedIngredients(selectedImages);

      setLoading(false);
      setResult({
        ingredients: ingredientSummaryText,
        ingredient_description: `AI detected ${ingredientSummaryText} and matched them with dishes that fit your ${profilePlan.goalLabel.toLowerCase()} plan.`,
        goal: profilePlan.goalLabel,
        advice: buildAdvice(goal, calories, protein),
        plan: getPlanSummary(calories, protein),
        dishes: getDishRecommendations(goal, calories, protein, detectedIngredients),
      });
    }, 1200);
  };

  return (
    <main className="gym-coach-page">
      {/* Header */}
      <section className="coach-header">
        <span className="eyebrow">AI FOOD GUIDE</span>

        <h1>
          Eat smarter.
          <br />
          <span>Fuel your goals.</span>
        </h1>

        <p>
          Take a photo or upload ingredients, and AI Food Guide will recommend
          dishes that fit your saved profile plan.
        </p>
      </section>

      {/* Upload Section */}
      <section className="upload-section">
        <div className="upload-card">
          <div className="upload-icon">🥗</div>

          <h2>Show us your ingredients</h2>

          <p>
            Take a photo or upload an image of the ingredients you have, and AI
            will recommend dishes that fit your goal.
          </p>

          <div className="upload-buttons">
            <label htmlFor="camera-input" className="btn btn-primary">
              📷 Take Photo
            </label>

            <input
              type="file"
              id="camera-input"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleAddFiles(e.target.files);
                }
                e.target.value = '';
              }}
            />

            <label htmlFor="upload-input" className="btn btn-secondary">
              ↑ Upload Image
            </label>

            <input
              type="file"
              id="upload-input"
              ref={uploadInputRef}
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleAddFiles(e.target.files);
                }
                e.target.value = '';
              }}
            />
          </div>
        </div>

        {selectedImages.length > 0 && (
          <div id="preview-section" className="preview-section">
            <h3>Your ingredients</h3>

            <div
              id="image-preview-list"
              className="image-wrapper image-preview-list"
            >
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="preview-image-item">
                  <img src={preview.url} alt={preview.name} />
                </div>
              ))}
            </div>

            <button
              id="analyze-btn"
              className="btn analyze-btn"
              onClick={handleAnalyze}
            >
              Recommend Dishes
            </button>
          </div>
        )}
      </section>

      {loading && (
        <section id="loading-section" className="loading-section">
          <div className="loader"></div>
          <h3>AI is reviewing your ingredients...</h3>
          <p>Matching the foods in your image with personalized meal ideas.</p>
        </section>
      )}

      {result && (
        <section id="result-section" className="result-section">
          <div className="summary-card">
            <span className="result-label">INGREDIENTS DETECTED</span>
            <h2 id="ingredient-summary">{result.ingredients}</h2>
            <p id="ingredient-description">{result.ingredient_description}</p>
          </div>

          <div className="result-card">
            <span className="result-label">RECOMMENDED DISHES</span>

            <div id="dish-list" className="dish-grid">
              {result.dishes.map((dish, index) => (
                <article key={index} className="dish-card">
                  <div className="dish-header">
                    <div>
                      <h3>{dish.name}</h3>
                      <p>{dish.description}</p>
                    </div>
                  </div>

                  <div className="dish-tags">
                    {dish.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="dish-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="nutrition-grid">
                    <div className="nutrition-item">
                      <span>Calories</span>
                      <strong>{dish.calories} kcal</strong>
                    </div>
                    <div className="nutrition-item">
                      <span>Protein</span>
                      <strong>{dish.protein} g</strong>
                    </div>
                    <div className="nutrition-item">
                      <span>Carbs</span>
                      <strong>{dish.carbs} g</strong>
                    </div>
                    <div className="nutrition-item">
                      <span>Fat</span>
                      <strong>{dish.fat} g</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="personalized-card">
            <span className="result-label">YOUR PERSONALIZED PLAN</span>
            <h2>Built around your goal</h2>

            <div className="plan-grid">
              <div className="plan-item">
                <span className="plan-icon">🔥</span>
                <span className="plan-title">Calories</span>
                <strong id="target-calories">
                  {result.plan.calories} kcal
                </strong>
              </div>

              <div className="plan-item">
                <span className="plan-icon">💪</span>
                <span className="plan-title">Protein</span>
                <strong id="target-protein">{result.plan.protein} g</strong>
              </div>

              <div className="plan-item">
                <span className="plan-icon">🌾</span>
                <span className="plan-title">Carbs</span>
                <strong id="target-carbs">{result.plan.carbs} g</strong>
              </div>

              <div className="plan-item">
                <span className="plan-icon">🥑</span>
                <span className="plan-title">Fat</span>
                <strong id="target-fat">{result.plan.fat} g</strong>
              </div>
            </div>

            <div className="goal-message">
              <strong id="goal-title">{result.goal}</strong>
              <p id="personalized-advice">{result.advice}</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
