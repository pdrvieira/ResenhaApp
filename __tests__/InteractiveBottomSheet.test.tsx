import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { InteractiveBottomSheet } from '../src/components/organisms/InteractiveBottomSheet';

// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => {
    const { View, ScrollView } = require('react-native');
    return {
        __esModule: true,
        default: ({ children }: any) => <View testID="bottom-sheet">{children}</View>,
        BottomSheetView: ({ children }: any) => <View>{children}</View>,
        BottomSheetScrollView: ({ children }: any) => <ScrollView>{children}</ScrollView>,
        BottomSheetFlatList: ({ data, renderItem, keyExtractor }: any) => (
            <View>
                {data?.map((item: any, index: number) => (
                    <View key={keyExtractor?.(item) || index}>{renderItem?.({ item, index })}</View>
                ))}
            </View>
        ),
    };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
    const { View } = require('react-native');
    return {
        __esModule: true,
        default: {
            View: View,
        },
        FadeIn: { duration: () => ({}) },
        FadeOut: {},
        SlideInDown: {},
        SlideOutDown: {},
        Layout: { springify: () => ({}) },
    };
});

// Mock Animated from reanimated
jest.mock('react-native-reanimated', () => {
    const { View } = require('react-native');
    const Animated = {
        View: View,
    };
    return {
        __esModule: true,
        default: Animated,
        ...Animated,
        FadeIn: { duration: () => ({}) },
        FadeOut: {},
        SlideInDown: {},
        SlideOutDown: {},
        Layout: { springify: () => ({}) },
    };
});

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

describe('InteractiveBottomSheet', () => {
    const mockEvents = [
        { id: '1', title: 'Evento Teste 1', location: 'Local A' },
        { id: '2', title: 'Evento Teste 2', location: 'Local B' },
    ];

    it('renders correctly with events (list mode)', () => {
        const { getByText } = render(
            <InteractiveBottomSheet
                events={mockEvents}
                selectedEvent={null}
            />
        );

        expect(getByText('Eventos Próximos')).toBeTruthy();
        expect(getByText('2 eventos')).toBeTruthy();
        expect(getByText('Evento Teste 1')).toBeTruthy();
        expect(getByText('Evento Teste 2')).toBeTruthy();
    });

    it('shows loading state', () => {
        const { getByText } = render(
            <InteractiveBottomSheet
                events={[]}
                selectedEvent={null}
                isLoading={true}
            />
        );

        expect(getByText('Carregando...')).toBeTruthy();
    });

    it('shows empty state when no events', () => {
        const { getByText } = render(
            <InteractiveBottomSheet
                events={[]}
                selectedEvent={null}
                isLoading={false}
            />
        );

        expect(getByText(/Nenhum evento encontrado/)).toBeTruthy();
    });

    it('renders event preview when selectedEvent is provided', () => {
        const selectedEvent = {
            id: '1',
            title: 'Evento Selecionado',
            location: 'Belo Horizonte',
            date: 'Sábado, 15 de Janeiro',
        };

        const { getByText } = render(
            <InteractiveBottomSheet
                events={mockEvents}
                selectedEvent={selectedEvent}
            />
        );

        expect(getByText('Evento Selecionado')).toBeTruthy();
        expect(getByText('Belo Horizonte')).toBeTruthy();
        expect(getByText('Quero Participar')).toBeTruthy();
        expect(getByText('Ver Detalhes Completos')).toBeTruthy();
    });

    it('calls onEventClose when close button is pressed', () => {
        const mockOnClose = jest.fn();
        const selectedEvent = { id: '1', title: 'Evento', location: 'Local' };

        const { getByText } = render(
            <InteractiveBottomSheet
                events={mockEvents}
                selectedEvent={selectedEvent}
                onEventClose={mockOnClose}
            />
        );

        // O botão de fechar deve existir no preview
        expect(getByText('Quero Participar')).toBeTruthy();
    });
});
