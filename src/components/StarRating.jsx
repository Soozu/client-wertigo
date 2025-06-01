import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './StarRating.css';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 20, 
  interactive = false, 
  onRatingChange = null,
  showValue = true,
  precision = 1, // 1 = whole stars, 0.5 = half stars, 0.1 = decimal
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [tempRating, setTempRating] = useState(rating);

  const handleStarClick = (starValue) => {
    if (!interactive || !onRatingChange) return;
    
    setTempRating(starValue);
    onRatingChange(starValue);
  };

  const handleStarHover = (starValue) => {
    if (!interactive) return;
    setHoverRating(starValue);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(0);
  };

  const getStarFill = (starIndex) => {
    const currentRating = interactive && hoverRating > 0 ? hoverRating : (interactive ? tempRating : rating);
    
    if (starIndex <= currentRating) {
      return 'full';
    } else if (starIndex - 0.5 <= currentRating && precision <= 0.5) {
      return 'half';
    }
    return 'empty';
  };

  const renderStar = (starIndex) => {
    const fillType = getStarFill(starIndex);
    const isClickable = interactive;

    return (
      <button
        key={starIndex}
        type="button"
        className={`star-button ${fillType} ${isClickable ? 'clickable' : ''}`}
        onClick={() => handleStarClick(starIndex)}
        onMouseEnter={() => handleStarHover(starIndex)}
        disabled={!isClickable}
        aria-label={`Rate ${starIndex} out of ${maxRating} stars`}
      >
        <Star
          size={size}
          className={`star-icon ${fillType}`}
          fill={fillType === 'empty' ? 'none' : '#ffd700'}
        />
        {fillType === 'half' && (
          <div className="star-half-overlay">
            <Star
              size={size}
              className="star-icon half-fill"
              fill="#ffd700"
            />
          </div>
        )}
      </button>
    );
  };

  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    stars.push(renderStar(i));
  }

  const displayRating = interactive && hoverRating > 0 ? hoverRating : (interactive ? tempRating : rating);

  return (
    <div 
      className={`star-rating ${interactive ? 'interactive' : ''} ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      <div className="stars-container">
        {stars}
      </div>
      {showValue && (
        <span className="rating-value">
          {displayRating.toFixed(precision === 1 ? 0 : 1)}
          {maxRating !== 5 && ` / ${maxRating}`}
        </span>
      )}
    </div>
  );
};

// Quick rating display component for read-only use
export const QuickRating = ({ rating, size = 16, showValue = true, className = '' }) => (
  <StarRating 
    rating={rating}
    size={size}
    interactive={false}
    showValue={showValue}
    className={`quick-rating ${className}`}
  />
);

// Rating input component for forms
export const RatingInput = ({ 
  value = 0, 
  onChange, 
  size = 24, 
  label = "Rating",
  required = false,
  error = null 
}) => {
  return (
    <div className="rating-input-wrapper">
      {label && (
        <label className="rating-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <StarRating
        rating={value}
        size={size}
        interactive={true}
        onRatingChange={onChange}
        showValue={true}
        className="rating-input"
      />
      {error && <span className="rating-error">{error}</span>}
    </div>
  );
};

export default StarRating; 