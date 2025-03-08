import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Timestamp } from 'firebase/firestore';
import { useTodoTasks } from '../contexts/TaskContext';
import { useTodoProjects } from '../contexts/ProjectContext';
import { TASK_PRIORITIES, TaskPriority } from '../types/Task';
import type { MainScreenProps } from '../types/navigation';
import DateTimePicker from '../components/common/DateTimePicker';
import PriorityButton from '../components/common/PriorityButton';
import theme from '../theme';

const AddTaskScreen: React.FC<MainScreenProps<'AddTask'>> = ({ navigation, route }) => {
  const { addTask } = useTodoTasks();
  const { projects } = useTodoProjects();
  const initialProjectId = route.params?.projectId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Timestamp | null>(null);
  const [priority, setPriority] = useState<TaskPriority>(TASK_PRIORITIES.MEDIUM);
  const [projectId, setProjectId] = useState<string | undefined>(initialProjectId);
  const [labels, setLabels] = useState<string[]>([]);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || undefined,
        priority,
        projectId,
        labels,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    }
  }, [title, description, dueDate, priority, projectId, labels, addTask, navigation]);

  const handleDateChange = (newDate: Timestamp | null | undefined) => {
    setDueDate(newDate || null);
  };

  const togglePriorityPicker = () => {
    setShowPriorityPicker(!showPriorityPicker);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <TextInput
            style={styles.titleInput}
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
            autoFocus
            returnKeyType="next"
          />

          <TextInput
            style={styles.descriptionInput}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Due Date</Text>
            <DateTimePicker
              value={dueDate}
              onChange={handleDateChange}
              mode="datetime"
              minimumDate={new Date()}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority</Text>
            <TouchableOpacity
              style={styles.priorityButton}
              onPress={togglePriorityPicker}
            >
              <PriorityButton
                priority={priority}
                selected={true}
                onPress={togglePriorityPicker}
              />
            </TouchableOpacity>

            {showPriorityPicker && (
              <View style={styles.priorityPicker}>
                {Object.values(TASK_PRIORITIES).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={styles.priorityOption}
                    onPress={() => {
                      setPriority(p);
                      setShowPriorityPicker(false);
                    }}
                  >
                    <PriorityButton
                      priority={p}
                      selected={priority === p}
                      onPress={() => {}}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {projects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Project</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.projectScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.projectButton,
                    !projectId && styles.projectButtonSelected,
                  ]}
                  onPress={() => setProjectId(undefined)}
                >
                  <Icon
                    name="inbox"
                    size={20}
                    color={!projectId ? theme.colors.primary : theme.colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.projectButtonText,
                      !projectId && styles.projectButtonTextSelected,
                    ]}
                  >
                    Inbox
                  </Text>
                </TouchableOpacity>

                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.projectButton,
                      projectId === project.id && styles.projectButtonSelected,
                    ]}
                    onPress={() => setProjectId(project.id)}
                  >
                    <View
                      style={[styles.projectColor, { backgroundColor: project.color }]}
                    />
                    <Text
                      style={[
                        styles.projectButtonText,
                        projectId === project.id && styles.projectButtonTextSelected,
                      ]}
                    >
                      {project.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, !title.trim() && styles.addButtonDisabled]}
          onPress={handleSubmit}
          disabled={!title.trim()}
        >
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: theme.spacing.md,
  },
  titleInput: {
    fontSize: 18,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  descriptionInput: {
    fontSize: 16,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
    minHeight: 80,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  priorityButton: {
    alignSelf: 'flex-start',
  },
  priorityPicker: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  priorityOption: {
    paddingVertical: theme.spacing.xs,
  },
  projectScroll: {
    flexGrow: 0,
  },
  projectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
  },
  projectButtonSelected: {
    backgroundColor: `${theme.colors.primary}20`,
  },
  projectColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  projectButtonText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  projectButtonTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.surface,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  addButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 16,
    color: theme.colors.text.inverse,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AddTaskScreen;
