import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTodoProjects } from '../contexts/ProjectContext';
import { DEFAULT_PROJECT_COLORS } from '../types/Project';
import theme from '../theme';

const ProjectScreen = () => {
  const {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    toggleFavorite,
    toggleArchived,
    refreshProjects,
  } = useTodoProjects();

  const [refreshing, setRefreshing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_PROJECT_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshProjects();
    setRefreshing(false);
  }, [refreshProjects]);

  const handleAddProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    try {
      await addProject({
        name: newProjectName.trim(),
        color: selectedColor,
      });
      setNewProjectName('');
      setShowColorPicker(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create project');
    }
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${projectName}"? All tasks in this project will also be deleted.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(projectId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const filteredProjects = projects.filter(
    project => project.isArchived === showArchived
  );

  const renderColorPicker = () => (
    <View style={styles.colorPicker}>
      <FlatList
        data={DEFAULT_PROJECT_COLORS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={color => color}
        renderItem={({ item: color }) => (
          <TouchableOpacity
            style={[styles.colorOption, { backgroundColor: color }]}
            onPress={() => setSelectedColor(color)}
          >
            {color === selectedColor && (
              <Icon name="check" size={20} color="white" />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderProject = ({ item: project }) => (
    <View style={styles.projectItem}>
      <TouchableOpacity
        style={[styles.projectColor, { backgroundColor: project.color }]}
        onPress={() => {
          // Navigate to project detail view
        }}
      />

      <View style={styles.projectContent}>
        <Text style={styles.projectName}>{project.name}</Text>
        <Text style={styles.taskCount}>0 tasks</Text>
      </View>

      <View style={styles.projectActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleFavorite(project.id)}
        >
          <Icon
            name={project.isFavorite ? 'star' : 'star-outline'}
            size={24}
            color={project.isFavorite ? '#FFD700' : theme.colors.text.secondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleArchived(project.id)}
        >
          <Icon
            name={project.isArchived ? 'archive' : 'archive-outline'}
            size={24}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteProject(project.id, project.name)}
        >
          <Icon
            name="trash-can-outline"
            size={24}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowArchived(!showArchived)}
        >
          <Icon
            name={showArchived ? 'archive' : 'folder'}
            size={20}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.filterButtonText}>
            {showArchived ? 'Archived' : 'Active'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addProject}>
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.colorButton, { backgroundColor: selectedColor }]}
            onPress={() => setShowColorPicker(!showColorPicker)}
          />
          <TextInput
            style={styles.input}
            placeholder="Add new project..."
            value={newProjectName}
            onChangeText={setNewProjectName}
            onSubmitEditing={handleAddProject}
          />
        </View>
        {showColorPicker && renderColorPicker()}
      </View>

      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name="folder-outline"
              size={48}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.emptyText}>
              {showArchived
                ? 'No archived projects'
                : 'No projects yet. Create your first project!'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  filterButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  addProject: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  colorPicker: {
    marginTop: theme.spacing.md,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  projectColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: theme.spacing.md,
  },
  projectContent: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  taskCount: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default ProjectScreen;
