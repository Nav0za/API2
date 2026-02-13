<template>
  <div class="grid-table">
    <table class="table">
      <tbody>
        <tr v-for="r in rows" :key="r">
          <td v-for="c in cols" :key="c">Row {{ r }} Col {{ c }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const rows = 4
const cols = 5
</script>

<style scoped>
.table { border-collapse: collapse; width: 100%; }
.table td { border: 1px solid #ccc; padding: 8px; text-align: center; }
</style>
