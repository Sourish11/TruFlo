import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalContent } from './Modal';
import { Card, CardContent } from './Card';

const moods = [
  { 
    emoji: '😄', 
    label: 'Energized', 
    color: 'from-green-400 to-emerald-500', 
    bg: 'bg-green-500/20',
    description: 'Ready to conquer the world!',
    gradient: 'from-green-500/30 to-emerald-500/30',
    shadow: 'shadow-green-500/30'
  },
  { 
    emoji: '🙂', 
    label: 'Focused', 
    color: 'from-blue-400 to-cyan-500', 
    bg: 'bg-blue-500/20',
    description: 'Clear mind, sharp thinking',
    gradient: 'from-blue-500/30 to-cyan-500/30',
    shadow: 'shadow-blue-500/30'
  },
  { 
    emoji: '😐', 
    label: 'Meh', 
    color: 'from-gray-400 to-slate-500', 
    bg: 'bg-gray-500/20',
    description: 'Just getting by today',
    gradient: 'from-gray-500/30 to-slate-500/30',
    shadow: 'shadow-gray-500/30'
  },
  { 
    emoji: '😫', 
    label: 'Overwhelmed', 
    color: 'from-red-400 to-rose-500', 
    bg: 'bg-red-500/20',
    description: 'Too much on my plate',
    gradient: 'from-red-500/30 to-rose-500/30',
    shadow: 'shadow-red-500/30'
  }
];

