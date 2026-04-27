'use client';

import { useLocale } from '@/lib/content';
import { cn } from '@/lib/utils/utils';

export interface LanguageSelectorProps {
  variant?: 'text' | 'flags' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * LanguageSelector component for switching between available languages.
 *
 * @example
 * <LanguageSelector variant="text" />
 */
export function LanguageSelector({
  variant = 'text',
  size = 'md',
  className,
}: LanguageSelectorProps) {
  const { locale, setLocale, availableLocales, isCurrentLocale } = useLocale();

  const localeNames: Record<string, string> = {
    en: 'EN',
    es: 'ES',
    fr: 'FR',
    de: 'DE',
  };

  const sizeClasses = {
    sm: 'text-size-caption',
    md: 'text-size-body',
    lg: 'text-size-body-large',
  };

  // Text variant: EN | ES | FR | DE
  if (variant === 'text') {
    return (
      <div className={cn('flex items-center gap-1', sizeClasses[size], className)}>
        {availableLocales.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            aria-label={`Switch to ${localeNames[loc]}`}
            className={cn(
              'transition-colors hover:text-primary',
              isCurrentLocale(loc)
                ? 'font-semibold text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    );
  }

  // Flags variant: Use emoji flags
  if (variant === 'flags') {
    const flags: Record<string, string> = {
      en: '🇬🇧',
      es: '🇪🇸',
      fr: '🇫🇷',
      de: '🇩🇪',
    };

    return (
      <div className={cn('flex items-center gap-2', className)}>
        {availableLocales.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            aria-label={`Switch to ${localeNames[loc]}`}
            className={cn(
              'text-size-body-large transition-opacity hover:opacity-high',
              isCurrentLocale(loc) ? 'opacity-100' : 'opacity-mid'
            )}
            title={localeNames[loc]}
          >
            {flags[loc]}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant: Native select element
  if (variant === 'dropdown') {
    const fullLocaleNames: Record<string, string> = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
    };

    return (
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
        aria-label="Select language"
        className={cn(
          'bg-transparent border border-border rounded px-2 py-1',
          'text-sm focus:outline-none focus:ring-2 focus:ring-primary',
          sizeClasses[size],
          className
        )}
      >
        {availableLocales.map((loc) => (
          <option key={loc} value={loc}>
            {fullLocaleNames[loc]}
          </option>
        ))}
      </select>
    );
  }

  return null;
}
