/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';

import { Dimensions, Image, StyleSheet, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

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
    <Card style={styles.container} onPress={() => onPress && onPress(book)} mode="elevated">
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.cover} />
        
        {/* Gradient overlay for better text visibility */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.gradientOverlay}
        />

        {book.publishYear && (
          <View style={styles.yearBadge}>
            <Text style={styles.yearText}>{book.publishYear}</Text>
          </View>
        )}

        {isAuthenticated && (
          <View style={styles.favoriteButtonContainer}>
            {loading ? (
              <Surface style={styles.loadingContainer} elevation={2}>
                <ActivityIndicator size="small" color="#fff" />
              </Surface>
            ) : (
              <IconButton
                icon={isInCollection ? 'bookmark' : 'bookmark-outline'}
                size={20}
                onPress={handleCollectionToggle}
                style={[
                  styles.favoriteButton,
                  // eslint-disable-next-line react-native/no-color-literals, react-native/no-inline-styles
                  { backgroundColor: isInCollection ? colors.primary : 'rgba(0,0,0,0.6)' },
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
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: ITEM_WIDTH * 1.4,
    position: 'relative',
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  yearBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  yearText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 12,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 18,
  },
  author: {
    opacity: 0.7,
    marginBottom: 6,
    fontSize: 12,
  },
  genre: {
    alignSelf: 'flex-start',
    height: 34,
    marginTop: 4,
    marginBottom: 2,
  },
  genreText: {
    fontSize: 10,
  },
  favoriteButtonContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  favoriteButton: {
    margin: 0,
    elevation: 3,
  },
  loadingContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
