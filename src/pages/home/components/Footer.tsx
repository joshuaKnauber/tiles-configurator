import { useAtomValue } from "jotai";
import useCores from "../../../store/useCores";
import { ArrowPathIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";
import { activeCoreAtom } from "../../../atoms/coreAtoms";
import { Link } from "react-router-dom";

const Footer = () => {
  const { refreshCores, refreshingCores } = useCores();
  const activeCore = useAtomValue(activeCoreAtom);

  return (
    <div className="flex flex-row items-center p-1 gap-2 justify-between select-none">
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-row items-center gap-2">
          <button
            onClick={() => refreshCores()}
            className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-all"
          >
            <ArrowPathIcon
              className={`w-4 h-4 duration-200 ${
                refreshingCores
                  ? "transition-all rotate-180"
                  : "transition-none rotate-0"
              }`}
            />
          </button>
          {activeCore ? (
            <div className="flex flex-row items-center gap-2 hover:bg-zinc-800 px-2 py-1 h-min rounded-full cursor-pointer transition-all">
              <div
                className={`w-2 aspect-square rounded-full ${
                  activeCore.connected ? "bg-emerald-400" : "bg-zinc-600"
                }`}
              ></div>
              <span className="text-xs opacity-75">{activeCore.name}</span>
            </div>
          ) : (
            <span className="text-xs opacity-75">No Tile Connected</span>
          )}
        </div>
      </div>
      <Link
        to={"/settings"}
        className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-all"
      >
        <Cog6ToothIcon className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default Footer;
