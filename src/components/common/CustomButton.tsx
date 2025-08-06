import React, { memo, useMemo } from 'react';
import { Button, ButtonProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface CustomButtonProps extends Omit<ButtonProps, 'children'> {
  title?: string;
  label?: string; // alias for tests
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: any;
}

export const CustomButton: React.FC<CustomButtonProps> = memo(({
  title,
  label,
  variant = 'primary',
  size = 'medium',
  style,
  ...props
}) => {
  const buttonStyle = useMemo(() => {
    const baseStyle = [styles.button];
    
    if (size === 'small') baseStyle.push(styles.small);
    if (size === 'large') baseStyle.push(styles.large);
    if (props.icon) baseStyle.push(styles.withIcon);
    
    return [...baseStyle, style];
  }, [size, style]);

  const buttonColor = useMemo(() => {
    switch (variant) {
      case 'secondary': return '#FFC107';
      case 'danger': return '#F44336';
      default: return '#FF5722';
    }
  }, [variant]);

  const handlePress = (e: any) => {
    if (props.disabled || props.loading) return;
    // @ts-ignore
    props.onPress && props.onPress(e);
  };

  return (
    <Button
      mode={variant === 'outline' ? 'outlined' : 'contained'
      }
      buttonColor={variant === 'outline' ? undefined : buttonColor}
      style={[{ padding: 8 }, variant === 'outline' ? { backgroundColor: 'transparent', borderWidth: 1 } : { backgroundColor: buttonColor }, ...buttonStyle]}
      testID="custom-button"
      accessibilityLabel={props.accessibilityLabel || title || label}
      accessibilityState={{ disabled: !!props.disabled, busy: !!props.loading, ...(props as any).accessibilityState }}
      {...props}
      onPress={handlePress}
    >
      {props.loading ? 'Yükleniyor...' : (title || label || '')}
    </Button>
  );
});

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  small: {
    minHeight: 36,
  },
  large: {
    minHeight: 56,
  },
  withIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
