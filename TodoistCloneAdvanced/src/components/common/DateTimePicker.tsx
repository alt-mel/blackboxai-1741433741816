import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Platform, StyleSheet } from 'react-native';
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Timestamp } from 'firebase/firestore';
import theme from '../../theme';

interface DateTimePickerProps {
  value: Timestamp | null | undefined;
  onChange: (date: Timestamp | null | undefined) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  mode = 'datetime',
  minimumDate,
  maximumDate,
  placeholder = 'Select date and time',
}) => {
  const [show, setShow] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>(mode === 'datetime' ? 'date' : mode);

  const currentValue = value ? value.toDate() : new Date();

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'dismissed') {
      setShow(false);
      return;
    }

    if (!selectedDate) return;

    if (mode === 'datetime' && pickerMode === 'date') {
      setPickerMode('time');
      setShow(Platform.OS === 'ios');
      return;
    }

    setShow(false);
    setPickerMode(mode === 'datetime' ? 'date' : mode);
    onChange(selectedDate ? Timestamp.fromDate(selectedDate) : null);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return placeholder;

    const timeFormat: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };

    const dateFormat: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    if (mode === 'time') {
      return date.toLocaleTimeString(undefined, timeFormat);
    }

    if (mode === 'date') {
      return date.toLocaleDateString(undefined, dateFormat);
    }

    return `${date.toLocaleDateString(undefined, dateFormat)} at ${date.toLocaleTimeString(
      undefined,
      timeFormat
    )}`;
  };

  const showPicker = () => {
    setPickerMode(mode === 'datetime' ? 'date' : mode);
    setShow(true);
  };

  const clearDate = () => {
    onChange(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={showPicker}
      >
        <Icon
          name={mode === 'time' ? 'clock-outline' : 'calendar'}
          size={20}
          color={theme.colors.text.secondary}
          style={styles.icon}
        />
        <Text style={[
          styles.text,
          !value && styles.placeholder
        ]}>
          {formatDate(value?.toDate() || null)}
        </Text>
      </TouchableOpacity>

      {value && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearDate}
        >
          <Icon
            name="close-circle"
            size={20}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
      )}

      {show && (
        <RNDateTimePicker
          value={currentValue}
          mode={pickerMode}
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  placeholder: {
    color: theme.colors.text.secondary,
  },
  clearButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
});

export default DateTimePicker;
