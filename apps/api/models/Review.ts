// filepath: c:\Users\mnaim\Downloads\Projects\vibe-coding-projects\library-api\src\models\Review.ts
import { Book } from "./Book";
import { User } from "./User";

export interface Review {
  id?: number;
  bookId: number;
  userId?: number; // Optional for anonymous reviews
  username: string; // Name for display (can be from user account or anonymous)
  rating: number; // 1-5 star rating
  comment: string;
  createdAt?: string;
  updatedAt?: string;
  book?: Book; // For populating related book data
  user?: User; // For populating user data when available
}
