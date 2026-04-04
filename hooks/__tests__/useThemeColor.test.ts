import {useThemeColor, useThemeColorWithVariant} from '../useThemeColor';

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: {
      primary: '#007AFF',
      background: '#FFFFFF',
    },
    dark: {
      primary: '#0A84FF',
      background: '#000000',
    },
  },
}));

describe('useThemeColor', () => {
  it('should return dark theme color from props when provided', () => {
    const result = useThemeColor({light: '#007AFF', dark: '#0A84FF'}, 'primary');
    expect(result).toBe('#0A84FF');
  });

  it('should return dark theme color for any color name when props provided', () => {
    const result = useThemeColor({light: '#007AFF', dark: '#0A84FF'}, 'background');
    expect(result).toBe('#0A84FF');
  });

  it('should return default dark color when no props provided', () => {
    const result = useThemeColor({}, 'primary');
    expect(result).toBe('#0A84FF');
  });

  it('should return default dark background when no props provided', () => {
    const result = useThemeColor({}, 'background');
    expect(result).toBe('#000000');
  });
});

describe('useThemeColorWithVariant', () => {
  it('should return light variant color when specified', () => {
    const result = useThemeColorWithVariant(
      {light: '#007AFF', dark: '#0A84FF'},
      'primary',
      'light'
    );
    expect(result).toBe('#007AFF');
  });

  it('should return dark variant color when specified', () => {
    const result = useThemeColorWithVariant(
      {light: '#007AFF', dark: '#0A84FF'},
      'primary',
      'dark'
    );
    expect(result).toBe('#0A84FF');
  });

  it('should return dark variant by default when no variant specified', () => {
    const result = useThemeColorWithVariant(
      {light: '#007AFF', dark: '#0A84FF'},
      'background'
    );
    expect(result).toBe('#0A84FF');
  });
});
