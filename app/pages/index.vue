<template>
  <div class="min-h-screen bg-slate-900 pb-20">
    <!-- ปฏิทินการสอน -->
    <AppCalendar :teachers="teachers || []" />
  </div>
</template>

<script setup>
// Home page now only focuses on the Calendar view
// Teacher data is still needed for the calendar filtering/display
const { data: teachers } = await useFetch('/api/teachers')
</script>

<style scoped>
/* Page specific styles */
</style>
