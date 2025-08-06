import React from 'react';
import { Button, ButtonProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface CustomButtonProps extends Omit<ButtonProps, 'children'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  style,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    if (size === 'small') baseStyle.push(styles.small);
    if (size === 'large') baseStyle.push(styles.large);
    
    return baseStyle;
  };

  const getButtonColor = () => {
    switch (variant) {
      case 'secondary': return '#FFC107';
      case 'danger': return '#F44336';
      default: return '#FF5722';
    }
  };

  return (
    <Button
      mode="contained"
      buttonColor={getButtonColor()}
      style={[...getButtonStyle(), style]}
      {...props}
    >
      {title}
    </Button>
  );
};

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
});