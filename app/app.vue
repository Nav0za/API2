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
  <UApp>
    <UHeader class="bg-slate-900 text-white border-none shadow-md shadow-slate-600/60">
      <template #left>
        <NuxtLink class="flex items-center" to="/">
          <img src="/image/rmutiLogo.png" class="h-12 w-auto mx-5" alt="RMUTI logo">
          <span class="text-xl">ระบบจัดวันสอนชดเชยกึ่งอัตโนมัติ</span>
        </NuxtLink>
      </template>

      <template #right>
        <UButton class="text-white" label="คู่มือ" size="xl" icon="i-heroicons-information-circle" color="primary"
          variant="ghost" to="/guide" />
        <UButton class="text-white" label="เทอม" size="xl" icon="i-lucide-layers" color="primary" variant="ghost"
          to="/terms" />
        <UButton class="text-white" to="/sections" size="xl" variant="ghost" color="primary" label="กลุ่มนักศึกษา"
          icon="i-heroicons-users" />
        <UButton class="text-white" to="/rooms" size="xl" variant="ghost" color="primary" label="ห้องเรียน"
          icon="i-heroicons-building-office-2" />
        <UButton class="text-white" label="อาจารย์" size="xl" icon="i-lucide-users" color="primary" variant="ghost"
          to="/teachers" />
        <UButton class="text-white" label="สรุปผล" size="xl" icon="i-heroicons-chart-bar" color="primary"
          variant="ghost" to="/summary" />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <AppFooter />
  </UApp>
</template>
