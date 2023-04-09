import { useAtomValue } from "jotai";
import { logAtom } from "../../../atoms/logAtoms";
import { devModeAtom } from "../../../atoms/devModeAtoms";

const DebugOverlay = () => {
  const log = useAtomValue(logAtom);
  const devMode = useAtomValue(devModeAtom);

  if (!devMode) return null;
  return (
    <div className="resize-y w-96 h-52 overflow-auto bg-zinc-800 py-4 rounded-md flex flex-col gap-2 font-mono">
      {log.map((log, i) => (
        <div
          className={`text-xs leading-4 px-4 py-1 bg-opacity-5 ${
            i % 2 ? "bg-white" : "bg-transparent"
          }`}
          key={i}
        >
          {log}
        </div>
      ))}
    </div>
  );
};

export default DebugOverlay;
