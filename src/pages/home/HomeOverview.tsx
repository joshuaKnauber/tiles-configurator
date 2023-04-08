import { useAtomValue } from "jotai";
import { Link } from "react-router-dom";
import {
  CogIcon,
  CpuChipIcon,
  CursorArrowRippleIcon,
} from "@heroicons/react/24/solid";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { tileGridAtom } from "../../atoms/neighbourAtoms";
import { invertedRoutingTableAtom } from "../../atoms/routingTableAtoms";
import { tileConfigsAtom } from "../../atoms/tilesAtoms";
import { activeCoreAtom } from "../../atoms/coreAtoms";
import DebugOverlay from "./components/DebugOverlay";
import TablesOverlay from "./components/TablesOverlay";
import { devModeAtom } from "../../atoms/devModeAtoms";
import { useState } from "react";

const Overview = () => {
  const activeCore = useAtomValue(activeCoreAtom);
  const tileGrid = useAtomValue(tileGridAtom);
  const invertedRoutingTable = useAtomValue(invertedRoutingTableAtom);
  const tiles = useAtomValue(tileConfigsAtom);
  const devMode = useAtomValue(devModeAtom);

  const [pos, setPos] = useState<[number, number]>([0, 0]);

  if (!activeCore?.connected) {
    return (
      <div className="flex h-full justify-center items-center">
        <span className="text-lg font-medium opacity-50">
          Core not connected
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col fixed top-2 right-2 gap-2 z-10">
        <DebugOverlay />
        <TablesOverlay />
      </div>
      <TransformWrapper
        limitToBounds={false}
        centerOnInit
        minScale={1}
        maxScale={1}
        disablePadding
        onPanning={(e) => setPos([e.state.positionX, e.state.positionY])}
      >
        <TransformComponent
          wrapperClass="select-none w-full h-full overflow-hidden relative polka"
          wrapperStyle={{
            backgroundPosition: `calc(${pos[0]}px - .25rem) calc(${pos[1]}px - .25rem)`,
          }}
        >
          <table className="border-separate border-spacing-7">
            <tbody className="text-center">
              {tileGrid.map((row, i) => (
                <tr key={i}>
                  {row.map((tile, j) => {
                    const hardwareId = invertedRoutingTable[tile];
                    const tileType = tiles[hardwareId]?.type || 0;
                    return (
                      <td
                        key={`${i}_${j}`}
                        className={`overflow-hidden rounded-xl w-32 h-32 hover:scale-105 bg-zinc-800 border border-zinc-600 cursor-pointer transition-all scale-in ${
                          tile ? "" : "pointer-events-none invisible"
                        }`}
                      >
                        <Link
                          to={`/tiles/${tile}`}
                          className="flex items-center justify-center w-full h-full"
                        >
                          {tile ? (
                            tile === 1 ? (
                              <CpuChipIcon className="w-10 h-10 fill-amber-400" />
                            ) : (
                              <div className="flex flex-col gap-1 items-center">
                                {tileType === 1 ? (
                                  <CogIcon className="w-10 h-10 opacity-50" />
                                ) : (
                                  <CursorArrowRippleIcon className="w-10 h-10 opacity-50" />
                                )}
                                {devMode && (
                                  <>
                                    <span className="opacity-50 text-xs">
                                      {hardwareId || "None"}
                                    </span>
                                    <span className="opacity-50 text-xs">
                                      {tile}
                                    </span>
                                  </>
                                )}
                              </div>
                            )
                          ) : null}
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </TransformComponent>
      </TransformWrapper>
    </>
  );
};

export default Overview;
