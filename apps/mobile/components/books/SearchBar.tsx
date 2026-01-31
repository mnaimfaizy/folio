/* eslint-disable react-native/no-color-literals */
import React, { useRef, useState } from 'react';

import { Animated, Keyboard, StyleSheet, View } from 'react-native';

import { IconButton, Searchbar } from 'react-native-paper';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  initialValue?: string;
  showFilters?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFilterPress,
  placeholder = 'Search for books...',
  initialValue = '',
  showFilters = true,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const animatedWidth = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedWidth, {
      toValue: 0.85,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedWidth, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSearch = () => {
    onSearch(searchQuery);
    Keyboard.dismiss();
  };

  const handleChangeText = (text: string) => {
    setSearchQuery(text);
    // For a real-time search experience
    onSearch(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['85%', '100%'],
            }),
          },
        ]}>
        <Searchbar
          placeholder={placeholder}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          icon="magnify"
          clearIcon="close-circle"
          onClearIconPress={clearSearch}
          mode="bar"
          showDivider={false}
          traileringIcon={showFilters ? 'filter-outline' : undefined}
          traileringIconAccessibilityLabel="Filter"
          onTraileringIconPress={onFilterPress}
        />
      </Animated.View>

      {isFocused && (
        <IconButton
          icon="keyboard-backspace"
          size={24}
          onPress={() => {
            Keyboard.dismiss();
            handleBlur();
          }}
          style={styles.cancelButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    height: 48,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: 'transparent',
    borderRadius: 10,
    height: 48,
  },
  searchInput: {
    fontSize: 16,
    paddingVertical: 0,
    minHeight: 48,
  },
  cancelButton: {
    marginLeft: 4,
  },
});
