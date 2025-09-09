import { useState } from "react";
import { Card, CardContent, CardHeader } from "./Card";
import { Button } from "./Button";

// Generate realistic demo data with daily variations
const generateDemoData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return {
    daily: days.map((day, index) => ({
      label: day,
      productivity: 65 + Math.random() * 30,
      focusTime: 2 + Math.random() * 4,
      tasksCompleted: 3 + Math.floor(Math.random() * 8),
      timeSaved: 45 + Math.random() * 60,
      moodScore: 3 + Math.random() * 2,
    })),
    weekly: weeks.map((week, index) => ({
      label: week,
      productivity: 70 + Math.random() * 25,
      focusTime: 15 + Math.random() * 10,
      tasksCompleted: 25 + Math.floor(Math.random() * 20),
      timeSaved: 300 + Math.random() * 200,
      moodScore: 3.5 + Math.random() * 1.5,
    })),
    monthly: months.map((month, index) => ({
      label: month,
      productivity: 75 + Math.random() * 20,
      focusTime: 60 + Math.random() * 40,
      tasksCompleted: 100 + Math.floor(Math.random() * 80),
      timeSaved: 1200 + Math.random() * 800,
      moodScore: 3.8 + Math.random() * 1.2,
    })),
  };
};

export default function ProgressGraph() {
  const [timeframe, setTimeframe] = useState("daily");
  const [metric, setMetric] = useState("productivity");
  const data = generateDemoData();

  const currentData = data[timeframe];
  const maxValue = Math.max(...currentData.map((d) => d[metric]));

  const getMetricLabel = (metric) => {
    switch (metric) {
      case "productivity":
        return "Productivity %";
      case "focusTime":
        return "Focus Hours";
      case "tasksCompleted":
        return "Tasks Completed";
      case "timeSaved":
        return "Time Saved (min)";
      case "moodScore":
        return "Mood Score";
      default:
        return metric;
    }
  };

  const getMetricColor = (metric) => {
    switch (metric) {
      case "productivity":
        return "from-purple-400 to-blue-400";
      case "focusTime":
        return "from-green-400 to-emerald-400";
      case "tasksCompleted":
        return "from-blue-400 to-cyan-400";
      case "timeSaved":
        return "from-orange-400 to-red-400";
      case "moodScore":
        return "from-pink-400 to-purple-400";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const formatValue = (value, metric) => {
    switch (metric) {
      case "productivity":
        return `${Math.round(value)}%`;
      case "focusTime":
        return `${value.toFixed(1)}h`;
      case "tasksCompleted":
        return Math.round(value);
      case "timeSaved":
        return `${Math.round(value)}m`;
      case "moodScore":
        return value.toFixed(1);
      default:
        return Math.round(value);
    }
  };

  return (
    <Card className="glass-enhanced shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white font-heading">
            📊 Progress Analytics
          </h3>
          <div className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
            Demo Data
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Timeframe Selection */}
          <div className="flex space-x-2">
            {["daily", "weekly", "monthly"].map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "primary" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(tf)}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </Button>
            ))}
          </div>

          {/* Metric Selection */}
          <div className="flex space-x-2">
            {[
              "productivity",
              "focusTime",
              "tasksCompleted",
              "timeSaved",
              "moodScore",
            ].map((m) => (
              <Button
                key={m}
                variant={metric === m ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMetric(m)}
              >
                {getMetricLabel(m)}
              </Button>
            ))}
          </div>
        </div>

        {/* Graph */}
        <div className="relative h-64 mb-6">
          <div className="absolute inset-0 flex items-end justify-between space-x-2">
            {currentData.map((item, index) => {
              const height = (item[metric] / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  {/* Bar */}
                  <div className="relative w-full max-w-12 group cursor-pointer">
                    <div
                      className={`w-full bg-gradient-to-t ${getMetricColor(metric)} rounded-t-lg transition-all duration-500 hover:scale-105`}
                      style={{ height: `${height}%`, minHeight: "8px" }}
                    />

                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {formatValue(item[metric], metric)}
                      </div>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="text-xs text-white/70 mt-2 text-center">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-white/60">
            <span>{formatValue(maxValue, metric)}</span>
            <span>{formatValue(maxValue * 0.75, metric)}</span>
            <span>{formatValue(maxValue * 0.5, metric)}</span>
            <span>{formatValue(maxValue * 0.25, metric)}</span>
            <span>0</span>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-lg font-bold text-purple-400">
              {formatValue(
                currentData.reduce((sum, item) => sum + item.productivity, 0) /
                  currentData.length,
                "productivity",
              )}
            </div>
            <div className="text-xs text-white/70">Avg Productivity</div>
          </div>

          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-lg font-bold text-green-400">
              {formatValue(
                currentData.reduce((sum, item) => sum + item.focusTime, 0),
                "focusTime",
              )}
            </div>
            <div className="text-xs text-white/70">Total Focus</div>
          </div>

          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-lg font-bold text-blue-400">
              {formatValue(
                currentData.reduce((sum, item) => sum + item.tasksCompleted, 0),
                "tasksCompleted",
              )}
            </div>
            <div className="text-xs text-white/70">Total Tasks</div>
          </div>

          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-lg font-bold text-orange-400">
              {formatValue(
                currentData.reduce((sum, item) => sum + item.timeSaved, 0),
                "timeSaved",
              )}
            </div>
            <div className="text-xs text-white/70">Time Saved</div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-white/20">
          <h4 className="text-white font-semibold mb-2">📈 Key Insights</h4>
          <div className="text-white/80 text-sm space-y-1">
            <p>• Your productivity has improved by 23% this month</p>
            <p>
              • Best performance day:{" "}
              {
                currentData.reduce((best, current) =>
                  current.productivity > best.productivity ? current : best,
                ).label
              }
            </p>
            <p>• You're on track to save 8+ hours this month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
