import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../css/style.css';
import '../css/landing.css';

export default function LandingPage() {
  const statCalorieRef = useRef(null);
  const statProteinRef = useRef(null);

  useEffect(() => {
    // 1. Reveal on scroll observer
    const revealElements = document.querySelectorAll(
      '.section-heading, .landing-feature-card, .step, .cta-content'
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    revealElements.forEach((element) => {
      element.classList.add('reveal');
      revealObserver.observe(element);
    });

    // 2. Animate statistics counter
    const animateStat = (stat) => {
      const target = Number(stat.dataset.target || 0);
      const suffix = stat.dataset.suffix || '';
      const duration = 1200;
      const startTime = performance.now();

      const update = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const nextValue = Math.round(target * eased);

        stat.textContent = `${nextValue.toLocaleString()}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          stat.textContent = `${target.toLocaleString()}${suffix}`;
        }
      };

      requestAnimationFrame(update);
    };

    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    const stats = document.querySelectorAll('[data-target]');
    stats.forEach((stat) => {
      statObserver.observe(stat);
    });

    // 3. Navbar active section tracking
    const navbarLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = [...document.querySelectorAll('main section[id]')];

    const setActiveLink = () => {
      let currentSection = sections[0]?.id;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 140 && rect.bottom >= 140) {
          currentSection = section.id;
        }
      });

      navbarLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${currentSection}`;
        link.classList.toggle('active', isActive);
      });
    };

    window.addEventListener('scroll', setActiveLink, { passive: true });
    setActiveLink();

    return () => {
      revealObserver.disconnect();
      statObserver.disconnect();
      window.removeEventListener('scroll', setActiveLink);
    };
  }, []);

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <main>
        <section className="hero">
          <div className="hero-background">
            <img src="/images/hero4.jpg" alt="Fitness" />
          </div>

          <div className="hero-overlay"></div>

          <div className="hero-content">
            <span className="hero-label">AI-Powered Health & Fitness</span>

            <h1>
              Your Health.
              <br />
              Your Goals.
              <br />
              <span>Powered by AI.</span>
            </h1>

            <p>
              FIT FOR ALL helps you make smarter decisions about exercise, food,
              and shopping based on your personal goals, health, and budget.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="primary-btn">
                Create Account
              </Link>

              <a
                href="#features"
                className="secondary-btn"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .querySelector('#features')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore FIT FOR ALL
              </a>

              <Link to="/coaches" className="secondary-btn hero-coaches-btn">
                Explore Coaches
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-header">
                <span>FIT FOR ALL</span>
                <span>AI Assistant</span>
              </div>

              <div className="hero-goal">
                <span>Your Goal</span>
                <strong>Weight Loss</strong>
              </div>

              <div className="hero-stats">
                <div>
                  <span>Calories</span>
                  <strong ref={statCalorieRef} data-target="1850">
                    1,850
                  </strong>
                </div>

                <div>
                  <span>Protein</span>
                  <strong ref={statProteinRef} data-target="120" data-suffix="g">
                    120g
                  </strong>
                </div>

                <div>
                  <span>Budget</span>
                  <strong>Low</strong>
                </div>
              </div>

              <div className="hero-message">
                <span>AI Recommendation</span>
                <p>
                  Choose grilled chicken with vegetables for a balanced meal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features" id="features">
          <div className="section-heading">
            <span>WHAT FIT FOR ALL CAN DO</span>
            <h2>One app for your whole journey.</h2>
            <p>
              From personalized food guidance to coach support, FIT FOR ALL
              helps you stay focused on your goals.
            </p>
          </div>

          <div className="feature-grid">
            <Link
              to="/food-guide"
              className="landing-feature-card"
              aria-label="Open AI Food Guide"
            >
              <div className="landing-feature-icon">
                <img src="/images/dish.png" alt="AI Food Guide" />
              </div>
              <h3>AI Food Guide</h3>
              <p>
                Upload ingredient images and get personalized dish
                recommendations that match your saved profile plan.
              </p>
            </Link>

            <Link
              to="/gym-coach"
              className="landing-feature-card"
              aria-label="Open AI Food Scanner"
            >
              <div className="landing-feature-icon">
                <img src="/images/plate2.png" alt="Food Scanner" />
              </div>
              <h3>AI Food Scanner</h3>
              <p>
                Take a photo of your meal and get estimated calories, macros,
                health insights, and personalized improvements.
              </p>
            </Link>

            <Link
              to="/product-scanner"
              className="landing-feature-card"
              aria-label="Open AI Product Scanner"
            >
              <div className="landing-feature-icon">
                <img src="/images/cart.png" alt="Product Scanner" />
              </div>
              <h3>Smart Product Scanner</h3>
              <p>
                Scan a food product to understand its nutrition and find
                healthier or more affordable alternatives.
              </p>
            </Link>
          </div>
        </section>

        <section className="coach-spotlight">
          <div className="coach-spotlight-content">
            <span className="section-badge">COACHES</span>
            <h2>Explore Coaches</h2>
            <p>
              Browse female and male coaches, compare their plans, and subscribe
              to the one that matches your goals.
            </p>
            <Link to="/coaches" className="primary-btn">
              Discover Coaches
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works" id="how-it-works">
          <div className="section-heading">
            <span>HOW IT WORKS</span>
            <h2>
              Personalized from <span>the start.</span>
            </h2>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <h3>Build Your Profile</h3>
              <p>
                Tell FIT FOR ALL about your goal, health, and food budget.
              </p>
            </div>

            <div className="step">
              <div className="step-number">02</div>
              <h3>Scan & Analyze</h3>
              <p>
                Use AI to analyze gym machines, meals, and food products.
              </p>
            </div>

            <div className="step">
              <div className="step-number">03</div>
              <h3>Get Personalized Advice</h3>
              <p>Receive recommendations designed specifically for you.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <div className="cta-content">
            <h2>Ready to make smarter health choices?</h2>
            <p>
              Create your profile and let FIT FOR ALL guide you to your goals.
              Start today and personalize your journey.
            </p>
            <Link to="/register" className="primary-btn">
              Create Account
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
