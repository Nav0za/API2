<template>
  <div class="min-h-screen bg-slate-50 py-20 flex flex-col justify-center">
    <div class="max-w-6xl mx-auto px-4 text-center">
      <div class="mb-12">
        <h1 class="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          ยินดีต้อนรับสู่ <br class="hidden md:block" />
          <span class="text-primary-600">ระบบจัดวันสอนชดเชยกึ่งอัตโนมัติ</span>
        </h1>
        <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          ระบบที่ช่วยอำนวยความสะดวกในการจัดการตารางเรียน ตารางสอน และตารางห้องเรียน
          พร้อมฟังก์ชั่นค้นหาวันและเวลาที่เหมาะสมสำหรับการสอนชดเชยของอาจารย์ได้อย่างอัตโนมัติ
        </p>
      </div>

      <div class="flex flex-wrap justify-center gap-6 text-left [&>a]:w-full md:[&>a]:w-[calc(50%-0.75rem)] lg:[&>a]:w-[calc(33.3333%-1rem)] items-stretch">
        <NuxtLink to="/guide" class="block group">
          <div
            class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-slate-300 hover:shadow-md hover:ring-1 hover:ring-slate-500 transition-all h-full flex flex-col">
            <div class="bg-slate-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-information-circle"
                class="w-8 h-8 text-slate-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">คู่มือการใช้งาน (Guide)</h3>
            <p class="text-slate-500 flex-grow font-medium leading-relaxed">
              ศึกษาเอกสารและกระบวนการทำงานเพื่อทำความเข้าใจทุกระบบย่อย และคำแนะนำการใช้งานอย่างละเอียด
            </p>
          </div>
        </NuxtLink>

        <NuxtLink to="/curriculums" class="block group">
          <div
            class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-teal-200 hover:shadow-md hover:ring-1 hover:ring-teal-500 transition-all h-full flex flex-col">
            <div class="bg-teal-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-academic-cap"
                class="w-8 h-8 text-teal-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">หลักสูตร (Curriculum)</h3>
            <p class="text-slate-500 flex-grow font-medium leading-relaxed">
              จัดการข้อมูลหลักสูตร วิชา และแผนการเรียน
            </p>
          </div>
        </NuxtLink>

        <NuxtLink to="/calendar" class="block group">
          <div
            class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-primary-200 hover:shadow-md hover:ring-1 hover:ring-primary-500 transition-all h-full flex flex-col">
            <div class="bg-primary-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-calendar"
                class="w-8 h-8 text-primary-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">ปฏิทินการสอน (Calendar)</h3>
            <p class="text-slate-500 flex-grow font-medium leading-relaxed">
              จัดตารางการสอนชดเชยอย่างอัตโนมัติ ภาพรวมกิจกรรมทั้งหมดในรูปแบบปฏิทิน
            </p>
          </div>
        </NuxtLink>

        <NuxtLink to="/sections" class="block group">
          <div
            class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md hover:ring-1 hover:ring-blue-500 transition-all h-full flex flex-col">
            <div class="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-lucide-table" class="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">ตารางเรียน (Sections)</h3>
            <p class="text-slate-500 flex-grow font-medium leading-relaxed">
              จัดการข้อมูลกลุ่มการเรียน (Section) และจัดการตารางเรียนของนักศึกษาแต่ละกลุ่มแยกตามภาคการศึกษาและปีการศึกษา
            </p>
          </div>
        </NuxtLink>

        <NuxtLink to="/teachers" class="block group">
          <div
            class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-green-200 hover:shadow-md hover:ring-1 hover:ring-green-500 transition-all h-full flex flex-col">
            <div class="bg-green-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-users"
                class="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">ตารางสอน (Teachers)</h3>
            <p class="text-slate-500 flex-grow font-medium leading-relaxed">
              จัดการข้อมูลอาจารย์ แสดงวิชาและกลุ่มเรียนที่ทำการสอน และตรวจสอบตารางการสอนรายบุคคล
            </p>
          </div>
        </NuxtLink>

        <NuxtLink to="/rooms" class="block group">
          <div
            class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-md hover:ring-1 hover:ring-orange-500 transition-all h-full flex flex-col">
            <div class="bg-orange-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-building-office-2"
                class="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">ตารางห้องเรียน (Rooms)</h3>
            <p class="text-slate-500 flex-grow font-medium leading-relaxed">
              ตรวจสอบการใช้งานห้องเรียนแต่ละห้องในช่วงเวลาต่างๆ เพื่อป้องกันและหลีกเลี่ยงการใช้ห้องซ้อนทับกัน
            </p>
          </div>
        </NuxtLink>

        <NuxtLink to="/terms" class="block group">
          <div
            class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-md hover:ring-1 hover:ring-purple-500 transition-all h-full flex flex-col">
            <div class="bg-purple-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-lucide-layers"
                class="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">ปีการศึกษา (Terms)</h3>
            <p class="text-slate-500 flex-grow font-medium leading-relaxed">
              จัดการปีการศึกษา ภาคการศึกษา วันเปิดและปิดภาคการศึกษา
            </p>
          </div>
        </NuxtLink>


      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'หน้าหลัก - ระบบจัดวันสอนชดเชยกึ่งอัตโนมัติ'
})
</script>
