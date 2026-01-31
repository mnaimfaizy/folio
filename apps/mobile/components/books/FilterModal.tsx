import React, { useState } from 'react';

import { Modal, ScrollView, StyleSheet, View } from 'react-native';

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { Button, Chip, Divider, IconButton, RadioButton, Surface, Text } from 'react-native-paper';

import { useThemeColor } from '../../hooks/useThemeColor';

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

  const borderColor = useThemeColor({ lightColor: '#e0e0e0', darkColor: '#2c2c2e' }, 'border');

  const genres = [
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'Science Fiction',
    'Fantasy',
    'Romance',
    'Thriller',
    'Biography',
    'History',
    'Self-Help',
  ];

  const years = [
    { label: 'Any Year', value: null },
    { label: '2023+', value: 2023 },
    { label: '2020+', value: 2020 },
    { label: '2015+', value: 2015 },
    { label: '2010+', value: 2010 },
    { label: '2000+', value: 2000 },
    { label: 'Before 2000', value: 1999 },
  ];

  const sortOptions = [
    { label: 'Title (A-Z)', value: { sortBy: 'title', sortOrder: 'asc' } },
    { label: 'Title (Z-A)', value: { sortBy: 'title', sortOrder: 'desc' } },
    { label: 'Author (A-Z)', value: { sortBy: 'author', sortOrder: 'asc' } },
    { label: 'Year (Newest)', value: { sortBy: 'year', sortOrder: 'desc' } },
    { label: 'Year (Oldest)', value: { sortBy: 'year', sortOrder: 'asc' } },
    { label: 'Popularity', value: { sortBy: 'popularity', sortOrder: 'desc' } },
  ];

  const availabilityOptions = [
    { label: 'All Books', value: 'all' },
    { label: 'Available Only', value: 'available' },
    { label: 'Checked Out', value: 'unavailable' },
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
    sortBy: 'title' | 'author' | 'year' | 'popularity',
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
      <BlurView intensity={20} style={styles.overlay}>
        <Surface style={[styles.container, { borderColor }]} elevation={4}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <Text variant="titleLarge" style={styles.title}>
              Filter Books
            </Text>
            <IconButton icon="close" size={24} onPress={onClose} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Genres
              </Text>
              <View style={styles.chipContainer}>
                {genres.map(genre => (
                  <Chip
                    key={genre}
                    mode={filters.genre === genre ? 'flat' : 'outlined'}
                    selected={filters.genre === genre}
                    onPress={() => handleSelectGenre(genre)}
                    style={styles.chip}>
                    {genre}
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Publication Year
              </Text>
              <RadioButton.Group
                value={filters.year?.toString() || 'null'}
                onValueChange={value => handleSelectYear(value === 'null' ? null : Number(value))}>
                {years.map(year => (
                  <RadioButton.Item
                    key={year.label}
                    label={year.label}
                    value={year.value?.toString() || 'null'}
                    position="leading"
                    style={styles.radioItem}
                  />
                ))}
              </RadioButton.Group>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Availability
              </Text>
              <RadioButton.Group
                value={filters.availability || 'all'}
                onValueChange={value =>
                  handleSelectAvailability(value as 'all' | 'available' | 'unavailable')
                }>
                {availabilityOptions.map(option => (
                  <RadioButton.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    position="leading"
                    style={styles.radioItem}
                  />
                ))}
              </RadioButton.Group>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Sort By
              </Text>
              <RadioButton.Group
                value={
                  filters.sortBy && filters.sortOrder
                    ? `${filters.sortBy}-${filters.sortOrder}`
                    : ''
                }
                onValueChange={value => {
                  if (value) {
                    const [sortBy, sortOrder] = value.split('-') as [
                      'title' | 'author' | 'year' | 'popularity',
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
                  />
                ))}
              </RadioButton.Group>
            </View>
          </ScrollView>

          <Surface style={[styles.footer, { borderTopColor: borderColor }]} elevation={4}>
            {isFiltered && (
              <Button mode="text" onPress={handleResetFilters} style={styles.resetButton}>
                <Text>Reset Filters</Text>
              </Button>
            )}
            <Button mode="contained" onPress={handleApplyFilters} style={styles.applyButton}>
              <Text>Apply Filters</Text>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  divider: {
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
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
    paddingVertical: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  resetButton: {
    marginRight: 12,
  },
  applyButton: {
    borderRadius: 8,
  },
});
