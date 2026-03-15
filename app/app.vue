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
    <UHeader class="bg-white text-slate-900 border-b border-slate-200 shadow-sm">
      <template #left>
        <NuxtLink class="flex items-center" to="/">
          <img src="/image/rmutiLogo.png" class="h-12 w-auto mx-5" alt="RMUTI logo">
          <span class="text-xl">ระบบจัดวันสอนชดเชยกึ่งอัตโนมัติ</span>
        </NuxtLink>
      </template>

      <template #right>
        <UButton class="text-slate-900" label="คู่มือ" size="xl" icon="i-heroicons-information-circle" color="primary"
          variant="ghost" to="/guide" />
        <UButton class="text-slate-900" label="เทอม" size="xl" icon="i-lucide-layers" color="primary" variant="ghost"
          to="/terms" />
        <UButton class="text-slate-900" to="/sections" size="xl" variant="ghost" color="primary" label="กลุ่มนักศึกษา"
          icon="i-heroicons-users" />
        <UButton class="text-slate-900" to="/rooms" size="xl" variant="ghost" color="primary" label="ห้องเรียน"
          icon="i-heroicons-building-office-2" />
        <UButton class="text-slate-900" label="อาจารย์" size="xl" icon="i-lucide-users" color="primary" variant="ghost"
          to="/teachers" />
        <UButton class="text-slate-900" label="สรุปผล" size="xl" icon="i-heroicons-chart-bar" color="primary"
          variant="ghost" to="/summary" />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <AppFooter />
  </UApp>
</template>
