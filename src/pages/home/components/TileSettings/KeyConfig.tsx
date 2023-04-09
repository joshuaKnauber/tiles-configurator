import { useState } from "react";
import keyOptions from "./keys.json";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

type Key = {
  name: string;
  value: "down" | "release" | "click";
};

const KeyConfig = () => {
  const [keys, setKeys] = useState<Key[]>([]);

  const addEmptyKey = () => {
    setKeys((keys) => [...keys, { name: "", value: "click" }]);
  };

  const updateKey = (index: number, key: Key) => {
    setKeys((keys) => {
      const newKeys = [...keys];
      newKeys[index] = key;
      return newKeys;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {keys.map((key, i) => (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-4">
            <div className="flex flex-row gap-1">
              <button
                className={`w-6 h-6 border flex items-center justify-center rounded-md transition-all ${
                  key.value === "click" ? "opacity-100" : "opacity-50"
                }`}
                onClick={() => {
                  updateKey(i, { ...key, value: "click" });
                }}
              >
                <ArrowsUpDownIcon className="w-4 h-4 -scale-x100" />
              </button>
              <button
                className={`w-6 h-6 border flex items-center justify-center rounded-md transition-all ${
                  key.value === "down" ? "opacity-100" : "opacity-50"
                }`}
                onClick={() => {
                  updateKey(i, { ...key, value: "down" });
                }}
              >
                <ArrowDownIcon className="w-4 h-4" />
              </button>
              <button
                className={`w-6 h-6 border flex items-center justify-center rounded-md transition-all ${
                  key.value === "release" ? "opacity-100" : "opacity-50"
                }`}
                onClick={() => {
                  updateKey(i, { ...key, value: "release" });
                }}
              >
                <ArrowUpIcon className="w-4 h-4" />
              </button>
            </div>
            <input
              placeholder="No Key"
              value={key.name}
              className="bg-transparent outline-none w-36 h-6 bg-red-700"
              list="keyOptions"
              onChange={(e) => {
                updateKey(i, { ...key, name: e.target.value });
              }}
            />
            <datalist id="keyOptions">
              {keyOptions.map((option) => (
                <option value={option}>{option}</option>
              ))}
            </datalist>
            <button
              className={`w-6 h-6 flex items-center justify-center rounded-full transition-all opacity-50 hover:bg-zinc-800 hover:opacity-100`}
              onClick={() => {
                setKeys((keys) => {
                  const newKeys = [...keys];
                  newKeys.splice(i, 1);
                  return newKeys;
                });
              }}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          {i !== keys.length - 1 && <PlusIcon className="w-4 h-4 opacity-50" />}
        </div>
      ))}
      <button
        onClick={addEmptyKey}
        className="w-8 rounded-xl bg-zinc-700 h-8 flex items-center justify-center hover:bg-zinc-600 transition-all"
      >
        <PlusIcon className="fill-white w-4 h-4" />
      </button>
    </div>
  );
};

export default KeyConfig;
