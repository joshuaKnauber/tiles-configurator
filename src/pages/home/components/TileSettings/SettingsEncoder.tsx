import { useAtomValue } from "jotai";
import { open, save } from "@tauri-apps/api/dialog";
import { tileConfigsAtom } from "../../../../atoms/tilesAtoms";
import useTileSettings from "./useTileSettings";
import KeyConfig from "./KeyConfig";

const SettingsEncoder = ({ hardwareId }: { hardwareId: string }) => {
  const { config, updateConfigKey } = useTileSettings(hardwareId);

  return (
    <>
      <span className="text-md font-medium opacity-50">Click Down</span>
      <KeyConfig />
      <span className="text-md font-medium opacity-50">Click Up</span>
      <span className="text-md font-medium opacity-50">Rotate Right</span>
      <span className="text-md font-medium opacity-50">Rotate Left</span>
    </>
  );
};

export default SettingsEncoder;
