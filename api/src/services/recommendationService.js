/**
 * 🎓 STUDYSPOT - Smart Recommendations Engine
 * Phase 5: AI-Powered Features
 * 
 * This service provides personalized library recommendations based on:
 * - User booking history
 * - User preferences (location, amenities, price)
 * - Similar user patterns (collaborative filtering)
 * - Library popularity and ratings
 * - Time and day patterns
 */

class RecommendationService {
  /**
   * Get personalized library recommendations for a user
   * @param {Object} user - User object with id and preferences
   * @param {Array} libraries - Available libraries
   * @param {Array} userBookings - User's booking history
   * @param {Object} options - Recommendation options
   * @returns {Array} Sorted array of recommended libraries with scores
   */
  getPersonalizedRecommendations(user, libraries, userBookings = [], options = {}) {
    const {
      limit = 5,
      minScore = 0.3,
      includeExplanation = true
    } = options;

    // Calculate scores for each library
    const scoredLibraries = libraries.map(library => {
      const score = this.calculateLibraryScore(user, library, userBookings);
      const explanation = includeExplanation 
        ? this.generateExplanation(user, library, score)
        : null;

      return {
        ...library,
        recommendationScore: score,
        explanation,
        matchReasons: this.getMatchReasons(user, library, userBookings)
      };
    });

    // Sort by score and filter by minimum score
    const recommendations = scoredLibraries
      .filter(lib => lib.recommendationScore >= minScore)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);

