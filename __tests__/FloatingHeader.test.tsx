import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FloatingHeader } from '../src/components/organisms/FloatingHeader';

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

describe('FloatingHeader', () => {
    const mockOnSearchChange = jest.fn();
    const mockOnFilterToggle = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders search bar and filter pills', () => {
        const { getByPlaceholderText, getByText } = render(
            <FloatingHeader
                searchQuery=""
                onSearchChange={mockOnSearchChange}
                activeFilters={[]}
                onFilterToggle={mockOnFilterToggle}
            />
        );

        expect(getByPlaceholderText('Buscar eventos ou locais...')).toBeTruthy();
        expect(getByText('Hoje')).toBeTruthy();
        expect(getByText('Amanhã')).toBeTruthy();
        expect(getByText('🍺 Bares')).toBeTruthy();
    });

    it('calls onSearchChange when typing in search bar', () => {
        const { getByPlaceholderText } = render(
            <FloatingHeader
                searchQuery=""
                onSearchChange={mockOnSearchChange}
                activeFilters={[]}
                onFilterToggle={mockOnFilterToggle}
            />
        );

        const searchInput = getByPlaceholderText('Buscar eventos ou locais...');
        fireEvent.changeText(searchInput, 'festa');

        expect(mockOnSearchChange).toHaveBeenCalledWith('festa');
    });

    it('calls onFilterToggle when pressing a filter pill', () => {
        const { getByText } = render(
            <FloatingHeader
                searchQuery=""
                onSearchChange={mockOnSearchChange}
                activeFilters={[]}
                onFilterToggle={mockOnFilterToggle}
            />
        );

        const hojeFilter = getByText('Hoje');
        fireEvent.press(hojeFilter);

        expect(mockOnFilterToggle).toHaveBeenCalledWith('hoje');
    });
});
