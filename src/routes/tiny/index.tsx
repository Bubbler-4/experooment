import { Title } from "@solidjs/meta";
import Konva from "konva";
import { onCleanup, onMount } from "solid-js";

type Cell = readonly [row: number, col: number];

type BlockShape = {
  readonly cells: readonly Cell[];
  readonly width: number;
  readonly height: number;
};

const GRID_SIZE = 9;
const CELL_SIZE = 36;
const GRID_X = 20;
const GRID_Y = 20;

const PREVIEW_X = GRID_X + GRID_SIZE * CELL_SIZE + 40;
const PREVIEW_Y = GRID_Y + 36;
const PREVIEW_SLOT_WIDTH = 82;
const PREVIEW_SLOT_HEIGHT = 82;
const PREVIEW_CELL_SIZE = 14;

const STAGE_WIDTH = PREVIEW_X + PREVIEW_SLOT_WIDTH * 5 + 20;
const STAGE_HEIGHT = GRID_Y + GRID_SIZE * CELL_SIZE + 20;

const BLOCKS: readonly BlockShape[] = [
  // 1
  withBounds([
    [0, 0],
  ]),
  // 2
  withBounds([
    [0, 0],
    [0, 1],
  ]),
  // 3
  withBounds([
    [0, 0],
    [1, 0],
  ]),
  // 4
  withBounds([
    [0, 0],
    [1, 0],
    [2, 0],
  ]),
  // 5
  withBounds([
    [0, 0],
    [0, 1],
    [0, 2],
  ]),
  // 6
  withBounds([
    [0, 0],
    [1, 0],
    [1, 1],
  ]),
  // 7
  withBounds([
    [0, 1],
    [1, 0],
    [1, 1],
  ]),
  // 8
  withBounds([
    [0, 0],
    [0, 1],
    [1, 0],
  ]),
  // 9
  withBounds([
    [0, 0],
    [0, 1],
    [1, 1],
  ]),
];

function withBounds(cells: readonly Cell[]): BlockShape {
  const maxRow = Math.max(...cells.map(([row]) => row));
  const maxCol = Math.max(...cells.map(([, col]) => col));

  return {
    cells,
    width: maxCol + 1,
    height: maxRow + 1,
  };
}

function createEmptyGrid(): boolean[][] {
  return Array.from({ length: GRID_SIZE }, () => Array<boolean>(GRID_SIZE).fill(false));
}

function createBlockQueue(): number[] {
  return Array.from({ length: 500 }, () => Math.floor(Math.random() * BLOCKS.length));
}

