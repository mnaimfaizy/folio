import React, { useCallback, useEffect, useState } from 'react';

import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { router, useFocusEffect } from 'expo-router';

import {
    Avatar,
    Card,
    Chip,
    Divider,
    List,
    Button as PaperButton,
    Surface,
    Text,
    useTheme,
} from 'react-native-paper';

import { BookCard } from '../../components/books/BookCard';
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

  const fetchData = useCallback(async () => {
    try {
      const promises: Promise<any>[] = [bookService.getAllBooks(1, 5)];
      if (isAuthenticated) {
        promises.push(bookService.getUserCollection());
      }

      const results = await Promise.allSettled(promises);

      if (results[0].status === 'fulfilled') {
        setRecentBooks(results[0].value.books || []);
      }
      if (isAuthenticated && results[1]?.status === 'fulfilled') {
        setCollectionBooks(results[1].value.books || []);
      } else if (!isAuthenticated) {
        setCollectionBooks([]);
      }
    } catch {
      // Silently handle — data will show empty state
    }
  }, [isAuthenticated]);

  // Wait for auth to finish before fetching data
  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [fetchData, authLoading]);

  useFocusEffect(
    useCallback(() => {
      if (!authLoading) {
        fetchData();
      }
    }, [fetchData, authLoading])
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
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }>
      {/* Welcome Header */}
      <Surface style={styles.heroSection} elevation={0}>
        <View style={styles.heroRow}>
          <View style={styles.heroTextContainer}>
            <Text variant="titleMedium" style={[styles.greeting, { color: colors.onSurfaceVariant }]}>
              {greeting()},
            </Text>
            <Text variant="headlineMedium" style={styles.userName} numberOfLines={1}>
              {user?.name || 'Reader'}
            </Text>
          </View>
          <Avatar.Text
            size={52}
            label={userInitials}
            style={{ backgroundColor: colors.primaryContainer }}
            labelStyle={{ color: colors.primary, fontWeight: '700' }}
          />
        </View>
        {settings.hero_subtitle && (
          <Text
            variant="bodyMedium"
            style={[styles.heroSubtitle, { color: colors.onSurfaceVariant }]}>
            {settings.hero_subtitle}
          </Text>
        )}
      </Surface>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Surface
          style={[styles.quickActionCard, { backgroundColor: colors.primaryContainer }]}
          elevation={0}>
          <PaperButton
            icon="book-search"
            mode="text"
            onPress={() => router.push('/(tabs)/books')}
            labelStyle={[styles.quickActionLabel, { color: colors.primary }]}
            compact>
            Browse
          </PaperButton>
        </Surface>
        <Surface
          style={[styles.quickActionCard, { backgroundColor: colors.secondaryContainer }]}
          elevation={0}>
          <PaperButton
            icon="bookmark-multiple"
            mode="text"
            onPress={() => router.push('/(tabs)/books')}
            labelStyle={[styles.quickActionLabel, { color: colors.secondary }]}
            compact>
            Collection
          </PaperButton>
        </Surface>
        <Surface
          style={[styles.quickActionCard, { backgroundColor: colors.tertiaryContainer }]}
          elevation={0}>
          <PaperButton
            icon="information"
            mode="text"
            onPress={() => router.push('/(tabs)/about')}
            labelStyle={styles.quickActionLabel}
            compact>
            About
          </PaperButton>
        </Surface>
      </View>

      {/* My Collection */}
      {collectionBooks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              My Collection
            </Text>
            <Chip icon="bookmark" compact onPress={() => router.push('/(tabs)/books')}>
              {collectionBooks.length} books
            </Chip>
          </View>
          {collectionBooks.slice(0, 3).map(book => (
            <BookCard
              key={book.id}
              book={book}
              inCollection={true}
              onPress={handleBookPress}
              onCollectionUpdate={fetchData}
            />
          ))}
        </View>
      )}

      <Divider style={styles.divider} />

      {/* Recent Books */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            New Arrivals
          </Text>
          <PaperButton
            mode="text"
            compact
            onPress={() => router.push('/(tabs)/books')}>
            See all
          </PaperButton>
        </View>
        {recentBooks.length > 0 ? (
          recentBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              inCollection={collectionBooks.some(c => c.id === book.id)}
              onPress={handleBookPress}
              onCollectionUpdate={fetchData}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="bodyLarge" style={{ color: colors.onSurfaceVariant }}>
                No books available yet. Check back soon!
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Library Services
        </Text>
        <Card style={styles.servicesCard} mode="outlined">
          <List.Item
            title="Browse Collection"
            description="Explore our full library catalog"
            left={props => <List.Icon {...props} icon="book-multiple" color={colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/(tabs)/books')}
          />
          <Divider />
          <List.Item
            title="Manage Collection"
            description="Track books you've bookmarked"
            left={props => <List.Icon {...props} icon="bookmark-multiple" color={colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/(tabs)/books')}
          />
          <Divider />
          <List.Item
            title="About {appName}"
            description="Learn more about us"
            left={props => <List.Icon {...props} icon="information" color={colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/(tabs)/about')}
          />
        </Card>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
          {settings.footer_text || `\u00A9 ${new Date().getFullYear()} ${appName}`}
        </Text>
      </View>

      <BookDetailsModal
        book={selectedBook}
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        onCollectionUpdate={fetchData}
        inCollection={selectedBook ? collectionBooks.some(c => c.id === selectedBook.id) : false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    marginBottom: 2,
  },
  userName: {
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 8,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 4,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  divider: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  emptyCard: {
    marginBottom: 8,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  servicesCard: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
});
