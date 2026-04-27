import {
  resolveFallback,
  resolveNestedFallback,
  mergeWithProps,
  resolveMediaFallback,
  type FallbackSource,
} from '@/lib/content/fallback';

describe('Content Fallback Utilities', () => {
  describe('resolveFallback', () => {
    it('should return content value when available', () => {
      const result = resolveFallback(
        'Content Value',
        'Props Value',
        'Default Value'
      );
      expect(result).toBe('Content Value');
    });

    it('should fallback to props when content is null', () => {
      const result = resolveFallback(
        null,
        'Props Value',
        'Default Value'
      );
      expect(result).toBe('Props Value');
    });

    it('should fallback to props when content is undefined', () => {
      const result = resolveFallback(
        undefined,
        'Props Value',
        'Default Value'
      );
      expect(result).toBe('Props Value');
    });

    it('should fallback to default when both content and props are null', () => {
      const result = resolveFallback(
        null,
        null,
        'Default Value'
      );
      expect(result).toBe('Default Value');
    });

    it('should fallback to default when both content and props are undefined', () => {
      const result = resolveFallback(
        undefined,
        undefined,
        'Default Value'
      );
      expect(result).toBe('Default Value');
    });

    it('should handle empty string as valid content value', () => {
      const result = resolveFallback(
        '',
        'Props Value',
        'Default Value'
      );
      expect(result).toBe('');
    });

    it('should handle zero as valid content value', () => {
      const result = resolveFallback(
        0,
        10,
        100
      );
      expect(result).toBe(0);
    });

    it('should handle false as valid content value', () => {
      const result = resolveFallback(
        false,
        true,
        true
      );
      expect(result).toBe(false);
    });

    describe('trim option', () => {
      it('should trim string values when trim is true', () => {
        const result = resolveFallback(
          '  Content Value  ',
          undefined,
          'Default',
          { trim: true }
        );
        expect(result).toBe('Content Value');
      });

      it('should not trim string values when trim is false', () => {
        const result = resolveFallback(
          '  Content Value  ',
          undefined,
          'Default',
          { trim: false }
        );
        expect(result).toBe('  Content Value  ');
      });

      it('should not trim when trim is not specified', () => {
        const result = resolveFallback(
          '  Content Value  ',
          undefined,
          'Default'
        );
        expect(result).toBe('  Content Value  ');
      });

      it('should skip whitespace-only props and use default when trim is true', () => {
        const result = resolveFallback(
          undefined,
          '   ',
          'Default Value',
          { trim: true }
        );
        expect(result).toBe('Default Value');
      });

      it('should skip whitespace-only content and props, use default when trim is true', () => {
        const result = resolveFallback(
          '  ',
          ' ',
          'Default Value',
          { trim: true }
        );
        expect(result).toBe('Default Value');
      });
    });

    describe('validate option', () => {
      it('should skip content value when validation fails', () => {
        const result = resolveFallback(
          'bad',
          'Props Value',
          'Default',
          {
            validate: (val) => val.length > 5,
          }
        );
        expect(result).toBe('Props Value');
      });

      it('should use content value when validation passes', () => {
        const result = resolveFallback(
          'good value',
          'Props Value',
          'Default',
          {
            validate: (val) => val.length > 5,
          }
        );
        expect(result).toBe('good value');
      });

      it('should skip props value when validation fails', () => {
        const result = resolveFallback(
          null,
          'bad',
          'Default',
          {
            validate: (val) => val.length > 5,
          }
        );
        expect(result).toBe('Default');
      });
    });

    describe('onFallback callback', () => {
      it('should call callback with content source', () => {
        const callback = jest.fn();
        resolveFallback(
          'Content',
          undefined,
          'Default',
          { onFallback: callback }
        );
        expect(callback).toHaveBeenCalledWith('content');
      });

      it('should call callback with props source', () => {
        const callback = jest.fn();
        resolveFallback(
          null,
          'Props',
          'Default',
          { onFallback: callback }
        );
        expect(callback).toHaveBeenCalledWith('props');
      });

      it('should call callback with default source', () => {
        const callback = jest.fn();
        resolveFallback(
          null,
          null,
          'Default',
          { onFallback: callback }
        );
        expect(callback).toHaveBeenCalledWith('default');
      });

      it('should not call callback when content is valid', () => {
        const callback = jest.fn();
        resolveFallback(
          'Content',
          'Props',
          'Default',
          { onFallback: callback }
        );
        expect(callback).toHaveBeenCalledWith('content');
      });
    });
  });

  describe('resolveNestedFallback', () => {
    it('should return content object when available', () => {
      const contentObj = { text: 'Content', href: '/content' };
      const propsObj = { text: 'Props', href: '/props' };
      const defaultObj = { text: 'Default', href: '/default' };

      const result = resolveNestedFallback(contentObj, propsObj, defaultObj);
      expect(result).toEqual(contentObj);
    });

    it('should fallback to props object when content is null', () => {
      const propsObj = { text: 'Props', href: '/props' };
      const defaultObj = { text: 'Default', href: '/default' };

      const result = resolveNestedFallback(null, propsObj, defaultObj);
      expect(result).toEqual(propsObj);
    });

    it('should fallback to default object when both are null', () => {
      const defaultObj = { text: 'Default', href: '/default' };

      const result = resolveNestedFallback(null, null, defaultObj);
      expect(result).toEqual(defaultObj);
    });

    it('should handle empty object as valid', () => {
      const contentObj = {};
      const defaultObj = { text: 'Default', href: '/default' };

      const result = resolveNestedFallback(contentObj, null, defaultObj);
      expect(result).toEqual(contentObj);
    });

    it('should call callback with key path', () => {
      const callback = jest.fn();
      const defaultObj = { text: 'Default', href: '/default' };

      resolveNestedFallback(
        null,
        null,
        defaultObj,
        'hero.primaryCTA',
        { onFallback: callback }
      );

      expect(callback).toHaveBeenCalledWith('default', 'hero.primaryCTA');
    });
  });

  describe('mergeWithProps', () => {
    it('should merge content object with props, props winning', () => {
      const contentObj = { text: 'Content', href: '/content', extra: 'from-content' };
      const propsObj = { text: 'Props', href: '/props', extra: 'from-props' };

      const result = mergeWithProps(contentObj, propsObj);

      expect(result).toEqual({
        text: 'Props', // from props
        href: '/props', // from props
        extra: 'from-props', // from props
      });
    });

    it('should return content object when props is null', () => {
      const contentObj = { text: 'Content', href: '/content' };

      const result = mergeWithProps(contentObj, null);

      expect(result).toEqual(contentObj);
    });

    it('should return props object when content is null', () => {
      const propsObj = { text: 'Props', href: '/props' };

      const result = mergeWithProps(null, propsObj);

      expect(result).toEqual(propsObj);
    });

    it('should return empty object when both are null', () => {
      const result = mergeWithProps(null, null);
      expect(result).toEqual({});
    });

    it('should handle partial props object', () => {
      const contentObj = { text: 'Content', href: '/content', extra: 'value' };
      const propsObj = { text: 'Props' }; // only override text

      const result = mergeWithProps(contentObj, propsObj);

      expect(result).toEqual({
        text: 'Props',
        href: '/content',
        extra: 'value',
      });
    });
  });

  describe('resolveMediaFallback', () => {
    it('should return resolved URL when available', () => {
      const result = resolveMediaFallback(
        '@media:homepage.hero',
        'https://cdn.example.com/hero.jpg',
        '/props/image.jpg',
        '/default/image.jpg'
      );
      expect(result).toBe('https://cdn.example.com/hero.jpg');
    });

    it('should fallback to props value when resolved URL is null', () => {
      const result = resolveMediaFallback(
        '@media:homepage.hero',
        null,
        '/props/image.jpg',
        '/default/image.jpg'
      );
      expect(result).toBe('/props/image.jpg');
    });

    it('should fallback to props value when resolved URL is undefined', () => {
      const result = resolveMediaFallback(
        '@media:homepage.hero',
        undefined,
        '/props/image.jpg',
        '/default/image.jpg'
      );
      expect(result).toBe('/props/image.jpg');
    });

    it('should fallback to default when both are unavailable', () => {
      const result = resolveMediaFallback(
        null,
        null,
        null,
        '/default/image.jpg'
      );
      expect(result).toBe('/default/image.jpg');
    });

    it('should call callback with content source when resolved URL used', () => {
      const callback = jest.fn();
      resolveMediaFallback(
        '@media:homepage.hero',
        'https://cdn.example.com/hero.jpg',
        '/props/image.jpg',
        '/default/image.jpg',
        { onFallback: callback }
      );
      expect(callback).toHaveBeenCalledWith('content');
    });

    it('should call callback with props source when props used', () => {
      const callback = jest.fn();
      resolveMediaFallback(
        '@media:homepage.hero',
        null,
        '/props/image.jpg',
        '/default/image.jpg',
        { onFallback: callback }
      );
      expect(callback).toHaveBeenCalledWith('props');
    });
  });
});
