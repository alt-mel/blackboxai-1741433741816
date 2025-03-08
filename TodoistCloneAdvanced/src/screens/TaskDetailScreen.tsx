import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Timestamp } from 'firebase/firestore';
import { useTodoTasks } from '../contexts/TaskContext';
import { useTodoProjects } from '../contexts/ProjectContext';
import type { MainScreenProps } from '../types/navigation';
import DateTimePicker from '../components/common/DateTimePicker';
import PriorityButton from '../components/common/PriorityButton';
import { TASK_PRIORITIES, TaskPriority } from '../types/Task';
import theme from '../theme';

const TaskDetailScreen: React.FC<MainScreenProps<'TaskDetail'>> = ({
  navigation,
  route,
}) => {
  const { taskId } = route.params;
  const { tasks, updateTask, deleteTask } = useTodoTasks();
  const { projects } = useTodoProjects();
  const task = tasks.find(t => t.id === taskId);

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState<Timestamp | null>(task?.dueDate || null);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || TASK_PRIORITIES.MEDIUM);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const project = task?.projectId ? projects.find(p => p.id === task.projectId) : undefined;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleDelete}
        >
          <Icon name="trash-can-outline" size={24} color={theme.colors.error} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleSave = useCallback(async () => {
    if (!task) return;
    if (!title.trim()) {
      Alert.alert('Error', 'Task title cannot be empty');
      return;
    }

    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || undefined,
        priority,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  }, [task, title, description, dueDate, priority, updateTask, navigation]);

  const handleDelete = useCallback(() => {
    if (!task) return;

    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  }, [task, deleteTask, navigation]);

  const handleDateChange = (newDate: Timestamp | null | undefined) => {
    setDueDate(newDate || null);
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Task not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
          />

          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Add description..."
            multiline
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
            <TouchableOpacity onPress={() => setShowPriorityPicker(!showPriorityPicker)}>
              <PriorityButton
                priority={priority}
                selected={true}
                onPress={() => setShowPriorityPicker(!showPriorityPicker)}
              />
            </TouchableOpacity>

            {showPriorityPicker && (
              <View style={styles.priorityPicker}>
                {Object.values(TASK_PRIORITIES).map((p) => (
                  <TouchableOpacity
                    key={p}
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

          {project && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Project</Text>
              <View style={styles.projectContainer}>
                <View style={[styles.projectColor, { backgroundColor: project.color }]} />
                <Text style={styles.projectName}>{project.name}</Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Created</Text>
            <Text style={styles.dateText}>
              {task.createdAt.toDate().toLocaleDateString()}
            </Text>
          </View>

          {task.updatedAt && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Last Modified</Text>
              <Text style={styles.dateText}>
                {task.updatedAt.toDate().toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={!title.trim()}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
  },
  descriptionInput: {
    fontSize: 16,
    color: theme.colors.text.primary,
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  priorityPicker: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  projectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  projectColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  projectName: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.surface,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});

export default TaskDetailScreen;
