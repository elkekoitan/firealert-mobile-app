import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { CustomButton } from './CustomButton';
import { ThemeProvider } from 'react-native-paper';
import { lightTheme } from '../../../theme/theme';

describe('CustomButton', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider theme={lightTheme}>
        {component}
      </ThemeProvider>
    );
  };

  it('should render with default props', () => {
    renderWithTheme(<CustomButton title="Test Button" />);
    
    expect(screen.getByText('Test Button')).toBeTruthy();
    expect(screen.getByTestId('custom-button')).toBeTruthy();
  });

  it('should render with different variants', () => {
    const { rerender } = renderWithTheme(<CustomButton title="Test" variant="primary" />);
    expect(screen.getByTestId('custom-button')).toHaveStyle({
      backgroundColor: '#FF5722', // primary color from theme
    });

    rerender(<ThemeProvider theme={lightTheme}><CustomButton title="Test" variant="secondary" /></ThemeProvider>);
    expect(screen.getByTestId('custom-button')).toHaveStyle({
      backgroundColor: '#FFC107', // secondary color from theme
    });

    rerender(<ThemeProvider theme={lightTheme}><CustomButton title="Test" variant="outline" /></ThemeProvider>);
    expect(screen.getByTestId('custom-button')).toHaveStyle({
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#FF5722',
    });
  });

  it('should handle press events', () => {
    const onPressMock = jest.fn();
    renderWithTheme(<CustomButton title="Test" onPress={onPressMock} />);
    
    fireEvent.press(screen.getByText('Test'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    renderWithTheme(<CustomButton title="Test" onPress={onPressMock} disabled />);
    
    fireEvent.press(screen.getByText('Test'));
    expect(onPressMock).not.toHaveBeenCalled();
    
    expect(screen.getByTestId('custom-button')).toHaveStyle({
      opacity: 0.5,
    });
  });

  it('should show loading state when loading is true', () => {
    renderWithTheme(<CustomButton title="Test" loading />);
    
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    expect(screen.getByText('Test')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { marginTop: 20 };
    renderWithTheme(<CustomButton title="Test" style={customStyle} />);
    
    expect(screen.getByTestId('custom-button')).toHaveStyle(customStyle);
  });

  it('should apply testID correctly', () => {
    renderWithTheme(<CustomButton title="Test" testID="custom-test-button" />);
    
    expect(screen.getByTestId('custom-test-button')).toBeTruthy();
  });

  it('should render icon when provided', () => {
    renderWithTheme(<CustomButton title="Test" icon="plus" />);
    
    expect(screen.getByTestId('custom-button-icon')).toBeTruthy();
  });

  it('should not render icon when not provided', () => {
    renderWithTheme(<CustomButton title="Test" />);
    
    expect(screen.queryByTestId('custom-button-icon')).toBeNull();
  });

  it('should handle accessibility correctly', () => {
    renderWithTheme(<CustomButton title="Test" accessibilityLabel="Test Button" />);
    
    const button = screen.getByLabelText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should have correct accessibility states', () => {
    const { rerender } = renderWithTheme(<CustomButton title="Test" />);
    
    let button = screen.getByLabelText('Test Button');
    expect(button.props.accessibilityState).toEqual({ disabled: false });

    rerender(<ThemeProvider theme={lightTheme}><CustomButton title="Test" disabled /></ThemeProvider>);
    button = screen.getByLabelText('Test Button');
    expect(button.props.accessibilityState).toEqual({ disabled: true });
  });
});