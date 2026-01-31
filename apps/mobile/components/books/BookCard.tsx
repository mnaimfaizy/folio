import React, { useEffect, useState } from 'react';

import { Image, StyleSheet, View } from 'react-native';

import * as Haptics from 'expo-haptics';

import { ActivityIndicator, Card, IconButton, Text } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { bookService } from '../../services/bookService';
import { Book } from '../../types/Book';
import { getToken } from '../../utils/storage';

interface BookCardProps {
  book: Book;
  inCollection?: boolean;
  onPress?: (book: Book) => void;
  onCollectionUpdate?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  inCollection = false,
  onPress,
  onCollectionUpdate,
}) => {
  const [isInCollection, setIsInCollection] = useState<boolean>(inCollection);
  const [loading, setLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  // Keep local state in sync with props
  useEffect(() => {
    setIsInCollection(inCollection);
  }, [inCollection]);

  const authorText =
    book.authors && book.authors.length > 0
      ? book.authors.map(a => a.name).join(', ')
      : book.author || 'Unknown Author';

  const year = book.publishYear ? ` (${book.publishYear})` : '';

  const defaultImage = 'https://via.placeholder.com/150x200/CCCCCC/808080?text=No+Cover';
  const imageSource = book.cover ? { uri: book.cover } : { uri: defaultImage };

  const handleCollectionToggle = async () => {
    // First verify user is authenticated
    if (!isAuthenticated) {
      console.warn('Cannot toggle collection - user not authenticated');
      return;
    }

    // Double-check we have a token before making API calls
    const token = await getToken();
    if (!token) {
      console.warn('No token available, cannot modify collection');
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (isInCollection) {
        await bookService.removeFromCollection(book.id);
        setIsInCollection(false);
      } else {
        await bookService.addToCollection(book.id);
        setIsInCollection(true);
      }

      if (onCollectionUpdate) {
        onCollectionUpdate();
      }
    } catch (error) {
      console.error('Failed to update collection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.card} onPress={() => onPress && onPress(book)}>
      <Card.Content style={styles.contentWrapper}>
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.cover} />
        </View>

        <View style={styles.contentContainer}>
          <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
            {book.title}
          </Text>
          <Text variant="bodyMedium" numberOfLines={1} style={styles.author}>
            {authorText}
            {year}
          </Text>
          {book.genre && (
            <View style={styles.genreContainer}>
              <Text variant="labelSmall" style={styles.genre}>
                {book.genre}
              </Text>
            </View>
          )}
        </View>

        {isAuthenticated && (
          <View style={styles.bookmarkContainer}>
            {loading ? (
              <ActivityIndicator size="small" animating={true} />
            ) : (
              <IconButton
                icon={isInCollection ? 'bookmark' : 'bookmark-outline'}
                size={20}
                onPress={handleCollectionToggle}
                style={styles.bookmarkButton}
              />
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    marginHorizontal: 2,
  },
  contentWrapper: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  imageContainer: {
    width: 60,
    height: 80,
    borderRadius: 4,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    opacity: 0.6,
    marginBottom: 4,
  },
  genreContainer: {
    alignSelf: 'flex-start',
  },
  genre: {
    opacity: 0.6,
  },
  bookmarkContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  bookmarkButton: {
    margin: 0,
  },
});
