<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
      <div class="p-6 border-b border-slate-800">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
          ระบบจัดตาราง
        </h1>
        <p class="text-xs text-slate-400 mt-1">CS Table Scheduler</p>
      </div>

      <nav class="flex-1 p-4 space-y-2">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="$route.path === '/' ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
        >
          <UIcon name="i-lucide-calendar" class="text-xl" />
          <span class="font-medium">ปฏิทินการสอน</span>
        </NuxtLink>

        <NuxtLink
          to="/teachers"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="$route.path.startsWith('/teacher') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
        >
          <UIcon name="i-lucide-users" class="text-xl" />
          <span class="font-medium">อาจารย์</span>
        </NuxtLink>

        <NuxtLink
          to="/sections"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="$route.path.startsWith('/section') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
        >
          <UIcon name="i-heroicons-user-group" class="text-xl" />
          <span class="font-medium">กลุ่มเรียน</span>
        </NuxtLink>

         <NuxtLink
          to="/terms"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="$route.path.startsWith('/term') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
        >
          <UIcon name="i-lucide-layers" class="text-xl" />
          <span class="font-medium">เทอมการศึกษา</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        &copy; 2026 CS Scheduler
      </div>
    </aside>

    <!-- Mobile Header (Visible only on small screens) -->
    <div class="md:hidden fixed top-0 w-full bg-slate-900 h-16 z-50 flex items-center justify-between px-4">
       <span class="text-lg font-bold text-white">CS Scheduler</span>
       <UButton icon="i-lucide-menu" color="white" variant="ghost" @click="mobileMenuOpen = !mobileMenuOpen" />
    </div>

     <!-- Mobile Menu Overlay -->
    <div v-if="mobileMenuOpen" class="md:hidden fixed inset-0 z-50 bg-slate-900 bg-opacity-95 flex flex-col p-8">
       <div class="flex justify-end mb-8">
         <UButton icon="i-lucide-x" color="white" variant="ghost" @click="mobileMenuOpen = false" />
       </div>
       <nav class="space-y-4">
          <NuxtLink to="/" @click="mobileMenuOpen = false" class="block text-xl text-white py-2 border-b border-slate-700">ปฏิทินการสอน</NuxtLink>
          <NuxtLink to="/teachers" @click="mobileMenuOpen = false" class="block text-xl text-white py-2 border-b border-slate-700">อาจารย์</NuxtLink>
           <NuxtLink to="/sections" @click="mobileMenuOpen = false" class="block text-xl text-white py-2 border-b border-slate-700">กลุ่มเรียน</NuxtLink>
          <NuxtLink to="/terms" @click="mobileMenuOpen = false" class="block text-xl text-white py-2 border-b border-slate-700">เทอมการศึกษา</NuxtLink>
       </nav>
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 md:pl-0 pt-16 md:pt-0">
      <div class="flex-1 p-4 md:p-8 overflow-x-hidden">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
const mobileMenuOpen = ref(false)
</script>

<style scoped>
/* Add any layout specific styles here */
</style>
