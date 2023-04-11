import { useState, useEffect } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import DatalistInput from "react-datalist-input";
import "react-datalist-input/dist/styles.css";
import keyOptions from "./keys.json";
import store from "../../../../store/store";
import { TileConfigs } from "../../../../types";

type Key = {
  name: string;
  value: "down" | "release" | "click";
};

interface KeyConfigProps {
  hardwareId: string;
  action: string;
}

const KeyConfig = ({ hardwareId, action }: KeyConfigProps) => {
  const [keys, setKeys] = useState<Key[]>([]);

  const addEmptyKey = () => {
    setKeys((keys) => [...(keys || []), { name: "", value: "click" }]);
  };

  const updateKey = (index: number, key: Key) => {
    setKeys((keys) => {
      const newKeys = [...(keys || [])];
      newKeys[index] = key;
      return newKeys;
    });
  };

  const saveConfig = async () => {
    const configs = ((await store.get("tiles")) || {}) as TileConfigs;
    let keyCombi = "";
    for (const key of keys || []) {
      if (key.name === "") continue;
      if (key.value === "click") {
        keyCombi += `${key.name};`;
      } else if (key.value === "down") {
        keyCombi += `+${key.name};`;
      } else if (key.value === "release") {
        keyCombi += `-${key.name};`;
      }
    }
    if (keyCombi.endsWith(";")) keyCombi = keyCombi.slice(0, -1);
    configs[hardwareId][action] = keyCombi;
    configs[hardwareId][action + "-raw"] = JSON.stringify(keys);
    await store.set("tiles", configs);
    store.save();
  };

  const loadKeys = async () => {
    const configs = ((await store.get("tiles")) || {}) as TileConfigs;
    if (
      configs &&
      configs[hardwareId] &&
      configs[hardwareId][action + "-raw"]
    ) {
      let parsedKeys = JSON.parse(configs[hardwareId][action + "-raw"]);
      if (!Array.isArray(parsedKeys)) {
        parsedKeys = [];
      }
      setKeys(parsedKeys);
    } else {
      setKeys([]);
    }
  };

  useEffect(() => {
    saveConfig();
  }, [hardwareId, keys, action]);

  useEffect(() => {
    loadKeys();
  }, []);
  console.log(action, keys);

  return (
    <div className="flex flex-col gap-4 w-96">
      {keys.length > 0 && (
        <div className="flex flex-col gap-2">
          {keys.map((key, i) => (
            <div className="flex flex-col gap-2" key={i}>
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
                <DatalistInput
                  placeholder="No Key"
                  label={false}
                  value={key.name}
                  className="key-config-input flex-1"
                  setValue={(value) => {
                    updateKey(i, { ...key, name: value });
                  }}
                  items={keyOptions.map((option) => ({
                    value: option,
                    label: option,
                  }))}
                />
                <button
                  className={`w-6 h-6 flex items-center justify-center rounded-full transition-all opacity-50 hover:bg-zinc-800 hover:opacity-100`}
                  onClick={() => {
                    setKeys((keys) => {
                      const newKeys = [...(keys || [])];
                      newKeys.splice(i, 1);
                      return newKeys;
                    });
                  }}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              {i !== keys.length - 1 && (
                <PlusIcon className="w-4 h-4 opacity-50" />
              )}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={addEmptyKey}
        className="w-12 rounded bg-zinc-800 h-7 flex items-center justify-center hover:bg-zinc-700 transition-all"
      >
        <PlusIcon className="fill-white w-4 h-4" />
      </button>
    </div>
  );
};

export default KeyConfig;
