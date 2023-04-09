import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { useAtomValue } from "jotai";
import { Link, useParams } from "react-router-dom";
import { invertedRoutingTableAtom } from "../../atoms/routingTableAtoms";
import { tileConfigsAtom, tileTypesPretty } from "../../atoms/tilesAtoms";
import SettingsEncoder from "./components/TileSettings/SettingsEncoder";

const Tile = () => {
  const { id } = useParams<{ id: string }>();
  const invertedRoutingTable = useAtomValue(invertedRoutingTableAtom);
  const tiles = useAtomValue(tileConfigsAtom);

  const hardwareId = id
    ? invertedRoutingTable[parseInt(id)] || undefined
    : undefined;

  const tileType = hardwareId ? tiles[hardwareId]?.type || 0 : 0;
  const typeName = tileTypesPretty[tileType] || "Tile";

  return (
    <div className="flex-grow h-full flex flex-col divide-y-2 divide-zinc-800">
      <div className="py-1 pl-2 flex flex-row gap-2 items-center select-none">
        <Link
          to="/"
          className="flex flex-row gap-2 items-center py-1 px-2 pr-3 rounded-full hover:bg-zinc-800 transition-all"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="font-medium">{`${
            parseInt(id || "") === 1 ? "Core" : typeName
          }`}</span>
        </Link>
      </div>
      {hardwareId && (
        <div className="flex-grow flex flex-col px-4">
          {tileType === 1 && <SettingsEncoder hardwareId={hardwareId} />}
        </div>
      )}
    </div>
  );
};

export default Tile;
