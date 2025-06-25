import React, { useState } from 'react';
import { Trello, Users, Moon, Sun, LogOut } from 'lucide-react';
import { Column } from './components/Column';
import { TaskModal } from './components/TaskModal';
import { SearchAndFilter } from './components/SearchAndFilter';
import { LoginForm } from './components/LoginForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './components/AuthProvider';
import { useTasks } from './hooks/useTasks';
import { useUsers } from './hooks/useUsers';
import { useLabels } from './hooks/useLabels';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { Task, TaskStatus } from './types/Task';

function AppContent() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const {
    searchTerm,
    selectedLabels,
    selectedAssignee,
    setSearchTerm,
    setSelectedLabels,
    setSelectedAssignee,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addComment,
    addAttachment,
    getTasksByStatus,
    isLoading: tasksLoading,
    error: tasksError,
  } = useTasks();

  const { users, isLoading: usersLoading } = useUsers();
  const { labels } = useLabels();
  const { isDark, toggleTheme } = useTheme();

  const {
    draggedTask,
    dragOverColumn,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDragAndDrop(moveTask);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [modalDefaultStatus, setModalDefaultStatus] = useState<TaskStatus>('todo');

  // Show loading spinner during initial auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleAddTask = (status: TaskStatus) => {
    setModalDefaultStatus(status);
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt'> | Task) => {
    try {
      if ('id' in taskData) {
        await updateTask(taskData.id, taskData);
      } else {
        await addTask(taskData);
      }
      setIsModalOpen(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const totalTasks = getTasksByStatus('todo').length + 
                   getTasksByStatus('inprogress').length + 
                   getTasksByStatus('done').length;

  return (
    <div className={`min-h-screen transition-colors ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Trello className="text-white" size={24} />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  TaskBoard
                </h1>
                <p className={`text-sm sm:text-base ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-4 text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>{users.length} team members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{totalTasks} total tasks</span>
                </div>
              </div>
              
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {tasksError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {tasksError}
          </div>
        )}

        {/* Loading State */}
        {(tasksLoading || usersLoading) && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading tasks...
            </span>
          </div>
        )}

        {/* Search and Filter */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedLabels={selectedLabels}
          onLabelsChange={setSelectedLabels}
          selectedAssignee={selectedAssignee}
          onAssigneeChange={setSelectedAssignee}
          users={users}
          labels={labels}
          isDark={isDark}
        />

        {/* Board */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 overflow-x-auto pb-4">
          <Column
            title="Todo"
            status="todo"
            tasks={getTasksByStatus('todo')}
            users={users}
            onAddTask={() => handleAddTask('todo')}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggedTask={draggedTask}
            dragOverColumn={dragOverColumn}
            isDark={isDark}
          />

          <Column
            title="In Progress"
            status="inprogress"
            tasks={getTasksByStatus('inprogress')}
            users={users}
            onAddTask={() => handleAddTask('inprogress')}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggedTask={draggedTask}
            dragOverColumn={dragOverColumn}
            isDark={isDark}
          />

          <Column
            title="Done"
            status="done"
            tasks={getTasksByStatus('done')}
            users={users}
            onAddTask={() => handleAddTask('done')}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggedTask={draggedTask}
            dragOverColumn={dragOverColumn}
            isDark={isDark}
          />
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onAddComment={addComment}
        onAddAttachment={addAttachment}
        task={editingTask}
        defaultStatus={modalDefaultStatus}
        users={users}
        labels={labels}
        currentUser={user!}
        isDark={isDark}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;