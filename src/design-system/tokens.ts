export const colorTokens = {
  background: {
    label: 'Background',
    cssVar: '--background',
    description: 'Plano de fundo neutro usado na base das páginas.',
  },
  foreground: {
    label: 'Foreground',
    cssVar: '--foreground',
    description: 'Cor padrão do texto sobre o fundo claro.',
  },
  primary: {
    label: 'Primary',
    cssVar: '--primary',
    description: 'Ação principal e elementos de destaque.',
  },
  secondary: {
    label: 'Secondary',
    cssVar: '--secondary',
    description: 'Fundo suave para componentes secundários.',
  },
  accent: {
    label: 'Accent',
    cssVar: '--accent',
    description: 'Realces e superfícies complementares.',
  },
  muted: {
    label: 'Muted',
    cssVar: '--muted',
    description: 'Superfícies desabilitadas ou com menos contraste.',
  },
  destructive: {
    label: 'Destructive',
    cssVar: '--destructive',
    description: 'Estado de erro ou ações destrutivas.',
  },
  ring: {
    label: 'Ring',
    cssVar: '--ring',
    description: 'Realce de foco para inputs interativos.',
  },
} as const

export const spacingScale = [
  { token: 'xs', value: '0.25rem', description: 'Espaçamento mínimo' },
  { token: 'sm', value: '0.5rem', description: 'Espaçamentos entre itens compactos' },
  { token: 'md', value: '0.75rem', description: 'Espaçamentos padrão entre elementos' },
  { token: 'lg', value: '1rem', description: 'Separação entre blocos' },
  { token: 'xl', value: '1.5rem', description: 'Respiração em seções ou cards' },
  { token: '2xl', value: '2rem', description: 'Margens internas de seções' },
] as const

export const radiiScale = [
  { token: 'sm', value: 'calc(var(--radius) - 4px)' },
  { token: 'md', value: 'calc(var(--radius) - 2px)' },
  { token: 'lg', value: 'var(--radius)' },
  { token: 'full', value: '9999px' },
] as const

export const typographyScale = [
  { token: 'Display', className: 'text-3xl font-semibold tracking-tight' },
  { token: 'Headline', className: 'text-2xl font-semibold tracking-tight' },
  { token: 'Title', className: 'text-xl font-semibold' },
  { token: 'Body', className: 'text-base text-muted-foreground' },
  { token: 'Caption', className: 'text-sm text-muted-foreground' },
] as const

export const breakpoints = [
  { token: 'sm', value: '640px' },
  { token: 'md', value: '768px' },
  { token: 'lg', value: '1024px' },
  { token: 'xl', value: '1280px' },
  { token: '2xl', value: '1400px' },
] as const
