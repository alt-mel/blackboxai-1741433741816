import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TASK_PRIORITIES, TaskPriority, getPriorityColor, getPriorityLabel, getPriorityIcon } from '../../types/Task';
import theme from '../../theme';

interface PriorityButtonProps {
  priority: TaskPriority;
  selected: boolean;
  onPress: () => void;
  small?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const PriorityButton: React.FC<PriorityButtonProps> = ({
  priority,
  selected,
  onPress,
  small = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const color = getPriorityColor(priority);
  const label = getPriorityLabel(priority);
  const icon = getPriorityIcon(priority);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        small ? styles.smallContainer : null,
        selected && { backgroundColor: `${color}20` },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Icon
        name={icon}
        size={small ? 16 : 20}
        color={selected ? color : theme.colors.text.secondary}
        style={styles.icon}
      />
      {!small && (
        <Text
          style={[
            styles.text,
            selected && { color },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  smallContainer: {
    padding: theme.spacing.xs,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  text: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default PriorityButton;
