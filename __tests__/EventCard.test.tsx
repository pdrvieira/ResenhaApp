import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EventCard } from '../src/components/molecules/EventCard';

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

describe('EventCard', () => {
    const defaultProps = {
        title: 'Festa na Praia',
        location: 'Barra da Tijuca, RJ',
        date: 'Sáb, 15 Jan · 18:00',
    };

    it('renders horizontal variant correctly', () => {
        const { getByText } = render(
            <EventCard variant="horizontal" {...defaultProps} />
        );

        expect(getByText('Festa na Praia')).toBeTruthy();
        expect(getByText('Barra da Tijuca, RJ')).toBeTruthy();
        expect(getByText('Sáb, 15 Jan · 18:00')).toBeTruthy();
    });

    it('renders vertical variant correctly', () => {
        const { getByText } = render(
            <EventCard variant="vertical" {...defaultProps} />
        );

        expect(getByText('Festa na Praia')).toBeTruthy();
        expect(getByText('Barra da Tijuca, RJ')).toBeTruthy();
    });

    it('shows category badge when provided', () => {
        const { getByText } = render(
            <EventCard variant="horizontal" {...defaultProps} category="🎉 Festa" />
        );

        expect(getByText('🎉 Festa')).toBeTruthy();
    });

    it('shows attendees count when provided', () => {
        const { getByText } = render(
            <EventCard variant="horizontal" {...defaultProps} attendeesCount={25} />
        );

        expect(getByText('25 confirmados')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const mockOnPress = jest.fn();
        const { getByText } = render(
            <EventCard variant="horizontal" {...defaultProps} onPress={mockOnPress} />
        );

        fireEvent.press(getByText('Festa na Praia'));
        expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('handles singular attendee text correctly', () => {
        const { getByText } = render(
            <EventCard variant="horizontal" {...defaultProps} attendeesCount={1} />
        );

        expect(getByText('1 confirmado')).toBeTruthy();
    });
});
