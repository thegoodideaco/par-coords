<template>
  <div
    id="app"
    class="font-primary">
    <nav>
      <router-link to="/">
        Home
      </router-link> |
      <router-link to="/about">
        Grouping Tool
      </router-link>
      <router-link to="/par-coords">
        Par Coords
      </router-link>
    </nav>
    <div class="content-area">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss" scoped>
nav {
  position: relative;
  border-bottom: 1px solid rgba(#444, 0.25);
  padding: 1rem;
  box-shadow: 0 2px 2px rgba(#000, 0.15);
}

#app {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;

  .content-area {
    position: relative;
  }
}
</style>
