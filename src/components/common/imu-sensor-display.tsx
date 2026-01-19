import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface IMUData {
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  magX: number;
  magY: number;
  magZ: number;
}

interface IMUSensorDisplayProps {
  imuData: IMUData;
}

export default function IMUSensorDisplay({ imuData }: IMUSensorDisplayProps) {
  const [accelHistory, setAccelHistory] = useState<any[]>([]);
  const [gyroHistory, setGyroHistory] = useState<any[]>([]);
  const [magHistory, setMagHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"accel" | "gyro" | "mag">("accel");

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();

    setAccelHistory((prev) => {
      const updated = [
        ...prev,
        {
          time: timestamp,
          x: parseFloat(imuData.accelX.toFixed(2)),
          y: parseFloat(imuData.accelY.toFixed(2)),
          z: parseFloat(imuData.accelZ.toFixed(2)),
        },
      ];
      return updated.slice(-30);
    });

    setGyroHistory((prev) => {
      const updated = [
        ...prev,
        {
          time: timestamp,
          x: parseFloat(imuData.gyroX.toFixed(2)),
          y: parseFloat(imuData.gyroY.toFixed(2)),
          z: parseFloat(imuData.gyroZ.toFixed(2)),
        },
      ];
      return updated.slice(-30);
    });

    setMagHistory((prev) => {
      const updated = [
        ...prev,
        {
          time: timestamp,
        },
      ];
      return updated.slice(-30);
    });
  }, [imuData]);

  const tabs = [
    { id: "accel", label: "Accelerometer (m/s²)" },
    { id: "gyro", label: "Gyroscope (°/s)" },
    { id: "mag", label: "Magnetometer (µT)" },
  ];

  const getChartData = () => {
    switch (activeTab) {
      case "gyro":
        return gyroHistory;
      case "mag":
        return magHistory;
      default:
        return accelHistory;
    }
  };

  const getCurrentValues = () => {
    switch (activeTab) {
      case "gyro":
        return { x: imuData.gyroX, y: imuData.gyroY, z: imuData.gyroZ };
      case "mag":
        return { x: imuData.magX, y: imuData.magY, z: imuData.magZ };
      default:
        return { x: imuData.accelX, y: imuData.accelY, z: imuData.accelZ };
    }
  };

  const current = getCurrentValues();
  const chartData = getChartData();

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">IMU Sensor Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Current Values */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-secondary rounded-md">
            <p className="text-xs text-muted-foreground mb-1">X Axis</p>
            <p className="text-xl font-bold font-mono text-primary">
              {current.x.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-secondary rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Y Axis</p>
            <p className="text-xl font-bold font-mono text-accent">
              {current.y.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-secondary rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Z Axis</p>
            <p className="text-xl font-bold font-mono text-blue-400">
              {current.z.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-6">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  interval={Math.max(0, Math.floor(chartData.length / 6))}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  label={{
                    value:
                      activeTab === "accel"
                        ? "m/s²"
                        : activeTab === "gyro"
                          ? "°/s"
                          : "µT",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111729",
                    border: "1px solid #1e293b",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "#e8eef5" }}
                />
                <Legend wrapperStyle={{ color: "#94a3b8" }} />
                <Line
                  type="monotone"
                  dataKey="x"
                  stroke="#3b82f6"
                  dot={false}
                  name="X Axis"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="#0ea5e9"
                  dot={false}
                  name="Y Axis"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="z"
                  stroke="#06b6d4"
                  dot={false}
                  name="Z Axis"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Collecting sensor data...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
