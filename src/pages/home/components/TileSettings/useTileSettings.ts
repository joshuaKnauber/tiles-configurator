import { useAtom } from "jotai";
import { tileConfigsAtom } from "../../../../atoms/tilesAtoms";
import store from "../../../../store/store";

const useTileSettings = (hardwareId: string) => {
  const [tiles, setTiles] = useAtom(tileConfigsAtom);
  const config = tiles[hardwareId];

  const updateConfigKey = (key: string, value: any) => {
    let newConfig = { ...config };
    newConfig[key] = value;
    let newTiles = { ...tiles };
    newTiles[hardwareId] = newConfig;
    setTiles(newTiles);
    store.set("tiles", newTiles);
    store.save();
  };

  return {
    config,
    updateConfigKey,
  };
};

export default useTileSettings;
