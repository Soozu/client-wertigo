import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { reviewsAPI } from '../services/api'
import Header from '../components/Header'
import ReviewSubmission from '../components/ReviewSubmission'
import { Star, ChevronLeft, ChevronRight, Quote, MapPin, Calendar } from 'lucide-react'
import './Home.css'

const Home = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [currentReview, setCurrentReview] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [reviews, setReviews] = useState([])
  const [overallStats, setOverallStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const { isAuthenticated, user } = useAuth()
  
  const destinations = ['Caynipa Cove', 'Balite Falls', 'Sky Ranch']
  const slides = [
    { image: '/images/DESTINATIONS/CAYNIPA.jpg', alt: 'Caynipa' },
    { image: '/images/DESTINATIONS/BALITE.jpg', alt: 'Balite' },
    { image: '/images/DESTINATIONS/SKYRANCH.jpg', alt: 'Sky' }
  ]

  const teamMembers = [
    {
      name: 'Christian Gabrielle B. Dalida',
      image: '/images/GAB.jpg',
      description: 'I am Christian Gabrielle B. Dalida, a 4th year Computer Science student from Cavite State University - Imus. I grew up surrounded by technology, which explains my passion for it. I am interested in developing software, AI, and data analytics. Though I\'m open to anything inline with Computer Science, and there isn\'t anything I can\'t learn!'
    },
    {
      name: 'Eduard Florence G. Domingo',
      image: '/images/ED.jpg',
      description: 'I am Eduard Florence G. Domingo, a 4th year Computer Science student from Cavite State University - Imus campus. I am born on September 26, 2002. I love to fiddle around technologies that\'s why I chose this course, to explore more things that I didn\'t get a chance to learn. I am that kind of person who wants to learn something new especially that is aligned with my course.'
    },
    {
      name: 'Matthew Daniel A. Sadaba',
      image: '/images/MATT.jpg',
      description: 'I am Matthew Daniel A. Sadaba, a 4th year Computer Science student from Cavite State University - Imus campus. I love to fiddle around technologies that\'s why I chose this course, to explore more things that I didn\'t get a chance to learn. I am that kind of person who wants to learn something new especially that is aligned with my course.'
    }
  ]

  // Mock data as fallback
  const mockReviews = [
    {
      id: 1,
      name: "Maria Santos",
      location: "Manila, Philippines",
      avatar: "https://ui-avatars.com/api/?name=Maria+Santos&background=1da1f2&color=fff&size=150",
      rating: 5,
      title: "Amazing Experience!",
      review: "WerTigo helped me plan the perfect trip to Palawan! The AI recommendations were spot-on and I discovered hidden gems I never would have found otherwise. Highly recommended!",
      destination: "Palawan",
      tripDate: "November 2023",
      verified: true
    },
    {
      id: 2,
      name: "John Dela Cruz",
      location: "Cebu, Philippines",
      avatar: "https://ui-avatars.com/api/?name=John+Dela+Cruz&background=2e7d32&color=fff&size=150",
      rating: 4,
      title: "Great Trip Planning",
      review: "The platform made it so easy to organize my family vacation to Bohol. The route optimization saved us so much time, and the kids loved all the activities suggested by the AI.",
      destination: "Bohol",
      tripDate: "October 2023",
      verified: true
    },
    {
      id: 3,
      name: "Sarah Johnson",
      location: "Davao, Philippines",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=e91e63&color=fff&size=150",
      rating: 5,
      title: "Perfect for Solo Travel",
      review: "As a solo female traveler, WerTigo gave me the confidence to explore Siargao safely. The detailed itineraries and local insights were invaluable!",
      destination: "Siargao",
      tripDate: "December 2023",
      verified: true
    }
  ];

  const mockStats = {
    totalReviews: 1247,
    averageRating: 4.8,
    ratingDistribution: [
      { stars: 5, count: 892, percentage: 72 },
      { stars: 4, count: 249, percentage: 20 },
      { stars: 3, count: 75, percentage: 6 },
      { stars: 2, count: 19, percentage: 1 },
      { stars: 1, count: 12, percentage: 1 }
    ]
  };

  // Fetch reviews data
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await reviewsAPI.getPlatformStats(6); // Get 6 reviews for display
        
        if (result.success) {
          setReviews(result.reviews || []);
          setOverallStats(result.stats || {});
        } else {
          throw new Error('Failed to fetch reviews');
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err.message);
        // Use mock data as fallback
        setReviews(mockReviews);
        setOverallStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-play reviews carousel
  useEffect(() => {
    if (!isAutoPlaying || reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  // Slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [slides.length])

  // Typing effect
  useEffect(() => {
    const currentDestination = destinations[currentDestinationIndex]
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing forward
        if (typedText.length < currentDestination.length) {
          setTypedText(currentDestination.substring(0, typedText.length + 1))
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        // Deleting backward
        if (typedText.length > 0) {
          setTypedText(currentDestination.substring(0, typedText.length - 1))
        } else {
          // Finished deleting, move to next destination
          setIsDeleting(false)
          setCurrentDestinationIndex((prev) => (prev + 1) % destinations.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [typedText, isDeleting, currentDestinationIndex, destinations])

  const handleReviewSubmitted = async (newReview) => {
    console.log('New review submitted:', newReview);
    
    // Refresh reviews data after submission
    try {
      const result = await reviewsAPI.getPlatformStats(6);
      if (result.success) {
        setReviews(result.reviews || []);
        setOverallStats(result.stats || {});
      }
    } catch (err) {
      console.error('Error refreshing reviews:', err);
    }
  };

  const nextReview = () => {
    if (reviews.length === 0) return;
    setCurrentReview((prev) => (prev + 1) % reviews.length);
    setIsAutoPlaying(false);
  };

  const prevReview = () => {
    if (reviews.length === 0) return;
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
    setIsAutoPlaying(false);
  };

  const handleShareExperienceClick = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleLoginRedirect = () => {
    setShowLoginPrompt(false)
    navigate('/login')
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={20}
        className={`star ${index < rating ? 'filled' : 'empty'}`}
        fill={index < rating ? '#ffd700' : 'none'}
        stroke={index < rating ? '#ffd700' : '#ddd'}
      />
    ));
  };

  return (
    <div className="home-page">
      <Header />
      
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: `url(${slides[currentSlide].image})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content fade-in">
          {isAuthenticated && user ? (
            <>
              <h1>Welcome back, {user.name}!</h1>
              <h1>Ready for your next adventure?</h1>
              <h3>Continue planning your journey!</h3>
              <br />
              <h3>Explore amazing places like <span className="typed-text">{typedText}</span>?</h3>
              
              <Link to="/planner" className="btn hero-btn">
                Continue Planning
              </Link>
            </>
          ) : (
            <>
          <h1>I am WerTigo,</h1>
          <h1>your travel planning buddy!</h1>
          <h3>Where do you want to go?</h3>
          <br />
          <h3>Do you want to go in <span className="typed-text">{typedText}</span>?</h3>
          
              <Link to="/login" className="btn hero-btn">
            Let's plan a trip!!
          </Link>
            </>
          )}
        </div>

        {/* Slide indicators */}
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`slide-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="container">
          <h2 className="section-title">About <span>Us</span></h2>
          
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member fade-in">
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <h3 className="member-name">{member.name}</h3>
                <p className="member-description">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="ratings-section">
        <div className="container">
          <div className="ratings-header">
            <h2 className="section-title">What Our <span>Travelers</span> Say</h2>
            <button 
              className="share-experience-btn"
              onClick={handleShareExperienceClick}
            >
              {isAuthenticated ? 'Share Your Experience' : 'Login to Share Experience'}
            </button>
          </div>

          {loading ? (
            <div className="reviews-loading">
              <div className="loading-spinner"></div>
              <p>Loading reviews...</p>
            </div>
          ) : error && reviews.length === 0 ? (
            <div className="reviews-error">
              <p>Unable to load reviews. Please try again later.</p>
            </div>
          ) : (
            <div className="reviews-container">
              {/* Overall Statistics */}
              <div className="reviews-stats">
                <div className="stats-overview">
                  <div className="overall-rating">
                    <div className="rating-number">{overallStats.averageRating || 4.8}</div>
                    <div className="rating-stars">
                      {renderStars(Math.round(overallStats.averageRating || 4.8))}
                    </div>
                    <div className="rating-text">
                      Based on {overallStats.totalReviews || 0} reviews
                    </div>
                  </div>
                  
                  <div className="rating-breakdown">
                    {(overallStats.ratingDistribution || mockStats.ratingDistribution).map((item) => (
                      <div key={item.stars} className="rating-bar">
                        <span className="stars">{item.stars} ★</span>
                        <div className="bar">
                          <div 
                            className="fill" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="percentage">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews Carousel */}
              {reviews.length > 0 && (
                <div className="reviews-carousel">
                  <div className="carousel-container">
                    {reviews.length > 1 && (
                      <>
                        <button 
                          className="carousel-btn prev" 
                          onClick={prevReview}
                          aria-label="Previous review"
                          disabled={reviews.length <= 1}
                        >
                          <ChevronLeft size={24} />
                        </button>

                        <button 
                          className="carousel-btn next" 
                          onClick={nextReview}
                          aria-label="Next review"
                          disabled={reviews.length <= 1}
                        >
                          <ChevronRight size={24} />
                        </button>
                      </>
                    )}

                    <div className="review-cards">
                      {reviews.map((review, index) => (
                        <div
                          key={review.id}
                          className={`review-card ${index === currentReview ? 'active' : ''}`}
                          style={{
                            transform: `translateX(${(index - currentReview) * 100}%)`,
                            opacity: index === currentReview ? 1 : 0.7
                          }}
                        >
                          <div className="review-header">
                            <img 
                              src={review.avatar} 
                              alt={review.name}
                              className="reviewer-avatar"
                            />
                            <div className="reviewer-info">
                              <h4 className="reviewer-name">{review.name}</h4>
                              <div className="reviewer-location">
                                <MapPin size={14} />
                                {review.location}
                              </div>
                              {review.verified && (
                                <span className="verified-badge">✓ Verified Traveler</span>
                              )}
                            </div>
                          </div>

                          <div className="review-rating">
                            {renderStars(review.rating)}
                            <span className="review-title">{review.title}</span>
                          </div>

                          <div className="review-content">
                            <Quote className="quote-icon" size={20} />
                            <p>{review.review}</p>
                          </div>

                          <div className="review-footer">
                            <div className="trip-info">
                              <MapPin size={14} />
                              <span>Visited {review.destination}</span>
                            </div>
                            <div className="trip-date">
                              <Calendar size={14} />
                              <span>{review.tripDate}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Carousel Indicators */}
                  {reviews.length > 1 && (
                    <div className="carousel-indicators">
                      {reviews.map((_, index) => (
                        <button
                          key={index}
                          className={`indicator ${index === currentReview ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentReview(index);
                            setIsAutoPlaying(false);
                          }}
                          aria-label={`Go to review ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section for Unauthenticated Users */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Start Your Philippine Adventure?</h2>
              <p>Join WerTigo today and discover the most beautiful destinations across the Philippines with AI-powered recommendations!</p>
              <div className="cta-buttons">
                <Link to="/login" className="btn cta-primary">
                  Get Started Free
                </Link>
                <Link to="#about" className="btn cta-secondary">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="review-modal-overlay">
          <div className="review-modal login-prompt-modal">
            <div className="review-modal-header">
              <h2>Login Required</h2>
              <button 
                className="close-btn"
                onClick={() => setShowLoginPrompt(false)}
              >
                ×
              </button>
            </div>
            <div className="login-prompt-content">
              <p>You need to be logged in to share your travel experience and help other travelers!</p>
              <div className="login-prompt-buttons">
                <button 
                  className="btn cta-primary"
                  onClick={handleLoginRedirect}
                >
                  Go to Login
                </button>
                <button 
                  className="btn cta-secondary"
                  onClick={() => setShowLoginPrompt(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {isAuthenticated && (
        <ReviewSubmission 
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>Website created by Christian Gabrielle Dalida</p>
            <a href="#" className="back-to-top">
              <i className="fa-solid fa-angle-up"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home 