import { atom } from "jotai";
import { NeighbourIds, NeighbourTable } from "../types";

export const neighbourAtom = atom<NeighbourTable>({});

export const tileGridAtom = atom((get) => {
  const neighbours = JSON.parse(
    JSON.stringify(get(neighbourAtom))
  ) as NeighbourTable;
  console.log("JIFJPOEKFPKS", neighbours);
  if (!neighbours["1"]) return [];
  let grid: number[][] = [[]];

  const getGridY = (id: number) => {
    for (let y = 0; y < grid.length; y++) {
      if (grid[y].includes(id)) return y;
    }
    return -1;
  };

  const getGridPosition = (id: number) => {
    let y = getGridY(id);
    if (y === -1) return [-1, -1];
    let x = grid[y].indexOf(id);
    if (x === -1) return [-1, -1];
    return [x, y];
  };

  const idInGrid = (id: number) => {
    let y = getGridY(id);
    if (y === -1) return false;
    let x = grid[y].indexOf(id);
    if (x === -1) return false;
    return true;
  };

  const insertIdIntoGrid = (id: number, y: number, x: number) => {
    // extend grid if necessary
    while (grid[0].length <= x || x < 0) {
      if (x < 0) {
        for (let i = 0; i < grid.length; i++) {
          grid[i].unshift(0);
        }
        x++;
      } else {
        for (let i = 0; i < grid.length; i++) {
          grid[i].push(0);
        }
      }
    }
    let emptyYRow = Array.from({ length: grid[0].length }, () => 0);
    while (grid.length <= y || y < 0) {
      if (y < 0) {
        grid.unshift(emptyYRow);
        y++;
      } else {
        grid.push(emptyYRow);
      }
    }
    grid[y][x] = id;
  };

  const addNeighboursToGrid = (
    id: number,
    bottom: number,
    top: number,
    left: number,
    right: number
  ) => {
    if (!idInGrid(id)) {
      if (grid.length === 1 && grid[0].length === 0) {
        grid[0].push(id);
      } else return;
    }
    let [x, y] = getGridPosition(id);
    if (bottom) {
      insertIdIntoGrid(bottom, y + 1, x);
    }
    [x, y] = getGridPosition(id);
    if (top) {
      insertIdIntoGrid(top, y - 1, x);
    }
    [x, y] = getGridPosition(id);
    if (left) {
      insertIdIntoGrid(left, y, x - 1);
    }
    [x, y] = getGridPosition(id);
    if (right) {
      insertIdIntoGrid(right, y, x + 1);
    }
  };

  const rotateNeighbours = (
    neighbours: NeighbourIds,
    rotations: number = 1
  ) => {
    let [top, right, bottom, left] = neighbours;
    for (let i = 0; i < rotations; i++) {
      [top, right, bottom, left] = [left, top, right, bottom];
    }
    return [top, right, bottom, left] as NeighbourIds;
  };

  const pairInGrid = (
    parent: number,
    neighbour: number,
    yOffset: number,
    xOffset: number
  ) => {
    if (!neighbour) return false;
    if (!idInGrid(parent)) return false;
    if (!idInGrid(neighbour)) return false;
    let y = getGridY(parent);
    let x = grid[y].indexOf(parent);
    let y2 = getGridY(neighbour);
    let x2 = grid[y2].indexOf(neighbour);
    if (y + yOffset === y2 && x + xOffset === x2) return true;
    return false;
  };

  const rotateNeighboursToMatch = (
    parent: number,
    neighbours: NeighbourIds
  ) => {
    let rotated = [...neighbours] as NeighbourIds;
    let i = 0;
    for (i; i < 4; i++) {
      let [top, right, bottom, left] = rotated;
      if (pairInGrid(parent, top, -1, 0)) break;
      if (pairInGrid(parent, right, 0, 1)) break;
      if (pairInGrid(parent, bottom, 1, 0)) break;
      if (pairInGrid(parent, left, 0, -1)) break;
      rotated = rotateNeighbours(rotated);
    }
    return rotated as NeighbourIds;
  };

  // top, right, bottom, left
  // while (Object.keys(neighbours).length > 0) {
  console.log("Jfeosjfesjp");
  console.log({ ...neighbours });
  for (let parent of Object.keys(neighbours)
    .map((n) => parseInt(n))
    .sort()) {
    console.log(parent);
    let parentNeighbours = neighbours[parent].map((n) =>
      parseInt(n)
    ) as NeighbourIds;
    let [top, right, bottom, left] = rotateNeighboursToMatch(
      parent,
      parentNeighbours
    );
    addNeighboursToGrid(parent, bottom, top, left, right);
  }
  // }
  console.log(grid);
  return grid;
});
