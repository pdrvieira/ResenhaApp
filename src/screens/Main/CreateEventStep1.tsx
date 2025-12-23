import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Step1Data {
  title: string;
  description: string;
  eventDate: Date;
}

interface CreateEventStep1Props {
  onNext: (data: Step1Data) => void;
  initialData?: Partial<Step1Data>;
}

export const CreateEventStep1: React.FC<CreateEventStep1Props> = ({ onNext, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [eventDate, setEventDate] = useState(initialData?.eventDate || new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [errors, setErrors] = useState<{ title?: string; description?: string; date?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Título deve ter pelo menos 3 caracteres';
    }

    if (!description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    const now = new Date();
    if (eventDate <= now) {
      newErrors.date = 'A data deve ser no futuro';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext({
        title: title.trim(),
        description: description.trim(),
        eventDate,
      });
    }
  };

  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);

      if (selectedDate) {
        if (pickerMode === 'date') {
          const newDate = new Date(selectedDate);
          newDate.setHours(eventDate.getHours(), eventDate.getMinutes());
          setEventDate(newDate);
          setTimeout(() => {
            setPickerMode('time');
            setShowPicker(true);
          }, 100);
        } else {
          const newDate = new Date(eventDate);
          newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
          setEventDate(newDate);
        }
      }
    } else {
      if (selectedDate) {
        setEventDate(selectedDate);
      }
    }
  };

  const openPicker = () => {
    setPickerMode('date');
    setShowPicker(true);
  };

  const formattedDateTime = eventDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Criar Evento
          </Text>
          <Text style={styles.stepIndicator}>Passo 1 de 3</Text>
          <Text style={styles.subtitle}>
            O que é o seu evento?
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Título do Evento *"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors({ ...errors, title: undefined });
            }}
            placeholder="Ex: Festa de Aniversário"
            style={styles.input}
            mode="outlined"
            error={!!errors.title}
            maxLength={100}
          />
          <HelperText type="error" visible={!!errors.title}>
            {errors.title}
          </HelperText>

          <TextInput
            label="Descrição *"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors({ ...errors, description: undefined });
            }}
            placeholder="Descreva seu evento..."
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
            error={!!errors.description}
            maxLength={500}
          />
          <HelperText type={errors.description ? 'error' : 'info'} visible>
            {errors.description || `${description.length}/500 caracteres`}
          </HelperText>

          <Text style={styles.sectionLabel}>Quando? *</Text>

          <Button
            mode="outlined"
            onPress={openPicker}
            style={styles.dateButton}
            contentStyle={styles.dateButtonContent}
            icon="calendar-clock"
          >
            {formattedDateTime}
          </Button>

          {errors.date && (
            <HelperText type="error" visible>
              {errors.date}
            </HelperText>
          )}

          {showPicker && (
            <DateTimePicker
              value={eventDate}
              mode={Platform.OS === 'ios' ? 'datetime' : pickerMode}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateTimeChange}
              minimumDate={new Date()}
              locale="pt-BR"
            />
          )}

          {Platform.OS === 'ios' && showPicker && (
            <Button mode="text" onPress={() => setShowPicker(false)}>
              Confirmar
            </Button>
          )}
        </View>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.nextButton}
            contentStyle={styles.buttonContent}
          >
            Próximo: Localização
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stepIndicator: {
    textAlign: 'center',
    color: '#6200ee',
    fontWeight: '600',
    marginTop: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: 0,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  dateButton: {
    borderRadius: 8,
  },
  dateButtonContent: {
    paddingVertical: 8,
    justifyContent: 'flex-start',
  },
  footer: {
    marginTop: 24,
  },
  nextButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
