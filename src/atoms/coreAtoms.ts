import { atom } from "jotai";
import { Core } from "../types";

export const coresAtom = atom<Core[]>([]);

export const activeCoreIndexAtom = atom<number | null>(null);

export const activeCoreAtom = atom((get) => {
  const cores = get(coresAtom);
  const activeCoreIndex = get(activeCoreIndexAtom);
  if (activeCoreIndex === null) return null;
  return cores[activeCoreIndex];
});
