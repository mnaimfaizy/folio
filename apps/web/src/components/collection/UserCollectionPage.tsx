import { Button } from '@/components/ui/button';
import { UserCollectionComponent } from './UserCollectionComponent';
import { RefreshCcw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function UserCollectionPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Collection</h1>
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
        </div>
      </div>

      <div className="mb-6">
        <UserCollectionComponent />
      </div>
    </div>
  );
}
