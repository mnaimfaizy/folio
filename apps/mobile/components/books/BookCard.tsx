import React, { useEffect, useState } from 'react';

import { Image, StyleSheet, View } from 'react-native';

import * as Haptics from 'expo-haptics';

import { ActivityIndicator, Card, Chip, IconButton, Text } from 'react-native-paper';

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
    if (!isAuthenticated) return;

    const token = await getToken();
    if (!token) return;

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
      if (__DEV__) console.error('Failed to update collection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.card} onPress={() => onPress && onPress(book)} mode="elevated">
      <Card.Content style={styles.contentWrapper}>
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.cover} />
          {book.publishYear && (
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{year}</Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text variant="titleMedium" numberOfLines={2} style={styles.title}>
            {book.title}
          </Text>
          <Text variant="bodyMedium" numberOfLines={1} style={styles.author}>
            {authorText}
          </Text>
          {book.genre && (
            <Chip
              compact
              mode="flat"
              style={styles.genreChip}
              textStyle={styles.genreText}>
              {book.genre}
            </Chip>
          )}
        </View>

        {isAuthenticated && (
          <View style={styles.bookmarkContainer}>
            {loading ? (
              <ActivityIndicator size="small" animating={true} />
            ) : (
              <IconButton
                icon={isInCollection ? 'bookmark' : 'bookmark-outline'}
                size={22}
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
    marginVertical: 8,
    marginHorizontal: 0,
    elevation: 2,
    borderRadius: 12,
  },
  contentWrapper: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingBottom: 20,
    minHeight: 155,
  },
  imageContainer: {
    width: 85,
    height: 125,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  yearBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  yearText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 16,
    paddingTop: 4,
    justifyContent: 'flex-start',
  },
  title: {
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 20,
  },
  author: {
    opacity: 0.7,
    marginBottom: 6,
    fontSize: 13,
  },
  genreChip: {
    alignSelf: 'flex-start',
    textAlignVertical: 'center',
    height: 34,
    marginTop: 4,
    marginBottom: 2,
    padding: 1,
  },
  genreText: {
    fontSize: 11,
  },
  bookmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  bookmarkButton: {
    margin: 0,
  },
});
