// Utility functions for handling destination images

/**
 * Get a random image path for a destination
 * @param {string} destinationName - The name of the destination
 * @returns {string} - The path to a random image for the destination
 */
export const getDestinationImage = (destinationName) => {
  // Encode the destination name to handle spaces and special characters
  const encodedName = encodeURIComponent(destinationName)
  // Generate random number between 1-3 for the image
  const randomImageNumber = Math.floor(Math.random() * 3) + 1
  // Return the image path
  return `/location/${encodedName}/${randomImageNumber}.jpg`
}

/**
 * Handle image loading errors with smart fallback
 * @param {Event} e - The error event
 * @param {string} destinationName - The name of the destination
 */
export const handleImageError = (e, destinationName) => {
  // Prevent infinite retry loops
  if (e.target.dataset.retryAttempted) {
    // Already tried fallback, use placeholder
    e.target.src = createPlaceholderImage(destinationName)
    e.target.alt = `${destinationName} - Image not available`
    console.warn(`No images available for destination: ${destinationName}`)
    return
  }

  // If the image fails to load, try a different random image first
  const currentSrc = e.target.src
  const imageNumber = currentSrc.match(/\/(\d)\.jpg$/)?.[1]
  
  if (imageNumber) {
    // Try the other available images (1, 2, or 3)
    const availableNumbers = ['1', '2', '3'].filter(num => num !== imageNumber)
    if (availableNumbers.length > 0) {
      const newNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)]
      const encodedName = encodeURIComponent(destinationName)
      e.target.dataset.retryAttempted = 'true'
      e.target.src = `/location/${encodedName}/${newNumber}.jpg`
      return
    }
  }
  
  // If all images fail or no match found, use a placeholder
  e.target.src = createPlaceholderImage(destinationName)
  e.target.alt = `${destinationName} - Image not available`
  console.warn(`No images available for destination: ${destinationName}`)
}

/**
 * Create a base64 encoded placeholder image
 * @param {string} destinationName - The name of the destination
 * @returns {string} - Base64 encoded SVG placeholder
 */
export const createPlaceholderImage = (destinationName) => {
  const text = destinationName.length > 20 ? 'No Image Available' : destinationName
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="14" fill="#999999" text-anchor="middle">${text}</text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="12" fill="#cccccc" text-anchor="middle">Image not available</text>
    </svg>
  `)}`
}

/**
 * Preload destination images to improve performance
 * @param {Array} destinations - Array of destination objects
 */
export const preloadDestinationImages = (destinations) => {
  destinations.forEach(destination => {
    if (destination.name) {
      // Preload all 3 possible images for each destination
      for (let i = 1; i <= 3; i++) {
        const img = new Image()
        const encodedName = encodeURIComponent(destination.name)
        img.src = `/location/${encodedName}/${i}.jpg`
        // No need to handle errors here, it's just preloading
      }
    }
  })
}

/**
 * Get destination image with specific number (1, 2, or 3)
 * @param {string} destinationName - The name of the destination
 * @param {number} imageNumber - The specific image number (1, 2, or 3)
 * @returns {string} - The path to the specific image
 */
export const getSpecificDestinationImage = (destinationName, imageNumber = 1) => {
  const encodedName = encodeURIComponent(destinationName)
  const imgNum = Math.max(1, Math.min(3, imageNumber)) // Ensure number is between 1-3
  return `/location/${encodedName}/${imgNum}.jpg`
} 