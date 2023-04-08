import { atom } from "jotai";
import { TileConfigs } from "../types";

export const tileTypes: { [key: number]: string } = {
  1: "encoder",
  2: "buttons",
};

export const tileTypesPretty: { [key: number]: string } = {
  1: "Encoder",
  2: "Buttons",
};

export const tileConfigsAtom = atom<TileConfigs>({});
