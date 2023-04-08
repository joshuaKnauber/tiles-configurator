import { useAtomValue } from "jotai";
import { logAtom } from "../../../atoms/logAtoms";
import { devModeAtom } from "../../../atoms/devModeAtoms";

const DebugOverlay = () => {
  const log = useAtomValue(logAtom);
  const devMode = useAtomValue(devModeAtom);

  if (!devMode) return null;
  return (
    <div className="resize-y w-96 h-52 overflow-auto bg-white p-2 bg-opacity-10 rounded-sm flex flex-col gap-2">
      {log.map((log, i) => (
        <div className="text-xs" key={i}>
          {log}
        </div>
      ))}
    </div>
  );
};

export default DebugOverlay;
