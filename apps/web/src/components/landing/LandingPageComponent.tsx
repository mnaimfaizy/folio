import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookCard } from '@/components/ui/book-card';
import {
  BookOpen,
  BookOpenCheck,
  Users,
  Search,
  Clock,
  BookCopy,
  ArrowRight,
  Sparkles,
  Star,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import BookService from '@/services/bookService';
import type { Book } from '@/services/bookService';

const features = [
  {
    icon: BookOpen,
    title: 'Vast Collection',
    description:
      'Access thousands of books across various genres, from classics to the latest releases.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Search,
    title: 'Smart Search',
    description:
      "Find exactly what you're looking for with our powerful AI-powered search and filter options.",
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Clock,
    title: 'Track Loans',
    description:
      'Manage your borrowed books and stay updated on due dates with automatic reminders.',
    color: 'from-orange-500 to-red-500',
  },
];

export function LandingPageComponent() {
  const { settings } = useSettings();
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        setIsLoadingBooks(true);
        const books = await BookService.getFeaturedBooks();
        setFeaturedBooks(books);
      } catch (err) {
        console.error('Failed to fetch featured books:', err);
      } finally {
        setIsLoadingBooks(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  if (settings.usage_profile === 'single_user') {
    return (
      <div className="flex flex-col min-h-screen pt-16 bg-white">
        <section className="py-20 bg-linear-to-b from-slate-900 to-slate-800 text-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-6 bg-white/10 text-blue-200 border-white/20">
                Single User Mode
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {settings.hero_title || 'My Personal Library'}
              </h1>
              <p className="text-slate-300 text-lg mb-8">
                {settings.hero_subtitle ||
                  'A minimal homepage focused on your books and authors.'}
              </p>
            </div>
          </div>
        </section>

        {(isLoadingBooks || featuredBooks.length > 0) && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Featured Books
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Quick access to your highlighted titles.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/books">View All</Link>
                </Button>
              </div>

              {isLoadingBooks ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      cover={book.cover}
                      genre={book.genre}
                      publishYear={book.publishYear}
                      description={book.description}
                      availableCopies={
                        typeof book.availableCopies === 'number'
                          ? book.availableCopies
                          : typeof book.available_copies === 'number'
                            ? book.available_copies
                            : undefined
                      }
                      variant="featured"
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    );
  }

  if (settings.usage_profile === 'showcase') {
    return (
      <div className="flex flex-col min-h-screen pt-16">
        <section className="py-24 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-indigo-500/15 text-indigo-200 border-indigo-300/20">
                Public Showcase
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                {settings.hero_title || 'Welcome to My Book Collection'}
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-10">
                {settings.hero_subtitle ||
                  'Discover curated books and authors from my personal collection.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="px-8">
                  <Link to="/books">
                    Explore Books
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="px-8 text-black"
                >
                  <Link to="/authors">View Authors</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {(isLoadingBooks || featuredBooks.length > 0) && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
                <div>
                  <Badge className="mb-3 bg-indigo-50 text-indigo-600 border-indigo-100">
                    Highlights
                  </Badge>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Featured Collection
                  </h2>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/books">View All Books</Link>
                </Button>
              </div>

              {isLoadingBooks ? (
                <div className="flex justify-center items-center py-14">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      cover={book.cover}
                      genre={book.genre}
                      publishYear={book.publishYear}
                      description={book.description}
                      availableCopies={
                        typeof book.availableCopies === 'number'
                          ? book.availableCopies
                          : typeof book.available_copies === 'number'
                            ? book.available_copies
                            : undefined
                      }
                      variant="featured"
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="py-16 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                {
                  icon: BookCopy,
                  value: settings.stat_total_books || '10,000+',
                  label: 'Books',
                },
                {
                  icon: BookOpenCheck,
                  value: settings.stat_total_ebooks || '5,000+',
                  label: 'E-Books',
                },
                {
                  icon: Users,
                  value: settings.stat_active_members || '2,500+',
                  label: 'Members',
                },
                {
                  icon: Star,
                  value: settings.stat_rating || '4.9/5',
                  label: 'Rating',
                },
              ].map((stat) => (
                <div key={stat.label}>
                  <stat.icon className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={
          settings.hero_image_url
            ? {
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.9)), url(${settings.hero_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {/* Background gradient (only if no custom image) */}
        {!settings.hero_image_url && (
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900"></div>
        )}

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-soft delay-500"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <Badge className="mb-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-300 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Welcome to the Future of Reading
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up delay-100 leading-tight">
              {settings.hero_title || 'Discover Your Next'}
              {!settings.hero_title && (
                <span className="block mt-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Literary Adventure
                </span>
              )}
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed">
              {settings.hero_subtitle ||
                'Explore our curated collection of over 10,000 books. Join a community of passionate readers and embark on a journey of knowledge and imagination.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-0 px-8 py-6 text-lg"
                asChild
              >
                <Link to={settings.hero_cta_link || '/books'}>
                  {settings.hero_cta_text || 'Browse Collection'}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-6 text-lg backdrop-blur-sm"
                asChild
              >
                <Link to="/signup">Create Free Account</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 animate-fade-in-up delay-400">
              <div className="flex items-center space-x-2 text-slate-400">
                <Users className="h-5 w-5" />
                <span className="text-sm">
                  {settings.stat_active_readers || '2,500+'} Active Readers
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <BookCopy className="h-5 w-5" />
                <span className="text-sm">
                  {settings.stat_books_display || '10,000+'} Books
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">
                  {settings.stat_rating || '4.9/5'} Rating
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-50 text-blue-600 border-blue-100">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Reading Journey
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our library management system provides all the tools you need to
              explore, borrow, and enjoy books of all genres and topics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-2xl bg-white border border-gray-100 hover-lift shadow-soft"
              >
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 shadow-lg`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover gradient border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:via-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      {(isLoadingBooks || featuredBooks.length > 0) && (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-4">
              <div>
                <Badge className="mb-4 bg-indigo-50 text-indigo-600 border-indigo-100">
                  Popular Reads
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Featured Books
                </h2>
              </div>
              <Button
                variant="outline"
                asChild
                className="group self-start md:self-auto"
              >
                <Link to="/books">
                  View All Books
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {isLoadingBooks ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    cover={book.cover}
                    genre={book.genre}
                    publishYear={book.publishYear}
                    description={book.description}
                    availableCopies={
                      typeof book.availableCopies === 'number'
                        ? book.availableCopies
                        : typeof book.available_copies === 'number'
                          ? book.available_copies
                          : undefined
                    }
                    variant="featured"
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: BookCopy,
                value: settings.stat_total_books || '10,000+',
                label: 'Books Available',
              },
              {
                icon: BookOpenCheck,
                value: settings.stat_total_ebooks || '5,000+',
                label: 'E-Books',
              },
              {
                icon: Users,
                value: settings.stat_active_members || '2,500+',
                label: 'Active Members',
              },
              {
                icon: Clock,
                value: settings.stat_online_access || '24/7',
                label: 'Online Access',
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                  <stat.icon className="h-7 w-7" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-1">
                  {stat.value}
                </h3>
                <p className="text-blue-100 text-sm md:text-base">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative max-w-4xl mx-auto text-center p-12 md:p-16 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Your Reading Journey?
              </h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto text-lg">
                Join our library community today and get access to thousands of
                books, personalized recommendations, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8"
                  asChild
                >
                  <Link to="/signup">
                    Sign Up Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
