import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, Star } from "lucide-react";
import { Link } from "react-router-dom";

// Sample suggested books with carefully curated selections
const suggestedBooks = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200",
    description:
      "A classic of modern American literature that explores themes of racial injustice and moral growth in the American South.",
    genre: "Classic Fiction",
    rating: 4.8,
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    cover:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200",
    description:
      "A dystopian social science fiction novel that explores the consequences of totalitarianism, mass surveillance, and repressive regimentation.",
    genre: "Dystopian",
    rating: 4.7,
  },
  {
    id: 3,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=200",
    description:
      "A novel that examines themes of decadence, idealism, resistance to change, and excess during the Jazz Age.",
    genre: "Classic Fiction",
    rating: 4.5,
  },
  {
    id: 4,
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    cover:
      "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=200",
    description:
      "A sweeping narrative of human history from the Stone Age to the 21st century, exploring how biology and history have shaped aspects of our lives.",
    genre: "Non-Fiction",
    rating: 4.6,
  },
];

interface BookSuggestionsProps {
  title?: string;
  description?: string;
  className?: string;
}

export function BookSuggestionsComponent({
  title = "Recommended Books",
  description = "Explore staff picks and highly rated books from our collection",
  className = "",
}: BookSuggestionsProps) {
  return (
    <div className={`py-8 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {suggestedBooks.map((book) => (
          <Card key={book.id} className="overflow-hidden flex flex-col h-full">
            <div className="h-48 overflow-hidden">
              <img
                src={book.cover}
                alt={`${book.title} cover`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">
                  {book.title}
                </CardTitle>
                <Badge variant="outline" className="ml-2 shrink-0">
                  {book.genre}
                </Badge>
              </div>
              <CardDescription className="line-clamp-1">
                {book.author}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(book.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm ml-1 text-muted-foreground">
                  {book.rating}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {book.description}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 mt-auto">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to={`/books/${book.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
