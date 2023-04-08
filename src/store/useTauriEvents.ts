import { useEffect, useState } from "react";
import {
  DataReportPayload,
  HardwareReportPayload,
  NeighboursReportPayload,
  NetworkRequestPayload,
} from "../types";
import { listen } from "@tauri-apps/api/event";

interface CorePayload {
  product_id: number;
  vendor_id: number;
  connected: boolean;
}

const useTauriEvents = () => {
  const [corePayload, setCorePayload] = useState<CorePayload | null>(null);

  const [networkIdPayload, setNetworkIdPayload] =
    useState<NetworkRequestPayload | null>(null);

  const [hardwareReportPayload, setHardwareReportPayload] =
    useState<HardwareReportPayload | null>(null);

  const [neighboursPayload, setNeighboursPayload] =
    useState<NeighboursReportPayload | null>(null);

  useEffect(() => {
    // listen for core changes
    const connectionListener = (event: any) => {
      setCorePayload(event.payload as CorePayload);
    };
    const unlistenConnection = listen("connection-change", connectionListener);

    // listen for network id requests
    const networkIdListener = async (event: any) => {
      setNetworkIdPayload(event.payload as NetworkRequestPayload);
    };
    const unlistenNetworkId = listen("request-network-id", networkIdListener);

    // listen for reported hardware ids
    const hardwareReportListener = async (event: any) => {
      setHardwareReportPayload(event.payload as HardwareReportPayload);
    };
    const unlistenHardwareReport = listen(
      "report-hardware-id",
      hardwareReportListener
    );

    // listen for reported neighbours
    const neighboursListener = (event: any) => {
      setNeighboursPayload(event.payload as NeighboursReportPayload);
    };
    const unlistenNeighbours = listen("report-neighbours", neighboursListener);

    return () => {
      unlistenConnection.then((unlisten) => unlisten());
      unlistenNetworkId.then((unlisten) => unlisten());
      unlistenHardwareReport.then((unlisten) => unlisten());
      unlistenNeighbours.then((unlisten) => unlisten());
    };
  }, []);

  return {
    networkIdPayload,
    setNetworkIdPayload,

    corePayload,
    setCorePayload,

    hardwareReportPayload,
    setHardwareReportPayload,

    neighboursPayload,
    setNeighboursPayload,
  };
};

export default useTauriEvents;
