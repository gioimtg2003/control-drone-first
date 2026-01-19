import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MotorControlPanelProps {
  isConnected: boolean;
}

export default function MotorControlPanel({
  isConnected,
}: MotorControlPanelProps) {
  const [selectedMotor, setSelectedMotor] = useState("motor1");
  const [testDuration, setTestDuration] = useState(5);
  const [motorThrottle, setMotorThrottle] = useState(0);
  const [activTest, setActiveTest] = useState<string | null>(null);

  const motors = [
    { id: "motor1", name: "Motor 1 (Front-Left)", color: "bg-blue-500" },
    { id: "motor2", name: "Motor 2 (Front-Right)", color: "bg-cyan-500" },
    { id: "motor3", name: "Motor 3 (Back-Right)", color: "bg-violet-500" },
    { id: "motor4", name: "Motor 4 (Back-Left)", color: "bg-indigo-500" },
  ];

  const handleTestMotor = async (motorId: string) => {
    setActiveTest(motorId);
    setTimeout(() => setActiveTest(null), testDuration * 1000);
  };

  const handleTestAll = () => {
    setActiveTest("all");
    setTimeout(() => setActiveTest(null), testDuration * 1000);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Motor Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Motor Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Select Motor</label>
          <select
            value={selectedMotor}
            onChange={(e) => setSelectedMotor(e.target.value)}
            disabled={!isConnected}
            className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {motors.map((motor) => (
              <option key={motor.id} value={motor.id}>
                {motor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Throttle Control */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Throttle: {motorThrottle}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={motorThrottle}
            onChange={(e) => setMotorThrottle(Number(e.target.value))}
            disabled={!isConnected || activTest !== null}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Test Duration */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Test Duration (seconds)
          </label>
          <select
            value={testDuration}
            onChange={(e) => setTestDuration(Number(e.target.value))}
            disabled={!isConnected || activTest !== null}
            className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {[1, 2, 3, 5, 10].map((dur) => (
              <option key={dur} value={dur}>
                {dur}s
              </option>
            ))}
          </select>
        </div>

        {/* Motor Status Indicators */}
        <div className="grid grid-cols-2 gap-2">
          {motors.map((motor) => (
            <div
              key={motor.id}
              className={`p-2 rounded-md text-sm font-medium text-center transition-all ${
                activTest === motor.id || activTest === "all"
                  ? `${motor.color} text-white`
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {motor.name.split("(")[0].trim()}
            </div>
          ))}
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => handleTestMotor(selectedMotor)}
            disabled={!isConnected || activTest !== null}
            className="w-full bg-primary text-primary-foreground"
          >
            {activTest === selectedMotor ? "Testing..." : "Test Selected Motor"}
          </Button>
          <Button
            onClick={handleTestAll}
            disabled={!isConnected || activTest !== null}
            className="w-full bg-accent text-accent-foreground"
          >
            {activTest === "all" ? "Testing All..." : "Test All Motors"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
