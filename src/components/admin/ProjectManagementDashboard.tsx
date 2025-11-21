import React, { useState } from 'react';
import { Plus, Calendar, Users, Target, TrendingUp, Clock, Flag, MoreVertical, Edit, Trash2, User, Tag, Paperclip, MessageSquare } from 'lucide-react';
import { useProjectStore, Task, Sprint, TaskStatus, TaskPriority } from '../../stores/projectStore';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const statusColors = {
  todo: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  done: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const statusLabels = {
  todo: 'Yapılacak',
  in_progress: 'Devam Ediyor',
  review: 'İncelemede',
  done: 'Tamamlandı',
};

const priorityColors = {
  low: 'bg-gray-200 text-gray-700',
  medium: 'bg-yellow-200 text-yellow-800',
  high: 'bg-orange-200 text-orange-800',
  urgent: 'bg-red-200 text-red-800',
};

const priorityLabels = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  urgent: 'Acil',
};

export const ProjectManagementDashboard: React.FC = () => {
  const {
    projects,
    activeSprint,
    addSprint,
    addTask,
    updateTask,
    moveTask,
    getTasksByStatus,
    getSprintVelocity,
    getBurndownData,
  } = useProjectStore();

  const [showNewSprintModal, setShowNewSprintModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('todo');

  const currentProject = projects[0]; // Get first project for demo
  const currentSprint = activeSprint || currentProject?.sprints[0];

  const tasksByStatus = {
    todo: currentSprint ? getTasksByStatus(currentSprint.id, 'todo') : [],
    in_progress: currentSprint ? getTasksByStatus(currentSprint.id, 'in_progress') : [],
    review: currentSprint ? getTasksByStatus(currentSprint.id, 'review') : [],
    done: currentSprint ? getTasksByStatus(currentSprint.id, 'done') : [],
  };

  const velocity = currentSprint ? getSprintVelocity(currentSprint.id) : 0;
  const burndownData = currentSprint ? getBurndownData(currentSprint.id) : [];

  const handleCreateTask = (taskData: any) => {
    if (currentSprint) {
      addTask(currentSprint.id, {
        ...taskData,
        sprintId: currentSprint.id,
        status: selectedStatus,
      });
      setShowNewTaskModal(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    moveTask(taskId, newStatus);
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-move"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{task.title}</h4>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {task.estimatedHours}h
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{task.assignee}</span>
            </div>
          )}
          {task.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{task.tags.length}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          {task.attachments.length > 0 && <Paperclip className="w-3 h-3" />}
          {task.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span className="text-xs">{task.comments.length}</span>
            </div>
          )}
        </div>
      </div>
      
      {task.dueDate && (
        <div className="mt-3 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          {format(new Date(task.dueDate), 'dd MMM', { locale: tr })}
        </div>
      )}
    </div>
  );

  const TaskColumn: React.FC<{ 
    title: string; 
    status: TaskStatus; 
    tasks: Task[];
    count: number;
  }> = ({ title, status, tasks, count }) => (
    <div className="flex-1 min-w-0">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-1 rounded-full text-xs font-medium">
            {count}
          </span>
        </div>
        <div className={`h-1 rounded-full ${statusColors[status].split(' ')[0]} bg-opacity-20`}>
          <div 
            className={`h-1 rounded-full ${statusColors[status].split(' ')[0]}`}
            style={{ width: `${Math.min((count / Math.max(tasks.length, 1)) * 100, 100)}%` }}
          />
        </div>
      </div>
      
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
        className="space-y-3 min-h-96 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700"
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        
        <button
          onClick={() => {
            setSelectedStatus(status);
            setShowNewTaskModal(true);
          }}
          className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <Plus className="w-4 h-4 mx-auto mb-1" />
          <span className="text-xs">Görev Ekle</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Proje Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Sprint ve görevlerinizi yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewSprintModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Target className="w-4 h-4" />
            Yeni Sprint
          </button>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Görev
          </button>
        </div>
      </div>

      {/* Sprint Info */}
      {currentSprint && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {currentSprint.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{currentSprint.goal}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {format(new Date(currentSprint.startDate), 'dd MMM', { locale: tr })} - 
                    {format(new Date(currentSprint.endDate), 'dd MMM', { locale: tr })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Hız: {velocity} saat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {Math.ceil((new Date(currentSprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün kaldı
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {tasksByStatus.done.length} / {Object.values(tasksByStatus).flat().length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Görev Tamamlandı</div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Görev Panosu</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {Object.values(tasksByStatus).flat().length} toplam görev
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TaskColumn
            title="Yapılacak"
            status="todo"
            tasks={tasksByStatus.todo}
            count={tasksByStatus.todo.length}
          />
          <TaskColumn
            title="Devam Ediyor"
            status="in_progress"
            tasks={tasksByStatus.in_progress}
            count={tasksByStatus.in_progress.length}
          />
          <TaskColumn
            title="İncelemede"
            status="review"
            tasks={tasksByStatus.review}
            count={tasksByStatus.review.length}
          />
          <TaskColumn
            title="Tamamlandı"
            status="done"
            tasks={tasksByStatus.done}
            count={tasksByStatus.done.length}
          />
        </div>
      </div>

      {/* New Sprint Modal */}
      {showNewSprintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Yeni Sprint Oluştur</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                if (currentProject) {
                  addSprint(currentProject.id, {
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    goal: formData.get('goal') as string,
                    status: 'planning',
                    startDate: formData.get('startDate') as string,
                    endDate: formData.get('endDate') as string,
                  });
                }
                setShowNewSprintModal(false);
              }}
              className="space-y-4"
            >
              <input
                name="name"
                type="text"
                placeholder="Sprint Adı"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <textarea
                name="description"
                placeholder="Açıklama"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <input
                name="goal"
                type="text"
                placeholder="Sprint Hedefi"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="startDate"
                  type="date"
                  required
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <input
                  name="endDate"
                  type="date"
                  required
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Oluştur
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewSprintModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Yeni Görev - {statusLabels[selectedStatus]}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleCreateTask({
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  priority: formData.get('priority') as TaskPriority,
                  estimatedHours: parseInt(formData.get('estimatedHours') as string),
                  dueDate: formData.get('dueDate') as string,
                  assignee: formData.get('assignee') as string,
                  tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
                });
              }}
              className="space-y-4"
            >
              <input
                name="title"
                type="text"
                placeholder="Görev Başlığı"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <textarea
                name="description"
                placeholder="Açıklama"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <select
                name="priority"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </select>
              <input
                name="estimatedHours"
                type="number"
                placeholder="Tahmini Süre (saat)"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <input
                name="assignee"
                type="text"
                placeholder="Atanan Kişi"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <input
                name="dueDate"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <input
                name="tags"
                type="text"
                placeholder="Etiketler (virgülle ayırın)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Oluştur
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};