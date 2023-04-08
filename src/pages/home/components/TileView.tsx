import { useAtomValue } from "jotai";
import { TransformComponent, useControls } from "react-zoom-pan-pinch";
import { tileGridAtom } from "../../../atoms/neighbourAtoms";
import Tile from "./Tile";
import { useEffect, useRef } from "react";

interface TileViewProps {
  pos: [number, number];
}

const TileView = ({ pos }: TileViewProps) => {
  const tileGrid = useAtomValue(tileGridAtom);

  const { zoomToElement } = useControls();
  const gridRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      zoomToElement(gridRef.current, 1, 200);
    }
  }, [tileGrid]);

  useEffect(() => {
    const onResize = () => {
      if (gridRef.current) {
        zoomToElement(gridRef.current, 1, 0);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  console.log(tileGrid);

  return (
    <TransformComponent
      wrapperClass="select-none w-full h-full overflow-hidden relative polka"
      wrapperStyle={{
        backgroundPosition: `calc(${pos[0]}px - .25rem) calc(${pos[1]}px - .25rem)`,
      }}
    >
      <table className="border-separate border-spacing-7" ref={gridRef}>
        <tbody className="text-center">
          {tileGrid.map((row, i) => (
            <tr key={i}>
              {row.map((tile, j) => {
                return (
                  <td
                    key={`${i}_${j}`}
                    className={`overflow-hidden rounded-xl w-32 h-32 hover:scale-105 bg-zinc-800 border border-zinc-600 cursor-pointer transition-all scale-in ${
                      tile ? "" : "pointer-events-none invisible"
                    }`}
                  >
                    <Tile id={tile} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </TransformComponent>
  );
};

export default TileView;
