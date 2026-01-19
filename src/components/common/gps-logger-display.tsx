import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GPSLog {
  id: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface GPSLoggerDisplayProps {
  gpsLogs: GPSLog[];
  onAddLog: (lat: number, lon: number, accuracy: number) => void;
}

export default function GPSLoggerDisplay({
  gpsLogs,
  onAddLog,
}: GPSLoggerDisplayProps) {
  const [activeTab, setActiveTab] = useState<"table" | "map">("table");
  const [mapZoom, setMapZoom] = useState(15);

  // Simulate GPS position (moving path)
  const baseLat = 21.0285;
  const baseLon = 105.8542;
  const randomOffset = () => (Math.random() - 0.5) * 0.001;

  const handleSimulateGPS = () => {
    onAddLog(
      baseLat + randomOffset(),
      baseLon + randomOffset(),
      5 + Math.random() * 10,
    );
  };

  // Calculate map center
  const getMapCenter = () => {
    if (gpsLogs.length === 0) return { lat: baseLat, lon: baseLon };
    const lastLog = gpsLogs[gpsLogs.length - 1];
    return { lat: lastLog.latitude, lon: lastLog.longitude };
  };

  const center = getMapCenter();
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lon}&zoom=${mapZoom}&size=600x400&key=AIzaSyDummyKey&markers=color:blue%7C${gpsLogs.map((log) => `${log.latitude},${log.longitude}`).join("|")}`;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">GPS Logger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("table")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "table"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Data Table
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "map"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Map View
          </button>
        </div>

        {/* Table View */}
        {activeTab === "table" && (
          <div className="space-y-3">
            <Button
              onClick={handleSimulateGPS}
              className="w-full bg-accent text-accent-foreground"
            >
              Add GPS Point
            </Button>

            {gpsLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground">
                        Time
                      </th>
                      <th className="text-left py-2 px-3 text-muted-foreground">
                        Latitude
                      </th>
                      <th className="text-left py-2 px-3 text-muted-foreground">
                        Longitude
                      </th>
                      <th className="text-left py-2 px-3 text-muted-foreground">
                        Accuracy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...gpsLogs].reverse().map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-border hover:bg-secondary transition-colors"
                      >
                        <td className="py-2 px-3 font-mono text-xs">
                          {log.timestamp}
                        </td>
                        <td className="py-2 px-3 font-mono text-xs text-primary">
                          {log.latitude.toFixed(6)}
                        </td>
                        <td className="py-2 px-3 font-mono text-xs text-accent">
                          {log.longitude.toFixed(6)}
                        </td>
                        <td className="py-2 px-3 font-mono text-xs">
                          {log.accuracy.toFixed(2)}m
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No GPS data logged yet
              </div>
            )}
          </div>
        )}

        {/* Map View */}
        {activeTab === "map" && (
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <label className="text-sm text-muted-foreground">Zoom:</label>
              <input
                type="range"
                min="5"
                max="20"
                value={mapZoom}
                onChange={(e) => setMapZoom(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-sm font-mono">{mapZoom}x</span>
            </div>

            {/* Simple ASCII Map Visualization */}
            <div className="border border-border rounded-md p-4 bg-secondary aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="text-muted-foreground mb-2">
                  <p className="text-sm">GPS Map Visualization</p>
                  <p className="text-xs mt-2">
                    Center: {center.lat.toFixed(6)}, {center.lon.toFixed(6)}
                  </p>
                </div>

                {gpsLogs.length > 0 ? (
                  <div className="mt-4 p-3 bg-card rounded text-xs font-mono">
                    <p className="text-primary">
                      Total Points: {gpsLogs.length}
                    </p>
                    <p className="text-accent mt-1">
                      Latest: {gpsLogs[gpsLogs.length - 1].latitude.toFixed(6)},
                      {gpsLogs[gpsLogs.length - 1].longitude.toFixed(6)}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No GPS points recorded
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleSimulateGPS}
              className="w-full bg-accent text-accent-foreground"
            >
              Add GPS Point
            </Button>
          </div>
        )}

        {/* GPS Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-secondary rounded-md text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Points</p>
            <p className="text-lg font-bold">{gpsLogs.length}</p>
          </div>
          <div className="p-3 bg-secondary rounded-md text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg Accuracy</p>
            <p className="text-lg font-bold">
              {gpsLogs.length > 0
                ? (
                    gpsLogs.reduce((sum, log) => sum + log.accuracy, 0) /
                    gpsLogs.length
                  ).toFixed(1)
                : "-"}
              m
            </p>
          </div>
          <div className="p-3 bg-secondary rounded-md text-center">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className="text-lg font-bold">
              {gpsLogs.length > 0 ? "Active" : "Waiting"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
