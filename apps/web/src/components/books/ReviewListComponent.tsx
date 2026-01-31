import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import reviewService, { Review } from "@/services/reviewService";
import { useAuth } from "@/services/useAuth";
import { format } from "date-fns";
import { AlertCircle, MessageSquare, ThumbsUp, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReviewListProps {
  bookId: number;
  onReviewDeleted?: () => void;
}

export function ReviewListComponent({
  bookId,
  onReviewDeleted,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const fetchedReviews = await reviewService.getBookReviews(bookId);
      setReviews(fetchedReviews);
      setError(null);
    } catch (err) {
      setError("Failed to load reviews. Please try again later.");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await reviewService.deleteReview(reviewId);
        setReviews(reviews.filter((review) => review.id !== reviewId));
        toast.success("Review deleted successfully");
        if (onReviewDeleted) onReviewDeleted();
      } catch (err) {
        toast.error("Failed to delete review");
        console.error("Error deleting review:", err);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10">Loading reviews...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-6 text-red-500">
        <AlertCircle className="mr-2 h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="mx-auto h-12 w-12 opacity-20 mb-2" />
        <p>No reviews yet. Be the first to review this book!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">
        {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
      </h3>

      {reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-medium">{review.username}</div>
                <div className="text-sm text-gray-500">
                  {review.createdAt &&
                    format(new Date(review.createdAt), "MMMM d, yyyy")}
                </div>
              </div>

              <StarRating rating={review.rating} size="sm" />
            </div>

            <div className="mt-3 text-gray-700 dark:text-gray-300">
              {review.comment}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful
                </Button>
              </div>

              {user && (user.id === review.userId || user.role === "ADMIN") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => review.id && handleDeleteReview(review.id)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
