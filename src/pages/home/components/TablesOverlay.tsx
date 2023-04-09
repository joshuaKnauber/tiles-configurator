import { useAtomValue } from "jotai";
import { devModeAtom } from "../../../atoms/devModeAtoms";
import { neighbourAtom } from "../../../atoms/neighbourAtoms";
import { invertedRoutingTableAtom } from "../../../atoms/routingTableAtoms";

const TablesOverlay = () => {
  const neighbourTable = useAtomValue(neighbourAtom);
  const invertedRoutingTable = useAtomValue(invertedRoutingTableAtom);
  const devMode = useAtomValue(devModeAtom);

  if (!devMode) return null;
  return (
    <div className="resize-y w-96 h-52 overflow-auto bg-zinc-800 p-4 rounded-md flex flex-col gap-3 font-mono">
      {Object.keys(neighbourTable).map((key) => (
        <div key={key}>
          <span className="text-sm leading-4">
            {key} : {neighbourTable[key].join(", ")}
          </span>
          <br />
        </div>
      ))}
      <br />
      {Object.entries(invertedRoutingTable).map(([key, value]) => (
        <div key={key}>
          <span className="text-sm leading-4">
            {key}: {value}
          </span>
          <br />
        </div>
      ))}
    </div>
  );
};

export default TablesOverlay;
