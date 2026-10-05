import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { Product } from '@/lib/api';

export type { Product };

export function useTheme() {
  const scheme = useColorScheme();
  const mode = scheme === 'dark' ? 'dark' : 'light';
  return { colors: Colors[mode], mode };
}

export function money(symbol: string, value: string) {
  return `${symbol}${value}`;
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({ title, onPress, disabled, variant = 'primary' }: ButtonProps) {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? colors.red : colors.backgroundElement,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}>
      <Text
        style={[
          styles.buttonText,
          { color: isPrimary ? '#fff' : colors.text },
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'characters' | 'words' | 'sentences';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
};

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
}: FieldProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.background,
          },
          multiline && { height: 80, textAlignVertical: 'top' },
        ]}
      />
    </View>
  );
}

type CardProps = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: CardProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.cardImage} contentFit="cover" />
      ) : (
        <View
          style={[
            styles.cardImage,
            { backgroundColor: colors.backgroundElement, alignItems: 'center', justifyContent: 'center' },
          ]}>
          <Text style={{ color: colors.textSecondary }}>No image</Text>
        </View>
      )}
      <View style={{ padding: 12, gap: 4 }}>
        <Text
          numberOfLines={1}
          style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>
          {product.name}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          {product.category.name}
        </Text>
        <Text style={{ color: colors.red, fontWeight: '700', fontSize: 15 }}>
          ${product.price}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
  },
});
