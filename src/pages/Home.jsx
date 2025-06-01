import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Ratings from '../components/Ratings'
import './Home.css'

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const { isAuthenticated, user } = useAuth()
  
  const destinations = ['Bohol', 'Boracay', 'El Nido']
  const slides = [
    { image: '/images/DESTINATIONS/Bohol.jpg', alt: 'Bohol' },
    { image: '/images/DESTINATIONS/Boracay.jpg', alt: 'Boracay' },
    { image: '/images/DESTINATIONS/ELNIDO.jpg', alt: 'El Nido' }
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
              <h3>Continue planning your Philippine journey!</h3>
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

      {/* Ratings Section */}
      <Ratings />

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