    return recommendations;
  }

  /**
   * Calculate recommendation score for a library
   * Uses weighted scoring across multiple factors
   */
  calculateLibraryScore(user, library, userBookings) {
    let score = 0;
    
    // 1. Location preference (25% weight)
    score += this.locationScore(user, library) * 0.25;
    
    // 2. Price preference (20% weight)
    score += this.priceScore(user, library) * 0.20;
    
    // 3. Amenities match (20% weight)
    score += this.amenitiesScore(user, library) * 0.20;
    
    // 4. Past booking patterns (15% weight)
    score += this.historyScore(user, library, userBookings) * 0.15;
    
    // 5. Library rating and popularity (10% weight)
    score += this.popularityScore(library) * 0.10;
    
    // 6. Availability (10% weight)
    score += this.availabilityScore(library) * 0.10;

    return Math.min(score, 1.0); // Normalize to 0-1
  }

  /**
   * Location-based scoring
   */
  locationScore(user, library) {
    // Prefer libraries in user's preferred city
    if (user.preferredCity && library.city.toLowerCase() === user.preferredCity.toLowerCase()) {
      return 1.0;
    }
    
    // Check if user has booked in this city before
    if (user.visitedCities && user.visitedCities.includes(library.city)) {
      return 0.7;
    }
    
    // Default score for new cities
    return 0.3;
  }

  /**
   * Price-based scoring
   */
  priceScore(user, library) {
    const dailyPrice = library.pricing?.daily || 0;
    const userBudget = user.maxBudget || 500; // Default budget ₹500
    
    if (dailyPrice === 0) return 0.5;
    
    // Perfect match if within budget
    if (dailyPrice <= userBudget * 0.8) {
      return 1.0;
    }
    
    // Good match if close to budget
    if (dailyPrice <= userBudget) {
      return 0.8;
    }
    
    // Lower score if over budget
    if (dailyPrice <= userBudget * 1.2) {
      return 0.5;
    }
    
    return 0.2;
  }

  /**
   * Amenities-based scoring
   */
  amenitiesScore(user, library) {
    const userPreferences = user.preferredAmenities || [];
    const libraryAmenities = library.amenities || [];
    
    if (userPreferences.length === 0) {
      return 0.5; // Neutral score if no preferences
    }
    
    const matchedAmenities = userPreferences.filter(pref => 
      libraryAmenities.some(amenity => 
        amenity.toLowerCase().includes(pref.toLowerCase())
      )
    );
    
    return matchedAmenities.length / userPreferences.length;
  }

  /**
   * Booking history-based scoring
   */
  historyScore(user, library, userBookings) {
    if (!userBookings || userBookings.length === 0) {
      return 0.5; // Neutral score for new users
    }
    
    // Count bookings at this library
    const libraryBookings = userBookings.filter(b => b.libraryId === library.id);
    
    if (libraryBookings.length > 0) {
      // User has visited before - high score
      return 0.9;
    }
    
    // Check for similar libraries (same city, similar price range)
    const similarBookings = userBookings.filter(b => {
      const bookingLib = b.library || {};
      return bookingLib.city === library.city ||
             Math.abs((bookingLib.pricing?.daily || 0) - (library.pricing?.daily || 0)) < 100;
    });
    
    return similarBookings.length > 0 ? 0.6 : 0.3;
  }

  /**
   * Popularity and rating score
   */
  popularityScore(library) {
    const rating = library.rating || 0;
    const totalReviews = library.totalReviews || 0;
    
    // Normalize rating (0-5 to 0-1)
    const ratingScore = rating / 5;
    
    // Boost for popular libraries (many reviews)
    const popularityBoost = Math.min(totalReviews / 100, 1);
    
    return (ratingScore * 0.7) + (popularityBoost * 0.3);
  }

  /**
   * Availability-based scoring
   */
  availabilityScore(library) {
    const capacity = library.capacity || 100;
    const availableSeats = library.availableSeats || 0;
    
    if (capacity === 0) return 0;
    
    const occupancyRate = (capacity - availableSeats) / capacity;
    
    // Prefer libraries with good availability (30-70% occupied)
    if (occupancyRate >= 0.3 && occupancyRate <= 0.7) {
      return 1.0;
    }
    
    // Low occupancy might mean less popular
    if (occupancyRate < 0.3) {
      return 0.7;
    }
    
    // High occupancy - might be difficult to book
    return 0.5;
  }

  /**
   * Generate human-readable explanation for recommendation
   */
  generateExplanation(user, library, score) {
    if (score >= 0.8) {
      return `Perfect match! This library aligns with your preferences for ${library.city} and offers ${library.amenities?.slice(0, 2).join(', ')}.`;
    }
    
    if (score >= 0.6) {
      return `Great option! Highly rated (${library.rating}⭐) with good availability.`;
    }
    
    if (score >= 0.4) {
      return `Worth considering! Located in ${library.city} with ${library.capacity} seats.`;
    }
    
    return `Alternative option in ${library.city}.`;
  }

  /**
   * Get specific match reasons
   */
  getMatchReasons(user, library, userBookings) {
    const reasons = [];
    
    // Location match
    if (user.preferredCity && library.city.toLowerCase() === user.preferredCity.toLowerCase()) {
      reasons.push('In your preferred city');
    }
    
    // Price match
    const dailyPrice = library.pricing?.daily || 0;
    const userBudget = user.maxBudget || 500;
    if (dailyPrice <= userBudget) {
      reasons.push('Within your budget');
    }
    
    // High rating
    if (library.rating >= 4.5) {
      reasons.push(`Excellent rating (${library.rating}⭐)`);
    }
    
    // Previous visits
    const libraryBookings = userBookings.filter(b => b.libraryId === library.id);
    if (libraryBookings.length > 0) {
      reasons.push('You\'ve visited before');
    }
    
    // Good availability
    const availabilityRate = (library.availableSeats / library.capacity) * 100;
    if (availabilityRate > 30) {
      reasons.push(`${Math.round(availabilityRate)}% available`);
    }
    
    // Amenities
    const userPreferences = user.preferredAmenities || [];
    if (userPreferences.length > 0) {
      const matches = userPreferences.filter(pref => 
        library.amenities?.some(a => a.toLowerCase().includes(pref.toLowerCase()))
      );
      if (matches.length > 0) {
        reasons.push(`Has ${matches[0]}`);
      }
    }
    
    return reasons;
  }

  /**
   * Get trending libraries based on recent booking patterns
   */
  getTrendingLibraries(libraries, recentBookings, limit = 5) {
    // Count bookings per library in last 7 days
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    const libraryCounts = {};
    recentBookings
      .filter(b => new Date(b.createdAt) > weekAgo)
      .forEach(booking => {
        libraryCounts[booking.libraryId] = (libraryCounts[booking.libraryId] || 0) + 1;
      });
    
    // Sort libraries by booking count
    return libraries
      .map(lib => ({
        ...lib,
        trendingScore: libraryCounts[lib.id] || 0
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);
  }

  /**
   * Get similar libraries (content-based filtering)
   */
  getSimilarLibraries(targetLibrary, allLibraries, limit = 5) {
    const similarities = allLibraries
      .filter(lib => lib.id !== targetLibrary.id)
      .map(lib => ({
        ...lib,
        similarityScore: this.calculateSimilarity(targetLibrary, lib)
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
    
    return similarities;
  }

  /**
   * Calculate similarity between two libraries
   */
  calculateSimilarity(lib1, lib2) {
    let score = 0;
    
    // Same city (high weight)
    if (lib1.city === lib2.city) {
      score += 0.4;
    }
    
    // Similar price range
    const priceDiff = Math.abs((lib1.pricing?.daily || 0) - (lib2.pricing?.daily || 0));
    if (priceDiff < 50) {
      score += 0.3;
    } else if (priceDiff < 100) {
      score += 0.15;
    }
    
    // Similar rating
    const ratingDiff = Math.abs((lib1.rating || 0) - (lib2.rating || 0));
    if (ratingDiff < 0.5) {
      score += 0.2;
    }
    
    // Common amenities
    const amenities1 = lib1.amenities || [];
    const amenities2 = lib2.amenities || [];
    const commonAmenities = amenities1.filter(a => amenities2.includes(a));
    score += (commonAmenities.length / Math.max(amenities1.length, amenities2.length)) * 0.1;
    
    return score;
  }
}

module.exports = new RecommendationService();



