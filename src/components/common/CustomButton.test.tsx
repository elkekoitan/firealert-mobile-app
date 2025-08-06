import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { CustomButton } from './CustomButton';

describe('CustomButton', () => {
  const mockOnPress = jest.fn();
  const mockLabel = 'Test Button';

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders correctly with default props', () => {
    render(<CustomButton label={mockLabel} onPress={mockOnPress} />);
    
    expect(screen.getByText(mockLabel)).toBeTruthy();
    expect(screen.getByTestId('custom-button')).toBeTruthy();
  });

  it('renders with loading state', () => {
    render(<CustomButton label={mockLabel} onPress={mockOnPress} loading />);
    
    expect(screen.getByText('Yükleniyor...')).toBeTruthy();
    expect(screen.getByTestId('custom-button')).toBeTruthy();
  });

  it('renders with disabled state', () => {
    render(<CustomButton label={mockLabel} onPress={mockOnPress} disabled />);
    
    expect(screen.getByText(mockLabel)).toBeTruthy();
    const button = screen.getByTestId('custom-button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('calls onPress when pressed', () => {
    render(<CustomButton label={mockLabel} onPress={mockOnPress} />);
    
    fireEvent.press(screen.getByText(mockLabel));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    render(<CustomButton label={mockLabel} onPress={mockOnPress} disabled />);
    
    fireEvent.press(screen.getByText(mockLabel));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    render(<CustomButton label={mockLabel} onPress={mockOnPress} loading />);
    
    fireEvent.press(screen.getByText('Yükleniyor...'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders with variant="primary"', () => {
    render(<CustomButton label={mockLabel} onPress={mockOnPress} variant="primary" />);
    
    const button = screen.getByTestId('custom-button');
    expect(button.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: expect.any(String),
      })
    );
  });

  it('renders with variant="secondary"', () => {
    render(<CustomButton label={mockLabel} onPress={mockOnPress} variant="secondary" />);
    
    const button = screen.getByTestId('custom-button');
    expect(button.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: expect.any(String),
      })
    );
  });

  it('renders with variant="outline"', () => {
    render(<CustomButton label={mockLabel} onPress={mockOnPress} variant="outline" />);
    
    const button = screen.getByTestId('custom-button');
    expect(button.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: 'transparent',
        borderWidth: expect.any(Number),
      })
    );
  });

  it('renders with icon', () => {
    const mockIcon = 'test-icon';
    render(<CustomButton label={mockLabel} onPress={mockOnPress} icon={mockIcon} />);
    
    const button = screen.getByTestId('custom-button');
    expect(button.props.style).toContainEqual(
      expect.objectContaining({
        flexDirection: 'row',
        alignItems: 'center',
      })
    );
  });

  it('has correct accessibility label', () => {
    const accessibilityLabel = 'Test Button Accessibility';
    render(
      <CustomButton 
        label={mockLabel} 
        onPress={mockOnPress} 
        accessibilityLabel={accessibilityLabel} 
      />
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button.props.accessibilityLabel).toBe(accessibilityLabel);
  });

  it('has default accessibility label when none provided', () => {
    render(<CustomButton label={mockLabel} onPress={mockOnPress} />);
    
    const button = screen.getByTestId('custom-button');
    expect(button.props.accessibilityLabel).toBe(mockLabel);
  });

  it('applies custom style', () => {
    const customStyle = { marginTop: 20 };
    render(<CustomButton label={mockLabel} onPress={mockOnPress} style={customStyle} />);
    
    const button = screen.getByTestId('custom-button');
    expect(button.props.style).toContainEqual(customStyle);
  });

  it('merges custom style with default style', () => {
    const customStyle = { marginTop: 20 };
    render(<CustomButton label={mockLabel} onPress={mockOnPress} style={customStyle} />);
    
    const button = screen.getByTestId('custom-button');
    expect(button.props.style).toContainEqual(customStyle);
    expect(button.props.style).toContainEqual(
      expect.objectContaining({
        padding: expect.any(Number),
      })
    );
  });
});