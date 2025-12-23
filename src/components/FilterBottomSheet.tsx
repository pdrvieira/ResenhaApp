import React from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Button, TextInput, Chip, Divider, IconButton } from 'react-native-paper';
import {
    MapFilters,
    FILTER_LABELS,
    EntryTypeFilter,
    AudienceFilter,
    DateRangeFilter,
    RadiusFilter,
} from '../types/mapFilters';

interface FilterBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    filters: MapFilters;
    onUpdateFilter: <K extends keyof MapFilters>(key: K, value: MapFilters[K]) => void;
    onReset: () => void;
    activeCount: number;
}

interface FilterSectionProps {
    title: string;
    children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.chipRow}>{children}</View>
    </View>
);

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
    visible,
    onClose,
    filters,
    onUpdateFilter,
    onReset,
    activeCount,
}) => {
    const radiusOptions: RadiusFilter[] = [null, 5, 10, 25, 50];
    const entryOptions: EntryTypeFilter[] = ['all', 'free', 'paid', 'bring'];
    const audienceOptions: AudienceFilter[] = ['all', 'everyone', 'adults_only', 'invite_only'];
    const dateOptions: DateRangeFilter[] = ['all', 'today', 'tomorrow', 'week', 'month'];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                <View style={styles.sheet}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.handle} />
                        <View style={styles.headerRow}>
                            <Text variant="titleLarge" style={styles.title}>
                                Filtros {activeCount > 0 && `(${activeCount})`}
                            </Text>
                            <IconButton icon="close" onPress={onClose} />
                        </View>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Busca */}
                        <View style={styles.section}>
                            <TextInput
                                label="Buscar evento"
                                value={filters.searchText}
                                onChangeText={(text) => onUpdateFilter('searchText', text)}
                                placeholder="Título, cidade, descrição..."
                                mode="outlined"
                                left={<TextInput.Icon icon="magnify" />}
                                right={
                                    filters.searchText ? (
                                        <TextInput.Icon
                                            icon="close"
                                            onPress={() => onUpdateFilter('searchText', '')}
                                        />
                                    ) : null
                                }
                            />
                        </View>

                        <Divider style={styles.divider} />

                        {/* Distância */}
                        <FilterSection title="📍 Distância">
                            {radiusOptions.map((radius) => (
                                <Chip
                                    key={String(radius)}
                                    selected={filters.radius === radius}
                                    onPress={() => onUpdateFilter('radius', radius)}
                                    style={styles.chip}
                                    showSelectedCheck={false}
                                    mode={filters.radius === radius ? 'flat' : 'outlined'}
                                >
                                    {FILTER_LABELS.radius[String(radius) as keyof typeof FILTER_LABELS.radius]}
                                </Chip>
                            ))}
                        </FilterSection>

                        <Divider style={styles.divider} />

                        {/* Tipo de Entrada */}
                        <FilterSection title="💰 Tipo de Entrada">
                            {entryOptions.map((entry) => (
                                <Chip
                                    key={entry}
                                    selected={filters.entryType === entry}
                                    onPress={() => onUpdateFilter('entryType', entry)}
                                    style={styles.chip}
                                    showSelectedCheck={false}
                                    mode={filters.entryType === entry ? 'flat' : 'outlined'}
                                >
                                    {FILTER_LABELS.entryType[entry]}
                                </Chip>
                            ))}
                        </FilterSection>

                        <Divider style={styles.divider} />

                        {/* Público */}
                        <FilterSection title="👥 Público">
                            {audienceOptions.map((audience) => (
                                <Chip
                                    key={audience}
                                    selected={filters.audience === audience}
                                    onPress={() => onUpdateFilter('audience', audience)}
                                    style={styles.chip}
                                    showSelectedCheck={false}
                                    mode={filters.audience === audience ? 'flat' : 'outlined'}
                                >
                                    {FILTER_LABELS.audience[audience]}
                                </Chip>
                            ))}
                        </FilterSection>

                        <Divider style={styles.divider} />

                        {/* Data */}
                        <FilterSection title="📅 Data">
                            {dateOptions.map((date) => (
                                <Chip
                                    key={date}
                                    selected={filters.dateRange === date}
                                    onPress={() => onUpdateFilter('dateRange', date)}
                                    style={styles.chip}
                                    showSelectedCheck={false}
                                    mode={filters.dateRange === date ? 'flat' : 'outlined'}
                                >
                                    {FILTER_LABELS.dateRange[date]}
                                </Chip>
                            ))}
                        </FilterSection>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Button
                            mode="outlined"
                            onPress={onReset}
                            style={styles.footerButton}
                            disabled={activeCount === 0}
                        >
                            Limpar Filtros
                        </Button>
                        <Button
                            mode="contained"
                            onPress={onClose}
                            style={styles.footerButton}
                        >
                            Aplicar
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: SCREEN_HEIGHT * 0.75,
    },
    header: {
        alignItems: 'center',
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        marginBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 16,
    },
    title: {
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        marginBottom: 4,
    },
    divider: {
        marginVertical: 8,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    footerButton: {
        flex: 1,
        borderRadius: 8,
    },
});
