import { useAtomValue } from "jotai";
import { Link } from "react-router-dom";
import { CpuChipIcon } from "@heroicons/react/24/solid";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { neighbourAtom, tileGridAtom } from "../../atoms/neighbourAtoms";
import { invertedRoutingTableAtom } from "../../atoms/routingTableAtoms";
import { logAtom } from "../../atoms/logAtoms";
import { tileConfigsAtom, tileTypes } from "../../atoms/tilesAtoms";

const Overview = () => {
  const tileGrid = useAtomValue(tileGridAtom);
  console.log(tileGrid);
  const neighbourTable = useAtomValue(neighbourAtom);
  const invertedRoutingTable = useAtomValue(invertedRoutingTableAtom);
  const log = useAtomValue(logAtom);
  const tiles = useAtomValue(tileConfigsAtom);
  console.log(tiles);

  return (
    // <TransformWrapper
    //   limitToBounds={false}
    //   centerOnInit
    //   minScale={1}
    //   maxScale={1}
    //   disablePadding
    // >
    //   <TransformComponent wrapperClass="select-none min-w-full min-h-full overflow-auto flex relative">
    <div className="min-w-full min-h-full overflow-auto">
      <div className="fixed top-2 right-2 w-96 h-96 overflow-auto bg-white p-2 bg-opacity-10 rounded-sm flex flex-col gap-2">
        {log.map((log, i) => (
          <div className="text-xs" key={i}>
            {log}
          </div>
        ))}
      </div>
      {Object.keys(neighbourTable).map((key) => (
        <div key={key}>
          <span>
            {key} : {neighbourTable[key].join(", ")}
          </span>
          <br />
        </div>
      ))}
      <br />
      {Object.entries(invertedRoutingTable).map(([key, value]) => (
        <div key={key}>
          <span>
            {key}: {value}
          </span>
          <br />
        </div>
      ))}
      <br />
      <table className="border-separate border-spacing-2">
        <tbody className="text-center">
          {tileGrid.map((row, i) => (
            <tr key={i}>
              {row.map((tile, j) => {
                const hardwareId = invertedRoutingTable[tile];
                console.log(invertedRoutingTable, hardwareId, tiles);
                const tileType = tiles[hardwareId]?.type || 0;
                const typeName = tileTypes[tileType] || "unknown";
                return (
                  <td
                    key={`${i}_${j}`}
                    className={`overflow-hidden rounded-xl w-28 h-28 min-w-[7rem] min-h-[7rem] hover:scale-105 bg-zinc-800 border border-zinc-600 cursor-pointer transition-all scale-in ${
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
                          <div className="flex flex-col">
                            <span className="opacity-50">{tile}</span>
                            <span className="opacity-50">
                              {hardwareId || "None"}
                            </span>
                            <span className="opacity-50">
                              {typeName}
                              {tileType}
                            </span>
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
    </div>
    //   </TransformComponent>
    // </TransformWrapper>
  );
};

export default Overview;
