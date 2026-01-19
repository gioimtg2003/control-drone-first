"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusDisplayProps {
  batteryVoltage: number;
  temperature: number;
}

export default function StatusDisplay({
  batteryVoltage,
  temperature,
}: StatusDisplayProps) {
  // Calculate battery percentage (assuming 11V = 0%, 12.6V = 100%)
  const batteryPercent = Math.max(
    0,
    Math.min(100, ((batteryVoltage - 11) / 1.6) * 100),
  );

  // Determine battery color based on percentage
  const getBatteryColor = () => {
    if (batteryPercent >= 80) return "bg-green-500";
    if (batteryPercent >= 50) return "bg-yellow-500";
    if (batteryPercent >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  // Determine temperature color
  const getTempColor = () => {
    if (temperature < 35) return "bg-blue-500";
    if (temperature < 50) return "bg-green-500";
    if (temperature < 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="border-border bg-card col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Battery Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Battery Status
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Voltage</span>
                <span className="font-mono text-sm font-bold">
                  {batteryVoltage.toFixed(2)}V
                </span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getBatteryColor()}`}
                  style={{ width: `${batteryPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0V</span>
                <span>{batteryPercent.toFixed(0)}%</span>
                <span>12.6V</span>
              </div>
            </div>
          </div>

          {/* Temperature Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Temperature
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">ESC/Motor Temp</span>
                <span className="font-mono text-sm font-bold">
                  {temperature.toFixed(1)}°C
                </span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getTempColor()}`}
                  style={{
                    width: `${Math.min(100, (temperature / 100) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0°C</span>
                <span>{temperature.toFixed(1)}°C</span>
                <span>100°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="p-3 bg-secondary rounded-md text-center">
            <p className="text-xs text-muted-foreground mb-1">GPS</p>
            <p className="text-lg font-bold">-</p>
          </div>
          <div className="p-3 bg-secondary rounded-md text-center">
            <p className="text-xs text-muted-foreground mb-1">Satellites</p>
            <p className="text-lg font-bold">0</p>
          </div>
          <div className="p-3 bg-secondary rounded-md text-center">
            <p className="text-xs text-muted-foreground mb-1">Signal</p>
            <p className="text-lg font-bold">-</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
