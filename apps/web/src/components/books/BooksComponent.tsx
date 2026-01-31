import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BooksCatalogComponent } from "./BooksCatalogComponent";
import { BooksListComponent } from "./BooksListComponent";
import { Plus, RefreshCcw, Search, Grid, List, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

export function BooksComponent() {
  const [view, setView] = useState("catalog");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // In a real implementation, this would fetch data from your API
    setTimeout(() => {
      setIsLoading(false);
      // Here you would update your state with the new data
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Books Collection</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link to="/my-books/search">
              <Search className="h-4 w-4 mr-2" />
              Search Books
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/my-books/collection">
              <Bookmark className="h-4 w-4 mr-2" />
              My Collection
            </Link>
          </Button>
          <Button asChild>
            <Link to="/books/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          <Button
            variant={view === "catalog" ? "default" : "outline"}
            onClick={() => setView("catalog")}
            className="flex items-center"
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid View
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
            className="flex items-center"
          >
            <List className="h-4 w-4 mr-2" />
            List View
          </Button>
        </div>

        {view === "catalog" ? (
          <BooksCatalogComponent />
        ) : (
          <BooksListComponent />
        )}
      </div>
    </div>
  );
}
