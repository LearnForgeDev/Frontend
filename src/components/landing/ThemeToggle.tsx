import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark';
type ThemeMode = Theme | 'system';

const THEME_STORAGE_KEY = 'learnforge-theme';
const LEGACY_THEME_STORAGE_KEY = 'learnfordge-theme';
const LABEL_THEME = '\u0422\u0435\u043c\u0430';
const ARIA_LABEL = '\u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0430\u0442\u0435\u043b\u044c \u0442\u0435\u043c\u044b';
const OPTION_LABELS: Record<ThemeMode, string> = {
  system: '\u0421\u0438\u0441\u0442\u0435\u043c\u043d\u0430\u044f',
  light: '\u0421\u0432\u0435\u0442\u043b\u0430\u044f',
  dark: '\u0422\u0451\u043c\u043d\u0430\u044f',
};

const getSystemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState<Theme>(() => getSystemTheme());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return systemTheme;
};

const migrateLegacyTheme = (): Theme | null => {
  const legacy = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
  if (legacy === 'light' || legacy === 'dark') {
    localStorage.setItem(THEME_STORAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    return legacy;
  }
  return null;
};

const getInitialMode = (): ThemeMode => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === 'system') {
    return 'system';
  }

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  const legacyTheme = migrateLegacyTheme();
  if (legacyTheme) {
    return legacyTheme;
  }

  return 'system';
};

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

export default function ThemeToggle() {
  const selectId = 'theme-select';
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);
  const systemTheme = useSystemTheme();
  const theme = mode === 'system' ? systemTheme : mode;
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const handleModeChange = (value: ThemeMode) => {
    setMode(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="theme-toggle" ref={wrapperRef}>
      <label className="theme-toggle__label" htmlFor={selectId}>
        <span className="theme-toggle__dot" aria-hidden />
        {LABEL_THEME}
      </label>
      <div className="theme-toggle__controls">
        <button
          className="theme-toggle__trigger"
          id={selectId}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ARIA_LABEL}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="theme-toggle__value">{OPTION_LABELS[mode]}</span>
          <span className="theme-toggle__arrow" aria-hidden />
        </button>
        {isOpen ? (
          <div className="theme-toggle__menu" role="listbox" aria-activedescendant={`${selectId}-${mode}`}>
            {(['system', 'light', 'dark'] as ThemeMode[]).map((value) => (
              <button
                key={value}
                type="button"
                className="theme-toggle__option"
                role="option"
                id={`${selectId}-${value}`}
                aria-selected={mode === value}
                onClick={() => handleModeChange(value)}
              >
                <span>{OPTION_LABELS[value]}</span>
                {mode === value ? <span className="theme-toggle__check" aria-hidden>{'\u2713'}</span> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
