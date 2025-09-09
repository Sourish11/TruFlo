import { useState } from 'react';
import { Card, CardContent, CardHeader } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { generateSubtasks } from '../../services/geminiService';

export default function SmartTaskAI({ onTasksGenerated, userProfile }) {
  const [taskInput, setTaskInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleGenerateTasks = async () => {
    if (!taskInput.trim()) return;
    setIsProcessing(true);
    try {
      const subtasks = await generateSubtasks(taskInput, dueDate, userProfile);
      setGeneratedTasks(subtasks);
      setShowResults(true);
    } catch (error) {
      console.error('AI task generation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptTasks = () => {
    const tasksWithIds = generatedTasks.map(task => ({
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      status: 'todo',
      createdAt: Date.now(),
      isAIGenerated: true,
      originalTask: taskInput
    }));

    onTasksGenerated(tasksWithIds);
    setTaskInput('');
    setDueDate('');
    setGeneratedTasks([]);
    setShowResults(false);
  };

  const calculateXP = (task) => Math.floor(task.estMinutes * task.difficulty / 5);

  return (
    <div className="space-y-4">
      {!showResults ? (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-300 text-sm">
              <span>🤖</span>
              <span>Powered by Gemini</span>
            </div>
          </div>

          <Input
            label="What do you need to accomplish?"
            placeholder="e.g., Write a comprehensive project proposal for new marketing campaign"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Due Date (Optional)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 glass-button rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Focus Length</label>
              <div className="text-white/70 text-sm mt-3">{userProfile?.focusLength || 25} minutes</div>
            </div>
          </div>

          <Button onClick={handleGenerateTasks} disabled={!taskInput.trim() || isProcessing} loading={isProcessing} className="w-full">
            {isProcessing ? '🤖 Generating with Gemini...' : '✨ Generate Smart Plan'}
          </Button>

          {isProcessing && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-white/70 text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span>Gemini is breaking down your task...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white font-heading">🤖 AI Smart Plan Generated</h4>
            <Button variant="ghost" size="sm" onClick={() => setShowResults(false)}>← Back</Button>
          </div>

          <div className="p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
            <p className="text-green-300 text-sm">✨ Gemini broke down "{taskInput}" into {generatedTasks.length} optimized steps</p>
          </div>

          <div className="space-y-3">
            {generatedTasks.map((task, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-white font-medium text-sm">{index + 1}. {task.title}</h5>
                  <span className="text-xs text-white/60">{calculateXP(task)} XP</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className={`px-2 py-1 rounded ${
                    task.difficulty === 1 ? 'bg-green-500/20 text-green-400' :
                    task.difficulty === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {task.difficulty === 1 ? 'Easy' : task.difficulty === 2 ? 'Medium' : 'Hard'}
                  </span>
                  <span className="text-white/60">~{task.estMinutes} minutes</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <Button onClick={handleAcceptTasks} className="flex-1">✅ Add All Tasks & Schedule</Button>
            <Button variant="ghost" onClick={() => setShowResults(false)} className="flex-1">🔄 Try Again</Button>
          </div>

          <div className="text-center text-white/60 text-xs">
            Total estimated time: {generatedTasks.reduce((sum, task) => sum + task.estMinutes, 0)} minutes • Will be auto-scheduled on your calendar
          </div>
        </div>
      )}
    </div>
  );
}
