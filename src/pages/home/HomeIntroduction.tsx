import { InformationCircleIcon } from "@heroicons/react/24/solid";

const Introduction = () => {
  return (
    <div className="flex-grow h-full flex items-center justify-center flex-col gap-2">
      <InformationCircleIcon className="w-6 h-6 opacity-50" />
      <span className="text-lg font-medium opacity-50 select-none">
        Get started by connecting a Tile Core
      </span>
    </div>
  );
};

export default Introduction;
