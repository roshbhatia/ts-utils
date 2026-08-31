export interface Layout {
  readonly width: number;
  readonly height: number;
  readonly treeWidth: number;
  readonly mainWidth: number;
  readonly mainRows: number;
  readonly detailRows: number;
}

const minimumMainWidth = 48;
const minimumMainRows = 12;
const defaultTreeWidth = 32;
const defaultDetailRows = 14;

export const resolveLayout = (
  width: number,
  height: number,
  treeVisible: boolean,
): Layout => {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const treeWidth =
    treeVisible && safeWidth >= minimumMainWidth + 20
      ? Math.min(defaultTreeWidth, safeWidth - minimumMainWidth)
      : 0;
  const detailRows =
    safeHeight >= minimumMainRows + 8
      ? Math.min(defaultDetailRows, safeHeight - minimumMainRows)
      : 0;

  return {
    width: safeWidth,
    height: safeHeight,
    treeWidth,
    mainWidth: safeWidth - treeWidth,
    mainRows: safeHeight - detailRows,
    detailRows,
  };
};
