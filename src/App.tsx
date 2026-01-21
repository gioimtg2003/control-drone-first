import { useEffect, useState } from "react";
import SerialConnectionPanel from "./components/common/serial-connection-panel";
import MotorControlPanel from "./components/common/motor-control-panel";
import DataLogPanel from "./components/common/data-log-panel";
import StatusDisplay from "./components/common/status-display";
import IMUSensorDisplay from "./components/common/imu-sensor-display";
import GPSLoggerDisplay from "./components/common/gps-logger-display";

import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export interface SerialPort {
  name: string;
  baudRate: number;
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedPort, setSelectedPort] = useState<SerialPort | null>(null);
  const [baudRate, setBaudRate] = useState(115200);
  const [reader, setReader] = useState<any>(null);

  // Status data
  const [batteryVoltage, setBatteryVoltage] = useState(12.5);
  const [temperature, setTemperature] = useState(25.3);
  const [imuData, setImuData] = useState({
    accelX: 0,
    accelY: 0,
    accelZ: 9.8,
    gyroX: 0,
    gyroY: 0,
    gyroZ: 0,
    magX: 0,
    magY: 0,
    magZ: 0,
  });

  // GPS data
  const [gpsLogs, setGpsLogs] = useState<any[]>([]);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    let unlistenIMU: UnlistenFn;
    let unlistenBattery: UnlistenFn;
    let unlistenGPS: UnlistenFn;
    let unlistenTemperature: UnlistenFn;

    async function setupRealtimeData() {
      unlistenIMU = await listen("imu-data", (event: any) => {
        setImuData(event.payload);
      });

      unlistenBattery = await listen("battery-data", (event: any) => {
        setBatteryVoltage(event.payload);
      });

      unlistenGPS = await listen("gps-data", (event: any) => {
        console.log(event.payload);
        const { lat, lon, sats } = event.payload;
        if (isLogging) {
          addGPSLog(lat, lon, sats);
        }
      });
      unlistenTemperature = await listen<{ temperature?: number }>(
        "temperature-data",
        (event) => {
          setTemperature(event.payload?.temperature ?? 0);
        },
      );

      await invoke("start_telemetry_stream");
    }
    if (isConnected) {
      setupRealtimeData();
    }

    return () => {
      if (unlistenIMU) unlistenIMU();
      if (unlistenBattery) unlistenBattery();
      if (unlistenGPS) unlistenGPS();
      if (unlistenTemperature) unlistenTemperature();
    };
  }, [isConnected, isLogging]);

  // Connection handler
  const handleConnect = async (port: SerialPort, baud: number) => {
    try {
      setSelectedPort(port);
      setBaudRate(baud);
      setIsConnected(true);
      // Simulate data reading from serial port
      // startDataSimulation();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSelectedPort(null);
    setReader(null);
  };

  const addGPSLog = (lat: number, lon: number, accuracy: number) => {
    const newLog = {
      id: gpsLogs.length + 1,
      timestamp: new Date().toLocaleTimeString(),
      latitude: lat,
      longitude: lon,
      accuracy: accuracy,
    };
    setGpsLogs((prev) => [...prev, newLog].slice(-100)); // Keep last 100 entries
  };

  const startDataLogging = () => {
    setIsLogging(true);
  };

  const stopDataLogging = () => {
    setIsLogging(false);
  };

  const exportLogs = () => {
    const data = {
      timestamp: new Date().toISOString(),
      battery: batteryVoltage,
      temperature: temperature,
      imu: imuData,
      gps: gpsLogs,
    };
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(JSON.stringify(data, null, 2)),
    );
    element.setAttribute("download", `drone-log-${Date.now()}.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Drone Testing Control</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and control interface
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Serial Connection */}
            <SerialConnectionPanel
              isConnected={isConnected}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              baudRate={baudRate}
            />

            {/* Motor Control */}
            <MotorControlPanel isConnected={isConnected} />

            {/* Data Logging */}
            <DataLogPanel
              isLogging={isLogging}
              onStartLogging={startDataLogging}
              onStopLogging={stopDataLogging}
              onExport={exportLogs}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Status Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatusDisplay
                batteryVoltage={batteryVoltage}
                temperature={temperature}
              />
            </div>

            {/* IMU Sensor Data */}
            <IMUSensorDisplay imuData={imuData} />

            {/* GPS Logger */}
            <GPSLoggerDisplay gpsLogs={gpsLogs} onAddLog={addGPSLog} />
          </div>
        </div>
      </main>
    </div>
  );
}
