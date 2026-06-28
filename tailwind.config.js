/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ---- Editorial brand palette (public site) ----
        // High-fashion "L'Atelier d'Artiste" system: warm paper canvas,
        // architectural onyx, velvet burgundy and antique-gold ornament.
        'pearl-white': '#F8F4F0',
        'onyx-black': '#1A1A1A',
        'deep-burgundy': '#4A0404',
        'antique-gold': '#B58D3D',
        canvas: '#FCF9F8',
        ink: '#1C1B1B',
        'ink-soft': '#554240',
        line: '#DCC0BD',
        'line-strong': '#89726F',
        'gold-soft': '#C9A86A',

        // ---- Admin panel palette (light, Ana Beatriz identity) ----
        // The admin reuses these generic token names; remapped to the brand's
        // warm/light editorial palette (pearl canvas, onyx ink, antique gold).
        'surface-container': '#ffffff', // cards
        'tertiary-container': '#efe9e3',
        'pure-black': '#1A1A1A', // dark text (e.g. on gold buttons)
        'outline-variant': '#e6ddd4', // hairline borders
        'inverse-surface': '#1A1A1A',
        'inverse-on-surface': '#F8F4F0',
        surface: '#F8F4F0',
        'surface-container-high': '#efe9e3',
        primary: '#1A1A1A', // onyx: headings + dark buttons
        background: '#F8F4F0',
        'primary-container': '#4A0404',
        secondary: '#6E635E',
        'on-background': '#1A1A1A',
        'on-surface-variant': '#5b5048',
        'surface-container-highest': '#e7ded5',
        'silver-gray': '#6E635E', // muted text on light
        'secondary-container': '#efe9e3',
        'status-gold': '#B58D3D', // antique gold accent
        'on-primary': '#F8F4F0', // light text on dark buttons
        outline: '#b7a99f',
        'surface-container-low': '#f3eee9', // inputs / subtle fills
        'surface-tint': '#B58D3D',
        'surface-container-lowest': '#F8F4F0', // admin page background
        'surface-dim': '#efe9e3',
        'on-surface': '#1A1A1A',
        error: '#B3261E',
        'on-error': '#ffffff',
        'error-container': '#f9dedc',
        tertiary: '#4A0404',
        'surface-variant': '#efe9e3',
        'surface-bright': '#ffffff',
      },
      borderRadius: {
        // Sharp, architectural edges per the editorial system.
        DEFAULT: '0px',
        sm: '0px',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '9999px',
      },
      spacing: {
        unit: '8px',
        gutter: '40px',
        'safe-margin': '80px',
        'safe-margin-mobile': '24px',
        'section-gap': '160px',
        // legacy tokens still referenced by the admin panel
        'margin-desktop': '80px',
        'margin-mobile': '20px',
        'margin-tablet': '40px',
      },
      fontFamily: {
        // EB Garamond = the "Artiste" (monumental headlines/display).
        'display-xl': ['"EB Garamond"', 'serif'],
        'headline-lg': ['"EB Garamond"', 'serif'],
        'headline-lg-mobile': ['"EB Garamond"', 'serif'],
        'headline-md': ['"EB Garamond"', 'serif'],
        // Montserrat = the "Atelier" (precise, modernist UI/labels/body).
        'body-lg': ['Montserrat', 'sans-serif'],
        'body-md': ['Montserrat', 'sans-serif'],
        'nav-item': ['Montserrat', 'sans-serif'],
        'label-caps': ['Montserrat', 'sans-serif'],
        'label-sm': ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['120px', { lineHeight: '110px', letterSpacing: '-0.04em', fontWeight: '400' }],
        'headline-lg': ['64px', { lineHeight: '72px', letterSpacing: '-0.02em', fontWeight: '400' }],
        'headline-lg-mobile': ['40px', { lineHeight: '48px', fontWeight: '400' }],
        'headline-md': ['32px', { lineHeight: '40px', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '32px', letterSpacing: '0.01em', fontWeight: '300' }],
        'body-md': ['15px', { lineHeight: '26px', fontWeight: '400' }],
        'nav-item': ['12px', { lineHeight: '16px', letterSpacing: '0.15em', fontWeight: '400' }],
        'label-caps': ['11px', { lineHeight: '16px', letterSpacing: '0.2em', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
}
