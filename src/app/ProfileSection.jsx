import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function ProfileSection() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchUsername = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsername(userData.username || "");
        setInput(userData.username || "");
      }
    };
    fetchUsername();
  }, [user]);

  const handleSetUsername = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!input.trim()) {
      setError("Username cannot be empty.");
      setIsLoading(false);
      return;
    }

    if (input.length < 3) {
      setError("Username must be at least 3 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      // Check for duplicate username
      const q = query(collection(db, "users"), where("username", "==", input.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty && input.trim() !== username) {
        setError("Username already taken. Please choose another.");
        setIsLoading(false);
        return;
      }

      // Save username
      await setDoc(doc(db, "users", user.uid), { 
        username: input.trim(),
        email: user.email,
        updatedAt: new Date()
      }, { merge: true });
      
      setUsername(input.trim());
      setSuccess("Username updated successfully!");
    } catch (err) {
      setError("Failed to update username. Please try again.");
      console.error("Error updating username:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  const profileStats = [
    { label: 'Total XP', value: '1,250', color: 'text-blue-600' },
    { label: 'Current Streak', value: '7 days', color: 'text-green-600' },
    { label: 'Challenges Completed', value: '12', color: 'text-purple-600' },
    { label: 'Focus Hours', value: '45.5h', color: 'text-orange-600' },
  ];

  const achievements = [
    { title: 'First Steps', description: 'Completed your first task', icon: '🎯', earned: true },
    { title: 'Week Warrior', description: 'Maintained a 7-day streak', icon: '🔥', earned: true },
    { title: 'Focus Master', description: 'Completed 10 focus sessions', icon: '🧠', earned: false },
    { title: 'Challenge Champion', description: 'Won a community challenge', icon: '🏆', earned: false },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {(username || user.email)[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {username || 'User'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {user.email}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Member since {new Date(user.metadata.creationTime).toLocaleDateString()}</span>
                <span>•</span>
                <span>Level 5</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {profileStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 text-center">
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Username Update */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Profile Settings
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetUsername} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              error={error}
              helperText="Choose a unique username (minimum 3 characters)"
            />
            
            {success && (
              <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
              </div>
            )}
            
            <Button
              type="submit"
              loading={isLoading}
              disabled={input.trim() === username}
            >
              Update Username
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Achievements
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.earned
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </span>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      achievement.earned 
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm ${
                      achievement.earned 
                        ? 'text-green-600 dark:text-green-300' 
                        : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}