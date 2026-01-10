import React from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    ScrollView,
    Platform,
    StatusBar,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import { FilterPill } from '../molecules/FilterPill';
import { ReText } from '../atoms/ReText';

// Filtros rápidos (inline) - os mais usados
const QUICK_FILTERS = [
    { id: 'hoje', label: 'Hoje' },
    { id: 'amanha', label: 'Amanhã' },
    { id: 'fds', label: 'Fim de Semana' },
    { id: 'bares', label: '🍺 Bares' },
    { id: 'shows', label: '🎵 Shows' },
];

interface FloatingHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeFilters: string[];
    onFilterToggle: (filterId: string) => void;
    onSearchSubmit?: () => void;
    advancedFiltersCount?: number; // Número de filtros avançados ativos
    onAdvancedFiltersPress?: () => void; // Abre modal de filtros avançados
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
    searchQuery,
    onSearchChange,
    activeFilters,
    onFilterToggle,
    onSearchSubmit,
    advancedFiltersCount = 0,
    onAdvancedFiltersPress,
}) => {
    // Placeholder: Mostra alert até o modal ser implementado
    const handleAdvancedFiltersPress = () => {
        if (onAdvancedFiltersPress) {
            onAdvancedFiltersPress();
        } else {
            Alert.alert(
                'Filtros Avançados',
                'Em breve você poderá filtrar por distância, preço, horário e muito mais!',
                [{ text: 'OK' }]
            );
        }
    };

    const totalActiveFilters = activeFilters.length + advancedFiltersCount;

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Icon
                    name="magnify"
                    size={22}
                    color={theme.custom.colors.textSecondary}
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar eventos ou locais..."
                    placeholderTextColor={theme.custom.colors.textSecondary}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    onSubmitEditing={onSearchSubmit}
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                    <Icon
                        name="close-circle"
                        size={20}
                        color={theme.custom.colors.textSecondary}
                        onPress={() => onSearchChange('')}
                    />
                )}
            </View>

            {/* Filter Pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.pillsScrollView}
                contentContainerStyle={styles.pillsContainer}
            >
                {QUICK_FILTERS.map((filter) => (
                    <FilterPill
                        key={filter.id}
                        label={filter.label}
                        isActive={activeFilters.includes(filter.id)}
                        onPress={() => onFilterToggle(filter.id)}
                    />
                ))}

                {/* Botão Filtros Avançados */}
                <TouchableOpacity
                    style={[
                        styles.advancedFilterButton,
                        totalActiveFilters > 0 && styles.advancedFilterButtonActive,
                    ]}
                    onPress={handleAdvancedFiltersPress}
                    activeOpacity={0.7}
                >
                    <Icon
                        name="tune-vertical"
                        size={18}
                        color={totalActiveFilters > 0 ? theme.custom.colors.surface : theme.custom.colors.textPrimary}
                    />
                    <ReText
                        variant="bodyMedium"
                        color={totalActiveFilters > 0 ? 'surface' : 'textPrimary'}
                        weight="500"
                        style={styles.advancedFilterText}
                    >
                        Filtros{totalActiveFilters > 0 ? ` (${totalActiveFilters})` : ''}
                    </ReText>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 40) + 10,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 16,
    },
    searchBar: {
        backgroundColor: theme.custom.colors.surface,
        borderRadius: theme.custom.roundness.l,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: theme.custom.colors.textPrimary,
        paddingVertical: 0, // Remove padding extra no Android
    },
    pillsScrollView: {
        marginTop: 12,
    },
    pillsContainer: {
        paddingRight: 16, // Espaço extra no final do scroll
    },
    advancedFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.custom.colors.surface,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.12)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    advancedFilterButtonActive: {
        backgroundColor: theme.custom.colors.primary,
        borderColor: theme.custom.colors.primary,
    },
    advancedFilterText: {
        marginLeft: 6,
    },
});
