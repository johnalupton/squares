///////////////////////////////////////////////
// START OF UI HANDLING
///////////////////////////////////////////////

//input event handlers
//helper function to construct rgba string
const rgbStr = (r, g, b, o = 1) => `rgba(${r},${g},${b},${o})`;

// implements state cange when slider changes
// parameter color is ["r" | "g" | "b"]
// 1. set the text displaying the number selected - element id = [color_slider_" + color + "__value]
// 2. change the background color to reflect the new value - element id = [color_slider_" + color + "__color]
// 3. return the color chosen as used by calling function

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

////////////////////////////////////////////////////////////////////
// HELPER FUNCTION FOR CLASS MANIPULATION ON GRID CELLS
////////////////////////////////////////////////////////////////////
//helper functions for add/remove classes to island
// island number stored as an attrbute called "island" on cell (therfore a string)
// sensible to convert this to a number for onward processing
const parseIslandNumber = islandIn => {
  const island = parseInt(islandIn, 10);
  if (isNaN(island)) {
    return 0;
  } else {
    return island;
  }
};

// control flow enums
const add = "add";
const remove = "remove";

// pass through params adding contol enum "add"
const addClassToIsland = (islandStr, addClass) =>
  modClassOnIsland(islandStr, addClass, add);

// pass through params adding contol enum "remove"
// also instruct handler to clear text from all cells
const removeClassFromIsland = (
  islandStr,
  removeClass,
  clearInnerText = false
) => modClassOnIsland(islandStr, removeClass, remove, clearInnerText);

// handler to modify class on all cells in an island
// factored this out from Add/Remove as selector and loop is generic to both
// only diff is logic inside "for each"
// querySelectorAll on island attribute nicely slects the island and cellcount
// returns cell count for display in clicked cell
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
////////////////////////////////////////////////////////////////////
// END HELPER FUNCTION FOR CLASS MANIPULATION ON GRID CELLS
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// EVENT HANDLERS FOR CELLS AND SLIDERS
////////////////////////////////////////////////////////////////////
// Double click on the handle and it re-centres the slider
// call change method to reflect change of state
const colorSliderDblClick = slider => {
  console.log(slider);
  slider.value = 127;
  colorSliderChange();
};

// handle change of state
// called when single slider changes or to initialise
// some redundant calls but as performance not an issue makes code much simpler
// could probably refactor this
// *** SUPER IMPORTANT :
// We have to dynamically set a CSS selector. Quickest way to get the style element is to
// give the element an ID so in the HTML tehre is an element defined
// <style id="island-style"></style>
// this makes it the search for the style element unambiguos and efficient
const colorSliderChange = () => {
  const r = setSlider("r");
  const g = setSlider("g");
  const b = setSlider("b");

  // Find <style id="island-style"></style>
  // opacty set to 0.5 so that "on hover" it can darken but keep same colour

  const html =
    `td.island {background-color: ${rgbStr(r, g, b, 0.7)};}` +
    `td.island--hover:not(.clicked) {background-color: ${rgbStr(r, g, b)};}`;

  document.getElementById("island-style").innerHTML = html;
};

// handle change of state for size of puzzle
// Calls newGrid(n) - creates a new island grid n by n
// Outputs grid with call to gridInit
const sizeSliderChange = slider => {
  document.getElementById("size_slider__value").innerText = slider.value;
  gridInit(newGrid(parseInt(slider.value, 10)));
};

// event handler - move into island
const puzzleEnter = cell =>
  addClassToIsland(cell.getAttribute("island"), "island--hover");
// event handler depart island
const puzzleLeave = cell =>
  removeClassFromIsland(cell.getAttribute("island"), "island--hover");

// super important global variable: maintains last island we clicked on
// needed to determine if we need to removed the "clicked" i.e. currently selected
// class from the previously clickied island
let lastIslandStr;

// event handler when cell clicked
// passed cell which is the clicked cell
// get the "island" attribute from the cell
// if island !== "0" then we know we have clicked an island
// if we are clicking on a different island from last time remove the "clicked" classe from that island
// and add "clicked" to this island
// function to add classes returns number of cells on the island
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
////////////////////////////////////////////////////////////////////
// END OF EVENT HANDLERS FOR CELLS AND SLIDERS
////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////
// END OF UI HANDLING
///////////////////////////////////////////////

///////////////////////////////////////////////
// START OF PUZZLE HANDLING
///////////////////////////////////////////////
// initial puzzle grid
const grid = [
  [0, 0, 0, 0, 1],
  [1, 1, 0, 0, 0],
  [1, 1, 0, 1, 1],
  [0, 0, 0, 0, 0],
  [1, 1, 1, 0, 0]
];
// CREATE NEW RANDOM GRID
const newGrid = size =>
  new Array(size)
    .fill(0)
    .map(row =>
      new Array(size).fill(0).map(val => Math.floor(Math.random() * 2))
    );

// recursively resolve conjoined cells for given starting cell at position (r, c)
// islandsIndex is the ordinal to identfy this island
// gridCopy is output copy of input grid so as not to mutate ...
// ... islands, the input grid
// if finds a non-empty cell starts process of eminating out from that cell
// by recursively calling itself in up/down/left/right directions
// essentially finding the boundary in each direction from initially found cell
// maintains gridCopy so as not to mutate input array
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
// island detection control methid
// input is g, initial grid
// islands is array of islands with each island reprsented by its ordinal number not a simple "1"
//
const setIslands = g => {
  const height = g.length;
  const width = g.length ? g[0].length : 0;

  // ordinal incrementing eaxh time island is found
  //used to identify each island
  let islandIndex = 0;

  //make empty array to hold identified islands
  const islands = new Array(height).fill(0).map(() => new Array(width).fill(0));
  //copy input grid
  const gridCopy = g.map(row => row.map(col => col));

  // step through grid and start process of mapping island each time
  // an island is found, i.e. cell value === 1
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
///////////////////////////////////////////////
// END OF PUZZLE HANDLING
///////////////////////////////////////////////

///////////////////////////////////////////////
// PUZZLE RENDERING
///////////////////////////////////////////////

// set up puzzle as a table element
// create isalnds array
// input array of
// [
// [0, 0, 0, 0, 1],
// [1, 1, 0, 0, 0],
// [1, 1, 0, 1, 1],
// [0, 0, 0, 0, 0],
// [1, 1, 1, 0, 0]
// ]
// returns array of islands identified by ordinal
// [
// [0, 0, 0, 0, 1],
// [2, 2, 0, 0, 0],
// [2, 2, 0, 3, 3],
// [0, 0, 0, 0, 0],
// [4, 4, 4, 0, 0]
// ]
//
// each cell is given class of ["island" | "not--island"] to control formatting
// plus attribute island = "{island number}" - enables counting of island cells when required
// and selection of all cells on the island to handle click/hover formating
const gridInit = g => {
  const islands = setIslands(g);

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
///////////////////////////////////////////////
// END OF PUZZLE RENDERING
///////////////////////////////////////////////

// When DOM built initialise the rendering
document.addEventListener("DOMContentLoaded", () => {
  colorSliderChange();
  gridInit(grid);
});
