# Grouping with D3 Group vs Nest

In the newest release of d3 (7) nest is no longer included.

Nest used to be the way we would configure multilevel grouping, and although we can still group multiple levels, the way it is used is slightly different.

## With `d3.nest`

d3.nest returns an object with additional functions to modify the grouping, and doesn't actually perform the grouping until data is passed to one of the methods.

```js
d3.nest()
...
{object: ƒ, map: ƒ, entries: ƒ, key: ƒ, sortKeys: ƒ, …}
```

## With `d3.group` or `d3.groups`

On the other hand, `d3.group` initiates the grouping immediately, and returns an `InternMap`, similar to the `map` function of nest.

`d3.groups` returns the same, but as an entry array as values instead of a map, similar to `nest.entries`

This groups everything the same, but immediately returns the result as an InternMap or an entry array.

```js
ƒ group(values, ...keys)
...
InternMap
```

## Working wth d3.hierarchy

### Old way

Using d3.nest, we pass the entries inside of a root entry object:

```js
nester = d3
  .nest()
  .key((record) => record.type)
  .key((record) => record.level)

d3.hierarchy({ key: 'root', values: nester.entries(dataset) }, (n) => n.values)
```

### New Way

Fortunately, we can pass an InternMap as the root source to the hierarchy function, and it will generate a hierarchy just the same.

```js
d3.hierarchy(
  d3.group(
    dataset,
    (record) => record.type,
    (record) => record.level
  )
)
```

## Vue Reactivity

The idea is to observe an array of keys that determine how the data will be grouped, and recalculate the groupings based on their order.

### With Nest

With nest, we created a computed property that returned a reactive nest object. Anytime the order of keys would change, this would return a fresh nester object

```js

```

### With group

Using group, we call it directly, and it returns a group immediately. Instead of returning an object with a grouping method, we return a method instead.

```js

```

### Breakdown

1. reactive array of ordered keys
2. computed grouping function from keys
3. computed hierarchy from the group function

P.S

There's many different ways to approach this, but keep in mind of Vue's reactivity approach, and large datasets..

The dataset itself shouldn't be fully reactive, as well as groups generated from your key order. Passing around methods that return objects instead of the objects themselves. Or using something like the composition api, you can take advantage of shallowRefs, and markRaw to avoid observing too many things.
