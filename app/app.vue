<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})
</script>

<template>
  <UApp class="bg-white text-slate-900 min-h-screen">
    <UHeader class="bg-slate-900 text-white border-b border-slate-200 shadow-sm">
      <template #left>
        <NuxtLink class="flex items-center" to="/">
          <img src="/image/logo it.png" class="h-11 w-auto mx-5" alt="RMUTI logo">
          <span class="text-xl">ระบบจัดวันสอนชดเชยกึ่งอัตโนมัติ</span>
        </NuxtLink>
      </template>

      <template #right>
        <UButton class="text-white" label="คู่มือ" size="xl" icon="i-heroicons-information-circle" color="primary"
          variant="ghost" :ui="{ leadingIcon: 'text-primary' }" to="/guide" />
        <UButton class="text-white" label="ปฏิทิน" size="xl" icon="i-heroicons-calendar" color="primary" variant="ghost"
          :ui="{ leadingIcon: 'text-primary' }" to="/" />
        <UButton class="text-white" label="หลักสูตร" size="xl" icon="i-heroicons-academic-cap" color="primary"
          variant="ghost" :ui="{ leadingIcon: 'text-primary' }" to="/curriculums" />
        <UButton class="text-white" label="ปีการศึกษา" size="xl" icon="i-lucide-layers" color="primary" variant="ghost"
          :ui="{ leadingIcon: 'text-primary' }" to="/terms" />
        <UButton class="text-white" to="/sections" size="xl" variant="ghost" color="primary" label="ตารางเรียน"
          :ui="{ leadingIcon: 'text-primary' }" icon="i-lucide-table" />
        <UButton class="text-white" to="/rooms" size="xl" variant="ghost" color="primary" label="ตารางห้องเรียน"
          :ui="{ leadingIcon: 'text-primary' }" icon="i-heroicons-building-office-2" />
        <UButton class="text-white" label="ตารางสอน" size="xl" icon="i-heroicons-table-cells" color="primary"
          variant="ghost" :ui="{ leadingIcon: 'text-primary' }" to="/teachers" />
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <AppFooter />
  </UApp>
</template>
