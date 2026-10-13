import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollToHash = (hash) => {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="logo">FIT FOR ALL</div>
          <p>
            AI-powered health and fitness guidance that helps you train smarter,
            eat better, and make confident choices every day.
          </p>
          <div className="footer-socials">
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">X</a>
          </div>
        </div>

        <div className="footer-column">
          <h4>Company</h4>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash('#features');
            }}
          >
            What We Offer
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash('#how-it-works');
            }}
          >
            How It Works
          </a>
          <Link to="/register">Create Account</Link>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Contact Us</a>
          <a href="#">Privacy Policy</a>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>
          <a href="#">Gym Tips</a>
          <a href="#">Healthy Meals</a>
          <a href="#">Shopping Guidance</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 FIT FOR ALL. All rights reserved.</span>
      </div>
    </footer>
  );
}
