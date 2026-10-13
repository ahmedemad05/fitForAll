import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../css/style.css';
import '../css/coaches.css';

const COACH_PROFILES = {
  amina: {
    name: 'Amina Rahman',
    role: 'Nutrition Coach',
    gender: 'female',
    tags: ['Weight Loss', 'Meal Plans', 'Healthy Habits'],
    rating: '4.9',
    clients: '1.2k',
    price: '$29/mo',
    avatar: 'A',
    avatarClass: 'blue',
    bio: 'Amina helps clients build simple, realistic nutrition routines that support fat loss, better energy, and long-term consistency. She focuses on meal structure, habit tracking, and sustainable progress.',
    services: [
      {
        title: 'Weekly Check-ins',
        text: 'Personalized progress reviews and accountability.',
      },
      {
        title: 'Custom Plan',
        text: 'Goal-based routines built around your current schedule.',
      },
      {
        title: 'Support',
        text: 'Direct guidance and adjustments as your goals evolve.',
      },
    ],
  },
  mohamed: {
    name: 'Mohamed Ali',
    role: 'Strength Coach',
    gender: 'male',
    tags: ['Muscle Gain', 'Gym Plans', 'Strength'],
    rating: '4.8',
    clients: '980',
    price: '$34/mo',
    avatar: 'M',
    avatarClass: 'tan',
    bio: 'Mohamed helps clients grow stronger with smart training progression, recovery planning, and workout consistency. His programs are ideal for people who want visible progress in the gym.',
    services: [
      {
        title: 'Weekly Check-ins',
        text: 'Personalized progress reviews and accountability.',
      },
      {
        title: 'Custom Plan',
        text: 'Goal-based routines built around your current schedule.',
      },
      {
        title: 'Support',
        text: 'Direct guidance and adjustments as your goals evolve.',
      },
    ],
  },
  sara: {
    name: 'Sara Lewis',
    role: 'Fitness Coach',
    gender: 'female',
    tags: ['General Fitness', 'Home Workouts', 'Consistency'],
    rating: '4.9',
    clients: '1.6k',
    price: '$26/mo',
    avatar: 'S',
    avatarClass: 'purple',
    bio: 'Sara creates enjoyable and balanced fitness routines for clients who want steady progress without burnout. Her coaching works especially well for beginners and busy lifestyles.',
    services: [
      {
        title: 'Weekly Check-ins',
        text: 'Personalized progress reviews and accountability.',
      },
      {
        title: 'Custom Plan',
        text: 'Goal-based routines built around your current schedule.',
      },
      {
        title: 'Support',
        text: 'Direct guidance and adjustments as your goals evolve.',
      },
    ],
  },
  daniel: {
    name: 'Daniel Reed',
    role: 'Performance Coach',
    gender: 'male',
    tags: ['Recovery', 'Athletic Performance', 'Mobility'],
    rating: '4.7',
    clients: '760',
    price: '$39/mo',
    avatar: 'D',
    avatarClass: 'green',
    bio: 'Daniel specializes in performance optimization, mobility, and recovery. His coaching is designed for active clients who want to move better, recover faster, and perform at a higher level.',
    services: [
      {
        title: 'Weekly Check-ins',
        text: 'Personalized progress reviews and accountability.',
      },
      {
        title: 'Custom Plan',
        text: 'Goal-based routines built around your current schedule.',
      },
      {
        title: 'Support',
        text: 'Direct guidance and adjustments as your goals evolve.',
      },
    ],
  },
};

export default function CoachProfilePage() {
  const [searchParams] = useSearchParams();
  const coachKey = searchParams.get('coach') || 'amina';
  const coach = COACH_PROFILES[coachKey] || COACH_PROFILES.amina;

  const handleSubscribe = () => {
    alert(`You have subscribed to ${coach.name} (${coach.role}).`);
  };

  return (
    <div>
      <Navbar />

      <main className="coach-profile-shell">
        <section className="coach-profile-card" id="coach-profile-card">
          <div className="coach-profile-left">
            <div
              className={`coach-profile-avatar ${coach.avatarClass}`}
              id="coach-avatar"
            >
              {coach.avatar}
            </div>
            <h2 id="coach-name">{coach.name}</h2>
            <div id="coach-role" className="coach-profile-role">
              {coach.role}
            </div>

            <div className="coach-tags" id="coach-tags">
              {coach.tags.map((tag) => (
                <span key={tag} className="coach-tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="coach-profile-meta">
              <div className="coach-stat">
                <span>Rating</span>
                <strong id="coach-rating">{coach.rating}</strong>
              </div>
              <div className="coach-stat">
                <span>Clients</span>
                <strong id="coach-clients">{coach.clients}</strong>
              </div>
              <div className="coach-stat">
                <span>Price</span>
                <strong id="coach-price">{coach.price}</strong>
              </div>
            </div>
          </div>

          <div className="coach-profile-right">
            <h3>About this coach</h3>
            <p id="coach-bio" className="coach-profile-bio">
              {coach.bio}
            </p>

            <div className="coach-services">
              {coach.services.map((service, index) => (
                <div key={index} className="service-box">
                  <h4>{service.title}</h4>
                  <p>{service.text}</p>
                </div>
              ))}
            </div>

            <div className="coach-profile-actions">
              <button
                className="subscribe-btn"
                id="subscribe-btn"
                onClick={handleSubscribe}
              >
                Subscribe Now
              </button>
              <Link to="/coaches" className="coach-link-btn">
                Back to Coaches
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