export default function MoodPickerModal({ isOpen, onClose, onMoodSelect }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [mehCount, setMehCount] = useState(0);
  const [showHiddenSection, setShowHiddenSection] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load persistent mood data
    const savedMehCount = localStorage.getItem('mehCount') || 0;
    setMehCount(parseInt(savedMehCount));
  }, []);

  const handleMoodSelect = (mood) => {
    setIsAnimating(true);
    setSelectedMood(mood);
    
    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 600);
    
    if (mood.label === 'Meh') {
      const newCount = mehCount + 1;
      setMehCount(newCount);
      localStorage.setItem('mehCount', newCount.toString());
      
      if (newCount >= 50) {
        setShowHiddenSection(true);
        // Trigger confetti
        if (window.confetti) {
          window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6B7280', '#9CA3AF', '#D1D5DB']
          });
        }
      }
    }
    
    onMoodSelect(mood);
  };

  const getMoodQuote = (mood) => {
    const quotes = {
      'Energized': "Perfect! Let's channel that energy into crushing your goals today!",
      'Focused': "Great mindset! You're ready to tackle complex tasks with clarity.",
      'Meh': "We all have these days. Let's start with something small and build momentum.",
      'Overwhelmed': "Take a breath. Let's break things down into manageable pieces."
    };
    return quotes[mood?.label] || '';
  };

  const getMoodTasks = (mood) => {
    const tasks = {
      'Energized': ['Start that big project', 'Tackle your hardest task', 'Plan your week ahead'],
      'Focused': ['Deep work session', 'Complex problem solving', 'Strategic planning'],
      'Meh': ['Organize your workspace', 'Quick email cleanup', 'Light planning'],
      'Overwhelmed': ['5-minute meditation', 'Brain dump thoughts', 'Pick one small task']
    };
    return tasks[mood?.label] || [];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-6xl mx-auto max-h-[95vh] overflow-y-auto">
        <Card className="glass-enhanced shadow-2xl border-2 border-white/20 overflow-hidden">
          <ModalHeader onClose={onClose}>
            <h3 className="text-2xl font-bold text-white drop-shadow-md font-heading">
              Experience TruFlo
            </h3>
          </ModalHeader>
          
          <ModalContent className="p-8">
            <div className="space-y-8">
              {/* Header with enhanced styling */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full border-2 border-white/30 mb-6 shadow-xl">
                  <span className="text-4xl">🔘</span>
                </div>
                <h4 className="text-3xl font-bold text-white mb-4 drop-shadow-lg font-heading">
                  How are you feeling right now?
                </h4>
                <p className="text-white/80 text-lg max-w-3xl mx-auto leading-relaxed font-body">
                  Your mood shapes your productivity. Let's see what we can do to help you get started!
                </p>
              </div>
              
              {/* Enhanced mood selection grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {moods.map((mood, index) => (
                  <button
                    key={index}
                    onClick={() => handleMoodSelect(mood)}
                    className={`group relative p-6 rounded-3xl transition-all duration-500 transform hover:scale-105 border-2 overflow-hidden ${
                      selectedMood?.label === mood.label 
                        ? `border-white/60 bg-gradient-to-br ${mood.gradient} shadow-2xl ${mood.shadow} scale-105` 
                        : 'border-white/20 hover:border-white/40 glass-button hover:shadow-xl'
                    } ${isAnimating && selectedMood?.label === mood.label ? 'animate-pulse' : ''}`}
                  >
                    {/* Background gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Content */}
                    <div className="relative z-10 text-center">
                      <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                        {mood.emoji}
                      </div>
                      <div className="text-white font-bold text-lg mb-2 drop-shadow-md font-heading">
                        {mood.label}
                      </div>
                      <div className="text-white/70 text-sm leading-relaxed font-body">
                        {mood.description}
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {selectedMood?.label === mood.label && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-green-500 text-sm font-bold">✓</span>
                      </div>
                    )}

                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${mood.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`} />
                  </button>
                ))}
              </div>

              {/* Enhanced mood response section */}
              {selectedMood && (
                <div className="animate-fade-in">
                  <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${selectedMood.gradient} border-2 border-white/30 shadow-2xl overflow-hidden`}>
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12" />
                    </div>
                    
                    <div className="relative z-10">
                      {/* Quote section */}
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 border border-white/30">
                          <span className="text-3xl">{selectedMood.emoji}</span>
                        </div>
                        <p className="text-white font-semibold text-xl mb-2 drop-shadow-md font-body">
                          {getMoodQuote(selectedMood)}
                        </p>
                      </div>

                      {/* Tasks section with enhanced design */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
                        <h4 className="text-white/90 font-semibold text-lg mb-4 flex items-center font-heading">
                          <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                          Recommended tasks for your mood:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {getMoodTasks(selectedMood).map((task, i) => (
                            <div key={i} className="flex items-center p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer">
                              <span className="text-green-400 mr-3 text-lg group-hover:scale-110 transition-transform duration-300">✓</span>
                              <span className="text-white/90 font-medium text-sm font-body">{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress indicator for Meh count */}
              {mehCount > 0 && mehCount < 50 && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-4 bg-white/10 px-6 py-3 rounded-full border border-white/20 backdrop-blur-sm">
                    <span className="text-white/80 text-sm font-medium font-body">Meh journey:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-gray-400 to-slate-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(mehCount / 50) * 100}%` }}
                        />
                      </div>
                      <span className="text-white/70 text-sm font-semibold font-ui">{mehCount}/50</span>
                    </div>
                    <span className="text-yellow-400 text-sm">🎁</span>
                  </div>
                </div>
              )}

              {/* Enhanced hidden section */}
              {showHiddenSection && (
                <Card className="glass-enhanced shadow-2xl border-2 border-yellow-400/60 animate-fade-in overflow-hidden">
                  <CardContent className="p-8">
                    {/* Celebration header */}
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full border-2 border-yellow-400/50 mb-4 shadow-xl">
                        <span className="text-4xl">🎁</span>
                      </div>
                      <div className="flex items-center justify-center space-x-4 mb-4">
                        <h4 className="text-2xl font-bold text-yellow-400 drop-shadow-lg font-heading">
                          Hidden Section Unlocked!
                        </h4>
                      </div>
                      
                      <h5 className="text-xl font-semibold text-white mb-2 font-heading">
                        Low Energy? Here's How 132 People Got Back on Track Today
                      </h5>
                      <p className="text-white/80 max-w-2xl mx-auto font-body">
                        You've unlocked exclusive strategies from our community for those "meh" moments.
                      </p>
                    </div>
                    
                    {/* Strategy cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="group p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🌱</div>
                        <h6 className="font-bold text-white mb-3 text-lg font-heading">Start Micro</h6>
                        <p className="text-white/80 leading-relaxed font-body">Begin with 2-minute tasks to build momentum. Small wins create big changes.</p>
                        <div className="mt-4 text-green-400 text-sm font-semibold font-ui">→ Try it now</div>
                      </div>
                      
                      <div className="group p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎵</div>
                        <h6 className="font-bold text-white mb-3 text-lg font-heading">Change Environment</h6>
                        <p className="text-white/80 leading-relaxed font-body">Move to a different space or play focus music. Fresh surroundings spark fresh energy.</p>
                        <div className="mt-4 text-purple-400 text-sm font-semibold font-ui">→ Switch it up</div>
                      </div>
                      
                      <div className="group p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">👥</div>
                        <h6 className="font-bold text-white mb-3 text-lg font-heading">Find Accountability</h6>
                        <p className="text-white/80 leading-relaxed font-body">Share your goal with someone or join our Discord. Community support works wonders.</p>
                        <div className="mt-4 text-blue-400 text-sm font-semibold font-ui">→ Get support</div>
                      </div>
                    </div>
                    
                    {/* Community stats */}
                    <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-6 border border-white/20 backdrop-blur-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                          <div className="text-3xl font-bold text-yellow-400 mb-1 font-ui">89%</div>
                          <div className="text-white/80 text-sm font-body">Found micro-tasks helpful</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-purple-400 mb-1 font-ui">76%</div>
                          <div className="text-white/80 text-sm font-body">Boosted energy with environment change</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-blue-400 mb-1 font-ui">92%</div>
                          <div className="text-white/80 text-sm font-body">Stayed motivated with accountability</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ModalContent>
        </Card>
      </div>
    </Modal>
  );
}