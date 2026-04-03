<template>
  <BackButton to="/" />
  <div class="min-h-screen bg-white text-slate-900 pb-20">
    <!-- Hero Section -->
    <div class="relative py-20 overflow-hidden">
      <div class="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full -top-24 -left-24" />
      <div class="absolute inset-0 bg-purple-500/5 blur-[100px] rounded-full -bottom-24 -right-24" />

      <div class="container mx-auto px-4 relative text-center">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-4 px-4 py-1 rounded-full uppercase tracking-widest text-xs font-bold"
        >
          Step-by-Step Guide
        </UBadge>
        <h1 class="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
          เริ่มต้นใช้งานระบบอย่าง <span class="text-blue-600 font-black italic">เป็นลำดับขั้นตอน</span>
        </h1>
        <p class="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          ยินดีต้อนรับสู่ระบบจัดการสอนชดเชยกึ่งอัตโนมัติ
          นี่คือลำดับขั้นตอนการตั้งค่าเพื่อให้ระบบทำงานได้อย่างสมบูรณ์
        </p>
      </div>
    </div>

    <!-- Timeline Flow -->
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="space-y-12">
        <!-- Step 1 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform"
            >
              1
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-blue-500/50 transition-all duration-300 shadow-xl shadow-slate-100"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-lucide-layers"
                  class="text-2xl text-blue-600"
                />
                <h2 class="text-xl font-bold text-slate-900">
                  ตั้งค่าปีการศึกษา (Terms)
                </h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              ขั้นตอนแรกสุดคือการกำหนด เทอม และ ช่วงวันที่ ของการเรียนการสอนในเทอมนั้น ๆ
              ระบบจะใช้ข้อมูลนี้ในการคำนวณวันหยุดและช่วงเวลาที่เปิดสอนชดเชย และเก็บข้อมูลต่าง ๆ ไว้ในแต่ละเทอมนั้น
            </p>
            <UButton
              to="/terms"
              label="ไปที่หน้าตั้งค่าเทอม"
              variant="soft"
              color="primary"
              size="xl"
              trailing-icon="i-heroicons-arrow-right"
            />
          </UCard>
        </div>

        <!-- Step 2 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform"
            >
              2
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-purple-500/50 transition-all duration-300 shadow-xl shadow-slate-100"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-heroicons-building-office-2"
                  class="text-2xl text-purple-600"
                />
                <h2 class="text-xl font-bold text-slate-900">
                  จัดการรายชื่อห้องเรียน (Rooms)
                </h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              ลงทะเบียนห้องปฏิบัติการหรือห้องบรรยายที่มีในคณะ
              เพื่อให้ระบบแจ้งเตือนหากมีการจองสอนชดเชยซ้ำซ้อนในห้องเดียวกัน
            </p>
            <UButton
              to="/rooms"
              label="จัดการห้องเรียน"
              variant="soft"
              color="primary"
              size="xl"
              trailing-icon="i-heroicons-arrow-right"
            />
          </UCard>
        </div>

        <!-- Step 3 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform"
            >
              3
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-pink-500/50 transition-all duration-300 shadow-xl shadow-slate-100"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-lucide-users"
                  class="text-2xl text-pink-600"
                />
                <h2 class="text-xl font-bold text-slate-900">
                  ลงทะเบียนอาจารย์ผู้สอน (Teachers)
                </h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              เพิ่มรายชื่ออาจารย์ผู้สอนพร้อมรหัสบุคลากร เพื่อใช้ระบุว่าใครเป็นผู้สอนในแต่ละคาบ
              อาจารย์แต่ละท่านจะมี **"หน้าดูตารางสอนส่วนตัว"** ให้ด้วย
            </p>
            <UButton
              to="/teachers"
              label="เพิ่มรายชื่ออาจารย์"
              variant="soft"
              color="primary"
              size="xl"
              trailing-icon="i-heroicons-arrow-right"
            />
          </UCard>
        </div>

        <!-- Step 4 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform"
            >
              4
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-orange-500/50 transition-all duration-300 shadow-xl shadow-slate-100"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-heroicons-users"
                  class="text-2xl text-orange-600"
                />
                <h2 class="text-xl font-bold text-slate-900">
                  สร้างกลุ่มนักศึกษา (Sections)
                </h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              สร้างกลุ่มเรียน เช่น SE66, TC2R1 และเข้าไป **"จัดตารางเรียนหลัก"** (Weekly Schedule) ของกลุ่มนี้
              ระบบจะ Sync ตารางนี้ไปหาอาจารย์ผู้สอนที่ระบุโดยอัตโนมัติ
            </p>
            <UButton
              to="/sections"
              label="สร้างกลุ่มเรียนและตาราง"
              variant="soft"
              color="primary"
              size="xl"
              trailing-icon="i-heroicons-arrow-right"
            />
          </UCard>
        </div>

        <!-- Step 5 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform"
            >
              5
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-green-500/50 transition-all duration-300 shadow-xl shadow-slate-100"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-heroicons-calendar"
                  class="text-2xl text-green-600"
                />
                <h2 class="text-xl font-bold text-slate-900">
                  การใช้งานปฏิทินและการนัดชดเชย
                </h2>
              </div>
            </template>
            <div class="space-y-4">
              <p class="text-slate-600">
                เมื่อทุกอย่างพร้อมแล้ว คุณสามารถใช้งานที่หน้าแรก (Home) ได้ดังนี้:
              </p>
              <ul class="list-disc list-inside text-sm text-slate-500 space-y-2 ml-2">
                <li>
                  <span class="text-blue-600 font-bold">เพิ่มกิจกรรม:</span>
                  เลือกวันที่ปฏิทินเพื่อเพิ่มวันหยุดหรือแจ้งอาจารย์ลาสอน
                </li>
                <li>
                  <span class="text-green-600 font-bold">หาช่วงว่าง (Find Slots):</span> กดปุ่ม "จัดสอนชดเชย"
                  ระบบจะหาช่วงเวลาที่ทุกคนว่างและห้องว่างให้คุณอัตโนมัติ
                </li>
                <li>
                  <span class="text-purple-600 font-bold">ยืนยันผล:</span>
                  ข้อมูลจะไปปรากฏในตารางของทั้งนักศึกษาและอาจารย์ทันที
                </li>
              </ul>
            </div>
            <div class="mt-6">
              <UButton
                to="/"
                label="ไปที่หน้าปฏิทิน (เริ่มใช้งานจริง)"
                block
                size="xl"
                color="primary"
                class="rounded-2xl font-black shadow-lg shadow-blue-500/20"
              />
            </div>
          </UCard>
        </div>

        <!-- Step 6 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform"
            >
              6
            </div>
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-cyan-500/50 transition-all duration-300 shadow-xl shadow-slate-100"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-heroicons-chart-bar"
                  class="text-2xl text-cyan-600"
                />
                <h2 class="text-xl font-bold text-slate-900">
                  ตรวจสอบภาพรวม (Dashboard)
                </h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              คุณสามารถเข้าหน้า **"สรุปผล"** เพื่อดูสถิติการสอนชดเชยทั้งหมด
              รวมถึงสามารถ Export ข้อมูลเป็นไฟล์ CSV เพื่อส่งรายงานต่อได้อย่างง่ายดาย
            </p>
            <UButton
              to="/summary"
              label="ดูสรุปสถิติ"
              variant="soft"
              color="primary"
              size="xl"
              trailing-icon="i-heroicons-arrow-right"
            />
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'คู่มือการใช้งาน - Semi-Auto Makeup System'
})
</script>
