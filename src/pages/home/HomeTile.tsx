import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { useAtomValue } from "jotai";
import { Link, useNavigate, useParams } from "react-router-dom";
import { invertedRoutingTableAtom } from "../../atoms/routingTableAtoms";
import { tileConfigsAtom, tileTypesPretty } from "../../atoms/tilesAtoms";
import SettingsEncoder from "./components/TileSettings/SettingsEncoder";
import SettingsButtons from "./components/TileSettings/SettingsButtons";
import { useEffect } from "react";

const Tile = () => {
  const { id } = useParams<{ id: string }>();
  const invertedRoutingTable = useAtomValue(invertedRoutingTableAtom);
  const tiles = useAtomValue(tileConfigsAtom);

  const navigate = useNavigate();

  const hardwareId = id ? invertedRoutingTable[id] || undefined : undefined;

  const tileType = hardwareId ? tiles[hardwareId]?.type || 0 : 0;
  const typeName = tileTypesPretty[tileType] || "Tile";

  useEffect(() => {
    if (id && !invertedRoutingTable[id]) {
      navigate("/");
    }
  }, [id, invertedRoutingTable]);

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
        <div className="flex-grow overflow-y-auto">
          <div className="overflow-y-auto h-full">
            {tileType === 1 ? (
              <SettingsEncoder hardwareId={hardwareId} />
            ) : tileType === 2 ? (
              <SettingsButtons hardwareId={hardwareId} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tile;
