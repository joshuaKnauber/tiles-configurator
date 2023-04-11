import { useAtomValue } from "jotai";
import { TransformWrapper } from "react-zoom-pan-pinch";
import { activeCoreAtom } from "../../atoms/coreAtoms";
import DebugOverlay from "./components/DebugOverlay";
import TablesOverlay from "./components/TablesOverlay";
import { useState } from "react";
import TileView from "./components/TileView";
import KeyConfig from "./components/TileSettings/KeyConfig";

const Overview = () => {
  const activeCore = useAtomValue(activeCoreAtom);

  const [pos, setPos] = useState<[number, number]>([0, 0]);

  if (!activeCore?.connected) {
    return (
      <div className="flex flex-col h-full justify-center items-center polka">
        <span className="text-lg font-medium opacity-50 select-none">
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
        <TileView pos={pos} />
      </TransformWrapper>
    </>
  );
};

export default Overview;
