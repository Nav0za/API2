<template>
  <div class="p-4">
    <h1 class="text-lg font-semibold mb-4">ตาราง 4x5</h1>
    <FormTerm13 />
    <div class="mt-4">
      <NuxtLink to="/" class="no-underline">
        <UButton label="กลับ" color="neutral" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import FormTerm13 from '~/components/FormTerm/13.vue'
</script>
