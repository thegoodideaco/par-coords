# Automatic Parallel Coordinate Plots

![example](public%5Css1.png)

## Concept

The idea of a parallel coordinate chart is to _visualize large multidimensional sets of records._

Generally we are used to looking at tabular data in cells. We have rows and columns, and can sort and filter, but only see a fixed amount of records at any given time. Instead, we can use a parallel coordinate chart to see everything at once, to give us immediate insights at a glance.

Each column represents a `dimension` of the records that are numerical or chronological in value. Ticks are displayed on each column to show the range of values, with formatting based on the type of data it represents (i.e. number, date).

Lines are then drawn for every filtered record in order to visually see correlations and other patterns of the data as a whole.

## Loading any data

In order to use different datasets automatically, there are some rules:

> ### **Values cannot be undefined or NaN**
>
> Values must be naturally sortable so they have a designated position on the y axis. Empty or NaN values cannot be sorted

> ### **Values of a dimension must be the same type**
>
> A dimension of numbers should not have dates or strings mixed in with them.

> ### **Maximum amount of columns**
>
> Datasets could possibly have thousands of columns, we need to determine the best ones to use and limit the total amount of dimensions that can be made.

The first thing we do is sample 1000 records and determine the field types.

If fields are numeric or chronological, we choose the fields with the most unique values, and the least amount of null values.

Once we identify the dimensions to use, we create them inside of an empty crossfilter instance.

Next, we process the entire dataset in chunks. Each chunk is analyzed and cleaned, then added to crossfilter before loading the next chunk. When crossfilter adds these records, each dimension should update to give us new extents and summaries

Once we know the full extent of each dimension, we dispose of dimensions with 1 unique value, and start drawing the lines. Lines are cleared and redrawn if the data is filtered, chart is resized, or styling effects change. We don't want to start drawing lines as data is being added, because the extents will change so rapidly.

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
