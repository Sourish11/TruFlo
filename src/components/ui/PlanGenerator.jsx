import { useState } from 'react';
import { Card, CardContent, CardHeader } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { generatePlan } from '../../services/geminiService';

function to12Hour(time) {
  // time: HH:MM
  const [h, m] = time.split(':').map((v) => parseInt(v, 10));
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
}

function durationText(days) {
  if (days === 1) return 'one day';
  if (days === 7) return 'one week';
  if (days === 14) return 'two weeks';
  if (days === 21) return 'three weeks';
  if (days === 28) return 'four weeks';
  return `${days} days`;
}

export default function PlanGenerator({ onImportTasks }) {
  const [userInput, setUserInput] = useState('');
  const [days, setDays] = useState(7);
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('17:00');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    setError('');
    const duration = durationText(days);
    const timeWindow = `${to12Hour(startTime)} - ${to12Hour(endTime)}`;
    try {
      const res = await generatePlan({ userInput, duration, timeWindow });
      setPlan(res);
    } catch (e) {
      setError(e?.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const difficultyToLevel = (d) => (d === 'Easy' ? 1 : d === 'Medium' ? 2 : 3);

  const importTodayTasks = () => {
    if (!plan?.days?.length) return;
    const firstDay = plan.days[0];
    const tasks = firstDay.tasks.map((t) => ({
      id: Math.random().toString(36).slice(2),
      title: t.title,
      difficulty: difficultyToLevel(t.difficulty),
      estMins: t.duration,
      status: 'todo',
      createdAt: Date.now(),
      tags: ['ai','gemini','plan']
    }));
    onImportTasks?.(tasks);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Flow-State Plan Generator (Gemini)</h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            label="Your goal/context"
            placeholder="e.g., Calculus Trigonometry exam in 2 weeks"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Duration (days)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value, 10))}
                  className="w-full"
                />
                <span className="text-white/80 text-sm min-w-[90px] text-right">{durationText(days)}</span>
              </div>
              <div className="overflow-x-auto mt-2 whitespace-nowrap no-scrollbar">
                {Array.from({ length: days }).map((_, i) => (
                  <span key={i} className="inline-block px-2 py-1 text-xs bg-white/5 border border-white/10 rounded mr-1 text-white/70">Day {i + 1}</span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Time Window</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Start</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-3 glass-button rounded-lg text-white" step={300} />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">End</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-3 glass-button rounded-lg text-white" step={300} />
                </div>
              </div>
              <div className="text-white/70 text-sm mt-2">{to12Hour(startTime)} – {to12Hour(endTime)}</div>
            </div>
          </div>

          <Button onClick={handleGenerate} loading={loading} disabled={loading || !userInput.trim()} className="w-full">
            {loading ? 'Generating with Gemini…' : 'Generate Plan'}
          </Button>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-400/30 rounded text-red-300 text-sm">{error}</div>
          )}

          {plan && (
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded border border-white/10">
                <div className="text-white font-medium">{plan.plan_title}</div>
              </div>
              {plan.days.map((day, i) => (
                <div key={i} className="p-4 bg-white/5 rounded border border-white/10">
                  <div className="text-white font-semibold mb-2">{day.day_title}</div>
                  <div className="space-y-3">
                    {day.tasks.map((t, j) => (
                      <div key={j} className="p-3 rounded bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="text-white font-medium">{t.title}</div>
                          <div className="text-xs text-white/60">{t.time_slot} • {t.duration}m • {t.difficulty} • {t.xp} XP</div>
                        </div>
                        <ul className="mt-2 list-disc list-inside text-white/80 text-sm space-y-1">
                          {t.steps.map((s, k) => (<li key={k}>{s}</li>))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="p-3 bg-white/5 rounded border border-white/10 text-sm text-white/80">
                <div>Total Tasks: {plan.summary.total_tasks}</div>
                <div>Total XP: {plan.summary.total_xp} • Total Time: {plan.summary.total_time}m</div>
              </div>

              <Button onClick={importTodayTasks} className="w-full">Add Today's Tasks to Task Manager</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
