import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  BookOpenCheck,
  Users,
  Search,
  Clock,
  BookCopy,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Sample featured books
const featuredBooks = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200",
    genre: "Classic",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    cover:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200",
    genre: "Dystopian",
  },
  {
    id: 3,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=200",
    genre: "Classic",
  },
];

export function LandingPageComponent() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000')]"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-4">Welcome to the Library</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Discover the World Through Books
            </h1>
            <p className="text-xl mb-8">
              Explore our vast collection of books, join our reading community,
              and embark on a journey of knowledge and imagination.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-gray-100"
                asChild
              >
                <Link to="/books">Browse Books</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white/10"
                asChild
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">
              Everything You Need for Your Reading Journey
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Our library management system provides all the tools you need to
              explore, borrow, and enjoy books of all genres and topics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Vast Collection</h3>
              <p className="text-gray-600">
                Access thousands of books across various genres, from classics
                to the latest releases.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
              <p className="text-gray-600">
                Find exactly what you're looking for with our powerful search
                and filter options.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Loans</h3>
              <p className="text-gray-600">
                Manage your borrowed books and stay updated on due dates with
                automatic reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured Books</h2>
            <Button variant="outline" asChild>
              <Link to="/books">View All Books</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBooks.map((book) => (
              <Card
                key={book.id}
                className="overflow-hidden flex flex-col h-full"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="mb-2 w-fit">
                    {book.genre}
                  </Badge>
                  <CardTitle className="leading-tight">{book.title}</CardTitle>
                  <CardDescription>{book.author}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600 line-clamp-3">
                    One of our library's most popular titles, loved by readers
                    of all ages.
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button className="w-full" asChild>
                    <Link to={`/books/${book.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-2">
                <BookCopy className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-bold">10,000+</h3>
              <p className="text-blue-100">Books Available</p>
            </div>

            <div>
              <div className="flex justify-center mb-2">
                <BookOpenCheck className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-bold">5,000+</h3>
              <p className="text-blue-100">E-Books</p>
            </div>

            <div>
              <div className="flex justify-center mb-2">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-bold">2,500+</h3>
              <p className="text-blue-100">Active Members</p>
            </div>

            <div>
              <div className="flex justify-center mb-2">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-bold">24/7</h3>
              <p className="text-blue-100">Online Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Start Your Reading Journey?
            </h2>
            <p className="text-gray-600 mb-8">
              Join our library community today and get access to thousands of
              books, personalized recommendations, and more.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="default" asChild>
                <Link to="/signup">Sign Up Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
