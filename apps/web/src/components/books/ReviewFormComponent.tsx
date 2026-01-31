// filepath: c:\Users\mnaim\Downloads\Projects\vibe-coding-projects\library-ui\src\components\books\ReviewFormComponent.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import reviewService from "@/services/reviewService";
import { useAuth } from "@/services/useAuth";
import React, { useState } from "react";
import { toast } from "sonner";

interface ReviewFormProps {
  bookId: number;
  onReviewSubmitted: () => void;
}

export function ReviewFormComponent({
  bookId,
  onReviewSubmitted,
}: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [username, setUsername] = useState(user?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate that a rating has been selected
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!username.trim() || !comment.trim()) {
      return; // Other validations are handled by HTML required attribute
    }

    // Proceed with submission
    try {
      setIsSubmitting(true);
      await reviewService.createReview(bookId, {
        username,
        rating,
        comment,
      });

      toast.success("Your review has been submitted!");
      setComment("");
      setRating(0);
      onReviewSubmitted();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Write a Review</CardTitle>
      </CardHeader>
      <form role="form" aria-label="review form" onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Your Rating</Label>
            <StarRating
              rating={rating}
              interactive={true}
              size="lg"
              onRatingChange={setRating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Your Name</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              disabled={!!user?.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think about this book?"
              rows={4}
              required
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              rating === 0 ||
              !comment.trim() ||
              !username.trim()
            }
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
