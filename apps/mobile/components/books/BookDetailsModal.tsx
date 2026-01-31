/* eslint-disable react-native/no-color-literals */
import React, { useEffect, useState } from 'react';

import { Image, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { Button, Chip, Divider, IconButton, Surface, Text, useTheme } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';
import { bookService } from '../../services/bookService';
import { Book } from '../../types/Book';
import { getToken } from '../../utils/storage';

interface BookDetailsModalProps {
  book: Book | null;
  visible: boolean;
  onClose: () => void;
  onCollectionUpdate?: () => void;
  inCollection?: boolean;
}

const COVER_HEIGHT = 240;

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  book,
  visible,
  onClose,
  onCollectionUpdate,
  inCollection = false,
}) => {
  const [isInCollection, setIsInCollection] = useState<boolean>(inCollection);
  const [loading, setLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const { colors } = useTheme();

  // Keep local state in sync with props
  useEffect(() => {
    setIsInCollection(inCollection);
  }, [inCollection]);

  const borderColor = useThemeColor({ lightColor: '#e0e0e0', darkColor: '#2c2c2e' }, 'border');

  if (!book) return null;

  const authorText =
    book.authors && book.authors.length > 0
      ? book.authors.map(a => a.name).join(', ')
      : book.author || 'Unknown Author';

  const defaultImage = 'https://via.placeholder.com/300x450/CCCCCC/808080?text=No+Cover';
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLoading(true);

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
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.overlay}>
        <Surface style={[styles.container, { borderColor }]} elevation={5}>
          <View style={styles.header}>
            <IconButton
              icon="chevron-down"
              size={28}
              onPress={onClose}
              style={styles.closeButton}
              iconColor={colors.primary}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.coverContainer}>
              <Image source={imageSource} style={styles.coverImage} />
              {book.publishYear && (
                <Surface style={styles.yearBadge} elevation={3}>
                  <Text variant="labelLarge" style={styles.yearText}>
                    {book.publishYear}
                  </Text>
                </Surface>
              )}
            </View>

            <Surface style={styles.detailsContainer} elevation={0}>
              <Text variant="headlineSmall" style={styles.title}>
                {book.title}
              </Text>
              <Text variant="titleMedium" style={styles.author}>
                by {authorText}
              </Text>

              {book.genre && (
                <Chip icon="tag" style={styles.genreChip} mode="outlined">
                  {book.genre}
                </Chip>
              )}

              {book.description && (
                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Description
                  </Text>
                  <Text variant="bodyMedium" style={styles.description}>
                    {book.description}
                  </Text>
                </View>
              )}

              <Divider style={styles.divider} />

              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Details
                </Text>
                <View style={styles.detailRow}>
                  <Text variant="bodyLarge" style={styles.detailLabel}>
                    ISBN:
                  </Text>
                  <Text variant="bodyMedium" style={styles.detailValue}>
                    {book.isbn || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="bodyLarge" style={styles.detailLabel}>
                    Publication Year:
                  </Text>
                  <Text variant="bodyMedium" style={styles.detailValue}>
                    {book.publishYear || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="bodyLarge" style={styles.detailLabel}>
                    Added on:
                  </Text>
                  <Text variant="bodyMedium" style={styles.detailValue}>
                    {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              </View>
            </Surface>
          </ScrollView>

          {isAuthenticated && (
            <Surface style={[styles.footer, { borderTopColor: borderColor }]} elevation={4}>
              <Button
                mode="contained"
                icon={isInCollection ? 'bookmark-remove' : 'bookmark-outline'}
                onPress={handleCollectionToggle}
                disabled={loading}
                loading={loading}
                buttonColor={isInCollection ? '#e53935' : colors.primary}
                style={styles.collectionButton}>
                {isInCollection ? 'Remove from Collection' : 'Add to Collection'}
              </Button>
            </Surface>
          )}
        </Surface>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  coverContainer: {
    width: '100%',
    height: COVER_HEIGHT,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  yearBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  yearText: {
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  author: {
    marginBottom: 16,
    opacity: 0.8,
  },
  genreChip: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '500',
    width: 140,
  },
  detailValue: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.9)', // Will be adjusted by ThemedView
    backdropFilter: 'blur(10px)',
  },
  collectionButton: {
    borderRadius: 12,
  },
});
