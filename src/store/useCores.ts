import { useState } from "react";
import { invoke } from "@tauri-apps/api";
import { Core, CoreIds } from "../types";
import store from "./store";
import { useSetAtom } from "jotai";
import { coresAtom } from "../atoms/coreAtoms";

const useCores = () => {
  const setCores = useSetAtom(coresAtom);

  const updateCores = async (cores: Core[]) => {
    store.set("cores", cores);
    store.save();
    setCores(cores);
  };

  const getCores = async () => {
    const cores = ((await store.get("cores")) || []) as Core[];
    return cores;
  };

  const getCore = async (productId: number, vendorId: number) => {
    const cores = await getCores();
    const core = cores.find(
      (core) => core.productId === productId && core.vendorId === vendorId
    );
    return core || null;
  };

  const refreshCores = async () => {
    const connectedCores = (await invoke("get_connected_cores")) as CoreIds[];
    const current = await getCores();
    console.log(current, connectedCores);

    const newCores: Core[] = [...current];
    newCores.forEach((core) => (core.connected = false));

    for (const connected of connectedCores) {
      const currentIndex = current.findIndex(
        (core) =>
          core.productId === connected[1] && core.vendorId === connected[0]
      );
      if (currentIndex !== -1) {
        newCores[currentIndex].connected = true;
      } else {
        newCores.push({
          vendorId: connected[0],
          productId: connected[1],
          name: "New Tile",
          connected: true,
        });
      }
    }

    await updateCores(newCores);
  };

  const deleteCores = async () => {
    await store.delete("cores");
    setCores([]);
  };

  const setCoreName = (core: Core, name: string) => {};

  return {
    getCore,
    getCores,
    setCoreName,
    refreshCores,
    deleteCores,
  };
};

export default useCores;
