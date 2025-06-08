import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, MapPin, Calendar } from 'lucide-react';
import { reviewsAPI } from '../services/api';
import './Ratings.css';

const Ratings = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [overallStats, setOverallStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data as fallback
  const mockReviews = [
    {
      id: 1,
      name: "Maria Santos",
      location: "Manila, Philippines",
      avatar: "https://ui-avatars.com/api/?name=Maria+Santos&background=1da1f2&color=fff&size=150",
      rating: 5,
      title: "Amazing AI Recommendations!",
      review: "WerTigo helped me discover hidden gems in Palawan that I never would have found on my own. The AI recommendations were spot-on and perfectly matched my travel style. Highly recommended!",
      destination: "Palawan",
      tripDate: "March 2024",
      verified: true
    },
    {
      id: 2,
      name: "John Rodriguez",
      location: "Cebu, Philippines",
      avatar: "https://ui-avatars.com/api/?name=John+Rodriguez&background=2e7d32&color=fff&size=150",
      rating: 5,
      title: "Perfect Trip Planning",
      review: "The trip planner feature is incredible! It organized my entire Bohol adventure perfectly. The route calculations saved me so much time and the destination suggestions were amazing.",
      destination: "Bohol",
      tripDate: "February 2024",
      verified: true
    },
    {
      id: 3,
      name: "Ana Reyes",
      location: "Davao, Philippines",
      avatar: "https://ui-avatars.com/api/?name=Ana+Reyes&background=e91e63&color=fff&size=150",
      rating: 4,
      title: "Great for Budget Travel",
      review: "WerTigo helped me plan an amazing budget trip to Siargao. The AI assistant provided great affordable options and the cost estimates were very accurate. Will definitely use again!",
      destination: "Siargao",
      tripDate: "January 2024",
      verified: true
    },
    {
      id: 4,
      name: "Carlos Mendoza",
      location: "Baguio, Philippines",
      avatar: "https://ui-avatars.com/api/?name=Carlos+Mendoza&background=ff9800&color=fff&size=150",
      rating: 5,
      title: "Excellent User Experience",
      review: "The interface is so intuitive and the AI chat feels like talking to a real travel expert. Found amazing restaurants and activities in Boracay that made our honeymoon perfect!",
      destination: "Boracay",
      tripDate: "December 2023",
      verified: true
    },
    {
      id: 5,
      name: "Sofia Cruz",
      location: "Iloilo, Philippines",
      avatar: "https://ui-avatars.com/api/?name=Sofia+Cruz&background=9c27b0&color=fff&size=150",
      rating: 4,
      title: "Comprehensive Travel Tool",
      review: "From planning to tracking, WerTigo has everything I need. The map integration is fantastic and the destination details are very comprehensive. A must-have for Philippine travel!",
      destination: "Batanes",
      tripDate: "November 2023",
      verified: true
    }
  ];

  const mockStats = {
    totalReviews: 2847,
    averageRating: 4.8,
    ratingDistribution: [
      { stars: 5, count: 2156, percentage: 76 },
      { stars: 4, count: 512, percentage: 18 },
      { stars: 3, count: 142, percentage: 5 },
      { stars: 2, count: 23, percentage: 1 },
      { stars: 1, count: 14, percentage: 0 }
    ]
  };

  // Fetch reviews and stats from backend
  useEffect(() => {
    const fetchReviewsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch platform stats and reviews from backend
        const response = await reviewsAPI.getPlatformStats(5);
        
        if (response.success && response.reviews && response.stats) {
          // Use backend data
          setReviews(response.reviews);
          setOverallStats(response.stats);
          console.log('✅ Loaded reviews from backend:', response.reviews.length, 'reviews');
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.warn('⚠️ Failed to load reviews from backend, using mock data:', error.message);
        setError('Using demo data - backend not available');
        
        // Fallback to mock data
        setReviews(mockReviews);
        setOverallStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewsData();
  }, []);

  // Auto-play reviews
  useEffect(() => {
    if (!isAutoPlaying || reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const renderStars = (rating, size = 20) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={size}
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
          fill={i <= rating ? '#ffd700' : 'none'}
        />
      );
    }
    return stars;
  };

  const nextReview = () => {
    setIsAutoPlaying(false);
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setIsAutoPlaying(false);
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToReview = (index) => {
    setIsAutoPlaying(false);
    setCurrentReview(index);
  };

  // Show loading state
  if (loading) {
    return (
      <section className="ratings-section">
        <div className="container">
          <div className="ratings-header">
            <h2 className="section-title">
              What Our <span>Travelers</span> Say
            </h2>
            <p className="section-subtitle">Loading reviews...</p>
          </div>
          <div className="loading-spinner" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no reviews available
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="ratings-section">
      <div className="container">
        <div className="ratings-header">
          <h2 className="section-title">
            What Our <span>Travelers</span> Say
          </h2>
          <p className="section-subtitle">
            Discover why thousands of Filipino travelers trust WerTigo for their adventures
            {error && <span style={{ color: '#ff6b6b', fontSize: '0.9em', display: 'block', marginTop: '0.5rem' }}>({error})</span>}
          </p>
        </div>

        {/* Overall Rating Stats */}
        <div className="rating-stats">
          <div className="overall-rating">
            <div className="rating-number">{overallStats.averageRating || 0}</div>
            <div className="rating-stars">
              {renderStars(Math.floor(overallStats.averageRating || 0), 24)}
            </div>
            <div className="total-reviews">
              Based on {(overallStats.totalReviews || 0).toLocaleString()} reviews
            </div>
          </div>

          <div className="rating-breakdown">
            {(overallStats.ratingDistribution || []).map((item) => (
              <div key={item.stars} className="rating-bar">
                <span className="star-label">{item.stars}</span>
                <Star size={16} className="star filled" fill="#ffd700" />
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="percentage">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Carousel */}
        <div className="reviews-carousel">
          <div className="carousel-container">
            <button 
              className="carousel-btn prev"
              onClick={prevReview}
              aria-label="Previous review"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <img 
                    src={reviews[currentReview].avatar} 
                    alt={reviews[currentReview].name}
                    className="reviewer-avatar"
                  />
                  <div className="reviewer-details">
                    <h4 className="reviewer-name">
                      {reviews[currentReview].name}
                      {reviews[currentReview].verified && (
                        <span className="verified-badge">✓</span>
                      )}
                    </h4>
                    <div className="reviewer-location">
                      <MapPin size={14} />
                      {reviews[currentReview].location}
                    </div>
                  </div>
                </div>
                <div className="review-rating">
                  {renderStars(reviews[currentReview].rating)}
                </div>
              </div>

              <div className="review-content">
                <Quote className="quote-icon" size={24} />
                <h3 className="review-title">{reviews[currentReview].title}</h3>
                <p className="review-text">{reviews[currentReview].review}</p>
                
                <div className="review-metadata">
                  <div className="trip-info">
                    <MapPin size={16} />
                    <span>Visited {reviews[currentReview].destination}</span>
                  </div>
                  <div className="trip-date">
                    <Calendar size={16} />
                    <span>{reviews[currentReview].tripDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="carousel-btn next"
              onClick={nextReview}
              aria-label="Next review"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            {reviews.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentReview ? 'active' : ''}`}
                onClick={() => goToReview(index)}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="trust-indicators">
          <div className="trust-item">
            <div className="trust-number">{Math.floor((overallStats.totalReviews || 2800) / 1000 * 10) / 10}K+</div>
            <div className="trust-label">Happy Travelers</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">{overallStats.averageRating || 4.8}</div>
            <div className="trust-label">Average Rating</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">150+</div>
            <div className="trust-label">Destinations</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">99%</div>
            <div className="trust-label">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ratings; 