import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
    Text, TextInput, Button, Card, HelperText, Chip, Divider,
    ActivityIndicator, RadioButton, SegmentedButtons
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEditEvent } from '../../hooks/useEditEvent';
import { FIELD_LABELS, getHoursUntilEvent } from '../../utils/editValidation';

interface EditEventScreenProps {
    navigation: any;
    route: any;
}

export const EditEventScreen: React.FC<EditEventScreenProps> = ({ navigation, route }) => {
    const { eventId } = route.params;
    const {
        event,
        loading,
        participantsCount,
        editableFields,
        updateEvent,
        isUpdating,
    } = useEditEvent({ eventId });

    // Estados do formulário
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [motivation, setMotivation] = useState('');
    const [bringWhat, setBringWhat] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('');
    const [eventDate, setEventDate] = useState(new Date());
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [entryType, setEntryType] = useState<'free' | 'paid' | 'bring'>('free');
    const [entryPrice, setEntryPrice] = useState('');
    const [audience, setAudience] = useState<'everyone' | 'adults_only' | 'invite_only'>('everyone');

    // Estado do date picker
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');

    // Carregar dados iniciais
    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setDescription(event.description);
            setMotivation(event.motivation || '');
            setBringWhat(event.bring_what || '');
            setMaxParticipants(event.max_participants?.toString() || '');
            setEventDate(new Date(event.event_at));
            setAddress(event.address);
            setCity(event.city);
            setEntryType(event.entry_type || 'free');
            setEntryPrice(event.entry_price?.toFixed(2).replace('.', ',') || '');
            setAudience(event.audience || 'everyone');
        }
    }, [event]);

    // Formatar preço
    const formatPrice = (value: string): string => {
        let numbers = value.replace(/\D/g, '');
        if (numbers === '') return '';
        if (numbers.length > 7) numbers = numbers.slice(0, 7);
        const cents = parseInt(numbers, 10);
        const reais = (cents / 100).toFixed(2);
        return reais.replace('.', ',');
    };

    // Salvar alterações
    const handleSave = async () => {
        if (!event) return;

        try {
            const updates: any = {};

            // Campos básicos
            if (title !== event.title) updates.title = title;
            if (description !== event.description) updates.description = description;
            if (motivation !== (event.motivation || '')) updates.motivation = motivation || null;
            if (bringWhat !== (event.bring_what || '')) updates.bring_what = bringWhat || null;

            // Max participantes
            const newMaxParticipants = maxParticipants ? parseInt(maxParticipants, 10) : null;
            if (newMaxParticipants !== event.max_participants) {
                if (newMaxParticipants !== null && newMaxParticipants < participantsCount) {
                    Alert.alert('Erro', `Limite não pode ser menor que ${participantsCount} (participantes atuais).`);
                    return;
                }
                updates.max_participants = newMaxParticipants;
            }

            // Data (se editável)
            if (editableFields?.event_at.allowed) {
                const originalDate = new Date(event.event_at);
                if (eventDate.getTime() !== originalDate.getTime()) {
                    updates.event_at = eventDate.toISOString();
                }
            }

            // Local (se editável)
            if (editableFields?.address.allowed) {
                if (address !== event.address) updates.address = address;
                if (city !== event.city) updates.city = city;
            }

            // Tipo de entrada (se editável)
            if (editableFields?.entry_type.allowed) {
                if (entryType !== event.entry_type) updates.entry_type = entryType;
                if (entryType === 'paid') {
                    const price = parseFloat(entryPrice.replace(',', '.'));
                    if (price !== event.entry_price) updates.entry_price = price;
                }
            }

            // Público (se editável)
            if (editableFields?.audience.allowed) {
                if (audience !== event.audience) updates.audience = audience;
            }

            if (Object.keys(updates).length === 0) {
                Alert.alert('Sem alterações', 'Nenhuma alteração foi feita.');
                return;
            }

            // Confirmar
            Alert.alert(
                'Confirmar Alterações',
                participantsCount > 0
                    ? `${participantsCount} participante(s) serão notificados sobre as alterações.`
                    : 'Salvar alterações?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Salvar',
                        onPress: async () => {
                            try {
                                const result = await updateEvent(updates);
                                Alert.alert(
                                    '✅ Salvo!',
                                    result.notifiedCount > 0
                                        ? `Alterações salvas. ${result.notifiedCount} participante(s) foram notificados.`
                                        : 'Alterações salvas com sucesso.',
                                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                                );
                            } catch (error: any) {
                                Alert.alert('Erro', error.message || 'Não foi possível salvar as alterações.');
                            }
                        },
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        }
    };

    // Date picker handlers
    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (selectedDate) {
                if (datePickerMode === 'date') {
                    const newDate = new Date(selectedDate);
                    newDate.setHours(eventDate.getHours(), eventDate.getMinutes());
                    setEventDate(newDate);
                    setTimeout(() => {
                        setDatePickerMode('time');
                        setShowDatePicker(true);
                    }, 100);
                } else {
                    const newDate = new Date(eventDate);
                    newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
                    setEventDate(newDate);
                }
            }
        } else if (selectedDate) {
            setEventDate(selectedDate);
        }
    };

    // Loading
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Carregando evento...</Text>
            </View>
        );
    }

    if (!event || !editableFields) {
        return (
            <View style={styles.errorContainer}>
                <Text>Evento não encontrado</Text>
            </View>
        );
    }

    const hoursUntil = getHoursUntilEvent(event.event_at);

    // Renderizar campo com indicador de editável/bloqueado
    const renderField = (
        fieldKey: keyof typeof editableFields,
        label: string,
        value: string,
        onChange: (v: string) => void,
        options?: { multiline?: boolean; maxLength?: number; placeholder?: string }
    ) => {
        const validation = editableFields[fieldKey];
        const isEditable = validation.allowed;

        return (
            <View style={styles.fieldContainer}>
                <View style={styles.fieldHeader}>
                    <Text style={styles.fieldLabel}>{label}</Text>
                    {!isEditable && (
                        <Chip compact style={styles.lockedChip} icon="lock">
                            Bloqueado
                        </Chip>
                    )}
                </View>

                <TextInput
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                    disabled={!isEditable}
                    multiline={options?.multiline}
                    numberOfLines={options?.multiline ? 4 : 1}
                    maxLength={options?.maxLength}
                    placeholder={options?.placeholder}
                    style={[styles.input, !isEditable && styles.inputDisabled]}
                />

                {!isEditable && validation.reason && (
                    <HelperText type="info" visible>
                        {validation.reason}
                    </HelperText>
                )}
            </View>
        );
    };

    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Aviso de participantes */}
            {participantsCount > 0 && (
                <Card style={styles.warningCard}>
                    <Card.Content>
                        <Text style={styles.warningTitle}>⚠️ Atenção</Text>
                        <Text style={styles.warningText}>
                            Este evento tem {participantsCount} participante(s) confirmado(s).
                            Algumas opções estão bloqueadas e alterações serão notificadas.
                        </Text>
                    </Card.Content>
                </Card>
            )}

            {/* Info de tempo */}
            <Card style={styles.infoCard}>
                <Card.Content>
                    <Text style={styles.infoText}>
                        ⏰ Faltam <Text style={styles.infoBold}>{Math.round(hoursUntil)} horas</Text> para o evento
                        {hoursUntil > 24 && ' • Todas as edições permitidas'}
                        {hoursUntil <= 24 && hoursUntil > 0 && ' • Algumas edições bloqueadas (< 24h)'}
                    </Text>
                </Card.Content>
            </Card>

            {/* Campos editáveis básicos */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
                📝 Informações Básicas
            </Text>

            {renderField('title', 'Título', title, setTitle, { maxLength: 100 })}
            {renderField('description', 'Descrição', description, setDescription, {
                multiline: true,
                maxLength: 500
            })}
            {renderField('motivation', 'Motivação (opcional)', motivation, setMotivation, {
                maxLength: 200,
                placeholder: 'Ex: Celebrar o aniversário do João'
            })}

            <Divider style={styles.divider} />

            {/* Data e Hora */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
                📅 Data e Hora
            </Text>

            <View style={styles.fieldContainer}>
                <View style={styles.fieldHeader}>
                    <Text style={styles.fieldLabel}>Quando?</Text>
                    {!editableFields.event_at.allowed && (
                        <Chip compact style={styles.lockedChip} icon="lock">Bloqueado</Chip>
                    )}
                </View>

                <Button
                    mode="outlined"
                    onPress={() => {
                        if (editableFields.event_at.allowed) {
                            setDatePickerMode('date');
                            setShowDatePicker(true);
                        }
                    }}
                    icon="calendar-clock"
                    disabled={!editableFields.event_at.allowed}
                    style={!editableFields.event_at.allowed ? styles.inputDisabled : undefined}
                >
                    {formattedDate}
                </Button>

                {!editableFields.event_at.allowed && (
                    <HelperText type="info" visible>
                        {editableFields.event_at.reason}
                    </HelperText>
                )}

                {showDatePicker && (
                    <DateTimePicker
                        value={eventDate}
                        mode={Platform.OS === 'ios' ? 'datetime' : datePickerMode}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                        locale="pt-BR"
                    />
                )}

                {Platform.OS === 'ios' && showDatePicker && (
                    <Button mode="text" onPress={() => setShowDatePicker(false)}>
                        Confirmar
                    </Button>
                )}
            </View>

            <Divider style={styles.divider} />

            {/* Local */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
                📍 Local
            </Text>

            <View style={styles.fieldContainer}>
                <View style={styles.fieldHeader}>
                    <Text style={styles.fieldLabel}>Endereço</Text>
                    {!editableFields.address.allowed && (
                        <Chip compact style={styles.lockedChip} icon="lock">Bloqueado</Chip>
                    )}
                </View>

                <TextInput
                    value={address}
                    onChangeText={setAddress}
                    mode="outlined"
                    disabled={!editableFields.address.allowed}
                    style={!editableFields.address.allowed ? styles.inputDisabled : undefined}
                />

                {!editableFields.address.allowed && (
                    <HelperText type="info" visible>
                        {editableFields.address.reason}
                    </HelperText>
                )}
            </View>

            <View style={styles.fieldContainer}>
                <View style={styles.fieldHeader}>
                    <Text style={styles.fieldLabel}>Cidade</Text>
                    {!editableFields.city.allowed && (
                        <Chip compact style={styles.lockedChip} icon="lock">Bloqueado</Chip>
                    )}
                </View>

                <TextInput
                    value={city}
                    onChangeText={setCity}
                    mode="outlined"
                    disabled={!editableFields.city.allowed}
                    style={!editableFields.city.allowed ? styles.inputDisabled : undefined}
                />
            </View>

            <Divider style={styles.divider} />

            {/* Tipo de Entrada */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
                💰 Tipo de Entrada
            </Text>

            <View style={styles.fieldContainer}>
                {!editableFields.entry_type.allowed && (
                    <View style={styles.lockedBanner}>
                        <Chip compact style={styles.lockedChip} icon="lock">Bloqueado</Chip>
                        <HelperText type="info" visible style={styles.lockedReason}>
                            {editableFields.entry_type.reason}
                        </HelperText>
                    </View>
                )}

                <RadioButton.Group
                    onValueChange={(v) => editableFields.entry_type.allowed && setEntryType(v as any)}
                    value={entryType}
                >
                    <RadioButton.Item
                        label="Gratuito"
                        value="free"
                        disabled={!editableFields.entry_type.allowed}
                    />
                    <RadioButton.Item
                        label="Pago"
                        value="paid"
                        disabled={!editableFields.entry_type.allowed}
                    />
                    <RadioButton.Item
                        label="Traga algo"
                        value="bring"
                        disabled={!editableFields.entry_type.allowed}
                    />
                </RadioButton.Group>

                {entryType === 'paid' && (
                    <TextInput
                        label="Valor (R$)"
                        value={entryPrice}
                        onChangeText={(t) => setEntryPrice(formatPrice(t))}
                        mode="outlined"
                        keyboardType="number-pad"
                        disabled={!editableFields.entry_price.allowed}
                        left={<TextInput.Affix text="R$" />}
                        style={styles.priceInput}
                    />
                )}

                {entryType === 'bring' && (
                    <TextInput
                        label="O que trazer?"
                        value={bringWhat}
                        onChangeText={setBringWhat}
                        mode="outlined"
                        placeholder="Ex: 1 garrafa de bebida"
                        maxLength={100}
                        style={styles.priceInput}
                    />
                )}
            </View>

            <Divider style={styles.divider} />

            {/* Público */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
                👥 Público
            </Text>

            <View style={styles.fieldContainer}>
                {!editableFields.audience.allowed && (
                    <View style={styles.lockedBanner}>
                        <Chip compact style={styles.lockedChip} icon="lock">Bloqueado</Chip>
                        <HelperText type="info" visible style={styles.lockedReason}>
                            {editableFields.audience.reason}
                        </HelperText>
                    </View>
                )}

                <RadioButton.Group
                    onValueChange={(v) => editableFields.audience.allowed && setAudience(v as any)}
                    value={audience}
                >
                    <RadioButton.Item
                        label="Todos (aberto)"
                        value="everyone"
                        disabled={!editableFields.audience.allowed}
                    />
                    <RadioButton.Item
                        label="Apenas +18"
                        value="adults_only"
                        disabled={!editableFields.audience.allowed}
                    />
                    <RadioButton.Item
                        label="Somente convidados"
                        value="invite_only"
                        disabled={!editableFields.audience.allowed}
                    />
                </RadioButton.Group>
            </View>

            <Divider style={styles.divider} />

            {/* Limite de participantes */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
                🎫 Vagas
            </Text>

            <TextInput
                label="Limite de participantes"
                value={maxParticipants}
                onChangeText={(t) => setMaxParticipants(t.replace(/[^0-9]/g, ''))}
                mode="outlined"
                keyboardType="number-pad"
                placeholder="Sem limite"
                left={<TextInput.Icon icon="account-group" />}
            />
            <HelperText type="info" visible>
                {participantsCount > 0
                    ? `Mínimo: ${participantsCount} (participantes atuais). Deixe vazio para sem limite.`
                    : 'Deixe vazio para sem limite.'
                }
            </HelperText>

            {/* Botões */}
            <View style={styles.footer}>
                <Button
                    mode="outlined"
                    onPress={() => navigation.goBack()}
                    style={styles.button}
                    disabled={isUpdating}
                >
                    Cancelar
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.button}
                    loading={isUpdating}
                    disabled={isUpdating}
                    icon="check"
                >
                    Salvar
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningCard: {
        backgroundColor: '#fff3e0',
        marginBottom: 12,
    },
    warningTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    warningText: {
        color: '#666',
    },
    infoCard: {
        backgroundColor: '#e3f2fd',
        marginBottom: 16,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
    },
    infoBold: {
        fontWeight: 'bold',
        color: '#1565c0',
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 8,
    },
    fieldContainer: {
        marginBottom: 12,
    },
    fieldHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    lockedChip: {
        backgroundColor: '#ffebee',
        height: 24,
    },
    lockedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    lockedReason: {
        flex: 1,
        marginLeft: 8,
    },
    input: {
        backgroundColor: '#fff',
    },
    inputDisabled: {
        backgroundColor: '#f0f0f0',
        opacity: 0.7,
    },
    priceInput: {
        marginTop: 12,
        backgroundColor: '#fff',
    },
    divider: {
        marginVertical: 16,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    button: {
        flex: 1,
        borderRadius: 8,
    },
});
