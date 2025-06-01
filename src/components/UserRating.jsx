import React, { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import './UserRating.css';

const UserRating = ({ 
  destinationId, 
  destinationName, 
  existingRating = null,
  onSubmit,
  onCancel,
  isOpen = false,
  mode = 'modal' // 'modal' or 'inline'
}) => {
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    rating: existingRating?.rating || 0,
    title: existingRating?.title || '',
    review: existingRating?.review || '',
    wouldRecommend: existingRating?.wouldRecommend ?? true,
    visitDate: existingRating?.visitDate || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rating || formData.rating < 1) {
      newErrors.rating = 'Please provide a rating';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Please provide a title for your review';
    }

    if (!formData.review.trim()) {
      newErrors.review = 'Please write a review';
    } else if (formData.review.trim().length < 10) {
      newErrors.review = 'Review must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!isAuthenticated || !user) {
      alert('Please log in to submit a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData = {
        ...formData,
        destinationId,
        destinationName,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        submittedAt: new Date().toISOString(),
        verified: true // Could be based on actual visit verification
      };

      await onSubmit(ratingData);
      
      // Reset form if this is a new rating
      if (!existingRating) {
        setFormData({
          rating: 0,
          title: '',
          review: '',
          wouldRecommend: true,
          visitDate: ''
        });
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCancel = () => {
    if (existingRating) {
      // Reset to existing values
      setFormData({
        rating: existingRating.rating,
        title: existingRating.title,
        review: existingRating.review,
        wouldRecommend: existingRating.wouldRecommend,
        visitDate: existingRating.visitDate
      });
    } else {
      // Reset to empty
      setFormData({
        rating: 0,
        title: '',
        review: '',
        wouldRecommend: true,
        visitDate: ''
      });
    }
    setErrors({});
    onCancel?.();
  };

  if (!isAuthenticated) {
    return (
      <div className="rating-login-prompt">
        <p>Please log in to rate this destination</p>
      </div>
    );
  }

  if (!isOpen && mode === 'modal') {
    return null;
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="user-rating-form">
      <div className="form-header">
        <h3>Rate {destinationName}</h3>
        {mode === 'modal' && (
          <button 
            type="button" 
            className="close-btn"
            onClick={handleCancel}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="user-info">
        <img src={user.avatar} alt={user.name} className="user-avatar" />
        <div>
          <p className="user-name">{user.name}</p>
          <p className="rating-prompt">Share your experience</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Overall Rating <span className="required">*</span>
        </label>
        <StarRating
          rating={formData.rating}
          size={32}
          interactive={true}
          onRatingChange={(rating) => handleInputChange('rating', rating)}
          className="rating-input-large"
        />
        {errors.rating && <span className="error-text">{errors.rating}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="visit-date" className="form-label">
          When did you visit?
        </label>
        <input
          type="month"
          id="visit-date"
          value={formData.visitDate}
          onChange={(e) => handleInputChange('visitDate', e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="review-title" className="form-label">
          Review Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="review-title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Summarize your experience..."
          className={`form-input ${errors.title ? 'error' : ''}`}
          maxLength={100}
        />
        {errors.title && <span className="error-text">{errors.title}</span>}
        <div className="char-count">{formData.title.length}/100</div>
      </div>

      <div className="form-group">
        <label htmlFor="review-text" className="form-label">
          Your Review <span className="required">*</span>
        </label>
        <textarea
          id="review-text"
          value={formData.review}
          onChange={(e) => handleInputChange('review', e.target.value)}
          placeholder="Tell others about your experience. What did you love? What could be improved?"
          className={`form-textarea ${errors.review ? 'error' : ''}`}
          rows={4}
          maxLength={1000}
        />
        {errors.review && <span className="error-text">{errors.review}</span>}
        <div className="char-count">{formData.review.length}/1000</div>
      </div>

      <div className="form-group">
        <div className="recommendation-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.wouldRecommend}
              onChange={(e) => handleInputChange('wouldRecommend', e.target.checked)}
              className="checkbox-input"
            />
            <span className="checkbox-custom"></span>
            I would recommend this destination to others
          </label>
        </div>
      </div>

      <div className="form-actions">
        {mode === 'inline' && (
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? (
            <>
              <div className="spinner" />
              Submitting...
            </>
          ) : (
            <>
              <Send size={16} />
              {existingRating ? 'Update Review' : 'Submit Review'}
            </>
          )}
        </button>
      </div>
    </form>
  );

  if (mode === 'modal') {
    return (
      <div className="rating-modal-overlay">
        <div className="rating-modal">
          {formContent}
        </div>
      </div>
    );
  }

  return <div className="rating-inline">{formContent}</div>;
};

export default UserRating; 