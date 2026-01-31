/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';

import Colors from '../constants/Colors';

export type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;

export function useThemeColor(props: ThemeProps, colorName: ColorName) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[`${theme}Color`];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
