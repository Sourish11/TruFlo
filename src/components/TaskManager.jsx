import { useState, useEffect } from "react";

export default function TaskManager({ userId, onTasksApplied }) {
  const [tasks, setTasks] = useState([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load tasks from localStorage
  useEffect(() => {
    if (!userId) return;
    
    const savedTasks = localStorage.getItem(`tasks_${userId}`);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, [userId]);

  // Save tasks to localStorage
  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem(`tasks_${userId}`, JSON.stringify(newTasks));
  };

  // Add new task
  const addTask = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      createdAt: new Date().toISOString(),
      status: "pending",
      progress: 0,
    };

    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    setShowAddTaskModal(false);

    // Emit tasks for Dashboard integration
    if (onTasksApplied) {
      onTasksApplied(generateDailyTasks(newTask));
    }
  };

  // Delete task
  const deleteTask = (taskId, event) => {
    event.stopPropagation();
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
    
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  // Select task for detailed view
  const selectTask = (task) => {
    setSelectedTask(task);
  };

  // Generate daily tasks based on the main task
  const generateDailyTasks = (task) => {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    // Calculate daily time slots
    const dailyMinutes = task.dailyDuration === "30 minutes" ? 30 :
                        task.dailyDuration === "1 hour" ? 60 :
                        task.dailyDuration === "1.5 hours" ? 90 :
                        task.dailyDuration === "2 hours" ? 120 :
                        task.dailyDuration === "3 hours" ? 180 : 60;

    // Create 2-3 focused time blocks
    const timeBlocks = [];
    const startTime = new Date();
    startTime.setHours(15, 0, 0, 0); // 3:00 PM

    if (dailyMinutes >= 30) {
      timeBlocks.push({
        id: `${task.id}_block1`,
        title: `Start: ${task.task}`,
        timeSlot: "3:00 PM - 3:50 PM",
        taskType: "Focus Work",
        emoji: "🧠",
        difficulty: "Medium",
        xpEarned: 20,
        description: `Begin working on ${task.task}. Focus on getting started and building momentum.`,
        aiFeedback: "Perfect starter task for your session"
      });
    }

    if (dailyMinutes >= 60) {
      timeBlocks.push({
        id: `${task.id}_block2`,
        title: `Continue: ${task.task}`,
        timeSlot: "3:55 PM - 4:45 PM",
        taskType: "Deep Work",
        emoji: "✍️",
        difficulty: "Medium",
        xpEarned: 25,
        description: `Continue working on ${task.task}. Build on your initial progress and dive deeper.`,
        aiFeedback: "Maintain your momentum with this follow-up session"
      });
    }

    if (dailyMinutes >= 120) {
      timeBlocks.push({
        id: `${task.id}_block3`,
        title: `Review: ${task.task}`,
        timeSlot: "4:50 PM - 5:00 PM",
        taskType: "Review",
        emoji: "🧪",
        difficulty: "Easy",
        xpEarned: 10,
        description: `Review your progress on ${task.task}. Plan next steps and consolidate learning.`,
        aiFeedback: "Great way to wrap up your focused session"
      });
    }

    return timeBlocks;
  };

  // Calculate task progress based on due date
  const getTaskProgress = (task) => {
    const now = new Date();
    const created = new Date(task.createdAt);
    const due = new Date(task.dueDate);
    const totalTime = due - created;
    const elapsed = now - created;
    return Math.min(Math.max((elapsed / totalTime) * 100, 0), 100);
  };

  if (!userId) {
    return <div className="text-red-500">Error: User ID is required</div>;
  }

  return (
    <>
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">
              📋 My Tasks
            </h2>
            <p className="text-white/70 font-body">
              Create and manage your daily focused work sessions
            </p>
          </div>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl py-2 px-4 font-medium transition-colors"
          >
            ➕ Add Task
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-4 mb-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-2xl shadow-md p-4 cursor-pointer transition-colors border relative ${
                selectedTask?.id === task.id
                  ? "bg-indigo-500/20 border-indigo-400/50"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
              onClick={() => selectTask(task)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{task.task}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-white/70">
                    <span>⏱️ {task.dailyDuration}/day</span>
                    <span>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-white/70 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(getTaskProgress(task))}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${getTaskProgress(task)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium text-green-400">
                    Active
                  </p>
                  <p className="text-xs text-white/60">
                    Focus Sessions Available
                  </p>
                </div>
              </div>
              
              {/* Delete Button */}
              <button
                onClick={(e) => deleteTask(task.id, e)}
                className="absolute bottom-3 right-3 w-8 h-8 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 rounded-full flex items-center justify-center transition-all border border-red-500/30 hover:border-red-400/60"
                title="Delete task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
            <p className="text-white/70 mb-4">Create your first task to get started with focused work sessions</p>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl py-2 px-4 font-medium transition-colors"
            >
              Create First Task
            </button>
          </div>
        )}

        {/* Selected Task Details */}
        {selectedTask && (
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              📊 Task Details: {selectedTask.task}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                <p className="text-white/60 text-sm">Daily Time</p>
                <p className="text-white font-bold">{selectedTask.dailyDuration}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                <p className="text-white/60 text-sm">Due Date</p>
                <p className="text-white font-bold">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                <p className="text-white/60 text-sm">Progress</p>
                <p className="text-white font-bold">{Math.round(getTaskProgress(selectedTask))}%</p>
              </div>
            </div>
            <button
              onClick={() => {
                const dailyTasks = generateDailyTasks(selectedTask);
                if (onTasksApplied) {
                  onTasksApplied(dailyTasks);
                }
              }}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl py-3 px-4 font-medium transition-colors"
            >
              🚀 Start Today's Focus Session
            </button>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <AddTaskModal
          onClose={() => setShowAddTaskModal(false)}
          onSubmit={addTask}
          loading={loading}
        />
      )}
    </>
  );
}

// Add Task Modal Component
function AddTaskModal({ onClose, onSubmit, loading }) {
  const [task, setTask] = useState("");
  const [dailyDuration, setDailyDuration] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim() && dailyDuration && dueDate) {
      onSubmit({
        task: task.trim(),
        dailyDuration,
        dueDate,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-white/20 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            ✨ Add New Task
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/80 mb-2">
              What Task? *
            </label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., Learn Python, Complete project proposal..."
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Duration Each Day *
            </label>
            <select
              value={dailyDuration}
              onChange={(e) => setDailyDuration(e.target.value)}
              className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              style={{ colorScheme: 'dark' }}
              required
            >
              <option value="" className="bg-gray-800 text-white">Select daily duration...</option>
              <option value="30 minutes" className="bg-gray-800 text-white">30 minutes</option>
              <option value="1 hour" className="bg-gray-800 text-white">1 hour</option>
              <option value="1.5 hours" className="bg-gray-800 text-white">1.5 hours</option>
              <option value="2 hours" className="bg-gray-800 text-white">2 hours</option>
              <option value="3 hours" className="bg-gray-800 text-white">3 hours</option>
              <option value="4 hours" className="bg-gray-800 text-white">4 hours</option>
              <option value="5+ hours" className="bg-gray-800 text-white">5+ hours</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              style={{ colorScheme: 'dark' }}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl py-2 px-4 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !task.trim() || !dailyDuration || !dueDate}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl py-2 px-4 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "📝 Creating..." : "📝 Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
