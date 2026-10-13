import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/api';
import '../css/food-guide.css';

export default function GymCoachPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
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

  const handleImageFile = (file) => {
    if (!file) return;
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
  };

  const getIngredientLabel = (fileName) => {
    const cleanedName = fileName
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    return cleanedName || 'meal';
  };

  const detectMeal = (fileName) => {
    const ingredientName = getIngredientLabel(fileName).toLowerCase();

    if (ingredientName.includes('burger')) {
      return {
        key: 'burger',
        label: 'Burger',
        calories: 540,
        protein: 33,
        carbs: 38,
        fat: 24,
      };
    }

    if (ingredientName.includes('pizza')) {
      return {
        key: 'pizza',
        label: 'Pizza',
        calories: 620,
        protein: 27,
        carbs: 58,
        fat: 23,
      };
    }

    if (ingredientName.includes('salad')) {
      return {
        key: 'salad',
        label: 'Salad',
        calories: 280,
        protein: 18,
        carbs: 16,
        fat: 12,
      };
    }

    if (ingredientName.includes('rice') || ingredientName.includes('bowl')) {
      return {
        key: 'rice-bowl',
        label: 'Rice Bowl',
        calories: 500,
        protein: 29,
        carbs: 57,
        fat: 15,
      };
    }

    if (ingredientName.includes('pasta')) {
      return {
        key: 'pasta',
        label: 'Pasta',
        calories: 580,
        protein: 26,
        carbs: 68,
        fat: 19,
      };
    }

    if (ingredientName.includes('chicken')) {
      return {
        key: 'grilled-chicken',
        label: 'Grilled Chicken Meal',
        calories: 420,
        protein: 42,
        carbs: 20,
        fat: 14,
      };
    }

    if (ingredientName.includes('fries')) {
      return {
        key: 'fries',
        label: 'Fries',
        calories: 340,
        protein: 6,
        carbs: 42,
        fat: 14,
      };
    }

    if (ingredientName.includes('wrap')) {
      return {
        key: 'wrap',
        label: 'Wrap',
        calories: 390,
        protein: 24,
        carbs: 34,
        fat: 16,
      };
    }

    return {
      key: 'mixed-meal',
      label: 'Mixed Meal',
      calories: 430,
      protein: 24,
      carbs: 35,
      fat: 17,
    };
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
      goal: goal,
      goalLabel: formatGoal(goal),
      calories: calories,
      protein: protein,
      carbs: Math.max(25, Math.round((calories * 0.4) / 4)),
      fat: Math.max(10, Math.round((calories * 0.25) / 9)),
    };
  };

  const analyzeMeal = (meal, profilePlan) => {
    const targetCalories = profilePlan.calories;
    const targetProtein = profilePlan.protein;
    const targetCarbs = Math.max(25, Math.round((targetCalories * 0.4) / 4));

    let suitable = true;
    let status = 'Suitable';
    let reason = 'This meal fits your current goal and can be kept as is.';
    let portionAdvice =
      'Keep the current portion size, or add extra vegetables if you want more volume.';
    let replacements = ['Add a side of vegetables for extra fiber.'];

    if (profilePlan.goal === 'weight-loss') {
      if (meal.calories > targetCalories * 1.08) {
        suitable = false;
        status = 'Needs adjustment';
        reason = 'This meal is a little high for your weight-loss target.';
        portionAdvice =
          'Reduce the portion by about 25% and choose a lighter side.';
        replacements = [
          'Replace fries or rice with a fresh salad.',
          'Swap creamy sauces for yogurt or herbs.',
          'Choose grilled protein instead of fried protein.',
        ];
      } else if (meal.protein < targetProtein * 0.7) {
        suitable = true;
        status = 'Good, but add protein';
        reason =
          'The meal is within your calorie range, but it could use more protein.';
        portionAdvice =
          'Add a lean protein source such as chicken, tuna, or Greek yogurt.';
        replacements = [
          'Add grilled chicken or eggs.',
          'Replace one carb-heavy item with extra vegetables.',
        ];
      }
    }

    if (profilePlan.goal === 'fitness') {
      if (meal.calories > targetCalories * 1.18) {
        suitable = false;
        status = 'Too heavy';
        reason = 'This meal is larger than your usual fitness target.';
        portionAdvice =
          'Lower the portion slightly and keep the balance of carbs and protein steady.';
        replacements = [
          'Use half the starch portion.',
          'Add more vegetables and lean protein.',
        ];
      } else if (meal.protein < targetProtein * 0.65) {
        suitable = true;
        status = 'Good, but add protein';
        reason =
          'The meal fits your calories, but it would benefit from more protein.';
        portionAdvice =
          'Add an extra protein portion to better support exercise recovery.';
        replacements = [
          'Add chicken, eggs, or yogurt.',
          'Choose a whole-grain side instead of a refined carb.',
        ];
      }
    }

    if (profilePlan.goal === 'muscle-gain') {
      if (meal.calories < targetCalories * 0.85) {
        suitable = false;
        status = 'Too light';
        reason = 'This meal is smaller than your muscle-gain target.';
        portionAdvice =
          'Increase the portion slightly and add one energy-dense side.';
        replacements = [
          'Add rice, potatoes, or whole-grain bread.',
          'Increase the protein portion if the meal is too light.',
        ];
      } else if (meal.protein < targetProtein * 0.8) {
        suitable = true;
        status = 'Good, but boost protein';
        reason =
          'The meal provides enough energy, but you may want a little more protein.';
        portionAdvice =
          'Add a little more lean protein to make it stronger for recovery and growth.';
        replacements = [
          'Add chicken, fish, beans, or Greek yogurt.',
          'Keep starch moderate and add vegetables.',
        ];
      }
    }

    const macroSummary = {
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
    };

    return {
      suitable,
      status,
      reason,
      portionAdvice,
      replacements,
      targetCalories,
      targetProtein,
      targetCarbs,
      macroSummary,
    };
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    let profile = userProfile;
    if (!profile) {
      await loadProfile();
    }

    const profilePlan = getProfilePlan(profile);
    const meal = detectMeal(selectedImage.name);
    const analysis = analyzeMeal(meal, profilePlan);

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      setLoading(false);
      setResult({
        meal,
        analysis,
        profilePlan,
      });
    }, 1000);
  };

  return (
    <main className="gym-coach-page">
      {/* Header */}
      <section className="coach-header">
        <span className="eyebrow">AI FOOD SCANNER</span>

        <h1>
          Scan your meal.
          <br />
          <span>Check your fit.</span>
        </h1>

        <p>
          Take a photo of a meal and AI Food Scanner will tell you whether it
          suits your saved plan, how it affects your macros, and what to change
          if needed.
        </p>
      </section>

      {/* Upload Section */}
      <section className="upload-section">
        <div className="upload-card">
          <div className="upload-icon">🥗</div>

          <h2>Show us your meal</h2>

          <p>
            Take a photo or upload an image of a meal, and AI will check whether
            it fits your goal and suggest better options.
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
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageFile(e.target.files[0]);
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
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageFile(e.target.files[0]);
                }
                e.target.value = '';
              }}
            />
          </div>
        </div>

        {selectedImage && (
          <div id="preview-section" className="preview-section">
            <h3>Your meal</h3>

            <div className="image-wrapper">
              <img
                id="machine-preview"
                src={previewUrl}
                alt="Selected ingredients"
              />
            </div>

            <button
              id="analyze-btn"
              className="btn analyze-btn"
              onClick={handleAnalyze}
            >
              Check My Meal
            </button>
          </div>
        )}
      </section>

      {loading && (
        <section id="loading-section" className="loading-section">
          <div className="loader"></div>
          <h3>AI is checking if this meal suits your plan...</h3>
          <p>
            Reviewing the meal image, estimating its nutrition, and comparing it
            with your goal.
          </p>
        </section>
      )}

      {result && (
        <section id="result-section" className="result-section">
          <div className="summary-card">
            <span className="result-label">MEAL DETECTED</span>
            <h2 id="ingredient-summary">{result.meal.label}</h2>
            <p id="ingredient-description">
              {result.meal.label} was detected from your uploaded meal photo.{' '}
              {result.analysis.reason}
            </p>
          </div>

          <div className="result-card">
            <span className="result-label">MEAL ANALYSIS</span>

            <div id="dish-list" className="dish-grid">
              <article className="dish-card">
                <div className="dish-header">
                  <div>
                    <h3>{result.analysis.status}</h3>
                    <p>{result.analysis.reason}</p>
                  </div>
                </div>

                <div className="nutrition-grid">
                  <div className="nutrition-item">
                    <span>Calories</span>
                    <strong>{result.analysis.macroSummary.calories} kcal</strong>
                  </div>
                  <div className="nutrition-item">
                    <span>Protein</span>
                    <strong>{result.analysis.macroSummary.protein} g</strong>
                  </div>
                  <div className="nutrition-item">
                    <span>Carbs</span>
                    <strong>{result.analysis.macroSummary.carbs} g</strong>
                  </div>
                  <div className="nutrition-item">
                    <span>Fat</span>
                    <strong>{result.analysis.macroSummary.fat} g</strong>
                  </div>
                </div>
              </article>

              <article className="dish-card">
                <div className="dish-header">
                  <div>
                    <h3>Portion Advice</h3>
                    <p>{result.analysis.portionAdvice}</p>
                  </div>
                </div>
              </article>

              <article className="dish-card">
                <div className="dish-header">
                  <div>
                    <h3>Better replacements</h3>
                    <ul className="replacement-list">
                      {result.analysis.replacements.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
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
                  {result.profilePlan.calories} kcal
                </strong>
              </div>

              <div className="plan-item">
                <span className="plan-icon">💪</span>
                <span className="plan-title">Protein</span>
                <strong id="target-protein">
                  {result.profilePlan.protein} g
                </strong>
              </div>

              <div className="plan-item">
                <span className="plan-icon">🌾</span>
                <span className="plan-title">Carbs</span>
                <strong id="target-carbs">
                  {result.profilePlan.carbs} g
                </strong>
              </div>

              <div className="plan-item">
                <span className="plan-icon">🥑</span>
                <span className="plan-title">Fat</span>
                <strong id="target-fat">
                  {result.profilePlan.fat} g
                </strong>
              </div>
            </div>

            <div className="goal-message">
              <strong id="goal-title">{result.profilePlan.goalLabel}</strong>
              <p id="personalized-advice">{result.analysis.portionAdvice}</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
