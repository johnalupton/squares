//input event handlers
const rgbStr = (r, g, b) => `rgb(${r},${g},${b})`;
const setSlider = color => {
  let r = 0;
  let g = 0;
  let b = 0;
  const c = document.getElementById("color_slider_" + color).value;

  switch (color) {
    case "r":
      r = c;
      break;
    case "g":
      g = c;
      break;
    case "b":
      b = c;
      break;
  }
  document.getElementById("color_slider_" + color + "__value").innerText = c;
  document.getElementById(
    "color_slider_" + color + "__color"
  ).style.backgroundColor = rgbStr(r, g, b);
  return c;
};

const colorSliderDblClick = slider => {
  console.log(slider);
  slider.value = 127;
  colorSliderChange();
};

const colorSliderChange = () => {
  const r = setSlider("r");
  const g = setSlider("g");
  const b = setSlider("b");
  document.getElementById(
    "color_slider_rgb__color"
  ).style.backgroundColor = rgbStr(r, g, b);
  document.getElementById(
    "island-style"
  ).innerHTML = `td.island {background-color: ${rgbStr(r, g, b)};}`;
};
const sizeSliderChange = slider => {
  document.getElementById("size_slider__value").innerText = slider.value;
  puzzleInit(newGrid(parseInt(slider.value, 10)));
};
// initial grid
const grid = [
  [0, 0, 0, 0, 1],
  [1, 1, 0, 0, 0],
  [1, 1, 0, 1, 1],
  [0, 0, 0, 0, 0],
  [1, 1, 1, 0, 0]
];
// randomize grid
const smallest = 2;
const largest = 16;
const newGrid = size =>
  new Array(size)
    .fill(0)
    .map(row =>
      new Array(size).fill(0).map(val => Math.floor(Math.random() * 2))
    );
// island detetection resolver
const markIslandAsCounted = (r, c, islandIndex, gridCopy, islands) => {
  const height = gridCopy.length;
  const width = gridCopy.length ? gridCopy[0].length : 0;
  if (r < 0 || r >= height || c < 0 || c >= width) {
    return;
  }
  if (gridCopy[r][c] === 0) {
    return;
  }
  gridCopy[r][c] = 0;
  islands[r][c] = islandIndex;
  markIslandAsCounted(r - 1, c, islandIndex, gridCopy, islands);
  markIslandAsCounted(r + 1, c, islandIndex, gridCopy, islands);
  markIslandAsCounted(r, c - 1, islandIndex, gridCopy, islands);
  markIslandAsCounted(r, c + 1, islandIndex, gridCopy, islands);
};
// island detection control
const setIslands = g => {
  const height = g.length;
  const width = g.length ? g[0].length : 0;
  let islandIndex = 0;
  const islands = new Array(height).fill(0).map(() => new Array(width).fill(0));
  const gridCopy = g.map(row => row.map(col => col));
  for (let r = 0; r < height; ++r) {
    for (let c = 0; c < width; ++c) {
      if (gridCopy[r][c] === 1) {
        islandIndex++;
        markIslandAsCounted(r, c, islandIndex, gridCopy, islands);
      }
    }
  }
  return islands;
};
//helper functions for add/remove classes to island
const parseIslandNumber = islandIn => {
  const island = parseInt(islandIn, 10);
  if (isNaN(island)) {
    return 0;
  } else {
    return island;
  }
};
const add = "add";
const remove = "remove";
const addClassToIsland = (islandStr, addClass) =>
  modClassOnIsland(islandStr, addClass, add);
const removeClassFromIsland = (
  islandStr,
  removeClass,
  clearInnerText = false
) => modClassOnIsland(islandStr, removeClass, remove, clearInnerText);
const modClassOnIsland = (islandStr, modClass, action, clearInnerText) => {
  const island = parseIslandNumber(islandStr);
  if (island !== 0) {
    const cellsInIsland = document.querySelectorAll(
      `.island[island="${island}"]`
    );
    for (let i = 0; i < cellsInIsland.length; ++i) {
      if (action === add) {
        cellsInIsland[i].classList.add(modClass);
      } else if (action === remove) {
        cellsInIsland[i].classList.remove(modClass);
        if (clearInnerText) {
          cellsInIsland[i].innerText = "";
        }
      }
    }
    return cellsInIsland.length;
  } else {
    return 0;
  }
};
// event handler - move into island
const puzzleEnter = cell =>
  addClassToIsland(cell.getAttribute("island"), "island--hover");
// event handler depart island
const puzzleLeave = cell =>
  removeClassFromIsland(cell.getAttribute("island"), "island--hover");
let lastIslandStr;
const puzzleClick = cell => {
  const islandStr = cell.getAttribute("island");
  //If clicked on island
  if (islandStr !== "0") {
    // if last island set ie not first time
    if (lastIslandStr) {
      removeClassFromIsland(lastIslandStr, "clicked", true);
    }
    // modClassOnIsland returns cell count
    cell.innerText = addClassToIsland(islandStr, "clicked");
    lastIslandStr = islandStr;
  }
};
const puzzleInit = g => {
  const islands = setIslands(g);
  const height = g.length;
  const width = g.length ? g[0].length : 0;
  const puzzle = document.getElementById("puzzle");
  let html = "";
  islands.forEach((row, rowIndex) => {
    html += "<tr>";
    row.forEach((islandNumber, colIndex) => {
      const prefix = islandNumber !== 0 ? "" : "not--";
      html += `<td class="${prefix}island" island="${islandNumber}" onclick="puzzleClick(this)" onmouseleave="puzzleLeave(this)" onmouseenter="puzzleEnter(this)">`;
      html += "</td>";
    });
    html += "</tr>";
  });
  puzzle.innerHTML = html;
};

document.addEventListener("DOMContentLoaded", () => {
  colorSliderChange();
  puzzleInit(grid);
});
