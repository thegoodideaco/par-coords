# grouping-example

## Things to do

- Filter columns that have one unique value.
- Limit the total amount of columns that can be made.
- Cleanup main code and pass composables better.
- Cleanup the main UI layout, add areas for inputs, table display
- Create instructions modal

- Make composables for crossfilter logic
  - Creating crossfilter
    - Optional onFilter param
  - Create dimension
    - reactive top or bottom lists (records)
  - Create Dimension Group
    - reactive top or bottom lists (aggregates)

## Missing features

We should be able to get some useful information about our current filtering to display.

- Showing Dataset Name, Amount of records
- Amount currently filtered
- Quartiles of each dimension column, to find outliers, and to normalize the yScales
- Total / filtered extents of columns being filtered
- Averages of each column

Some ui to help customize the appearance:

- Ordering columns
- Removing columns
- Sorting column order
- Providing alphanumerical dimensions
- Adjusting line thickness
- Adjusting line color
- Adjusting line opacity
- Line curvature
- Top offset / limit

Additional functionality:

- Saving filtered data
- Searching based on categorical values
- Custom eval input to provide advanced style adjustments functions
- Clearing all filters

## Par coords ✔

The par coords component is made up of the following:

### Brushes ✔

Each column will const of a brush, that will allow the user to select a vertical range.

We should extend this component to be used for x, y, and both x y. But can integrate vertical brushing first

### Ticks ✔

Each column will also have ticks that should provide nicely spaced out values

### Field Columns ✔

These columns should contain a brush and a tick component, should emit events based on it's range selection

### Line Renderer ✔

The line renderer will display all of the records values.

SVG for now, but want to build on webgl

Coloring, stroke size, and other style attributes should be extendable.

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn dev
```

### Compiles and minifies for production

```
yarn build
```

### Compile and hot-reloads storybook

```
yarn sb
```

### Lints and fixes files

```
yarn lint
```
