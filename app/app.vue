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
        <img src="/image/rmutiLogo.png" class="h-12 w-auto mx-5" alt="RMUTI logo">
        <NuxtLink to="/">
          <h1 class="text-xl">ระบบจัดวันสอนชดเชย semi-auto</h1>
        </NuxtLink>
      </template>

      <template #right>
        <UButton
          to="/teacherTable"
          variant="text"
          color="secondary"
          label="add teacher"
        />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
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
    </UFooter>
  </UApp>
</template>