export default function Tiny() {
  let wrapperRef: HTMLDivElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let stage: Konva.Stage | undefined;
  let layer: Konva.Layer | undefined;
  let stageScale = 1;

  let grid = createEmptyGrid();
  let queue = createBlockQueue();
  let placedCount = 0;
  let won = false;

  const draw = () => {
    if (!layer) {
      return;
    }

    layer.destroyChildren();

    layer.add(
      new Konva.Text({
        x: GRID_X,
        y: GRID_Y - 18,
        text: "Game Area",
        fontSize: 14,
        fill: "#111827",
      }),
    );

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        layer.add(
          new Konva.Rect({
            x: GRID_X + col * CELL_SIZE,
            y: GRID_Y + row * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            fill: "white",
            stroke: "black",
            strokeWidth: 1,
          }),
        );

        if (grid[row][col]) {
          layer.add(
            new Konva.Rect({
              x: GRID_X + col * CELL_SIZE + 2,
              y: GRID_Y + row * CELL_SIZE + 2,
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
              fill: "#111827",
            }),
          );
        }
      }
    }

    layer.add(
      new Konva.Text({
        x: PREVIEW_X,
        y: GRID_Y,
        text: "Next 10",
        fontSize: 18,
        fontStyle: "bold",
        fill: "#111827",
      }),
    );

    layer.add(
      new Konva.Text({
        x: PREVIEW_X,
        y: PREVIEW_Y + PREVIEW_SLOT_HEIGHT * 2 + 12,
        text: `Placed: ${placedCount} / 500`,
        fontSize: 14,
        fill: "#111827",
      }),
    );

    for (let i = 0; i < 10; i += 1) {
      const slotX = PREVIEW_X + (i % 5) * PREVIEW_SLOT_WIDTH;
      const slotY = PREVIEW_Y + Math.floor(i / 5) * PREVIEW_SLOT_HEIGHT;

      layer.add(
        new Konva.Rect({
          x: slotX,
          y: slotY,
          width: PREVIEW_SLOT_WIDTH - 8,
          height: PREVIEW_SLOT_HEIGHT - 8,
          fill: "#f9fafb",
          stroke: "#9ca3af",
          strokeWidth: 1,
          cornerRadius: 4,
        }),
      );

      const blockType = queue[placedCount + i];
      if (blockType === undefined) {
        continue;
      }

      const block = BLOCKS[blockType];
      const offsetX = slotX + (PREVIEW_SLOT_WIDTH - 8 - block.width * PREVIEW_CELL_SIZE) / 2;
      const offsetY = slotY + (PREVIEW_SLOT_HEIGHT - 8 - block.height * PREVIEW_CELL_SIZE) / 2;

      for (const [row, col] of block.cells) {
        layer.add(
          new Konva.Rect({
            x: offsetX + col * PREVIEW_CELL_SIZE,
            y: offsetY + row * PREVIEW_CELL_SIZE,
            width: PREVIEW_CELL_SIZE,
            height: PREVIEW_CELL_SIZE,
            fill: "#111827",
            stroke: "#000",
            strokeWidth: 1,
          }),
        );
      }
    }

    if (won) {
      layer.add(
        new Konva.Rect({
          x: GRID_X,
          y: GRID_Y,
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          fill: "white",
          opacity: 0.9,
        }),
      );

      layer.add(
        new Konva.Text({
          x: GRID_X,
          y: GRID_Y + GRID_SIZE * CELL_SIZE / 2 - 24,
          width: GRID_SIZE * CELL_SIZE,
          text: "Congratulations!\nAll 500 blocks placed.",
          align: "center",
          fontSize: 24,
          fontStyle: "bold",
          fill: "#16a34a",
        }),
      );
    }

    layer.draw();
  };

  const canPlaceAt = (block: BlockShape, topRow: number, leftCol: number): boolean => {
    for (const [row, col] of block.cells) {
      const gridRow = topRow + row;
      const gridCol = leftCol + col;

      if (gridCol < 0 || gridCol >= GRID_SIZE) {
        return false;
      }

      if (gridRow >= GRID_SIZE) {
        return false;
      }

      if (gridRow >= 0 && grid[gridRow][gridCol]) {
        return false;
      }
    }

    return true;
  };

  const clearFilledRows = () => {
    const remainingRows = grid.filter((row) => !row.every(Boolean));
    const clearedCount = GRID_SIZE - remainingRows.length;

    if (clearedCount === 0) {
      return;
    }

    const newRows = Array.from({ length: clearedCount }, () => Array<boolean>(GRID_SIZE).fill(false));
    grid = [...newRows, ...remainingRows];
  };

  const placeNextBlock = (clickedCol: number) => {
    if (won) {
      return;
    }

    const blockType = queue[placedCount];
    if (blockType === undefined) {
      return;
    }

    const block = BLOCKS[blockType];

    if (clickedCol + block.width > GRID_SIZE) {
      return;
    }

    let topRow = -block.height;
    while (canPlaceAt(block, topRow + 1, clickedCol)) {
      topRow += 1;
    }

    const fitsFullyInsideGrid = block.cells.every(([row]) => topRow + row >= 0);
    if (!fitsFullyInsideGrid || !canPlaceAt(block, topRow, clickedCol)) {
      return;
    }

    for (const [row, col] of block.cells) {
      grid[topRow + row][clickedCol + col] = true;
    }

    clearFilledRows();
    placedCount += 1;
    won = placedCount >= 500;
    draw();
  };

  const handleReset = () => {
    grid = createEmptyGrid();
    queue = createBlockQueue();
    placedCount = 0;
    won = false;
    draw();
  };

  const resizeStage = () => {
    if (!stage || !wrapperRef) {
      return;
    }

    const availableWidth = Math.max(wrapperRef.clientWidth - 8, 1);
    stageScale = Math.min(1, availableWidth / STAGE_WIDTH);

    stage.width(STAGE_WIDTH * stageScale);
    stage.height(STAGE_HEIGHT * stageScale);
    stage.scale({ x: stageScale, y: stageScale });
    stage.batchDraw();
  };

  onMount(() => {
    if (!containerRef) {
      return;
    }

    stage = new Konva.Stage({
      container: containerRef,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
    });

    layer = new Konva.Layer();
    stage.add(layer);

    stage.on("click tap", () => {
      if (!stage) {
        return;
      }

      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) {
        return;
      }

      const x = pointerPosition.x / stageScale;
      const y = pointerPosition.y / stageScale;
      const insideGridX = x >= GRID_X && x < GRID_X + GRID_SIZE * CELL_SIZE;
      const insideGridY = y >= GRID_Y && y < GRID_Y + GRID_SIZE * CELL_SIZE;

      if (!insideGridX || !insideGridY) {
        return;
      }

      const clickedCol = Math.floor((x - GRID_X) / CELL_SIZE);
      placeNextBlock(clickedCol);
    });

    draw();
    resizeStage();
    window.addEventListener("resize", resizeStage);
  });

  onCleanup(() => {
    window.removeEventListener("resize", resizeStage);
    stage?.destroy();
    stage = undefined;
    layer = undefined;
  });

  return (
    <main class="p-4 text-left">
      <Title>Tiny</Title>
      <h1 class="mb-4 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Tiny
      </h1>
      <div class="flex w-full max-w-full flex-col gap-3">
        <div ref={wrapperRef} class="w-full overflow-x-auto rounded border border-gray-300 bg-white p-1">
          <div ref={containerRef} class="touch-manipulation" />
        </div>
        <button
          type="button"
          class="w-fit rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </main>
  );
}
