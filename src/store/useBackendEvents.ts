import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { activeCoreIndexAtom, coresAtom } from "../atoms/coreAtoms";
import store from "./store";
import useCores from "./useCores";
import {
  HardwareReportPayload,
  NeighbourTable,
  NeighboursReportPayload,
  NetworkRequestPayload,
  TileConfigs,
} from "../types";
import { neighbourAtom } from "../atoms/neighbourAtoms";
import { routingTableAtom } from "../atoms/routingTableAtoms";
import { logAtom } from "../atoms/logAtoms";
import { tileConfigsAtom } from "../atoms/tilesAtoms";

const useBackendEvents = () => {
  const cores = useAtomValue(coresAtom);
  const [neighbourTable, setNeighboursState] = useAtom(neighbourAtom);
  const [routingTable, setRoutingTable] = useAtom(routingTableAtom);
  const setLog = useSetAtom(logAtom);
  const [activeCoreIndex, setActiveCoreIndex] = useAtom(activeCoreIndexAtom);
  const setTileConfigs = useSetAtom(tileConfigsAtom);
  const { refreshCores } = useCores();

  const [givenNetworkIds, setGivenNetworkIds] = useState<number[]>([]);

  useEffect(() => {
    log("-- NeighbourTable updated: " + JSON.stringify(neighbourTable));
  }, [neighbourTable]);

  const setNeighbours = (newNeighbourTable: NeighbourTable) => {
    log(
      "-- Updating neighbours1: " +
        JSON.stringify(newNeighbourTable) +
        " " +
        JSON.stringify(neighbourTable)
    );
    setNeighboursState(newNeighbourTable);
    log("-- Updating neighbours2: " + JSON.stringify(neighbourTable));
  };

  const log = (message: string) => {
    console.log(message);
    setLog((log) => [message, ...log]);
  };

  const getFreeNetworkId = () => {
    const takenNetworkIds = Object.values(routingTable);
    let nextFreeNetworkId = 2;
    while (
      [...takenNetworkIds, ...givenNetworkIds].includes(nextFreeNetworkId)
    ) {
      nextFreeNetworkId++;
    }
    log("gave away network id " + nextFreeNetworkId.toString());
    setGivenNetworkIds([...givenNetworkIds, nextFreeNetworkId]);
    return nextFreeNetworkId;
  };

  const addToRoutingTable = (
    product_id: number,
    vendor_id: number,
    hardware_id: string,
    network_id: number
  ) => {
    let networkIdExists = Object.values(routingTable).includes(network_id);
    if (networkIdExists && routingTable[hardware_id] !== network_id) {
      log("reset network id");
      invoke("reset_network_id", { product_id, vendor_id, network_id });
      return;
    }

    setGivenNetworkIds(
      givenNetworkIds.filter((id) => id !== parseInt(network_id.toString()))
    );

    let newRoutingTable = { ...routingTable };
    newRoutingTable[hardware_id] = network_id;
    setRoutingTable(newRoutingTable);
  };

  const updateNeighbours = (
    neighbourTableTemp: NeighbourTable,
    network_id: string,
    neighbours: [string, string, string, string]
  ) => {
    log(
      "updating neighbours of " +
        network_id +
        " to " +
        neighbours +
        " " +
        JSON.stringify(neighbourTableTemp)
    );
    // return;
    let newRoutingTable = { ...routingTable };
    let newNeighbourTable = JSON.parse(
      JSON.stringify(neighbourTableTemp)
    ) as NeighbourTable;
    log("unmodified neighbour table " + JSON.stringify(neighbourTableTemp));

    // find removed ids
    let removedTiles: string[] = [];
    if (newNeighbourTable[network_id]) {
      for (let tile of neighbourTable[network_id]) {
        if (!neighbours.includes(tile)) {
          removedTiles.push(tile);
          delete newNeighbourTable[tile];
          let routingTableIndex = Object.values(newRoutingTable).indexOf(
            parseInt(tile)
          );
          if (routingTableIndex !== -1)
            delete newRoutingTable[
              Object.keys(newRoutingTable)[routingTableIndex]
            ];
        }
      }
    }

    // add new network id entry
    newNeighbourTable[network_id] = neighbours;

    // update neighbours of removed ids
    console.log("removed", removedTiles);
    for (let removed of removedTiles) {
      for (let neighbour of Object.keys(newNeighbourTable)) {
        if (newNeighbourTable[neighbour].includes(removed)) {
          let index = newNeighbourTable[neighbour].indexOf(removed);
          newNeighbourTable[neighbour][index] = "0";
        }
      }
    }

    // remove empty that aren't 1
    for (let neighbour of Object.keys(newNeighbourTable)) {
      if (
        neighbour !== "1" &&
        newNeighbourTable[neighbour].every((tile) => tile === "0")
      ) {
        delete newNeighbourTable[neighbour];
        let routingTableIndex = Object.values(newRoutingTable).indexOf(
          parseInt(neighbour)
        );
        if (routingTableIndex !== -1)
          delete newRoutingTable[
            Object.keys(newRoutingTable)[routingTableIndex]
          ];
      }
    }

    log("updated neighbour table to " + JSON.stringify(newNeighbourTable));
    log("updated routing table to " + JSON.stringify(newRoutingTable));
    setNeighbours(newNeighbourTable);
    setRoutingTable(newRoutingTable);
  };

  const addTileConfig = async (hardwareId: string, tileType: number) => {
    const config = ((await store.get("tiles")) || {}) as TileConfigs;
    if (!config[hardwareId]) {
      config[hardwareId] = {
        type: tileType,
      };
      setTileConfigs(config);
      await store.set("tiles", config);
      await store.save();
    }
  };

  const loadConfigs = async () => {
    const config = ((await store.get("tiles")) || {}) as TileConfigs;
    setTileConfigs(config);
  };

  useEffect(() => {
    if (cores.length && activeCoreIndex === null) {
      setActiveCoreIndex(0);
    }
  }, [cores, activeCoreIndex]);

  const clearStore = async () => {
    await store.clear();
    await store.save();
  };

  useEffect(() => {
    log("update listeners " + JSON.stringify(neighbourTable));
    // initialize neighbours
    if (cores.length && Object.keys(neighbourTable).length === 0) {
      log("Setting initial neighbours state");
      setNeighboursState({
        "1": ["0", "0", "0", "0"],
      });
    }

    let cleanupListeners = () => {};

    const initializeListeners = async () => {
      // listen for core changes
      const connectionListener = (event: any) => {
        log("cores changed, refreshing");
        refreshCores(false);
        log("reset 1");
        setNeighboursState({
          "1": ["0", "0", "0", "0"],
        });
      };
      const unlistenConnection = await listen(
        "connection-change",
        connectionListener
      );

      // listen for network id requests
      const networkIdListener = async (event: any) => {
        const payload = event.payload as NetworkRequestPayload;
        log("received network id request");
        invoke("send_network_id", {
          productId: payload.product_id,
          vendorId: payload.vendor_id,
          networkId: getFreeNetworkId(),
        });
      };
      const unlistenNetworkId = await listen(
        "request-network-id",
        networkIdListener
      );

      // listen for reported hardware ids
      const hardwareReportListener = async (event: any) => {
        log(
          "received hardware report from " +
            event.payload.hardware_id +
            " as " +
            event.payload.network_id
        );
        const { hardware_id, network_id, product_id, vendor_id, tile_type } =
          event.payload as HardwareReportPayload;
        addToRoutingTable(product_id, vendor_id, hardware_id, network_id);
        await addTileConfig(hardware_id, tile_type);
      };
      const unlistenHardwareReport = await listen(
        "report-hardware-id",
        hardwareReportListener
      );

      // listen for reported neighbours
      const neighboursListener = (event: any) => {
        log(
          "received neighbours report from " +
            event.payload.network_id +
            ":" +
            event.payload.neighbours
        );
        const { neighbours, network_id } =
          event.payload as NeighboursReportPayload;
        log("update neighbours from current " + JSON.stringify(neighbourTable));
        updateNeighbours(neighbourTable, network_id, neighbours);
        // setNeighboursState((prevState) => {
        //   log("update neighbours from previous " + JSON.stringify(prevState));
        //   const newNeighbours = { ...prevState };
        //   newNeighbours[network_id] = neighbours;
        //   return newNeighbours;
        // });
      };
      const unlistenNeighbours = await listen(
        "report-neighbours",
        neighboursListener
      );

      cleanupListeners = () => {
        unlistenConnection();
        unlistenNetworkId();
        unlistenHardwareReport();
        unlistenNeighbours();
      };
    };

    initializeListeners();

    return () => {
      cleanupListeners();
    };
  }, [givenNetworkIds, neighbourTable, routingTable, updateNeighbours]);

  useEffect(() => {
    clearStore();

    // initialize cores
    refreshCores(false);

    // load tile configs
    loadConfigs();
  }, []);
};

export default useBackendEvents;
