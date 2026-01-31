import React, { useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { HelperText, TextInput } from 'react-native-paper';

interface FormInputProps extends React.ComponentProps<typeof TextInput> {
  label: string;
  errorMessage?: string;
  secureTextEntry?: boolean;
  icon?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  errorMessage,
  secureTextEntry,
  icon,
  ...props
}) => {
  const [, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        secureTextEntry={secureTextEntry && !showPassword}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        mode="outlined"
        error={!!errorMessage}
        left={icon ? <TextInput.Icon icon={icon} /> : undefined}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          ) : undefined
        }
        style={styles.input}
        outlineStyle={styles.outline}
        {...props}
      />
      {errorMessage ? (
        <HelperText type="error" visible={!!errorMessage} style={styles.error}>
          {errorMessage}
        </HelperText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  // eslint-disable-next-line react-native/no-color-literals
  input: {
    backgroundColor: 'transparent',
  },
  outline: {
    borderRadius: 8,
  },
  error: {
    marginBottom: 0,
    paddingHorizontal: 0,
  },
});
