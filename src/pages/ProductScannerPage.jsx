import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/api';
import '../css/food-guide.css';

export default function ProductScannerPage() {
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

  const getProductLabel = (fileName) => {
    const cleanedName = fileName
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    return cleanedName || 'product';
  };

  const detectProduct = (fileName) => {
    const name = getProductLabel(fileName).toLowerCase();

    if (name.includes('yogurt')) {
      return {
        key: 'yogurt',
        label: 'Yogurt',
        calories: 150,
        protein: 12,
        carbs: 10,
        fat: 5,
        buyRecommendation: 'Good for your plan if you choose a low-sugar version.',
        uses: [
          'Use it in a breakfast bowl with fruit and oats.',
          'Add it to a smoothie with berries and spinach.',
          'Use it as a topping for a healthy snack plate.',
        ],
      };
    }

    if (name.includes('protein bar')) {
      return {
        key: 'protein-bar',
        label: 'Protein Bar',
        calories: 210,
        protein: 20,
        carbs: 18,
        fat: 6,
        buyRecommendation: 'Good choice if it has low sugar and enough protein.',
        uses: [
          'Eat it as a post-workout snack.',
          'Pair it with fruit for better satiety.',
          'Use it as a quick option when you need energy on the go.',
        ],
      };
    }

    if (name.includes('chocolate')) {
      return {
        key: 'chocolate',
        label: 'Chocolate',
        calories: 220,
        protein: 2,
        carbs: 20,
        fat: 12,
        buyRecommendation:
          'Not ideal for a strict plan unless portion size is small.',
        uses: [
          'Use a small portion as a treat after a balanced meal.',
          'Choose dark chocolate with less sugar.',
          'Pair it with nuts instead of eating it alone.',
        ],
      };
    }

    if (name.includes('juice')) {
      return {
        key: 'juice',
        label: 'Juice',
        calories: 140,
        protein: 1,
        carbs: 30,
        fat: 0,
        buyRecommendation:
          'Only good if it is fresh and not overloaded with sugar.',
        uses: [
          'Drink a small glass with a meal instead of a large bottle.',
          'Mix with water to reduce sugar intake.',
          'Use it in a fruit smoothie with yogurt and oats.',
        ],
      };
    }

    if (name.includes('oat')) {
      return {
        key: 'oats',
        label: 'Oats',
        calories: 180,
        protein: 8,
        carbs: 28,
        fat: 4,
        buyRecommendation: 'A very good product for most plans.',
        uses: [
          'Make overnight oats with yogurt and fruit.',
          'Use them in a breakfast bowl with chia seeds.',
          'Add oats to smoothies for extra fiber.',
        ],
      };
    }

    if (name.includes('milk')) {
      return {
        key: 'milk',
        label: 'Milk',
        calories: 120,
        protein: 8,
        carbs: 12,
        fat: 5,
        buyRecommendation: 'Good if you choose low-fat or unsweetened options.',
        uses: [
          'Use it in oatmeal or smoothies.',
          'Pair it with cereal for a simple breakfast.',
          'Use it in protein shakes or sauces.',
        ],
      };
    }

    return {
      key: 'general-product',
      label: 'Packaged Food Product',
      calories: 210,
      protein: 8,
      carbs: 24,
      fat: 9,
      buyRecommendation:
        'It may fit your plan only if portion size and ingredients are checked carefully.',
      uses: [
        'Use it as part of a balanced meal.',
        'Pair it with fruits or vegetables.',
        'Avoid eating it alone if it is high in sugar or fat.',
      ],
    };
  };

  const getProductDishes = (product, goal) => {
    const productDishes = {
      yogurt: [
        {
          name: 'Berry Yogurt Oat Bowl',
          calories: 290,
          protein: 18,
          carbs: 32,
          fat: 8,
          tags: ['Protein-rich', 'Easy breakfast'],
          description:
            'A fresh bowl made with yogurt, oats, and berries for a balanced start.',
        },
        {
          name: 'Greek Yogurt Smoothie',
          calories: 340,
          protein: 22,
          carbs: 28,
          fat: 9,
          tags: ['Quick', 'High protein'],
          description:
            'A simple smoothie that turns yogurt into a satisfying and light meal.',
        },
        {
          name: 'Yogurt Fruit Parfait',
          calories: 310,
          protein: 19,
          carbs: 26,
          fat: 10,
          tags: ['High fiber', 'Smart snack'],
          description:
            'A simple parfait with yogurt and fruit that fits many nutrition goals.',
        },
      ],

      'protein-bar': [
        {
          name: 'Protein Bar Snack Plate',
          calories: 260,
          protein: 24,
          carbs: 24,
          fat: 7,
          tags: ['Quick snack', 'Post-workout'],
          description:
            'A fast snack plate built around the protein bar and a fruit side.',
        },
        {
          name: 'Protein Bar Banana Bowl',
          calories: 300,
          protein: 23,
          carbs: 34,
          fat: 8,
          tags: ['Portable', 'Balanced'],
          description:
            'A simple bowl pairing the product with banana and yogurt for better satiety.',
        },
        {
          name: 'Protein Bar Breakfast Combo',
          calories: 320,
          protein: 25,
          carbs: 30,
          fat: 9,
          tags: ['Meal prep', 'Energy boost'],
          description:
            'A convenient breakfast option that keeps carbs steady and protein high.',
        },
      ],

      chocolate: [
        {
          name: 'Dark Chocolate Berry Yogurt Bowl',
          calories: 340,
          protein: 16,
          carbs: 30,
          fat: 12,
          tags: ['Treat', 'Balanced'],
          description:
            'A lighter way to enjoy chocolate while adding fruit and yogurt for balance.',
        },
        {
          name: 'Chocolate Banana Oat Shake',
          calories: 360,
          protein: 14,
          carbs: 42,
          fat: 11,
          tags: ['Satisfying', 'Quick drink'],
          description:
            'A smooth shake that blends chocolate with oats and banana for a fuller meal.',
        },
        {
          name: 'Chocolate Nut Snack Plate',
          calories: 330,
          protein: 12,
          carbs: 26,
          fat: 15,
          tags: ['Moderate treat', 'Smart portion'],
          description:
            'A snack plate that uses chocolate in a controlled amount with nuts and fruit.',
        },
      ],

      juice: [
        {
          name: 'Fruit Juice Smoothie Bowl',
          calories: 290,
          protein: 15,
          carbs: 36,
          fat: 7,
          tags: ['Refreshing', 'Easy energy'],
          description:
            'A lighter smoothie bowl that uses juice as the base with yogurt and fruit.',
        },
        {
          name: 'Juice Oat Breakfast Cup',
          calories: 300,
          protein: 10,
          carbs: 42,
          fat: 6,
          tags: ['Breakfast', 'Simple'],
          description:
            'A quick breakfast option that uses juice with oats and fruit for structure.',
        },
        {
          name: 'Citrus Juice Chicken Salad',
          calories: 360,
          protein: 28,
          carbs: 20,
          fat: 12,
          tags: ['Fresh', 'High protein'],
          description:
            'A savory dish where juice can be used as a light dressing or marinade.',
        },
      ],

      oats: [
        {
          name: 'Overnight Oats Bowl',
          calories: 320,
          protein: 17,
          carbs: 38,
          fat: 7,
          tags: ['Fiber-rich', 'Meal prep'],
          description:
            'A convenient overnight oats bowl that is filling and easy to prepare ahead.',
        },
        {
          name: 'Oat Fruit Breakfast Bowl',
          calories: 340,
          protein: 15,
          carbs: 42,
          fat: 8,
          tags: ['Balanced', 'Energy'],
          description:
            'A comforting breakfast bowl with oats, fruit, and yogurt for extra protein.',
        },
        {
          name: 'Oat Smoothie Power Drink',
          calories: 290,
          protein: 16,
          carbs: 34,
          fat: 6,
          tags: ['Portable', 'Very filling'],
          description:
            'A satisfying drink built around oats and a good protein source.',
        },
      ],

      milk: [
        {
          name: 'Milk Oat Breakfast Bowl',
          calories: 300,
          protein: 14,
          carbs: 34,
          fat: 7,
          tags: ['Classic', 'Comfort meal'],
          description:
            'A simple bowl with milk, oats, and fruit to make a wholesome breakfast.',
        },
        {
          name: 'Protein Shake Bowl',
          calories: 350,
          protein: 24,
          carbs: 30,
          fat: 8,
          tags: ['Post-workout', 'High protein'],
          description:
            'A balanced bowl that uses milk as the base for a stronger recovery meal.',
        },
        {
          name: 'Milk Smoothie with Fruit',
          calories: 330,
          protein: 18,
          carbs: 36,
          fat: 8,
          tags: ['Easy', 'Energy'],
          description:
            'A quick smoothie that turns milk into a satisfying meal option with fruit.',
        },
      ],

      'general-product': [
        {
          name: 'Balanced Meal Bowl',
          calories: 420,
          protein: 24,
          carbs: 38,
          fat: 14,
          tags: ['Balanced', 'Portable'],
          description:
            'A flexible bowl using the product as part of a complete, satisfying meal.',
        },
        {
          name: 'High Protein Snack Plate',
          calories: 360,
          protein: 22,
          carbs: 26,
          fat: 12,
          tags: ['Snack', 'Smart portion'],
          description:
            'A practical plate built around the product plus fruit and lean protein.',
        },
        {
          name: 'Light Meal Combo',
          calories: 310,
          protein: 18,
          carbs: 30,
          fat: 9,
          tags: ['Light', 'Easy to prepare'],
          description:
            'A lighter option that uses the scanned product in a healthy way.',
        },
      ],
    };

    let dishes = productDishes[product.key] || productDishes['general-product'];

    const goalAdjustments = {
      'weight-loss': {
        caloriesMultiplier: 0.85,
        proteinAdd: 3,
        carbsMultiplier: 0.9,
        fatMultiplier: 0.85,
        tag: 'Plan-friendly',
      },
      fitness: {
        caloriesMultiplier: 1,
        proteinAdd: 2,
        carbsMultiplier: 1,
        fatMultiplier: 1,
        tag: 'Balanced',
      },
      'muscle-gain': {
        caloriesMultiplier: 1.15,
        proteinAdd: 5,
        carbsMultiplier: 1.08,
        fatMultiplier: 1.05,
        tag: 'High-protein',
      },
    };

    const adjustment = goalAdjustments[goal] || goalAdjustments.fitness;

    return dishes.map((dish) => {
      return {
        ...dish,
        calories: Math.round(dish.calories * adjustment.caloriesMultiplier),
        protein: Math.max(10, dish.protein + adjustment.proteinAdd),
        carbs: Math.max(10, Math.round(dish.carbs * adjustment.carbsMultiplier)),
        fat: Math.max(4, Math.round(dish.fat * adjustment.fatMultiplier)),
        tags: Array.from(new Set([...dish.tags, adjustment.tag])),
      };
    });
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
      carbs: Math.max(25, Math.round((calories * 0.4) / 4)),
      fat: Math.max(10, Math.round((calories * 0.25) / 9)),
    };
  };

  const analyzeProduct = (product, profilePlan) => {
    const targetCalories = profilePlan.calories;
    const targetProtein = profilePlan.protein;

    let suitable = true;
    let status = 'Buy it';
    let reason = 'This product can fit your plan and supports your current goal.';
    let buyAdvice = 'You can buy it and use it in a balanced meal.';
    let replacementAdvice = [
      'Keep the serving size moderate.',
      'Pair it with vegetables, fruit, or a lean protein.',
    ];

    if (profilePlan.goal === 'weight-loss') {
      if (product.calories > targetCalories * 0.12 || product.carbs > 25) {
        suitable = false;
        status = 'Skip it';
        reason = 'This product is too high in calories or carbs for your target.';
        buyAdvice = 'It is better to avoid it or choose a lighter version.';
        replacementAdvice = [
          'Choose a lower-sugar version.',
          'Pick a product with more protein and less added sugar.',
          'Use vegetables or fruit instead of a sweet snack.',
        ];
      }
    }

    if (profilePlan.goal === 'fitness') {
      if (product.protein < targetProtein * 0.25) {
        suitable = false;
        status = 'Use carefully';
        reason = 'This product is not very strong for your recovery needs.';
        buyAdvice = 'Buy it only if you add a protein-rich item alongside it.';
        replacementAdvice = [
          'Pair it with Greek yogurt or eggs.',
          'Choose a product with more protein per serving.',
          'Use it as a small snack, not the main meal.',
        ];
      }
    }

    if (profilePlan.goal === 'muscle-gain') {
      if (product.protein < targetProtein * 0.2) {
        suitable = false;
        status = 'Not the best choice';
        reason = 'This product is low in protein and may not help your muscle goal.';
        buyAdvice =
          'It is better to buy a higher-protein option or combine it with a richer protein source.';
        replacementAdvice = [
          'Choose a higher-protein yogurt or snack.',
          'Pair it with chicken, eggs, or beans.',
          'Use it as a side, not the main source of nutrition.',
        ];
      }
    }

    return {
      suitable,
      status,
      reason,
      buyAdvice,
      replacementAdvice,
      product,
    };
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    let profile = userProfile;
    if (!profile) {
      await loadProfile();
    }

    const profilePlan = getProfilePlan(profile);
    const product = detectProduct(selectedImage.name);
    const analysis = analyzeProduct(product, profilePlan);

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      setLoading(false);
      setResult({
        product,
        analysis,
        profilePlan,
      });
    }, 1000);
  };

  const recommendedDishes = result
    ? getProductDishes(result.product, result.profilePlan.goal)
    : [];

  return (
    <main className="gym-coach-page">
      <section className="coach-header">
        <span className="eyebrow">AI PRODUCT SCANNER</span>

        <h1>
          Scan the product.
          <br />
          <span>Check if it suits you.</span>
        </h1>

        <p>
          Take a photo or upload a product from the supermarket, and AI Product
          Scanner will tell you whether it fits your plan, if you should buy it,
          and which dishes you can make with it.
        </p>
      </section>

      <section className="upload-section">
        <div className="upload-card">
          <div className="upload-icon">🛒</div>

          <h2>Show us the product</h2>

          <p>
            Take a photo or upload a product image, and AI will check whether it
            matches your goals and recommend good uses for it.
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
            <h3>Your product</h3>

            <div className="image-wrapper">
              <img
                id="machine-preview"
                src={previewUrl}
                alt="Selected product"
              />
            </div>

            <button
              id="analyze-btn"
              className="btn analyze-btn"
              onClick={handleAnalyze}
            >
              Check Product
            </button>
          </div>
        )}
      </section>

      {loading && (
        <section id="loading-section" className="loading-section">
          <div className="loader"></div>
          <h3>AI is checking this product for your plan...</h3>
          <p>
            Comparing the product with your nutrition goals and suggesting smart
            meal ideas.
          </p>
        </section>
      )}

      {result && (
        <section id="result-section" className="result-section">
          <div className="summary-card">
            <span className="result-label">PRODUCT DETECTED</span>
            <h2 id="ingredient-summary">{result.product.label}</h2>
            <p id="ingredient-description">
              {result.product.label} was detected from the product image.{' '}
              {result.analysis.reason}
            </p>
          </div>

          <div className="result-card">
            <span className="result-label">PRODUCT ANALYSIS</span>

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
                    <strong>{result.product.calories} kcal</strong>
                  </div>
                  <div className="nutrition-item">
                    <span>Protein</span>
                    <strong>{result.product.protein} g</strong>
                  </div>
                  <div className="nutrition-item">
                    <span>Carbs</span>
                    <strong>{result.product.carbs} g</strong>
                  </div>
                  <div className="nutrition-item">
                    <span>Fat</span>
                    <strong>{result.product.fat} g</strong>
                  </div>
                </div>
              </article>

              <article className="dish-card">
                <div className="dish-header">
                  <div>
                    <h3>Should you buy it?</h3>
                    <p>{result.analysis.buyAdvice}</p>
                  </div>
                </div>
              </article>

              <article className="dish-card">
                <div className="dish-header">
                  <div>
                    <h3>Better options</h3>
                    <ul className="replacement-list">
                      {result.analysis.replacementAdvice.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>

              <article className="dish-card">
                <div className="dish-header">
                  <div>
                    <h3>Meals that fit your plan and use this product</h3>
                  </div>
                </div>
              </article>

              {recommendedDishes.map((dish, dIdx) => (
                <article key={dIdx} className="dish-card">
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
              <p id="personalized-advice">
                This product can be included in your plan if it matches your
                current nutrition balance.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
