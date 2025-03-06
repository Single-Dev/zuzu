<script setup>
import SideBar from './components/SideBar.vue';
</script>

<template>
  <div>
    <SideBar />
    <router-view></router-view>
  </div>
</template>

<style scoped>
  div {
    display: flex;
  }
</style>
