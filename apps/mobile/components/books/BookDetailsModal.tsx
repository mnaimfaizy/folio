import React, { useEffect, useState } from 'react';

import { Image, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { Button, Chip, IconButton, Surface, Text, useTheme } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
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

const COVER_HEIGHT = 340;

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

  if (!book) return null;

  const authorText =
    book.authors && book.authors.length > 0
      ? book.authors.map(a => a.name).join(', ')
      : book.author || 'Unknown Author';

  const defaultImage = 'https://via.placeholder.com/300x450/CCCCCC/808080?text=No+Cover';
  const imageSource = book.cover ? { uri: book.cover } : { uri: defaultImage };

  const handleCollectionToggle = async () => {
    if (!isAuthenticated) return;

    const token = await getToken();
    if (!token) return;

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
      if (__DEV__) console.error('Failed to update collection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <BlurView intensity={40} style={styles.overlay}>
        <Surface style={[styles.container, { borderColor: colors.outlineVariant }]} elevation={5}>
          <View style={styles.innerContainer}>
            {/* Close Button */}
            <View style={styles.header}>
              <IconButton
                icon="close"
                size={24}
                onPress={onClose}
                style={styles.closeButton}
                iconColor="#fff"
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {/* Cover Image with Gray Background */}
              <View style={styles.coverContainer}>
                <Image source={imageSource} style={styles.coverImage} />
                {book.publishYear && (
                  <View style={styles.yearBadge}>
                    <LinearGradient
                      colors={['rgba(102, 126, 234, 0.95)', 'rgba(118, 75, 162, 0.95)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.yearBadgeGradient}>
                      <Text variant="labelMedium" style={styles.yearText}>
                        {book.publishYear}
                      </Text>
                    </LinearGradient>
                  </View>
                )}
              </View>

              {/* Book Details Section */}
              <View style={styles.detailsContainer}>
                {/* Title & Author */}
                <Text variant="headlineMedium" style={styles.title}>
                  {book.title}
                </Text>
                <Text variant="titleMedium" style={[styles.author, { color: colors.onSurfaceVariant }]}>
                  by {authorText}
                </Text>

                {/* Genre Chip */}
                {book.genre && (
                  <Chip
                    icon="tag"
                    mode="flat"
                    style={[styles.genreChip, { backgroundColor: `${colors.primary}15` }]}
                    textStyle={{ color: colors.primary, fontWeight: '600' }}>
                    {book.genre}
                  </Chip>
                )}

                {/* Description Section */}
                {book.description && (
                  <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Description
                    </Text>
                    <Text variant="bodyMedium" style={[styles.description, { color: colors.onSurfaceVariant }]}>
                      {book.description}
                    </Text>
                  </View>
                )}

                {/* Details Section */}
                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Details
                  </Text>
                  
                  {book.isbn && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <IconButton icon="barcode" size={20} iconColor={colors.primary} style={styles.detailIcon} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text variant="labelSmall" style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>
                          ISBN
                        </Text>
                        <Text variant="bodyLarge" style={styles.detailValue}>
                          {book.isbn}
                        </Text>
                      </View>
                    </View>
                  )}

                  {book.publishYear && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <IconButton icon="calendar" size={20} iconColor={colors.primary} style={styles.detailIcon} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text variant="labelSmall" style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>
                          Publication Year
                        </Text>
                        <Text variant="bodyLarge" style={styles.detailValue}>
                          {book.publishYear}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Footer Button */}
            {isAuthenticated && (
              <Surface style={[styles.footer, { borderTopColor: colors.outlineVariant }]} elevation={5}>
                <Button
                  mode="contained"
                  icon={isInCollection ? 'bookmark-check' : 'bookmark-plus-outline'}
                  onPress={handleCollectionToggle}
                  disabled={loading}
                  loading={loading}
                  buttonColor={isInCollection ? colors.tertiary : colors.primary}
                  style={styles.collectionButton}
                  contentStyle={styles.collectionButtonContent}>
                  {isInCollection ? 'Remove from Collection' : 'Add to Collection'}
                </Button>
              </Surface>
            )}
          </View>
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
    height: '92%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingHorizontal: 16,
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    margin: 0,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  coverContainer: {
    width: '100%',
    height: COVER_HEIGHT,
    position: 'relative',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  yearBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  yearBadgeGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  yearText: {
    fontWeight: '700',
    color: '#fff',
  },
  detailsContainer: {
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 32,
  },
  author: {
    marginBottom: 16,
    fontWeight: '500',
  },
  genreChip: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
    fontSize: 18,
  },
  description: {
    lineHeight: 24,
    fontSize: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
  },
  detailIconContainer: {
    marginRight: 8,
  },
  detailIcon: {
    margin: 0,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    marginBottom: 2,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    borderTopWidth: 1,
  },
  collectionButton: {
    borderRadius: 24,
  },
  collectionButtonContent: {
    paddingVertical: 6,
  },
});
