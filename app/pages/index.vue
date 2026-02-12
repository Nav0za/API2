<template>
  <div class="h-full">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">ปฏิทินการสอน</h1>
        <p class="text-slate-500 mt-1">สรุปภาพรวมตารางสอนของอาจารย์ทั้งหมด</p>
      </div>
      
      <div class="flex gap-3">
        <UButton
          label="อาจารย์"
          icon="i-lucide-users"
          color="gray"
          variant="ghost"
          to="/teachers"
        />
        <UButton
          label="รายการชดเชย"
          icon="i-heroicons-clipboard-document-list"
          color="gray"
          variant="ghost"
          to="/makeup-classes"
        />
        <UButton
          label="เทอม"
          icon="i-lucide-layers"
          color="gray"
          variant="ghost"
          to="/terms"
        />
      </div>
    </div>

    <!-- ปฏิทินการสอน -->
    <UCard :ui="{ body: { padding: 'p-0' } }" class="overflow-hidden border-slate-200">
      <AppCalendar :teachers="teachers || []" />
    </UCard>
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
