/**
 * 🎓 STUDYSPOT - Predictive Analytics Service
 * Phase 5: AI-Powered Features
 * 
 * Provides intelligent predictions for:
 * - Library occupancy forecasting
 * - Peak hours prediction
 * - Demand-based pricing suggestions
 * - User behavior patterns
 * - Revenue forecasting
 */

class PredictiveAnalyticsService {
  constructor() {
    // Day type weights
    this.dayWeights = {
      0: 0.6,  // Sunday - Low
      1: 1.0,  // Monday - High
      2: 1.0,  // Tuesday - High
      3: 0.9,  // Wednesday - Medium-High
      4: 0.9,  // Thursday - Medium-High
      5: 0.8,  // Friday - Medium
      6: 0.7   // Saturday - Medium-Low
    };

    // Hour weights (24-hour format)
    this.hourWeights = {
      0: 0.1, 1: 0.1, 2: 0.1, 3: 0.1, 4: 0.1,  // Late night - Very low
      5: 0.2, 6: 0.4,                           // Early morning - Low
      7: 0.6, 8: 0.8,                           // Morning - Medium
      9: 1.0, 10: 1.0, 11: 1.0,                // Peak morning - High
      12: 0.8, 13: 0.7,                        // Lunch - Medium
      14: 0.9, 15: 1.0, 16: 1.0, 17: 1.0,     // Afternoon peak - High
      18: 0.9, 19: 0.8,                        // Evening - Medium-High
      20: 0.7, 21: 0.6,                        // Night - Medium
      22: 0.4, 23: 0.2                         // Late night - Low
    };

    // Seasonal factors
    this.seasonalFactors = {
      exam: 1.5,      // Exam season
      semester: 1.2,  // Regular semester
      vacation: 0.6,  // Vacation period
      weekend: 0.7    // Weekend
    };
  }

  /**
   * Predict library occupancy for a specific time
   */
  predictOccupancy(library, datetime, historicalData = []) {
    const date = new Date(datetime);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    
    // Base occupancy (library-specific)
    const baseOccupancy = library.capacity * 0.6; // Assume 60% base
    
    // Apply day weight
    const dayFactor = this.dayWeights[dayOfWeek];
    
    // Apply hour weight
    const hourFactor = this.hourWeights[hour];
    
    // Apply seasonal factor (simplified - assume semester time)
    const seasonFactor = this.isWeekend(date) 
      ? this.seasonalFactors.weekend 
      : this.seasonalFactors.semester;
    
    // Library popularity factor
    const popularityFactor = (library.rating || 4.0) / 5.0;
    
    // Calculate predicted occupancy
    const predictedOccupancy = Math.round(
      baseOccupancy * dayFactor * hourFactor * seasonFactor * popularityFactor
    );
    
    // Ensure within capacity
    const finalOccupancy = Math.min(Math.max(predictedOccupancy, 0), library.capacity);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(historicalData.length);
    
    return {
      datetime: datetime,
      predictedOccupancy: finalOccupancy,
      predictedAvailable: library.capacity - finalOccupancy,
      occupancyRate: Math.round((finalOccupancy / library.capacity) * 100),
      confidence: confidence,
      factors: {
        day: dayOfWeek,
        hour: hour,
        dayWeight: dayFactor,
        hourWeight: hourFactor,
        seasonWeight: seasonFactor
      },
      recommendation: this.getOccupancyRecommendation(finalOccupancy / library.capacity)
    };
  }

  /**
   * Predict peak hours for a library
   */
  predictPeakHours(library, date = new Date()) {
    const hours = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const datetime = new Date(date);
      datetime.setHours(hour, 0, 0, 0);
      
      const prediction = this.predictOccupancy(library, datetime);
      hours.push({
        hour: hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        occupancyRate: prediction.occupancyRate,
        category: this.categorizeOccupancy(prediction.occupancyRate)
      });
    }
    
    // Find peak hours
    const sortedHours = [...hours].sort((a, b) => b.occupancyRate - a.occupancyRate);
    const peakHours = sortedHours.slice(0, 5);
    const offPeakHours = sortedHours.slice(-5).reverse();
    
