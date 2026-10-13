import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../css/style.css';
import '../css/coaches.css';

const COACHES_DATA = [
  {
    id: 'amina',
    name: 'Amina Rahman',
    role: 'Nutrition Coach',
    gender: 'female',
    price: 29,
    priceLabel: '$29/mo',
    avatar: 'A',
    avatarColor: 'blue',
    tags: ['Weight Loss', 'Meal Plans'],
    rating: '⭐ 4.9 Rating',
    clients: '1.2k clients',
    description:
      'Helps clients build sustainable eating habits, improve energy, and stay consistent with their plan.',
  },
  {
    id: 'mohamed',
    name: 'Mohamed Ali',
    role: 'Strength Coach',
    gender: 'male',
    price: 34,
    priceLabel: '$34/mo',
    avatar: 'M',
    avatarColor: 'tan',
    tags: ['Muscle Gain', 'Gym Plans'],
    rating: '⭐ 4.8 Rating',
    clients: '980 clients',
    description:
      'Specializes in strength training, progressive overload, and body recomposition for busy professionals.',
  },
  {
    id: 'sara',
    name: 'Sara Lewis',
    role: 'Fitness Coach',
    gender: 'female',
    price: 26,
    priceLabel: '$26/mo',
    avatar: 'S',
    avatarColor: 'purple',
    tags: ['General Fitness', 'Home Workouts'],
    rating: '⭐ 4.9 Rating',
    clients: '1.6k clients',
    description:
      'Builds full-body routines for beginners and active clients who want a balanced and sustainable routine.',
  },
  {
    id: 'daniel',
    name: 'Daniel Reed',
    role: 'Performance Coach',
    gender: 'male',
    price: 39,
    priceLabel: '$39/mo',
    avatar: 'D',
    avatarColor: 'green',
    tags: ['Recovery', 'Athletic Performance'],
    rating: '⭐ 4.7 Rating',
    clients: '760 clients',
    description:
      'Focuses on performance, mobility, and recovery strategies to help athletes train smarter and avoid burnout.',
  },
];

export default function CoachesPage() {
  const [currentGender, setCurrentGender] = useState('All Coaches');
  const [currentPrice, setCurrentPrice] = useState('all');

  const filteredCoaches = COACHES_DATA.filter((coach) => {
    let matchesGender = true;
    let matchesPrice = true;

    if (currentGender === 'Female Coaches') {
      matchesGender = coach.gender === 'female';
    } else if (currentGender === 'Male Coaches') {
      matchesGender = coach.gender === 'male';
    }

    if (currentPrice === 'under-30') {
      matchesPrice = coach.price < 30;
    } else if (currentPrice === '30-34') {
      matchesPrice = coach.price >= 30 && coach.price <= 34;
    } else if (currentPrice === '35-plus') {
      matchesPrice = coach.price >= 35;
    }

    return matchesGender && matchesPrice;
  });

  return (
    <div>
      <Navbar />

      <main className="coaches-page">
        <section className="coach-header">
          <span className="coach-eyebrow">Find your coach</span>
          <h1>
            Choose a coach that fits <span>your goals</span>
          </h1>
          <p>
            Browse certified coaches, compare their focus areas, and subscribe
            to the one that matches your plan.
          </p>
        </section>

        <div className="coach-toolbar">
          {['All Coaches', 'Female Coaches', 'Male Coaches'].map((genderTab) => (
            <a
              key={genderTab}
              href="#"
              className={`coach-filter ${currentGender === genderTab ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentGender(genderTab);
              }}
            >
              {genderTab}
            </a>
          ))}

          <select
            id="price-filter"
            className="coach-price-filter"
            aria-label="Filter coaches by price"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
          >
            <option value="all">All Prices</option>
            <option value="under-30">Under $30</option>
            <option value="30-34">$30 - $34</option>
            <option value="35-plus">$35+</option>
          </select>
        </div>

        <section className="coach-grid" id="coach-grid">
          {filteredCoaches.map((coach) => (
            <article
              key={coach.id}
              className="coach-card"
              data-gender={coach.gender}
              data-price={coach.price}
            >
              <div className="coach-card-top">
                <div className="coach-profile-head">
                  <div className={`coach-avatar ${coach.avatarColor}`}>
                    {coach.avatar}
                  </div>
                  <div>
                    <h3 className="coach-name">{coach.name}</h3>
                    <span className="coach-role">{coach.role}</span>
                  </div>
                </div>

                <div className="coach-tags">
                  {coach.tags.map((tag) => (
                    <span key={tag} className="coach-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="coach-card-body">
                <div className="coach-meta">
                  <span>{coach.rating}</span>
                  <span>{coach.clients}</span>
                </div>

                <p className="coach-description">{coach.description}</p>

                <div className="coach-actions">
                  <div className="coach-price">{coach.priceLabel}</div>
                  <Link
                    to={`/coach-profile?coach=${coach.id}`}
                    className="coach-link-btn"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
