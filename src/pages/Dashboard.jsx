import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import MoodPickerModal from "../components/ui/MoodPickerModal";
import FocusTimer from "../components/ui/FocusTimer";
import ProgressGraph from "../components/ui/ProgressGraph";
import TaskManager from "../components/TaskManager";
import { useFocusTimer } from "../hooks/useFocusTimer";
import trufloLogo from "../assets/truflo-logo.png";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [currentMood, setCurrentMood] = useState(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [quickGoal, setQuickGoal] = useState("");
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [focusSessionActive, setFocusSessionActive] = useState(false);
  const [showBreakOptions, setShowBreakOptions] = useState(false);
  const [lastBreakChoice, setLastBreakChoice] = useState(15);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [completedBigTask, setCompletedBigTask] = useState(null);
  const [reflection, setReflection] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeSmartTask, setActiveSmartTask] = useState(null);

  // Focus timer for smart tasks
  const smartTaskTimer = useFocusTimer(activeSmartTask);

  const [availableTimeSlot, setAvailableTimeSlot] = useState({
    start: "",
    end: "",
  });

  const [userStats, setUserStats] = useState({
    xp: 1250,
    lockedXP: 0,
    streak: 7,
    tasksCompleted: 12,
    focusHours: 8.5,
    timeWasted: 45,
    timeSaved: 120,
    weeklyTimeSaved: 840,
    totalTimeSaved: 5400,
    level: 12,
    nextLevelXP: 100,
    trustLevel: 85, // Used for dynamic XP calculations
  });

  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Review project proposal",
      description:
        "Go through the quarterly project proposal and provide feedback",
      duration: 30,
      difficulty: "medium",
      energy: "focused",
      xpReward: 30,
      status: "pending",
      isAIGenerated: false,
      lockedXP: 0,
      startTime: null,
      canComplete: false,
    },
    {
      id: "2",
      title: "Update portfolio website",
      description: "Add recent projects and update skills section",
      duration: 45,
      difficulty: "easy",
      energy: "creative",
      xpReward: 45,
      status: "pending",
      isAIGenerated: false,
      lockedXP: 0,
      startTime: null,
      canComplete: false,
    },
  ]);

  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    setUser(auth.currentUser);

    // Load all data from localStorage
    const userId = auth.currentUser?.uid;
    if (userId) {
      const savedPfp = localStorage.getItem(`profile_picture_${userId}`);
      if (savedPfp) setProfilePicture(savedPfp);

      const savedTasks = localStorage.getItem(`truflo_tasks_${userId}`);
      if (savedTasks) setTasks(JSON.parse(savedTasks));

      const savedStats = localStorage.getItem(`user_stats_${userId}`);
      if (savedStats)
        setUserStats((prev) => ({ ...prev, ...JSON.parse(savedStats) }));

      const savedSchedule = localStorage.getItem(`schedule_${userId}`);
      if (savedSchedule) setSchedule(JSON.parse(savedSchedule));

      const today = new Date().toDateString();
      const savedMood = localStorage.getItem(`mood_${today}_${userId}`);
      if (savedMood) setCurrentMood(JSON.parse(savedMood));

      const savedBreak = localStorage.getItem(`last_break_${userId}`);
      if (savedBreak) setLastBreakChoice(parseInt(savedBreak));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(`truflo_tasks_${user.uid}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(`user_stats_${user.uid}`, JSON.stringify(userStats));
    }
  }, [userStats, user]);

  const handleMoodSelect = (mood) => {
    const today = new Date().toDateString();
    const moodData = { ...mood, date: today, timestamp: Date.now() };

    setCurrentMood(moodData);
    localStorage.setItem(`mood_${today}_${user.uid}`, JSON.stringify(moodData));
    setShowMoodPicker(false);

    // Filter tasks based on mood/energy
    const energyMap = {
      Energized: "high-energy",
      Focused: "focused",
      Relaxed: "low-energy",
      Motivated: "high-energy",
      Calm: "focused",
      Tired: "low-energy",
    };

    // This would filter and reorder tasks based on current energy level
    // For now, we'll just show all tasks but could implement mood-based filtering
  };

  // 1. Quick Goal → AI Breakdown System
  const handleBreakDownGoal = async () => {
    if (!quickGoal.trim()) return;

    setIsGeneratingTasks(true);

    // Simulate AI call (replace with actual Ollama integration)
    setTimeout(() => {
      const mockTasks = [
        {
          id: Date.now() + 1,
          title: `Research for: ${quickGoal}`,
          description: "Gather information and resources needed",
          duration: 25,
          difficulty: "easy",
          energy: "focused",
          xpReward: 25,
          status: "pending",
          isAIGenerated: true,
          lockedXP: 0,
          startTime: null,
          canComplete: false,
        },
        {
          id: Date.now() + 2,
          title: `Plan structure for: ${quickGoal}`,
          description: "Create outline and define key components",
          duration: 30,
          difficulty: "medium",
          energy: "focused",
          xpReward: 30,
          status: "pending",
          isAIGenerated: true,
          lockedXP: 0,
          startTime: null,
          canComplete: false,
        },
        {
          id: Date.now() + 3,
          title: `Begin implementation of: ${quickGoal}`,
          description: "Start working on the main deliverable",
          duration: 45,
          difficulty: "hard",
          energy: "high-energy",
          xpReward: 50,
          status: "pending",
          isAIGenerated: true,
          lockedXP: 0,
          startTime: null,
          canComplete: false,
        },
      ];

      setTasks((prev) => [...prev, ...mockTasks]);
      setQuickGoal("");
      setIsGeneratingTasks(false);

      // Show success message
      if (window.confetti) {
        window.confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#A855F7", "#3B82F6", "#10B981"],
        });
      }
    }, 2000);
  };

  // 2. Focus-Only Task Completion + 3. XP Bond System
  const handleStartTask = (task) => {
    if (!currentMood) {
      setShowMoodPicker(true);
      return;
    }

    // Lock XP based on task difficulty and trust level
    const xpToLock = Math.round(task.xpReward * (userStats.trustLevel / 100));

    const updatedTask = {
      ...task,
      status: "in-progress",
      startTime: Date.now(),
      lockedXP: xpToLock,
    };

    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    setUserStats((prev) => ({
      ...prev,
      xp: prev.xp - xpToLock,
      lockedXP: prev.lockedXP + xpToLock,
    }));

    setSelectedTask(updatedTask);
    setFocusSessionActive(true);
    setShowFocusTimer(true);
  };

  const handleFocusComplete = (completedTask) => {
    setFocusSessionActive(false);
    setShowFocusTimer(false);

    // Calculate XP multiplier based on last break choice
    let xpMultiplier = 1;
    if (lastBreakChoice === 5)
      xpMultiplier = 1.2; // Short break = XP boost
    else if (lastBreakChoice === 30) xpMultiplier = 1.1; // Long break = recovery bonus

    const finalXP = Math.round(
      (completedTask.lockedXP + completedTask.xpReward) * xpMultiplier,
    );

    // Update task as completable
    const updatedTask = {
      ...completedTask,
      canComplete: true,
      finalXP: finalXP,
    };

    setTasks((prev) =>
      prev.map((t) => (t.id === completedTask.id ? updatedTask : t)),
    );
    setSelectedTask(updatedTask);

    // Show break options for tasks > 25 minutes
    if (completedTask.duration > 25) {
      setShowBreakOptions(true);
    } else {
      // Auto-complete short tasks
      handleCompleteTask(updatedTask);
    }
  };

  const handleCompleteTask = (task) => {
    const updatedTask = {
      ...task,
      status: "completed",
      completedAt: Date.now(),
    };

    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    setUserStats((prev) => ({
      ...prev,
      xp: prev.xp + (task.finalXP || task.xpReward),
      lockedXP: prev.lockedXP - (task.lockedXP || 0),
      tasksCompleted: prev.tasksCompleted + 1,
      trustLevel: Math.min(100, prev.trustLevel + 1), // Increase trust on completion
    }));

    // Check if this is a big task (>30 min) for reflection
    if (task.duration > 30) {
      setCompletedBigTask(task);
      setShowReflectionModal(true);
    }

    setShowBreakOptions(false);
    setSelectedTask(null);

    // Confetti celebration
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // 5. Break-Aware XP Scaling
  const handleBreakChoice = (minutes) => {
    setLastBreakChoice(minutes);
    localStorage.setItem(`last_break_${user.uid}`, minutes.toString());
    setShowBreakOptions(false);

    if (selectedTask) {
      handleCompleteTask(selectedTask);
    }
  };

  // 6. AI Task Reflection for XP Boost
  const handleSubmitReflection = async () => {
    if (!reflection.trim()) return;

    // Simulate AI scoring (replace with actual Ollama call)
    const mockScore = Math.floor(Math.random() * 5) + 1; // 1-5 score
    const bonusXP = mockScore * 10;

    setUserStats((prev) => ({
      ...prev,
      xp: prev.xp + bonusXP,
    }));

    setReflection("");
    setShowReflectionModal(false);
    setCompletedBigTask(null);

    // Show success message
    alert(
      `Great reflection! AI scored it ${mockScore}/5. Bonus XP: +${bonusXP}`,
    );
  };

  // 4. Calendar-Based Scheduling
  const handleScheduleTasks = () => {
    if (!availableTimeSlot.start || !availableTimeSlot.end) return;

    const startTime = new Date(
      `${new Date().toDateString()} ${availableTimeSlot.start}`,
    );
    const endTime = new Date(
      `${new Date().toDateString()} ${availableTimeSlot.end}`,
    );
    const totalMinutes = (endTime - startTime) / (1000 * 60);

    // Get pending tasks that fit in the time slot
    const pendingTasks = tasks.filter((t) => t.status === "pending");
    let scheduledTasks = [];
    let currentTime = new Date(startTime);
    let remainingTime = totalMinutes;

    for (const task of pendingTasks) {
      if (remainingTime >= task.duration + 15) {
        // Task + 15min break
        scheduledTasks.push({
          ...task,
          scheduledStart: new Date(currentTime),
          scheduledEnd: new Date(currentTime.getTime() + task.duration * 60000),
        });

        currentTime = new Date(
          currentTime.getTime() + (task.duration + 15) * 60000,
        );
        remainingTime -= task.duration + 15;
      }
    }

    setSchedule(scheduledTasks);
    localStorage.setItem(
      `schedule_${user.uid}`,
      JSON.stringify(scheduledTasks),
    );
    setShowSchedule(true);
  };

  const getMoodBasedTasks = () => {
    if (!currentMood) return tasks;

    const energyMap = {
      Energized: "high-energy",
      Focused: "focused",
      Relaxed: "low-energy",
      Motivated: "high-energy",
      Calm: "focused",
      Tired: "low-energy",
    };

    const preferredEnergy = energyMap[currentMood.label];
    return tasks.sort((a, b) => {
      if (a.energy === preferredEnergy && b.energy !== preferredEnergy)
        return -1;
      if (a.energy !== preferredEnergy && b.energy === preferredEnergy)
        return 1;
      return 0;
    });
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Smart task handlers
  const handleStartSmartTask = (task) => {
    setActiveSmartTask(task);
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === task.id
          ? { ...t, status: "in-progress", startTime: new Date().toISOString() }
          : t,
      ),
    );
    smartTaskTimer.startTimer();
  };

  const handleCompleteSmartTask = () => {
    if (!activeSmartTask) return;

    const result = smartTaskTimer.stopTimer();
    if (result) {
      const updatedStats = {
        ...userStats,
        xp: userStats.xp + result.earnedXp,
        tasksCompleted: userStats.tasksCompleted + 1,
        focusHours: userStats.focusHours + result.actualMinutes / 60,
      };

      setUserStats(updatedStats);

      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === activeSmartTask.id
            ? {
                ...t,
                status: "completed",
                completedAt: new Date().toISOString(),
              }
            : t,
        ),
      );

      // Save completion data
      const completionData = {
        taskId: activeSmartTask.id,
        earnedXp: result.earnedXp,
        timeSpent: result.actualMinutes,
        efficiency: result.efficiency,
        completedAt: new Date().toISOString(),
      };

      const savedCompletions = JSON.parse(
        localStorage.getItem(`completions_${user?.uid || "demo-user"}`) || "[]",
      );
      savedCompletions.push(completionData);
      localStorage.setItem(
        `completions_${user?.uid || "demo-user"}`,
        JSON.stringify(savedCompletions),
      );
    }

    setActiveSmartTask(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header with XP Bond Display */}
      <Card className="p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={trufloLogo} alt="TruFlo Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-heading">
                Welcome back, {user?.email?.split("@")[0] || "there"}! 👋
              </h1>
              <p className="text-white/80 text-lg font-body">
                {currentMood
                  ? `Feeling ${currentMood.label} today`
                  : "How are you feeling today?"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Profile Picture */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  {(user?.email || "U")[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* XP Display with Locked XP */}
            <div className="text-right">
              <div className="text-white/80 text-sm mb-1">
                XP: {userStats.xp}{" "}
                {userStats.lockedXP > 0 && (
                  <span className="text-yellow-400">
                    ({userStats.lockedXP} locked)
                  </span>
                )}
              </div>
              <div className="w-32 bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${((userStats.xp % userStats.nextLevelXP) / userStats.nextLevelXP) * 100}%`,
                  }}
                />
              </div>
              <div className="text-white/60 text-xs mt-1">
                Level {userStats.level} • Trust: {userStats.trustLevel}%
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Task Manager - Simple and Reliable */}
      <TaskManager
        userId={user?.uid || "demo-user"}
        onTasksApplied={(focusTasks) => {
          // Integrate focus tasks with existing dashboard tasks
          const newTasks = focusTasks.map((task) => ({
            ...task,
            status: "pending",
            isAIGenerated: true,
            energy: "focused",
            duration: 30, // Default 30 minutes
            xpReward: task.xpEarned,
            canComplete: false,
          }));

          setTasks((prevTasks) => [
            ...prevTasks.filter((t) => !t.isAIGenerated), // Remove old AI tasks
            ...newTasks,
          ]);
        }}
      />

      {/* Mood-Based Task Suggestions */}
      {currentMood && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 font-heading">
            🧠 Tasks Matched to Your {currentMood.label} Mood
          </h2>
          <div className="grid gap-4">
            {getMoodBasedTasks()
              .filter((t) => t.status === "pending")
              .slice(0, 3)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">
                        {task.isAIGenerated ? "✨" : "📝"}
                      </span>
                      <h3 className="text-white font-semibold">{task.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          task.energy === "high-energy"
                            ? "bg-red-500/20 text-red-300"
                            : task.energy === "focused"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-green-500/20 text-green-300"
                        }`}
                      >
                        {task.energy}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm">{task.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-white/60">
                      <span>⏱️ {task.duration}min</span>
                      <span>🏆 {task.xpReward} XP</span>
                      <span
                        className={`px-2 py-1 rounded ${
                          task.difficulty === "easy"
                            ? "bg-green-500/20 text-green-300"
                            : task.difficulty === "medium"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {task.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {task.status === "pending" && (
                      <Button
                        onClick={() =>
                          task.isAIGenerated
                            ? handleStartSmartTask(task)
                            : handleStartTask(task)
                        }
                        className="bg-gradient-to-r from-purple-500 to-blue-500"
                        size="sm"
                      >
                        {task.isAIGenerated
                          ? "🚀 Start Focus"
                          : "🔒 Lock XP & Start"}
                      </Button>
                    )}
                    {task.status === "in-progress" &&
                      task.isAIGenerated &&
                      activeSmartTask?.id === task.id && (
                        <Button
                          onClick={handleCompleteSmartTask}
                          className="bg-gradient-to-r from-green-500 to-emerald-500"
                          size="sm"
                        >
                          ✅ Complete ({smartTaskTimer.formattedTime})
                        </Button>
                      )}
                    {task.canComplete && !task.isAIGenerated && (
                      <Button
                        onClick={() => handleCompleteTask(task)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500"
                        size="sm"
                      >
                        ✅ Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Active Smart Task Focus Timer */}
      {activeSmartTask && smartTaskTimer.isActive && (
        <Card className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">
                  Focus Session Active
                </h3>
                <p className="text-white/80 font-body">
                  {activeSmartTask.title}
                </p>
                <p className="text-white/60 text-sm">
                  Expected: {activeSmartTask.estimatedMinutes}min • XP:{" "}
                  {activeSmartTask.xp}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-2">
                {smartTaskTimer.formattedTime}
              </div>
              <div className="w-32 bg-white/20 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${smartTaskTimer.progress}%` }}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={smartTaskTimer.pauseTimer}
                  className="bg-yellow-500 hover:bg-yellow-600"
                  size="sm"
                >
                  ⏸️ Pause
                </Button>
                <Button
                  onClick={handleCompleteSmartTask}
                  className="bg-green-500 hover:bg-green-600"
                  size="sm"
                >
                  ✅ Complete
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}


      {/* Progress Analytics */}
      <ProgressGraph />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          hover
          className="cursor-pointer"
          onClick={() => !currentMood && setShowMoodPicker(true)}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">{currentMood?.emoji || "😊"}</span>
            </div>
            <h3 className="font-semibold text-white font-heading">
              {currentMood ? "Change Mood" : "Set Mood"}
            </h3>
          </CardContent>
        </Card>


        <Card hover className="cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="font-semibold text-white font-heading">
              Challenges
            </h3>
          </CardContent>
        </Card>

        <Card hover className="cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-400/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">���</span>
            </div>
            <h3 className="font-semibold text-white font-heading">
              Leaderboard
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Today's Stats with Streak */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white font-heading">
            Today's Progress & Streaks
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1 font-ui">
                {userStats.tasksCompleted}
              </div>
              <div className="text-sm text-white/70 font-body">Tasks Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1 font-ui">
                {userStats.focusHours}h
              </div>
              <div className="text-sm text-white/70 font-body">Focus Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1 font-ui">
                {userStats.streak}
              </div>
              <div className="text-sm text-white/70 font-body">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1 font-ui">
                {userStats.xp}
              </div>
              <div className="text-sm text-white/70 font-body">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400 mb-1 font-ui">
                {userStats.trustLevel}%
              </div>
              <div className="text-sm text-white/70 font-body">Trust Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <MoodPickerModal
        isOpen={showMoodPicker}
        onClose={() => setShowMoodPicker(false)}
        onMoodSelect={handleMoodSelect}
      />

      {showFocusTimer && selectedTask && (
        <FocusTimer
          isActive={focusSessionActive}
          onStart={() => setFocusSessionActive(true)}
          onPause={() => setFocusSessionActive(false)}
          onComplete={() => handleFocusComplete(selectedTask)}
          onQuit={() => {
            setShowFocusTimer(false);
            setFocusSessionActive(false);
            // Burn locked XP on quit
            setUserStats((prev) => ({
              ...prev,
              lockedXP: prev.lockedXP - selectedTask.lockedXP,
              trustLevel: Math.max(0, prev.trustLevel - 5),
            }));
            setTasks((prev) =>
              prev.map((t) =>
                t.id === selectedTask.id
                  ? { ...t, status: "pending", lockedXP: 0, startTime: null }
                  : t,
              ),
            );
            setSelectedTask(null);
          }}
          mood={currentMood?.label || "Focused"}
          duration={selectedTask.duration}
          taskTitle={selectedTask.title}
        />
      )}

      {/* Break Choice Modal */}
      {showBreakOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="glass-enhanced shadow-2xl border-2 border-white/20 max-w-md w-full mx-4">
            <CardHeader>
              <h3 className="text-xl font-semibold text-white font-heading">
                🌟 Choose Your Break
              </h3>
              <p className="text-white/70">
                Your choice affects next task's XP!
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={() => handleBreakChoice(5)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  ⚡ 5 min break (+20% next XP)
                </Button>
                <Button
                  onClick={() => handleBreakChoice(15)}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  😌 15 min break (normal XP)
                </Button>
                <Button
                  onClick={() => handleBreakChoice(30)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  🛋️ 30 min break (+10% recovery XP)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reflection Modal */}
      {showReflectionModal && completedBigTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="glass-enhanced shadow-2xl border-2 border-white/20 max-w-lg w-full mx-4">
            <CardHeader>
              <h3 className="text-xl font-semibold text-white font-heading">
                📝 Task Reflection
              </h3>
              <p className="text-white/70">
                Share what you accomplished for bonus XP!
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded">
                  <div className="text-white font-medium">
                    {completedBigTask.title}
                  </div>
                  <div className="text-white/60 text-sm">
                    {completedBigTask.duration} minutes
                  </div>
                </div>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Describe what you accomplished, challenges faced, and progress made..."
                  className="w-full p-3 glass-button rounded-lg text-white placeholder-white/60 h-32 resize-none"
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSubmitReflection}
                    disabled={!reflection.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
                  >
                    Submit for AI Scoring
                  </Button>
                  <Button
                    onClick={() => {
                      setShowReflectionModal(false);
                      setReflection("");
                      setCompletedBigTask(null);
                    }}
                    variant="ghost"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
