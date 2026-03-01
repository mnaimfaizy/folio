import React, { useCallback, useEffect, useState } from 'react';

import {
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';

import { Avatar, Chip, IconButton, Text, useTheme } from 'react-native-paper';

import { BookDetailsModal } from '../../components/books/BookDetailsModal';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { useThemeColor } from '../../hooks/useThemeColor';
import { bookService } from '../../services/bookService';
import { Book } from '../../types/Book';

export default function HomeScreen() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { settings, appName } = useSettings();
  const backgroundColor = useThemeColor({}, 'background');
  const { colors } = useTheme();

  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [collectionBooks, setCollectionBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Animation values
  const fadeAnim = useState(() => new Animated.Value(0))[0];
  const slideAnim = useState(() => new Animated.Value(30))[0];

  const fetchData = useCallback(async () => {
    try {
      const promises: Promise<unknown>[] = [bookService.getAllBooks(1, 5)];
      if (isAuthenticated) {
        promises.push(bookService.getUserCollection());
      }

      const results = await Promise.allSettled(promises);

      if (results[0].status === 'fulfilled') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const books = (results[0].value as any).books || [];
        console.log('New Arrivals books:', books.length);
        setRecentBooks(books);
      } else {
        console.log('Failed to fetch books:', results[0].reason);
      }
      if (isAuthenticated && results[1]?.status === 'fulfilled') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const collection = (results[1].value as any).books || [];
        console.log('Collection books:', collection.length);
        setCollectionBooks(collection);
      } else if (!isAuthenticated) {
        setCollectionBooks([]);
      }
    } catch (error) {
      console.log('Error fetching data:', error);
      // Silently handle — data will show empty state
    }
  }, [isAuthenticated]);

  // Wait for auth to finish before fetching data
  useEffect(() => {
    if (!authLoading) {
      fetchData();
      // Animate in on mount
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fetchData, authLoading, fadeAnim, slideAnim]);

  useFocusEffect(
    useCallback(() => {
      if (!authLoading) {
        fetchData();
      }
    }, [fetchData, authLoading]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleBookPress = (book: Book) => {
    setSelectedBook(book);
    setDetailsModalVisible(true);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Integrated Hero Section */}
          <View style={styles.heroSection}>
            {/* User Info Row */}
            <View style={styles.userRow}>
              <View style={styles.userInfo}>
                <Text variant="bodySmall" style={styles.greetingText}>
                  {greeting()},
                </Text>
                <Text variant="titleMedium" style={styles.userNameText}>
                  {user?.name || 'Reader'}
                </Text>
              </View>
              <Avatar.Text
                size={48}
                label={userInitials}
                style={styles.userAvatar}
              />
            </View>
          </View>

          {/* Bento Grid Navigation */}
          <View style={styles.bentoGrid}>
            {/* Large Collection Tile */}
            <Pressable
              style={styles.bentoLarge}
              onPress={() => router.push('/(tabs)/books')}
            >
              <BlurView intensity={15} tint="light" style={styles.bentoBlur}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bentoGradient}
                >
                  <IconButton
                    icon="bookmark-multiple"
                    size={32}
                    iconColor="#ffffff"
                  />
                  <Text
                    variant="titleLarge"
                    style={[styles.bentoLargeText, { color: '#ffffff' }]}
                  >
                    Collection
                  </Text>
                  {collectionBooks.length > 0 && (
                    <Chip
                      compact
                      style={styles.bentoChip}
                      textStyle={{ fontSize: 11, color: '#ffffff' }}
                    >
                      {collectionBooks.length} books
                    </Chip>
                  )}
                </LinearGradient>
              </BlurView>
            </Pressable>

            {/* Small Tiles Column */}
            <View style={styles.bentoSmallColumn}>
              {/* Browse Tile */}
              <Pressable
                style={styles.bentoSmall}
                onPress={() => router.push('/(tabs)/books')}
              >
                <BlurView
                  intensity={15}
                  tint="light"
                  style={styles.bentoBlurSmall}
                >
                  <LinearGradient
                    colors={['#f093fb', '#f5576c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bentoGradientSmall}
                  >
                    <IconButton
                      icon="book-search"
                      size={24}
                      iconColor="#ffffff"
                    />
                    <Text
                      variant="titleSmall"
                      style={[styles.bentoSmallText, { color: '#ffffff' }]}
                    >
                      Browse
                    </Text>
                  </LinearGradient>
                </BlurView>
              </Pressable>

              {/* Search Tile */}
              <Pressable
                style={styles.bentoSmall}
                onPress={() => router.push('/(tabs)/books')}
              >
                <BlurView
                  intensity={15}
                  tint="light"
                  style={styles.bentoBlurSmall}
                >
                  <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bentoGradientSmall}
                  >
                    <IconButton icon="magnify" size={24} iconColor="#ffffff" />
                    <Text
                      variant="titleSmall"
                      style={[styles.bentoSmallText, { color: '#ffffff' }]}
                    >
                      Search
                    </Text>
                  </LinearGradient>
                </BlurView>
              </Pressable>
            </View>
          </View>

          {/* New Arrivals - Horizontal Carousel */}
          <View style={styles.carouselSection}>
            <View style={styles.carouselHeader}>
              <Text variant="headlineSmall" style={styles.carouselTitle}>
                New Arrivals
              </Text>
              <Pressable onPress={() => router.push('/(tabs)/books')}>
                <Text
                  variant="labelLarge"
                  style={[styles.seeAllText, { color: colors.primary }]}
                >
                  See all
                </Text>
              </Pressable>
            </View>

            {recentBooks.length > 0 ? (
              <FlatList
                horizontal
                data={recentBooks}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                  <Pressable
                    style={[
                      styles.carouselItem,
                      index === 0 && styles.carouselItemFirst,
                    ]}
                    onPress={() => handleBookPress(item)}
                  >
                    <View style={styles.bookCoverContainer}>
                      <Image
                        source={{
                          uri:
                            item.cover || 'https://via.placeholder.com/120x180',
                        }}
                        style={styles.bookCover}
                        resizeMode="cover"
                      />
                      {/* Overlay on hover/press would show title */}
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.bookCoverOverlay}
                      >
                        <Text
                          variant="labelSmall"
                          style={styles.bookCoverTitle}
                          numberOfLines={2}
                        >
                          {item.title}
                        </Text>
                      </LinearGradient>
                    </View>
                  </Pressable>
                )}
              />
            ) : (
              <View style={styles.emptyCarousel}>
                <Text
                  variant="bodyMedium"
                  style={{ color: colors.onSurfaceVariant, opacity: 0.6 }}
                >
                  No books available yet
                </Text>
              </View>
            )}
          </View>

          {/* My Collection - Borderless Cards */}
          <View style={styles.feedSection}>
            <View style={styles.carouselHeader}>
              <Text variant="headlineSmall" style={styles.carouselTitle}>
                My Collection
              </Text>
              {collectionBooks.length > 0 && (
                <Pressable onPress={() => router.push('/(tabs)/collection')}>
                  <Text
                    variant="labelLarge"
                    style={[styles.seeAllText, { color: colors.primary }]}
                  >
                    See all
                  </Text>
                </Pressable>
              )}
            </View>

            {collectionBooks.length > 0 ? (
              collectionBooks.slice(0, 3).map((book, index) => (
                <Pressable
                  key={book.id}
                  style={styles.feedItem}
                  onPress={() => handleBookPress(book)}
                >
                  <View style={styles.feedCard}>
                    {/* Floating Book Cover */}
                    <View style={styles.floatingCover}>
                      <Image
                        source={{
                          uri:
                            book.cover || 'https://via.placeholder.com/80x120',
                        }}
                        style={styles.feedBookCover}
                        resizeMode="cover"
                      />
                    </View>

                    {/* Book Info */}
                    <View style={styles.feedBookInfo}>
                      <Text
                        variant="titleMedium"
                        style={styles.feedBookTitle}
                        numberOfLines={2}
                      >
                        {book.title}
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={[
                          styles.feedBookAuthor,
                          { color: colors.onSurfaceVariant },
                        ]}
                        numberOfLines={1}
                      >
                        {book.author}
                      </Text>
                      <View style={styles.feedTags}>
                        {book.genre && (
                          <Chip
                            compact
                            mode="flat"
                            style={[
                              styles.feedTag,
                              { backgroundColor: `${colors.primary}15` },
                            ]}
                            textStyle={{ fontSize: 10, color: colors.primary }}
                          >
                            {book.genre}
                          </Chip>
                        )}
                        {book.publishYear && (
                          <Chip
                            compact
                            mode="flat"
                            style={[
                              styles.feedTag,
                              { backgroundColor: `${colors.secondary}15` },
                            ]}
                            textStyle={{
                              fontSize: 10,
                              color: colors.secondary,
                            }}
                          >
                            {book.publishYear}
                          </Chip>
                        )}
                      </View>
                    </View>

                    {/* Bookmark Indicator */}
                    <IconButton
                      icon="bookmark"
                      size={20}
                      iconColor={colors.secondary}
                      style={styles.feedBookmark}
                    />
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyCollection}>
                <IconButton
                  icon="book-plus"
                  size={48}
                  iconColor={colors.primary}
                />
                <Text
                  variant="titleMedium"
                  style={{
                    color: colors.onSurface,
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  Start Your Collection
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: colors.onSurfaceVariant,
                    opacity: 0.7,
                    textAlign: 'center',
                    marginBottom: 16,
                  }}
                >
                  Browse books and add them to your personal library
                </Text>
                <Pressable
                  style={[
                    styles.addBooksButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => router.push('/(tabs)/books')}
                >
                  <Text variant="labelLarge" style={{ color: '#ffffff' }}>
                    Browse Books
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text
              variant="bodySmall"
              style={{
                color: colors.onSurfaceVariant,
                textAlign: 'center',
                opacity: 0.5,
              }}
            >
              {settings.footer_text ||
                `© ${new Date().getFullYear()} ${appName}. All rights reserved.`}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <BookDetailsModal
        book={selectedBook}
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        onCollectionUpdate={fetchData}
        inCollection={
          selectedBook
            ? collectionBooks.some((c) => c.id === selectedBook.id)
            : false
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
    paddingTop: 16, // Space for status bar
  },

  // Hero Section - Integrated
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  appTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 2,
  },
  userNameText: {
    fontWeight: '600',
    fontSize: 16,
  },
  userAvatar: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },

  // Bento Grid Navigation
  bentoGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
    height: 180,
  },
  bentoLarge: {
    flex: 1.3,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  bentoBlur: {
    flex: 1,
  },
  bentoGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  bentoLargeText: {
    fontWeight: '700',
    fontSize: 22,
    marginTop: 8,
  },
  bentoChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  bentoSmallColumn: {
    flex: 1,
    gap: 12,
  },
  bentoSmall: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  bentoBlurSmall: {
    flex: 1,
  },
  bentoGradientSmall: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoSmallText: {
    fontWeight: '600',
    marginTop: 4,
  },

  // Horizontal Carousel
  carouselSection: {
    marginBottom: 32,
  },
  carouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  carouselTitle: {
    fontWeight: '800',
    fontSize: 24,
  },
  seeAllText: {
    fontWeight: '600',
  },
  carouselList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  carouselItem: {
    marginRight: 16,
  },
  carouselItemFirst: {
    marginLeft: 0,
  },
  bookCoverContainer: {
    width: 140,
    height: 210,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  bookCover: {
    width: '100%',
    height: '100%',
  },
  bookCoverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    justifyContent: 'flex-end',
  },
  bookCoverTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyCarousel: {
    height: 210,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyCollection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    marginTop: 8,
  },
  addBooksButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },

  // Borderless Feed
  feedSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  feedTitle: {
    fontWeight: '800',
    fontSize: 24,
    marginBottom: 20,
  },
  feedItem: {
    marginBottom: 24,
  },
  feedCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  floatingCover: {
    width: 80,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    marginTop: -8, // Floating effect - breaks out
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  feedBookCover: {
    width: '100%',
    height: '100%',
  },
  feedBookInfo: {
    flex: 1,
    paddingTop: 4,
  },
  feedBookTitle: {
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 22,
  },
  feedBookAuthor: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  feedTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  feedTag: {
    height: 34,
  },
  feedBookmark: {
    margin: 0,
  },

  footer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
});
