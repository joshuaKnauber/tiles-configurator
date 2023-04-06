import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { Link, useParams } from "react-router-dom";

const Tile = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex-grow h-full flex flex-col divide-y-2 divide-zinc-800">
      <div className="py-1 pl-2 flex flex-row gap-2 items-center">
        <Link
          to="/"
          className="flex flex-row gap-2 items-center py-1 px-2 pr-3 rounded-full hover:bg-zinc-800 transition-all"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="font-medium">{`${
            parseInt(id || "") === 1 ? "Core" : `Tile ${id}`
          }`}</span>
        </Link>
      </div>
      <div className="flex-grow flex flex-col px-4"></div>
    </div>
  );
};

export default Tile;
