import {
  CogIcon,
  CpuChipIcon,
  CursorArrowRippleIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { invertedRoutingTableAtom } from "../../../atoms/routingTableAtoms";
import { useAtomValue } from "jotai";
import { tileConfigsAtom } from "../../../atoms/tilesAtoms";
import { devModeAtom } from "../../../atoms/devModeAtoms";
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { DataReportPayload } from "../../../types";

interface TileProps {
  id: number;
}

const Tile = ({ id }: TileProps) => {
  const invertedRoutingTable = useAtomValue(invertedRoutingTableAtom);
  const tiles = useAtomValue(tileConfigsAtom);
  const devMode = useAtomValue(devModeAtom);

  const hardwareId = invertedRoutingTable[id.toString()];
  const tileType = tiles[hardwareId]?.type || 0;

  // encoder tile state
  const [encoderPressed, setEncoderPressed] = useState<boolean>(false);
  const [encoderRotation, setEncoderRotation] = useState<number>(0);

  // button tile state
  const [btn1Pressed, setBtn1Pressed] = useState<boolean>(false);
  const [btn2Pressed, setBtn2Pressed] = useState<boolean>(false);

  const handleEncoderRotation = (rotation: number) => {
    setEncoderRotation((curr) => curr + rotation);
  };
  const handleEncoderPress = (pressed: boolean) => {
    setEncoderPressed(pressed);
  };

  const handleButtonPresses = (btn1: boolean | null, btn2: boolean | null) => {
    if (btn1 !== null) setBtn1Pressed(btn1);
    if (btn2 !== null) setBtn2Pressed(btn2);
  };

  useEffect(() => {
    const inputListener = (event: any) => {
      const { network_id, data } = event.payload as DataReportPayload;
      if (network_id === id) {
        switch (tileType) {
          case 1: // encoder
            if (data[0] === 0 || data[0] === 1)
              handleEncoderPress(data[0] === 0 ? true : false);
            else if (data[0] === 2 || data[0] === 3)
              handleEncoderRotation(data[0] === 2 ? 1 : -1);
            break;
          case 2: // button
            handleButtonPresses(
              data[0] === 0 ? true : data[0] === 1 ? false : null,
              data[0] === 2 ? true : data[0] === 3 ? false : null
            );
            break;
          default:
            break;
        }
      }
    };
    const unlistenInput = listen("report-input-data", inputListener);

    return () => {
      unlistenInput.then((unlisten) => unlisten());
    };
  }, [id, tileType]);

  return (
    <Link
      to={`/tiles/${id}`}
      className="flex items-center justify-center w-full h-full"
    >
      {id ? (
        id === 1 ? (
          <CpuChipIcon className="w-14 h-14 fill-orange-400" />
        ) : (
          <div className="flex flex-col gap-1 items-center">
            {tileType === 1 ? (
              <>
                <CogIcon
                  className={`w-14 h-14 transition-all ${
                    encoderPressed ? "fill-zinc-700" : "fill-zinc-500"
                  }`}
                  style={{
                    transform: `rotate(${encoderRotation * 45}deg)`,
                  }}
                />
              </>
            ) : (
              <div className="flex flex-row items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full transition-all border-4 border-zinc-800 ${
                    btn1Pressed ? "bg-zinc-700" : "bg-zinc-500"
                  }`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full transition-all border-4 border-zinc-800 ${
                    btn2Pressed ? "bg-zinc-700" : "bg-zinc-500"
                  }`}
                ></div>
              </div>
            )}
            {devMode && (
              <>
                <span className="opacity-50 text-xs">
                  {hardwareId || "None"}
                </span>
                <span className="opacity-50 text-xs">{id}</span>
              </>
            )}
          </div>
        )
      ) : null}
    </Link>
  );
};

export default Tile;
