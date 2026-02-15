import React, { useEffect, useState } from 'react';

import { Modal, ScrollView, StyleSheet, View } from 'react-native';

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { ActivityIndicator, Button, Chip, Divider, IconButton, RadioButton, Surface, Text, useTheme } from 'react-native-paper';

import { useThemeColor } from '../../hooks/useThemeColor';
import { bookService } from '../../services/bookService';

export interface FilterOptions {
  genre?: string;
  year?: number | null;
  availability?: 'all' | 'available' | 'unavailable';
  sortBy?: 'title' | 'author' | 'year' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [genres, setGenres] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const borderColor = useThemeColor({ lightColor: '#e0e0e0', darkColor: '#2c2c2e' }, 'border');
  const { colors } = useTheme();

  // Fetch filter options from API
  useEffect(() => {
    if (visible) {
      fetchFilterOptions();
    }
  }, [visible]);

  const fetchFilterOptions = async () => {
    try {
      setLoading(true);
      const options = await bookService.getFilterOptions();
      setGenres(options.genres || []);
      setYears(options.years || []);
    } catch (error) {
      if (__DEV__) console.error('Failed to fetch filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { label: 'Title (A-Z)', value: { sortBy: 'title', sortOrder: 'asc' }, icon: 'sort-alphabetical-ascending' },
    { label: 'Title (Z-A)', value: { sortBy: 'title', sortOrder: 'desc' }, icon: 'sort-alphabetical-descending' },
    { label: 'Author (A-Z)', value: { sortBy: 'author', sortOrder: 'asc' }, icon: 'account-arrow-up' },
    { label: 'Year (Newest)', value: { sortBy: 'publishYear', sortOrder: 'desc' }, icon: 'calendar-arrow-right' },
    { label: 'Year (Oldest)', value: { sortBy: 'publishYear', sortOrder: 'asc' }, icon: 'calendar-arrow-left' },
  ];

  // Generate year options from actual years in database
  const yearOptions = [
    { label: 'Any Year', value: null },
    ...years
      .filter((year) => year >= 2020)
      .map(year => ({ label: `${year}+`, value: year }))
      .slice(0, 5), // Get top 5 recent years
    { label: '2000+', value: 2000 },
    { label: 'Before 2000', value: 1999 },
  ];

  const handleSelectGenre = (genre: string) => {
    Haptics.selectionAsync();
    setFilters(prev => ({
      ...prev,
      genre: prev.genre === genre ? undefined : genre,
    }));
  };

  const handleSelectYear = (year: number | null) => {
    Haptics.selectionAsync();
    setFilters(prev => ({ ...prev, year }));
  };

  const handleSelectSort = (
    sortBy: 'title' | 'author' | 'publishYear',
    sortOrder: 'asc' | 'desc'
  ) => {
    Haptics.selectionAsync();
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const handleSelectAvailability = (availability: 'all' | 'available' | 'unavailable') => {
    Haptics.selectionAsync();
    setFilters(prev => ({ ...prev, availability }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setFilters({});
  };

  const isFiltered = Object.values(filters).some(value => value !== undefined);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <BlurView intensity={40} style={styles.overlay}>
        <Surface style={[styles.container, { borderColor }]} elevation={4}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}>
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.title}>
                Filter Books
              </Text>
              <IconButton icon="close" size={24} onPress={onClose} iconColor="#fff" style={styles.closeButton} />
            </View>
          </LinearGradient>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text variant="bodyLarge" style={styles.loadingText}>Loading filters...</Text>
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Genres Section */}
              {genres.length > 0 && (
                <>
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <IconButton icon="bookshelf" size={20} style={styles.sectionIcon} />
                      <Text variant="titleMedium" style={styles.sectionTitle}>
                        Genres
                      </Text>
                    </View>
                    <View style={styles.chipContainer}>
                      {genres.map(genre => (
                        <Chip
                          key={genre}
                          mode={filters.genre === genre ? 'flat' : 'outlined'}
                          selected={filters.genre === genre}
                          onPress={() => handleSelectGenre(genre)}
                          style={[
                            styles.chip,
                            filters.genre === genre && { backgroundColor: colors.primaryContainer }
                          ]}
                          textStyle={filters.genre === genre && { color: colors.primary, fontWeight: '600' }}>
                          {genre}
                        </Chip>
                      ))}
                    </View>
                  </View>

                  <Divider style={styles.divider} />
                </>
              )}

            {/* Publication Year Section */}
            {yearOptions.length > 1 && (
              <>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconButton icon="calendar-range" size={20} style={styles.sectionIcon} />
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Publication Year
                    </Text>
                  </View>
                  <RadioButton.Group
                    value={filters.year?.toString() || 'null'}
                    onValueChange={value => handleSelectYear(value === 'null' ? null : Number(value))}>
                    {yearOptions.map(year => (
                      <RadioButton.Item
                        key={year.label}
                        label={year.label}
                        value={year.value?.toString() || 'null'}
                        position="leading"
                        style={styles.radioItem}
                        labelStyle={styles.radioLabel}
                      />
                    ))}
                  </RadioButton.Group>
                </View>

                <Divider style={styles.divider} />
              </>
            )}

            {/* Sort By Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <IconButton icon="sort-variant" size={20} style={styles.sectionIcon} />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Sort By
                </Text>
              </View>
              <RadioButton.Group
                value={
                  filters.sortBy && filters.sortOrder
                    ? `${filters.sortBy}-${filters.sortOrder}`
                    : ''
                }
                onValueChange={value => {
                  if (value) {
                    const [sortBy, sortOrder] = value.split('-') as [
                      'title' | 'author' | 'publishYear',
                      'asc' | 'desc',
                    ];
                    handleSelectSort(sortBy, sortOrder);
                  }
                }}>
                {sortOptions.map(option => (
                  <RadioButton.Item
                    key={`${option.value.sortBy}-${option.value.sortOrder}`}
                    label={option.label}
                    value={`${option.value.sortBy}-${option.value.sortOrder}`}
                    position="leading"
                    style={styles.radioItem}
                    labelStyle={styles.radioLabel}
                  />
                ))}
              </RadioButton.Group>
            </View>
          </ScrollView>
          )}

          <Surface style={[styles.footer, { borderTopColor: borderColor }]} elevation={8}>
            {isFiltered && (
              <Button mode="outlined" onPress={handleResetFilters} style={styles.resetButton}>
                Reset
              </Button>
            )}
            <Button mode="contained" onPress={handleApplyFilters} style={styles.applyButton}>
              Apply Filters
            </Button>
          </Surface>
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
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    margin: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    margin: 0,
    marginRight: 4,
  },
  divider: {
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  chip: {
    margin: 4,
  },
  radioItem: {
    paddingVertical: 4,
  },
  radioLabel: {
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  resetButton: {
    borderRadius: 24,
  },
  applyButton: {
    borderRadius: 24,
    paddingHorizontal: 8,
  },
});
