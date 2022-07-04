# Grouping with D3 Group vs Nest

In the newest release of d3 (7) nest is no longer included.

Nest used to be the way we would configure multilevel grouping, and although we can still
group multiple levels, the way it is used is slightly different.

Keep in mind that nest is still available, as part of the `d3-collection` package.
The newer grouping and rollup functions are part of the `d3-array` package.

## With `d3.nest`

d3.nest returns an object with additional functions to modify the grouping, and doesn't
actually perform the grouping until data is passed to one of the methods.

```javascript
d3.nest()
...
{object: ƒ, map: ƒ, entries: ƒ, key: ƒ, sortKeys: ƒ, …}
```

### What are these methods?

These methods are a mixture of `input` and `output` utilities that define how you want to group, and how the returned value will be.

#### Input

the `key` method _chains_ value accessor functions in the order that you want to group things, as wll as `sortKeys` and `sortValues` to define the order of the returned value

#### Output

`object`, `map`, and `entries` methods are meant to return a grouped value
from a dataset, but in different formats.

## With `d3.group` or `d3.groups`

On the other hand, `d3.group` initiates the grouping immediately via parameters, and returns
an `InternMap`, similar to the `map` function of nest.

`d3.groups` returns the same, but as an entry array as values instead of a map, similar to `nest.entries`

These functions require the dataset, and other configurations upfront,
whereas `d3.nest` returns an object you can define options individually.

```javascript
ƒ group(values, ...keys)
...
InternMap
```

---

## Working wth d3.hierarchy

when passing grouped values to the hierarchy function, using a d3.group instance works out of the box.

However for nest, we use the entries method, and wrap it with a fake "root node"

### Old way

Using `d3.nest`, we pass the entries inside of a root entry object:

```js
nester = d3
  .nest()
  .key((record) => record.type)
  .key((record) => record.level)

const values = nester.entries(dataset)

d3.hierarchy({ key: 'root', values }, (n) => n.values)
```

### New Way

Instead, we can pass an `d3.group` directly as the root source to the hierarchy function,
and it will generate a hierarchy just the same.

The only difference is the data values will be _Maps_ instead of _Objects_.

```js
const rootGroup = d3.group(
  dataset,
  (record) => record.type,
  (record) => record.level
)

d3.hierarchy(rootGroup)
```

_`Rollup` is also available as a separate function, with `rollups` as it's entries counterpart, as well as `groupSort`_

## Vue Reactivity

The idea is to observe an array of `valueOf` accessor methods that determine how the data will be grouped, and recalculate the groupings based on their order.

An accessor method mimics the

```javascript
export default {
  data: () => ({
    keys: ['name', 'age'],
  }),
  computed: {
    groupFunctions() {
      return Array.from(this.keys, (key) => (record) => record[key])
    },
  },
}
```

In this case, whenever the keys change, the groupFunctions update,
and we can apply a grouped object using either nest or group.

```javascript
export default {
  data: () => ({
    keys: ['name', 'age'],
  }),
  computed: {
    groupFunctions() {
      return Array.from(this.keys, (key) => (record) => record[key])
    },
    dataUsingNest() {
      const nester = d3.nest()

      for (let accessor of this.groupFunctions) {
        nester.key(accessor)
      }

      return nester.entries(this.dataset)
    },
    dataUsingGroup() {
      return d3.group(this.dataset, ...this.groupFunctions)
    },
  },
}
```

When these groupings change, a hierarchy is generated.

```javascript
export default {
  data: () => ({
    keys: ['name', 'age'],
  }),
  computed: {
    groupFunctions() {
      return Array.from(this.keys, (key) => (record) => record[key])
    },
    dataUsingNest() {
      const nester = d3.nest()

      for (let accessor of this.groupFunctions) {
        nester.key(accessor)
      }

      return nester.entries(this.dataset)
    },
    dataUsingGroup() {
      return d3.group(this.dataset, ...this.groupFunctions)
    },
    nestHierarchy() {
      return d3.hierarchy(
        {
          key: 'root',
          values: this.dataUsingNest,
        },
        (datum) => datum.values
      )
    },
    groupHierarchy() {
      return d3.hierarchy(this.dataUsingGroup)
    },
  },
}
```

## Breakdown

1. reactive array of ordered keys
2. computed grouping function from keys
3. computed hierarchy from the group function

P.S

There's many different ways to approach this, but keep in mind of Vue's reactivity approach, and large datasets..

The dataset itself shouldn't be fully reactive, as well as groups generated from your key order. Be careful about when the grouping is performed. You only want to generate the grouped hierarchy if the dataset or the key orders change. Other modifiers like hierarchical layouts can provide custom options like padding, but make sure that any layout adjustments will perform on the preexisting hierarchy **without generating a new one**.
