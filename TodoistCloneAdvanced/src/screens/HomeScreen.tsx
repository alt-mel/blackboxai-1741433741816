import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Timestamp } from 'firebase/firestore';

import { useTodoTasks } from '../contexts/TaskContext';
import { useTodoProjects } from '../contexts/ProjectContext';
import PriorityButton from '../components/common/PriorityButton';
import type { Task } from '../types/Task';
import type { MainStackNavigationProp } from '../types/navigation';

const HomeScreen = () => {
  const navigation = useNavigation<MainStackNavigationProp>();
  const { tasks, loading, refreshTasks, toggleTaskCompletion } = useTodoTasks();
  const { projects } = useTodoProjects();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.name;
  };

  const getProjectColor = (projectId?: string) => {
    if (!projectId) return '#db4c3f';
    const project = projects.find(p => p.id === projectId);
    return project?.color || '#db4c3f';
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate.toDate() < new Date();
  };

  const formatDueDate = (dueDate: Timestamp) => {
    const date = dueDate.toDate();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString();
  };

  const renderTask = ({ item: task }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
    >
      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => toggleTaskCompletion(task.id, !task.completed)}
      >
        <Icon
          name={task.completed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
          size={24}
          color={task.completed ? '#2ecc71' : '#666'}
        />
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text
            style={[
              styles.taskTitle,
              task.completed && styles.completedTaskTitle,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <PriorityButton
            priority={task.priority}
            selected={false}
            onPress={() => {}}
            small
          />
        </View>

        <View style={styles.taskFooter}>
          {task.projectId && (
            <View style={styles.projectTag}>
              <View
                style={[
                  styles.projectColor,
                  { backgroundColor: getProjectColor(task.projectId) },
                ]}
              />
              <Text style={styles.projectName}>
                {getProjectName(task.projectId)}
              </Text>
            </View>
          )}

          {task.dueDate && (
            <View
              style={[
                styles.dueDate,
                isOverdue(task) && styles.overdueDueDate,
              ]}
            >
              <Icon
                name="calendar"
                size={14}
                color={isOverdue(task) ? '#ff4444' : '#666'}
              />
              <Text
                style={[
                  styles.dueDateText,
                  isOverdue(task) && styles.overdueDueDateText,
                ]}
              >
                {formatDueDate(task.dueDate)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#db4c3f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#db4c3f']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="check-circle-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>No tasks yet</Text>
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => navigation.navigate('AddTask')}
            >
              <Text style={styles.addTaskButtonText}>Add your first task</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  completeButton: {
    marginRight: 12,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  projectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
  },
  projectColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  projectName: {
    fontSize: 12,
    color: '#666',
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overdueDueDate: {
    backgroundColor: '#ffebee',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  dueDateText: {
    fontSize: 12,
    color: '#666',
  },
  overdueDueDateText: {
    color: '#ff4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 16,
  },
  addTaskButton: {
    backgroundColor: '#db4c3f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addTaskButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#db4c3f',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default HomeScreen;
