export type CoreIds = [number, number];

export type NetworkRequestPayload = {
  product_id: number;
  vendor_id: number;
};

export type HardwareReportPayload = {
  tile_type: number;
  product_id: number;
  vendor_id: number;
  hardware_id: string;
  network_id: number;
};

export type NeighboursReportPayload = {
  product_id: number;
  vendor_id: number;
  network_id: number;
  neighbours: [number, number, number, number];
};

export type DataReportPayload = {
  product_id: number;
  vendor_id: number;
  network_id: number;
  data: number[];
};

export type Core = {
  vendorId: number;
  productId: number;
  name: string;
  connected: boolean;
};

export type RoutingTable = {
  [key: string]: number;
};

export type InvertedRoutingTable = {
  [key: string]: string;
};

export type NeighbourTable = {
  [key: string]: [number, number, number, number];
};

export type NeighbourIds = [number, number, number, number];

export type TileConfigs = {
  [key: string]: {
    type: number;
    [key: string]: any;
  };
};

declare module "react-map-interaction";
