<template>
  <div class="min-h-screen bg-slate-50 pb-20">
    <!-- ปฏิทินการสอน -->
    <AppCalendar :teachers="teachers || []" />
  </div>
</template>

<script setup>
const { data: teachers } = await useFetch('/api/teachers')
</script>
