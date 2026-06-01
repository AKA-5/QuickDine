import { useState } from 'react';
import { doc, runTransaction, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

const StarRating = ({ value, onChange, label }) => {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</span>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => {
          const isFilled = star <= value;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="focus:outline-none transition-transform active:scale-95 select-none"
            >
              <span className={`material-symbols-outlined text-xl ${
                isFilled ? 'text-warning font-fill' : 'text-border'
              }`}>
                star
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function ReviewModal({ order, onClose }) {
  const [rating, setRating] = useState(5);
  const [ambianceRating, setAmbianceRating] = useState(5);
  const [dishRatings, setDishRatings] = useState(() => {
    const ratings = {};
    order.items.forEach(item => {
      ratings[item.id] = 5;
    });
    return ratings;
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDishRatingChange = (dishId, value) => {
    setDishRatings(prev => ({
      ...prev,
      [dishId]: value
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const reviewPayload = {
        orderId: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        restaurantId: order.restaurantId,
        rating,
        ambianceRating,
        dishRatings,
        comment,
        createdAt: serverTimestamp()
      };

      // Run Firestore transaction to write review and update restaurant rating safely
      await runTransaction(db, async (transaction) => {
        // Write the review doc
        const reviewColRef = collection(db, 'reviews');
        const reviewDocRef = doc(reviewColRef);
        transaction.set(reviewDocRef, reviewPayload);

        // Fetch restaurant details
        const restDocRef = doc(db, 'restaurants', order.restaurantId);
        const restDocSnap = await transaction.get(restDocRef);

        if (restDocSnap.exists()) {
          const restData = restDocSnap.data();
          const currentRating = restData.rating || 0;
          // Count ratings: if no reviewCount field, treat it as 1 review initially (or fetch count)
          const currentCount = restData.reviewCount || 5; // Default to 5 historical ratings for our seed data
          
          const newReviewCount = currentCount + 1;
          const newAvgRating = ((currentRating * currentCount) + rating) / newReviewCount;

          transaction.update(restDocRef, {
            rating: parseFloat(newAvgRating.toFixed(1)),
            reviewCount: newReviewCount
          });
        }
      });

      // Update local storage/alert and exit
      alert('Thank you! Your review has been submitted.');
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg border border-border shadow-card p-6 md:p-8 max-w-md w-full relative space-y-6 text-left max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="space-y-1">
          <h2 className="text-2xl font-serif text-text-primary font-normal">Review Your Dining Experience</h2>
          <p className="text-xs text-text-secondary uppercase tracking-widest">
            Help {order.restaurantName} improve their service.
          </p>
        </div>

        <form onSubmit={handleSubmitReview} className="space-y-6">
          {/* General ratings */}
          <div className="space-y-3 bg-bg border border-border/50 p-4 rounded-md">
            <h3 className="text-xs uppercase tracking-widest font-bold text-text-secondary border-b border-border/50 pb-1.5 mb-2">
              Overall & Ambiance
            </h3>
            <StarRating value={rating} onChange={setRating} label="Overall Rating" />
            <StarRating value={ambianceRating} onChange={setAmbianceRating} label="Table Ambiance" />
          </div>

          {/* Dish ratings */}
          <div className="space-y-3 bg-bg border border-border/50 p-4 rounded-md">
            <h3 className="text-xs uppercase tracking-widest font-bold text-text-secondary border-b border-border/50 pb-1.5 mb-2">
              Rate the Dishes
            </h3>
            {order.items.map(item => (
              <StarRating 
                key={item.id}
                value={dishRatings[item.id]} 
                onChange={(val) => handleDishRatingChange(item.id, val)} 
                label={item.name} 
              />
            ))}
          </div>

          {/* Comments */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest font-medium text-text-secondary block">
              Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of the pre-order timing and wait time?"
              rows="3"
              className="w-full text-xs border border-border rounded-[6px] bg-white px-3 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent text-white rounded-[6px] py-2.5 text-sm font-semibold hover:bg-[#B03D24] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
