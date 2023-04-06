import { useAtom } from "jotai";
import store from "./store";
import { devModeAtom } from "../atoms/devModeAtoms";
import { useEffect } from "react";

const useDevMode = () => {
  const [devMode, setDevModeState] = useAtom(devModeAtom);

  const setDevMode = async (devMode: boolean) => {
    if (devMode) {
      await store.set("dev_mode", true);
    } else {
      await store.delete("dev_mode");
    }
    setDevModeState(devMode);
  };

  useEffect(() => {
    (async () => {
      const devMode = await store.has("dev_mode");
      setDevModeState(devMode);
    })();
  }, []);

  return { devMode, setDevMode };
};

export default useDevMode;
