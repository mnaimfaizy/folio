/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';

import { Dimensions, Image, StyleSheet, View } from 'react-native';

import * as Haptics from 'expo-haptics';

import {
  ActivityIndicator,
  Card,
  Chip,
  IconButton,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { bookService } from '../../services/bookService';
import { Book } from '../../types/Book';
import { getToken } from '../../utils/storage';

interface BookGridItemProps {
  book: Book;
  inCollection?: boolean;
  onPress?: (book: Book) => void;
  onCollectionUpdate?: () => void;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 items per row with spacing

export const BookGridItem: React.FC<BookGridItemProps> = ({
  book,
  inCollection = false,
  onPress,
  onCollectionUpdate,
}) => {
  const [isInCollection, setIsInCollection] = useState<boolean>(inCollection);
  const [loading, setLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const { colors } = useTheme();

  // Keep local state in sync with props
  useEffect(() => {
    setIsInCollection(inCollection);
  }, [inCollection]);

  const authorText =
    book.authors && book.authors.length > 0
      ? book.authors[0].name // Just show the primary author in grid view
      : book.author || 'Unknown Author';

  const defaultImage = 'https://via.placeholder.com/150x200/CCCCCC/808080?text=No+Cover';
  const imageSource = book.cover ? { uri: book.cover } : { uri: defaultImage };

  const handleCollectionToggle = async (e: any) => {
    e.stopPropagation();

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
    <Card style={styles.container} onPress={() => onPress && onPress(book)} mode="elevated">
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.cover} />

        {book.publishYear && (
          <Surface style={styles.yearBadge} elevation={2}>
            <Text style={styles.yearText}>{book.publishYear}</Text>
          </Surface>
        )}

        {isAuthenticated && (
          <View style={styles.favoriteButtonContainer}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <IconButton
                icon={isInCollection ? 'bookmark' : 'bookmark-outline'}
                size={18}
                onPress={handleCollectionToggle}
                style={[
                  styles.favoriteButton,
                  // eslint-disable-next-line react-native/no-color-literals, react-native/no-inline-styles
                  { backgroundColor: isInCollection ? colors.primary : 'rgba(0,0,0,0.5)' },
                ]}
                iconColor="#fff"
              />
            )}
          </View>
        )}
      </View>

      <Card.Content style={styles.contentContainer}>
        <Text variant="titleSmall" numberOfLines={2} style={styles.title}>
          {book.title}
        </Text>
        <Text variant="bodySmall" numberOfLines={1} style={styles.author}>
          {authorText}
        </Text>

        {book.genre && (
          <Chip mode="flat" style={styles.genre} textStyle={styles.genreText} compact>
            {book.genre}
          </Chip>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: ITEM_WIDTH * 1.35,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  yearBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    opacity: 0.8,
    marginBottom: 6,
  },
  genre: {
    alignSelf: 'flex-start',
    height: 22,
  },
  genreText: {
    fontSize: 10,
  },
  favoriteButtonContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  favoriteButton: {
    margin: 0,
  },
});
