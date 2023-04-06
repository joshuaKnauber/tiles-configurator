import { atom } from "jotai";
import { InvertedRoutingTable, RoutingTable } from "../types";

export const routingTableAtom = atom<RoutingTable>({});

export const invertedRoutingTableAtom = atom((get) => {
  const routingTable = get(routingTableAtom);
  const inverted: InvertedRoutingTable = {};
  Object.entries(routingTable).forEach(([hardwareId, networkId]) => {
    inverted[networkId] = hardwareId;
  });
  return inverted;
});
