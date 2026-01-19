import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SerialPort } from "@/App";
import { invoke } from "@tauri-apps/api/core";

interface SerialConnectionPanelProps {
  isConnected: boolean;
  onConnect: (port: SerialPort, baud: number) => Promise<void>;
  onDisconnect: () => void;
  baudRate: number;
}

export default function SerialConnectionPanel({
  isConnected,
  onConnect,
  onDisconnect,
  baudRate,
}: SerialConnectionPanelProps) {
  const [selectedCom, setSelectedCom] = useState<string>();
  const [selectedBaud, setSelectedBaud] = useState(baudRate);
  const [loading, setLoading] = useState(false);
  const [listCom, setListCom] = useState<string[]>([]);

  const baudRates = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

  const getPorts = async () => {
    const _ports = await invoke<string[]>("get_port_available");
    setListCom(_ports);
    console.log(_ports);
  };
  useEffect(() => {
    console.log("get ports");
    (async () => {
      await getPorts();
    })();
  }, []);

  const requestPort = async () => {
    await getPorts();
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const response = await invoke("connect_to_drone", {
        port: selectedCom,
        baud: selectedBaud,
      });
      console.log("response::: ", response);
      await onConnect(
        {
          name: selectedCom ?? "",
          baudRate: selectedBaud,
        },
        selectedBaud,
      );
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await invoke("disconnect_drone");
      onDisconnect();
    } catch (error) {
      console.error("Disconnection error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Serial Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* COM Port Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">COM Port</label>
          <select
            value={selectedCom}
            onChange={(e) => setSelectedCom(String(e.target.value))}
            disabled={isConnected || listCom?.length === 0}
            className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {listCom?.length === 0 ? (
              <option>No ports available</option>
            ) : (
              listCom?.map((name, index) => (
                <option key={`${name}-${index}`} value={name}>
                  {name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Baud Rate Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Baud Rate</label>
          <select
            value={selectedBaud}
            onChange={(e) => setSelectedBaud(Number(e.target.value))}
            disabled={isConnected}
            className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {baudRates.map((baud) => (
              <option key={baud} value={baud}>
                {baud} bps
              </option>
            ))}
          </select>
        </div>

        {/* Request Port Button */}
        <Button
          onClick={requestPort}
          disabled={isConnected}
          variant="outline"
          className="w-full bg-transparent"
        >
          Reload Ports
        </Button>

        {/* Connection Status */}
        <div className="flex items-center gap-2 p-3 rounded-md bg-secondary">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {/* Connect/Disconnect Button */}
        {isConnected ? (
          <Button
            onClick={handleDisconnect}
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            {loading ? "Disconnecting..." : "Disconnect"}
          </Button>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={loading || listCom?.length === 0}
            className="w-full bg-primary text-primary-foreground"
          >
            {loading ? "Connecting..." : "Connect"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
