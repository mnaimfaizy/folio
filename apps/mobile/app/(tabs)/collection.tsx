import React, { useCallback, useEffect, useState } from 'react';

import {
    Animated,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';

import {
    ActivityIndicator,
    Button,
    IconButton,
    Searchbar,
    Text,
    useTheme,
} from 'react-native-paper';

import { BookCard } from '../../components/books/BookCard';
import { BookDetailsModal } from '../../components/books/BookDetailsModal';
import { BookGridItem } from '../../components/books/BookGridItem';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';
import { bookService } from '../../services/bookService';
import { Book } from '../../types/Book';

export default function CollectionScreen() {
  const { colors } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const { isAuthenticated } = useAuth();

  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListMode, setIsListMode] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const scrollY = useState(() => new Animated.Value(0))[0];

  const fetchCollection = useCallback(async () => {
    if (!isAuthenticated) {
      setBooks([]);
      setFilteredBooks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await bookService.getUserCollection();
      const booksData = response.books || [];
      setBooks(booksData);
      setFilteredBooks(booksData);
    } catch (err) {
      if (__DEV__) console.error('Failed to fetch collection:', err);
      setBooks([]);
      setFilteredBooks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  useFocusEffect(
    useCallback(() => {
      fetchCollection();
    }, [fetchCollection])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCollection();
  }, [fetchCollection]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author?.toLowerCase().includes(query) ||
          book.genre?.toLowerCase().includes(query)
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  const handleBookPress = (book: Book) => {
    setSelectedBook(book);
    setDetailsModalVisible(true);
  };

  const handleCollectionUpdate = () => {
    fetchCollection();
  };

  const toggleDisplayMode = () => {
    Haptics.selectionAsync();
    setIsListMode(!isListMode);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderListItem = ({ item }: { item: Book }) => (
    <BookCard book={item} onPress={handleBookPress} />
  );

  const renderGridItem = ({ item }: { item: Book }) => (
    <BookGridItem book={item} onPress={handleBookPress} />
  );

  const renderEmpty = () => (
    <ScrollView
      contentContainerStyle={styles.emptyContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyGradient}>
        <IconButton icon="book-outline" size={64} iconColor="#fff" />
      </LinearGradient>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        Your Collection is Empty
      </Text>
      <Text variant="bodyMedium" style={styles.emptyMessage}>
        Start building your library by adding books you love!
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push('/(tabs)/books')}
        style={styles.emptyButton}
        contentStyle={styles.emptyButtonContent}
        icon="plus">
        Browse Books
      </Button>
    </ScrollView>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading your collection...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Sticky Header with Search and Controls */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            backgroundColor,
            shadowOpacity: headerOpacity,
            elevation: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 4],
            }),
          },
        ]}>
        <View style={styles.headerContent}>
          <Searchbar
            placeholder="Search your collection..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            elevation={0}
          />
          <View style={styles.headerActions}>
            <Pressable onPress={toggleDisplayMode} style={styles.viewToggle}>
              <IconButton
                icon={isListMode ? 'view-grid-outline' : 'view-list'}
                size={22}
                iconColor={colors.primary}
              />
            </Pressable>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Text variant="bodyMedium" style={[styles.statsText, { color: colors.onSurfaceVariant }]}>
            {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
            {searchQuery ? ' found' : ' in your collection'}
          </Text>
        </View>
      </Animated.View>

      {/* Books List/Grid */}
      {filteredBooks.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={filteredBooks}
          renderItem={isListMode ? renderListItem : renderGridItem}
          keyExtractor={(item) => item.id.toString()}
          key={isListMode ? 'list' : 'grid'}
          numColumns={isListMode ? 1 : 2}
          contentContainerStyle={[
            isListMode ? styles.listContent : styles.gridContent,
            { paddingBottom: 100 },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetailsModal
          visible={detailsModalVisible}
          book={selectedBook}
          onClose={() => {
            setDetailsModalVisible(false);
            setSelectedBook(null);
          }}
          onCollectionUpdate={handleCollectionUpdate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  stickyHeader: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchbar: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  searchInput: {
    fontSize: 15,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggle: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 120,
  },
  emptyGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyMessage: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 24,
  },
  emptyButtonContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
});
