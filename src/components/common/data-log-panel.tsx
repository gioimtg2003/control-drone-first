import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataLogPanelProps {
  isLogging: boolean;
  onStartLogging: () => void;
  onStopLogging: () => void;
  onExport: () => void;
}

export default function DataLogPanel({
  isLogging,
  onStartLogging,
  onStopLogging,
  onExport,
}: DataLogPanelProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Data Logging</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logging Status */}
        <div className="flex items-center gap-2 p-3 rounded-md bg-secondary">
          <div
            className={`w-3 h-3 rounded-full animate-pulse ${
              isLogging ? "bg-red-500" : "bg-gray-500"
            }`}
          />
          <span className="text-sm">
            {isLogging ? "Recording..." : "Standby"}
          </span>
        </div>

        {/* Log Options */}
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2 p-2 rounded bg-secondary hover:bg-opacity-80 cursor-pointer transition-colors">
            <input type="checkbox" defaultChecked className="accent-primary" />
            <span>Battery Data</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded bg-secondary hover:bg-opacity-80 cursor-pointer transition-colors">
            <input type="checkbox" defaultChecked className="accent-primary" />
            <span>IMU Sensors</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded bg-secondary hover:bg-opacity-80 cursor-pointer transition-colors">
            <input type="checkbox" defaultChecked className="accent-primary" />
            <span>GPS Data</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded bg-secondary hover:bg-opacity-80 cursor-pointer transition-colors">
            <input type="checkbox" defaultChecked className="accent-primary" />
            <span>Motor Commands</span>
          </label>
        </div>

        {/* Control Buttons */}
        <div className="space-y-2">
          {isLogging ? (
            <Button
              onClick={onStopLogging}
              variant="destructive"
              className="w-full"
            >
              Stop Recording
            </Button>
          ) : (
            <Button
              onClick={onStartLogging}
              className="w-full bg-primary text-primary-foreground"
            >
              Start Recording
            </Button>
          )}
        </div>

        {/* Export Button */}
        <Button
          onClick={onExport}
          className="w-full bg-accent text-accent-foreground"
          disabled={isLogging}
        >
          Export as JSON
        </Button>

        {/* Log Info */}
        <div className="p-3 bg-secondary rounded-md text-xs space-y-1">
          <p className="text-muted-foreground">
            <span className="font-semibold">Format:</span> JSON
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold">Size:</span> Depends on duration
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold">Location:</span> Downloads folder
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
