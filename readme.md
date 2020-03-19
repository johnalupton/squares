# Squares Task

## Key Design Decisions

1. Identifying the islands

- The problem is solved in a way that does not mutate the input data

- An array is created that identifies the islands BEFORE rendering reason being

  - This creates simpler code as the processing of identifying an island is done once before render not every time a click is made

  - This reflects reality: state does not change during the user interaction

  - This involves pre processing before render but the lag is negligible

**Input array**

`[ [0, 0, 0, 0, 1],`

`[1, 1, 0, 0, 0],`

`[1, 1, 0, 1, 1],`

`[0, 0, 0, 0, 0],`

`[1, 1, 1, 0, 0] ]`

**returns array of islands identified by ordinal**

`[ [0, 0, 0, 0, 1],`

`[2, 2, 0, 0, 0],`

`[2, 2, 0, 3, 3],`

`[0, 0, 0, 0, 0],`

`[4, 4, 4, 0, 0] ]`

2. Handling UI with the grid

- The grid is rendered as a `<table>` and `innerHtml` is set for each cell - given the simplicity of the rquirements the solution is fit-for-purpose: May consider using `display: grid` or `display: flex` in alternative problems

- Each cell is styled with a `[class island | not--island]` to help style and select when responding to events.

- Also each cell is given an attribute `island` with the island ordinal number so that all cells in a given island can be easily identified with css selctors and JavaScript `querySelectorAll`

## Technical set up

1. Vendor prefixes added using SCSS mixins for `moz` and `webkit`

2. Simple `HTML` file with `sass` styling - separate files in the project but compiled to a single `styles.css` for presentation on codepen

3. Javascript is fully commented to show detailed implementation logic and design decisions

Have Fun! :clown_face:

John
