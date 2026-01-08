export type OptionItem = { label: string; value: string; icon?: string };

// --- RESENHA ---

export const RESENHA_VIBES: OptionItem[] = [
    { label: 'Bem de boa', value: 'chill', icon: '😌' },
    { label: 'Animado', value: 'lively', icon: '😄' },
    { label: 'Festa mesmo', value: 'party', icon: '🔥' },
];

export const RESENHA_LOCATIONS: OptionItem[] = [
    { label: 'Casa', value: 'home', icon: '🏠' },
    { label: 'Bar', value: 'bar', icon: '🍺' },
    { label: 'Aberto / Público', value: 'outdoor', icon: '🌳' },
];

export const RESENHA_TAGS = [
    '#aniversario',
    '#churrasco',
    '#festa',
    '#bar',
    '#show',
    '#resenhaaberta',
    '#after',
];

// --- NETWORKING ---

export const NETWORKING_AREAS: OptionItem[] = [
    { label: 'Tech & Dev', value: 'tech', icon: '💻' },
    { label: 'Marketing', value: 'marketing', icon: '📢' },
    { label: 'Design', value: 'design', icon: '🎨' },
    { label: 'Negócios', value: 'business', icon: '💼' },
    { label: 'Criativo', value: 'creative', icon: '💡' },
];

export const NETWORKING_PROFILES: OptionItem[] = [
    { label: 'Iniciante', value: 'beginner' },
    { label: 'Pleno', value: 'mid' },
    { label: 'Senior', value: 'senior' },
    { label: 'Misto / Todos', value: 'mixed' },
];

export const NETWORKING_FORMATS: OptionItem[] = [
    { label: 'Bate-papo', value: 'chat' },
    { label: 'Roda de Conversa', value: 'round_table' },
    { label: 'Apresentação', value: 'presentation' },
    { label: 'Open Networking', value: 'open' },
];

export const NETWORKING_TAGS = [
    '#networking',
    '#tech',
    '#startups',
    '#design',
    '#marketing',
    '#empreendedorismo',
];