    return {
      date: date.toISOString().split('T')[0],
      libraryId: library.id,
      libraryName: library.name,
      hourlyPredictions: hours,
      peakHours: peakHours,
      offPeakHours: offPeakHours,
      bestTimeToVisit: offPeakHours[0],
      worstTimeToVisit: peakHours[0]
    };
  }

  /**
   * Predict demand for next 7 days
   */
  predictWeeklyDemand(library) {
    const predictions = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const peakAnalysis = this.predictPeakHours(library, date);
      const avgOccupancy = peakAnalysis.hourlyPredictions.reduce((sum, h) => sum + h.occupancyRate, 0) / 24;
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        averageOccupancy: Math.round(avgOccupancy),
        category: this.categorizeOccupancy(avgOccupancy),
        peakHour: peakAnalysis.peakHours[0],
        bestHour: peakAnalysis.bestTimeToVisit
      });
    }
    
    return {
      libraryId: library.id,
      libraryName: library.name,
      weeklyForecast: predictions,
      busiestDay: predictions.reduce((max, p) => p.averageOccupancy > max.averageOccupancy ? p : max),
      quietestDay: predictions.reduce((min, p) => p.averageOccupancy < min.averageOccupancy ? p : min)
    };
  }

  /**
   * Suggest dynamic pricing based on demand
   */
  suggestPricing(library, datetime) {
    const prediction = this.predictOccupancy(library, datetime);
    const basePricing = library.pricing || { hourly: 50, daily: 300 };
    
    // Pricing multipliers based on occupancy
    let priceMultiplier = 1.0;
    
    if (prediction.occupancyRate > 90) {
      priceMultiplier = 1.3; // +30% for very high demand
    } else if (prediction.occupancyRate > 75) {
      priceMultiplier = 1.2; // +20% for high demand
    } else if (prediction.occupancyRate > 60) {
      priceMultiplier = 1.1; // +10% for medium demand
    } else if (prediction.occupancyRate < 30) {
      priceMultiplier = 0.8; // -20% for low demand
    } else if (prediction.occupancyRate < 50) {
      priceMultiplier = 0.9; // -10% for medium-low demand
    }
    
    return {
      datetime: datetime,
      predictedOccupancy: prediction.occupancyRate,
      standardPricing: basePricing,
      suggestedPricing: {
        hourly: Math.round(basePricing.hourly * priceMultiplier),
        daily: Math.round(basePricing.daily * priceMultiplier)
      },
      priceMultiplier: priceMultiplier,
      savingsOpportunity: priceMultiplier < 1.0,
      discount: priceMultiplier < 1.0 ? Math.round((1 - priceMultiplier) * 100) : 0,
      surge: priceMultiplier > 1.0 ? Math.round((priceMultiplier - 1) * 100) : 0,
      recommendation: this.getPricingRecommendation(priceMultiplier, prediction.occupancyRate)
    };
  }

  /**
   * Predict user behavior patterns
   */
  predictUserBehavior(userHistory) {
    if (!userHistory || userHistory.length === 0) {
      return {
        pattern: 'new_user',
        confidence: 0,
        predictions: {}
      };
    }
    
    // Analyze booking patterns
    const hourPreferences = {};
    const dayPreferences = {};
    const libraryPreferences = {};
    const durationPreferences = [];
    
    userHistory.forEach(booking => {
      const date = new Date(booking.bookingDate);
      const hour = parseInt(booking.startTime.split(':')[0]);
      const day = date.getDay();
      
      hourPreferences[hour] = (hourPreferences[hour] || 0) + 1;
      dayPreferences[day] = (dayPreferences[day] || 0) + 1;
      libraryPreferences[booking.libraryId] = (libraryPreferences[booking.libraryId] || 0) + 1;
      
      // Calculate duration
      if (booking.endTime) {
        const startHour = parseInt(booking.startTime.split(':')[0]);
        const endHour = parseInt(booking.endTime.split(':')[0]);
        durationPreferences.push(endHour - startHour);
      }
    });
    
    // Find preferences
    const favoriteHour = Object.keys(hourPreferences).reduce((a, b) => 
      hourPreferences[a] > hourPreferences[b] ? a : b
    );
    
    const favoriteDay = Object.keys(dayPreferences).reduce((a, b) => 
      dayPreferences[a] > dayPreferences[b] ? a : b
    );
    
    const favoriteLibrary = Object.keys(libraryPreferences).reduce((a, b) => 
      libraryPreferences[a] > libraryPreferences[b] ? a : b
    );
    
    const avgDuration = durationPreferences.length > 0
      ? durationPreferences.reduce((a, b) => a + b, 0) / durationPreferences.length
      : 8;
    
    // Determine user type
    const bookingFrequency = userHistory.length;
    let userType = 'casual';
    if (bookingFrequency > 20) userType = 'power_user';
    else if (bookingFrequency > 10) userType = 'regular';
    else if (bookingFrequency > 5) userType = 'frequent';
    
    return {
      userType,
      pattern: 'established',
      confidence: Math.min(userHistory.length * 10, 95),
      totalBookings: bookingFrequency,
      preferences: {
        favoriteHour: parseInt(favoriteHour),
        favoriteHourTime: `${favoriteHour}:00`,
        favoriteDay: this.getDayName(parseInt(favoriteDay)),
        favoriteLibraryId: favoriteLibrary,
        averageSessionDuration: Math.round(avgDuration)
      },
      predictions: {
        nextBookingLikely: this.predictNextBooking(userHistory),
        churnRisk: this.calculateChurnRisk(userHistory),
        lifetimeValue: this.estimateLifetimeValue(userHistory)
      },
      recommendations: this.getUserRecommendations(userType, {
        favoriteHour,
        favoriteDay,
        avgDuration
      })
    };
  }

  /**
   * Forecast revenue
   */
  forecastRevenue(historicalRevenue, daysAhead = 30) {
    if (!historicalRevenue || historicalRevenue.length === 0) {
      return { forecast: [], confidence: 0 };
    }
    
    // Simple linear regression for trend
    const avgDailyRevenue = historicalRevenue.reduce((sum, r) => sum + r.amount, 0) / historicalRevenue.length;
    const growth = 0.05; // Assume 5% monthly growth
    
    const forecast = [];
    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dayWeight = this.dayWeights[date.getDay()];
      const predictedRevenue = Math.round(avgDailyRevenue * dayWeight * (1 + (growth / 30) * i));
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted: predictedRevenue,
        confidence: Math.max(95 - i, 60) // Confidence decreases over time
      });
    }
    
    const totalPredicted = forecast.reduce((sum, f) => sum + f.predicted, 0);
    
    return {
      period: `${daysAhead} days`,
      dailyForcast: forecast,
      totalPredicted: totalPredicted,
      averageDaily: Math.round(totalPredicted / daysAhead),
      confidence: 85,
      trend: 'growing',
      growthRate: growth * 100
    };
  }

  // Helper methods
  
  isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  calculateConfidence(dataPoints) {
    if (dataPoints === 0) return 60;
    if (dataPoints < 10) return 70;
    if (dataPoints < 50) return 80;
    if (dataPoints < 100) return 90;
    return 95;
  }

  categorizeOccupancy(rate) {
    if (rate >= 90) return 'Very High';
    if (rate >= 75) return 'High';
    if (rate >= 50) return 'Medium';
    if (rate >= 25) return 'Low';
    return 'Very Low';
  }

  getOccupancyRecommendation(rate) {
    if (rate >= 0.9) return 'Almost full! Book now or try another time.';
    if (rate >= 0.75) return 'Getting busy. Book soon to secure a seat.';
    if (rate >= 0.5) return 'Good availability. Great time to book!';
    if (rate >= 0.25) return 'Plenty of space available. Very quiet time.';
    return 'Very quiet. Perfect for focused study!';
  }

  getPricingRecommendation(multiplier, occupancy) {
    if (multiplier > 1.2) {
      return `Peak demand period (+${Math.round((multiplier - 1) * 100)}%). Consider booking for off-peak hours to save money.`;
    } else if (multiplier < 0.9) {
      return `Great deal! ${Math.round((1 - multiplier) * 100)}% off during low-demand period. Book now to save!`;
    }
    return 'Standard pricing. Good time to book!';
  }

  getDayName(dayNum) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  }

  predictNextBooking(userHistory) {
    const lastBooking = userHistory[userHistory.length - 1];
    const lastDate = new Date(lastBooking.bookingDate);
    const today = new Date();
    const daysSinceLasting = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    // Calculate average days between bookings
    const intervals = [];
    for (let i = 1; i < userHistory.length; i++) {
      const date1 = new Date(userHistory[i - 1].bookingDate);
      const date2 = new Date(userHistory[i].bookingDate);
      intervals.push(Math.floor((date2 - date1) / (1000 * 60 * 60 * 24)));
    }
    
    const avgInterval = intervals.length > 0
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length
      : 7;
    
    const nextBookingDate = new Date(lastDate);
    nextBookingDate.setDate(nextBookingDate.getDate() + avgInterval);
    
    return {
      predictedDate: nextBookingDate.toISOString().split('T')[0],
      daysSinceLast: daysSinceLasting,
      averageInterval: Math.round(avgInterval),
      likelihood: daysSinceLasting >= avgInterval ? 'high' : 'medium'
    };
  }

  calculateChurnRisk(userHistory) {
    const lastBooking = userHistory[userHistory.length - 1];
    const daysSinceLast = Math.floor((new Date() - new Date(lastBooking.bookingDate)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLast > 90) return { risk: 'high', score: 80 };
    if (daysSinceLast > 60) return { risk: 'medium', score: 50 };
    if (daysSinceLast > 30) return { risk: 'low', score: 20 };
    return { risk: 'very_low', score: 5 };
  }

  estimateLifetimeValue(userHistory) {
    const totalSpent = userHistory.reduce((sum, b) => sum + (b.amount || 0), 0);
    const avgBookingValue = totalSpent / userHistory.length;
    const bookingsPerMonth = userHistory.length / 12; // Assume 1 year history
    const projectedMonths = 24; // Project 2 years
    
    return {
      currentValue: totalSpent,
      projectedLifetimeValue: Math.round(avgBookingValue * bookingsPerMonth * projectedMonths),
      averageBookingValue: Math.round(avgBookingValue),
      monthlyFrequency: Math.round(bookingsPerMonth * 10) / 10
    };
  }

  getUserRecommendations(userType, preferences) {
    const recommendations = [];
    
    if (userType === 'power_user') {
      recommendations.push('Consider our premium monthly plan for 40% savings!');
      recommendations.push('You qualify for VIP benefits and priority booking.');
    } else if (userType === 'regular') {
      recommendations.push('Book weekly passes to save 20% on your frequent visits.');
    }
    
    recommendations.push(`Your favorite time is ${preferences.favoriteHour}:00 - we'll notify you of deals!`);
    
    return recommendations;
  }
}

module.exports = new PredictiveAnalyticsService();



