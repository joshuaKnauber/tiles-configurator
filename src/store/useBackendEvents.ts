import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { activeCoreIndexAtom, coresAtom } from "../atoms/coreAtoms";
import store from "./store";
import useCores from "./useCores";
import { NeighbourTable, RoutingTable, TileConfigs } from "../types";
import { neighbourAtom } from "../atoms/neighbourAtoms";
import { routingTableAtom } from "../atoms/routingTableAtoms";
import { logAtom } from "../atoms/logAtoms";
import { tileConfigsAtom } from "../atoms/tilesAtoms";
import useTauriEvents from "./useTauriEvents";

const useBackendEvents = () => {
  const payloads = useTauriEvents();

  const cores = useAtomValue(coresAtom);
  const [neighbourTable, setNeighbours] = useAtom(neighbourAtom);
  const [routingTable, setRoutingTable] = useAtom(routingTableAtom);
  const setLog = useSetAtom(logAtom);
  const [activeCoreIndex, setActiveCoreIndex] = useAtom(activeCoreIndexAtom);
  const setTileConfigs = useSetAtom(tileConfigsAtom);
  const { refreshCores } = useCores();

  const givenNetworkIds = useRef<number[]>([]);

  const updateRoutingTable = (
    removeFromRoutingTable: (string | number)[],
    addToRoutingTable: [string, number][]
  ) => {
    setRoutingTable((curr) => {
      let newRoutingTable = { ...curr };
      removeFromRoutingTable.forEach((key) => {
        if (typeof key === "string" && key in newRoutingTable) {
          delete newRoutingTable[key];
        } else if (typeof key === "number") {
          const hardwareId = Object.keys(newRoutingTable).find(
            (hardwareId) => newRoutingTable[hardwareId] === key
          );
          if (hardwareId) {
            delete newRoutingTable[hardwareId];
          }
        }
      });
      addToRoutingTable.forEach(([key, value]) => {
        newRoutingTable[key] = value;
      });
      store.set("routingTable", newRoutingTable);
      store.save();
      log(
        "update routing table from " +
          JSON.stringify(curr) +
          " to " +
          JSON.stringify(newRoutingTable)
      );
      return newRoutingTable;
    });
  };

  const resetRoutingTable = () => {
    setRoutingTable({});
    store.set("routingTable", {});
    store.save();
  };

  const log = (message: string) => {
    console.log(message);
    setLog((log) => [message, ...log]);
  };

  const getFreeNetworkId = () => {
    const takenNetworkIds = Object.values(routingTable);
    let nextFreeNetworkId = 2;
    while (
      [...takenNetworkIds, ...givenNetworkIds.current].includes(
        nextFreeNetworkId
      )
    ) {
      nextFreeNetworkId++;
    }
    log("gave away network id " + nextFreeNetworkId.toString());
    givenNetworkIds.current = [...givenNetworkIds.current, nextFreeNetworkId];
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
      log("reset network id " + network_id.toString());
      invoke("reset_network_id", {
        productId: product_id,
        vendorId: vendor_id,
        networkId: network_id,
      });
      return;
    }

    givenNetworkIds.current = givenNetworkIds.current.filter(
      (id) => id !== network_id
    );

    updateRoutingTable([], [[hardware_id, network_id]]);
  };

  const updateNeighbours = (
    network_id: number,
    neighbours: [number, number, number, number]
  ) => {
    let removeFromRoutingTable: (string | number)[] = [];
    let newNeighbourTable = JSON.parse(
      JSON.stringify(neighbourTable)
    ) as NeighbourTable;
    log("unmodified neighbour table " + JSON.stringify(neighbourTable));

    // reset if only core is connected
    if (network_id === 1 && neighbours.every((n) => n === 0)) {
      log("reset neighbour table because only core is connected");
      setNeighbours({
        "1": [0, 0, 0, 0],
      });
      resetRoutingTable();
      givenNetworkIds.current = [];
    } else {
      // find removed ids
      let removedTiles: number[] = [];
      if (newNeighbourTable[network_id]) {
        for (let tile of neighbourTable[network_id]) {
          if (!neighbours.includes(tile) && tile !== 1) {
            removedTiles.push(tile);
            delete newNeighbourTable[tile];
            removeFromRoutingTable.push(tile);
          }
        }
      }

      // add new network id entry
      newNeighbourTable[network_id] = neighbours;

      // update neighbours of removed ids
      for (let removed of removedTiles) {
        for (let neighbour of Object.keys(newNeighbourTable)) {
          if (newNeighbourTable[neighbour].includes(removed)) {
            let index = newNeighbourTable[neighbour].indexOf(removed);
            newNeighbourTable[neighbour][index] = 0;
          }
        }
      }

      // remove empty that aren't 1
      for (let neighbour of Object.keys(newNeighbourTable)) {
        if (
          neighbour !== "1" &&
          newNeighbourTable[neighbour].every((tile) => tile === 0)
        ) {
          delete newNeighbourTable[neighbour];
          removeFromRoutingTable.push(parseInt(neighbour));
        }
      }

      log("updated neighbour table to " + JSON.stringify(newNeighbourTable));
      setNeighbours(newNeighbourTable);
      updateRoutingTable(removeFromRoutingTable, []);
    }
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

  const clearStore = async () => {
    await store.clear();
    await store.save();
  };

  useEffect(() => {
    if (payloads.networkIdPayload) {
      payloads.setNetworkIdPayload(null);
      const { product_id, vendor_id } = payloads.networkIdPayload;
      log("received network id request");
      invoke("send_network_id", {
        productId: product_id,
        vendorId: vendor_id,
        networkId: getFreeNetworkId(),
      });
    }
  }, [payloads.networkIdPayload]);

  useEffect(() => {
    if (payloads.hardwareReportPayload) {
      payloads.setHardwareReportPayload(null);
      const { hardware_id, network_id, product_id, vendor_id, tile_type } =
        payloads.hardwareReportPayload;
      log("received hardware report from " + hardware_id + " as " + network_id);
      addToRoutingTable(product_id, vendor_id, hardware_id, network_id);
      addTileConfig(hardware_id, tile_type);
    }
  }, [payloads.hardwareReportPayload, routingTable]);

  useEffect(() => {
    if (payloads.corePayload) {
      payloads.setCorePayload(null);
      log("cores changed, refreshing");
      refreshCores();
      setNeighbours({
        1: [0, 0, 0, 0],
      });
      resetRoutingTable();
    }
  }, [payloads.corePayload]);

  useEffect(() => {
    if (payloads.neighboursPayload) {
      payloads.setNeighboursPayload(null);
      const { neighbours, network_id } = payloads.neighboursPayload;
      if (neighbours.every((tile) => tile === 0)) {
        log("- - - - - - - - - - - - - - - ");
      }
      log("received neighbours report from " + network_id + ":" + neighbours);
      updateNeighbours(network_id, neighbours);
    }
  }, [payloads.neighboursPayload, routingTable, neighbourTable]);

  useEffect(() => {
    if (cores.length && activeCoreIndex === null) {
      setActiveCoreIndex(0);
    }
  }, [cores, activeCoreIndex]);

  useEffect(() => {
    // initialize neighbours
    if (cores.length && Object.keys(neighbourTable).length === 0) {
      log("Setting initial neighbours state");
      setNeighbours({
        "1": [0, 0, 0, 0],
      });
    }
  }, [givenNetworkIds, cores, neighbourTable]);

  useEffect(() => {
    // disable context menu
    const disableContextMenu = (event: Event) => {
      if (!import.meta.env.DEV) {
        event.preventDefault();
      }
    };
    document.addEventListener("contextmenu", disableContextMenu);

    // temporary TODO: remove
    // clearStore();

    // initialize cores
    refreshCores();

    // load tile configs
    loadConfigs();

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);
};

export default useBackendEvents;
