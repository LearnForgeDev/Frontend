import type { CSSProperties } from 'react';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    titleS: CSSProperties;
    bodyM: CSSProperties;
    bodyS: CSSProperties;
  }
  interface TypographyVariantsOptions {
    titleS?: CSSProperties;
    bodyM?: CSSProperties;
    bodyS?: CSSProperties;
  }
  interface Palette {
    brand: Palette['primary'];
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    titleS: true;
    bodyM: true;
    bodyS: true;
  }
}
