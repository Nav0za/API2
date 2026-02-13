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
        <NuxtLink
          class="flex items-center"
          to="/"
        >
          <img
            src="/image/rmutiLogo.png"
            class="h-12 w-auto mx-5"
            alt="RMUTI logo"
          >
          <span class="text-xl">ระบบจัดวันสอนชดเชย semi-auto</span>
        </NuxtLink>
      </template>

      <template #right>
        <UButton
          label="คู่มือ"
          icon="i-heroicons-information-circle"
          color="success"
          variant="ghost"
          to="/guide"
        />
        <UButton
          label="เทอม"
          icon="i-lucide-layers"
          color="warning"
          variant="ghost"
          to="/terms"
        />
        <UButton
        to="/sections"
        variant="ghost"
        color="secondary"
        label="กลุ่มนักศึกษา"
        icon="i-heroicons-users"
        />
        <UButton
        to="/rooms"
        variant="ghost"
        color="secondary"
        label="ห้องเรียน"
        icon="i-heroicons-building-office-2"
        />
        <UButton
        label="อาจารย์"
        icon="i-lucide-users"
        color="warning"
        variant="ghost"
        to="/teachers"
        />
        <UButton
          label="สรุปผล"
          icon="i-heroicons-chart-bar"
          color="info"
          variant="ghost"
          to="/summary"
        />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <AppFooter />
    <!-- <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built with Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter> -->
  </UApp>
</template>
