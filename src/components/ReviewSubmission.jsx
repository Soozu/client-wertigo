import React, { useState } from 'react';
import { Star, MapPin, Send, X } from 'lucide-react';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ReviewSubmission.css';

const ReviewSubmission = ({ isOpen, onClose, onReviewSubmitted }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  const [formData, setFormData] = useState({
    tripId: '',
    reviewerName: user?.name || '',
    rating: 0,
    reviewText: '',
    email: user?.email || '',
    destination: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.reviewerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!formData.rating) {
      setError('Please select a rating');
      return;
    }
    
    if (!formData.reviewText.trim() || formData.reviewText.length < 10) {
      setError('Please write a review of at least 10 characters');
      return;
    }

    if (!formData.destination.trim()) {
      setError('Please enter the destination you visited');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create a trip ID for the review (using destination + timestamp)
      const tripId = `review-${Date.now()}-${formData.destination.toLowerCase().replace(/\s+/g, '-')}`;
      
      const reviewData = {
        tripId: tripId,
        reviewerName: formData.reviewerName.trim(),
        rating: formData.rating,
        reviewText: formData.reviewText.trim(),
        destination: formData.destination.trim(),
        email: formData.email.trim() || null
      };

      const result = await reviewsAPI.createReview(reviewData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onReviewSubmitted && onReviewSubmitted(result.review);
          handleClose();
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      tripId: '',
      reviewerName: user?.name || '',
      rating: 0,
      reviewText: '',
      email: user?.email || '',
      destination: ''
    });
    setHoveredRating(0);
    setError('');
    setSuccess(false);
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-btn ${i <= (hoveredRating || formData.rating) ? 'filled' : 'empty'}`}
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          disabled={isSubmitting}
        >
          <Star size={24} fill={i <= (hoveredRating || formData.rating) ? '#ffd700' : 'none'} />
        </button>
      );
    }
    return stars;
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <div className="review-modal-header">
          <h2>Share Your Travel Experience</h2>
          <button 
            className="close-btn"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {success ? (
          <div className="success-state">
            <div className="success-icon">✅</div>
            <h3>Thank You!</h3>
            <p>Your review has been submitted successfully and will be visible after approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group">
              <label htmlFor="reviewerName" className="form-label">
                Your Name *
              </label>
              <input
                type="text"
                id="reviewerName"
                name="reviewerName"
                value={formData.reviewerName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your name"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination" className="form-label">
                <MapPin size={18} />
                Destination Visited *
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., Tagaytay, Naic, Ternate"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Rating *
              </label>
              <div className="rating-input">
                {renderStars()}
                <span className="rating-text">
                  {formData.rating > 0 && (
                    <>
                      {formData.rating} out of 5 stars
                      {formData.rating === 5 && ' - Excellent!'}
                      {formData.rating === 4 && ' - Very Good!'}
                      {formData.rating === 3 && ' - Good'}
                      {formData.rating === 2 && ' - Fair'}
                      {formData.rating === 1 && ' - Poor'}
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reviewText" className="form-label">
                Your Review *
              </label>
              <textarea
                id="reviewText"
                name="reviewText"
                value={formData.reviewText}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Share your experience... What did you love about your trip? Any recommendations for other travelers?"
                rows={4}
                disabled={isSubmitting}
                required
                minLength={10}
                maxLength={2000}
              />
              <div className="character-count">
                {formData.reviewText.length}/2000 characters
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !formData.reviewerName.trim() || !formData.rating || !formData.reviewText.trim() || !formData.destination.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewSubmission; 