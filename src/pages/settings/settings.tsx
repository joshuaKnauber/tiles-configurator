import { Switch } from "@headlessui/react";
import { useAtom } from "jotai";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { devModeAtom } from "../../atoms/devModeAtoms";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import ToggleOption from "./components/ToggleOption";

const SettingsPage = () => {
  const navigate = useNavigate();

  const [devMode, setDevMode] = useAtom(devModeAtom);

  return (
    <div className="bg-zinc-900 text-white h-full flex flex-col divide-y-2 divide-zinc-800 select-none">
      <div className="flex flex-row py-2 px-4">
        <button
          className="flex flex-row gap-2 items-center py-1 px-2 pr-3 rounded-full hover:bg-zinc-800 transition-all"
          onClick={() => navigate(-1)}
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
      <div className="flex-grow px-4 py-4">
        <ToggleOption
          title="Developer Mode"
          value={devMode}
          onChange={setDevMode}
        />
      </div>
    </div>
  );
};

export default SettingsPage;
