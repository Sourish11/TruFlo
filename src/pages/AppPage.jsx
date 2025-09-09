import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "../components/ui/Button";
import OnboardingModal from "../components/ui/OnboardingModal";
import trufloLogo from "../assets/truflo-logo.png";

const sections = [
  { key: "dashboard", label: "Dashboard", icon: "🏠" },
  { key: "tasks", label: "Tasks", icon: "📋" },
  { key: "calendar", label: "Calendar", icon: "📅" },
  { key: "focus", label: "Focus", icon: "🎯" },
  { key: "challenges", label: "Challenges", icon: "🏆" },
  { key: "leaderboard", label: "Leaderboard", icon: "🏆" },
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function AppPage() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDemoNotice, setShowDemoNotice] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const [userStats, setUserStats] = useState({
    xp: 0,
    level: 1,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        const userDoc = await getDoc(doc(db, "users", u.uid));
        setUsername(userDoc.exists() ? userDoc.data().username || "" : "");

        // Load profile picture
        const savedPfp = localStorage.getItem(`profile_picture_${u.uid}`);
        if (savedPfp) {
          setProfilePicture(savedPfp);
        }

        // Check if user needs onboarding
        const hasCompletedOnboarding = localStorage.getItem(
          `onboarding_${u.uid}`,
        );
        if (!hasCompletedOnboarding) {
          setShowOnboarding(true);
        }

        // Load user stats
        const savedStats = localStorage.getItem(`user_stats_${u.uid}`);
        if (savedStats) {
          setUserStats(JSON.parse(savedStats));
        }

        // Check if demo notice was shown
        const demoNoticeShown = localStorage.getItem(`demo_notice_${u.uid}`);
        if (demoNoticeShown) {
          setShowDemoNotice(false);
        }
      } else {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate, location.key]);

  const handleLogout = async () => {
    await signOut(getAuth());
    navigate("/login");
  };

  const handleOnboardingComplete = (data) => {
    // Save onboarding data
    localStorage.setItem(`onboarding_${user.uid}`, JSON.stringify(data));
    localStorage.setItem(`onboarding_completed_${user.uid}`, "true");
    setShowOnboarding(false);
  };

  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setProfilePicture(imageData);
        localStorage.setItem(`profile_picture_${user.uid}`, imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDemoNoticeClose = () => {
    setShowDemoNotice(false);
    localStorage.setItem(`demo_notice_${user.uid}`, "true");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="flex h-screen relative">
      {/* Background layer - same as main website */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url(/wp9019837.webp)",
            filter: "brightness(0.25) blur(3px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/85" />
      </div>

      {/* Demo Version Notice */}
      {showDemoNotice && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="glass-enhanced rounded-lg p-4 border-2 border-yellow-400/50">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Demo Version</h3>
                <p className="text-white/80 text-sm mb-3">
                  You're using the demo version of TruFlo. Some features may not
                  work as expected or may show sample data.
                </p>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={handleDemoNoticeClose}
                >
                  Got it
                </Button>
              </div>
              <button
                onClick={handleDemoNoticeClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Compact Sidebar - Hidden by default, shows on toggle */}
      <div
        className={`
                fixed inset-y-0 left-0 z-50 w-64 glass-nav transform transition-transform duration-300 ease-in-out border-r border-white/10
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div className="flex flex-col h-full">
          {/* Compact Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <img src={trufloLogo} alt="TruFlo Logo" className="h-8 w-auto" />
              <div>
                <h2 className="text-lg font-bold text-white font-heading">
                  TruFlo
                </h2>
                <p className="text-xs text-white/70 font-body">
                  {getGreeting()}, {username || user.email?.split("@")[0]}
                </p>
              </div>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Compact User Profile Section */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 cursor-pointer group">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold group-hover:opacity-80 transition-opacity">
                      {(username || user.email)[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs">Edit</span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold font-heading text-sm truncate">
                  {username || user.email?.split("@")[0]}
                </div>
                <div className="text-white/60 text-xs font-body">
                  Level {userStats.level} • {userStats.xp} XP
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${userStats.xp % 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Compact Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 font-ui">
              Navigation
            </div>
            {sections.map((section) => (
              <NavLink
                key={section.key}
                to={`/app/${section.key}`}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 font-ui group text-sm ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-white font-semibold shadow-lg border border-white/20"
                      : "text-white/80 hover:text-white hover:bg-white/10 hover:translate-x-1"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                  {section.icon}
                </span>
                <span className="font-medium">{section.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Compact Quick Stats */}
          <div className="p-4 border-t border-white/10">
            <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 font-ui">
              Today's Stats
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-sm font-bold text-green-400 font-ui">
                  8
                </div>
                <div className="text-xs text-white/70 font-body">Tasks</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-sm font-bold text-blue-400 font-ui">
                  2.5h
                </div>
                <div className="text-xs text-white/70 font-body">Focus</div>
              </div>
            </div>
          </div>

          {/* Compact Logout Section */}
          <div className="p-4 border-t border-white/10">
            <Button
              variant="glass"
              onClick={handleLogout}
              className="w-full justify-center text-sm"
              size="sm"
            >
              <span className="mr-2">🚪</span>
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Compact Top Navigation Bar */}
        <div className="glass-nav border-b border-white/10">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3">
              {/* Hamburger Menu Button */}
              <button
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                onClick={() => setSidebarOpen(true)}
              >
                <svg
                  className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-white/80">
                <span className="text-sm font-medium font-ui">TruFlo</span>
                <span className="text-white/40">/</span>
                <span className="text-sm font-medium text-white capitalize font-ui">
                  {location.pathname.split("/").pop() || "dashboard"}
                </span>
              </div>
            </div>

            {/* Right Side - Compact Stats & Profile */}
            <div className="flex items-center space-x-3">
              {/* Quick XP Display */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">
                <div className="text-right">
                  <div className="text-white/80 text-xs font-ui">
                    Level {userStats.level}
                  </div>
                  <div className="text-white text-sm font-semibold font-ui">
                    {userStats.xp} XP
                  </div>
                </div>
                <div className="w-12 bg-white/20 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${userStats.xp % 100}%` }}
                  />
                </div>
              </div>

              {/* Compact User Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 cursor-pointer hover:scale-105 transition-transform duration-200">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {(username || user.email)[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
