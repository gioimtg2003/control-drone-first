import { useState, useEffect, useRef } from "react";
import SerialConnectionPanel from "./components/common/serial-connection-panel";
import MotorControlPanel from "./components/common/motor-control-panel";
import DataLogPanel from "./components/common/data-log-panel";
import StatusDisplay from "./components/common/status-display";
import IMUSensorDisplay from "./components/common/imu-sensor-display";
import GPSLoggerDisplay from "./components/common/gps-logger-display";
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

  // Connection handler
  const handleConnect = async (port: SerialPort, baud: number) => {
    try {
      setSelectedPort(port);
      setBaudRate(baud);
      setIsConnected(true);
      // Simulate data reading from serial port
      startDataSimulation();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSelectedPort(null);
    setReader(null);
  };

  // Simulate real-time data from drone
  const startDataSimulation = () => {
    const interval = setInterval(() => {
      // Simulate battery voltage decay
      setBatteryVoltage((prev) => Math.max(11.5, prev - 0.001));

      // Simulate temperature fluctuation
      setTemperature((prev) => prev + (Math.random() - 0.5) * 0.5);

      // Simulate IMU sensor data (sine wave patterns)
      const time = Date.now() / 1000;
      setImuData({
        accelX: Math.sin(time * 0.5) * 2,
        accelY: Math.cos(time * 0.5) * 2,
        accelZ: 9.8 + Math.sin(time * 0.3) * 0.5,
        gyroX: Math.sin(time * 2) * 10,
        gyroY: Math.cos(time * 2) * 10,
        gyroZ: Math.sin(time * 1.5) * 5,
        magX: Math.sin(time * 0.2) * 50,
        magY: Math.cos(time * 0.2) * 50,
        magZ: 40 + Math.sin(time * 0.1) * 10,
      });
    }, 100);

    return () => clearInterval(interval);
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
