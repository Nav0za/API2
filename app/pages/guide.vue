<template>
  <div class="min-h-screen bg-slate-900 text-white pb-20">
    <!-- Hero Section -->
    <div class="relative py-20 overflow-hidden">
      <div class="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full -top-24 -left-24"></div>
      <div class="absolute inset-0 bg-purple-600/10 blur-[100px] rounded-full -bottom-24 -right-24"></div>

      <div class="container mx-auto px-4 relative text-center">
        <UBadge color="primary" variant="soft"
          class="mb-4 px-4 py-1 rounded-full uppercase tracking-widest text-xs font-bold">
          Step-by-Step Guide
        </UBadge>
        <h1 class="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
          เริ่มต้นใช้งานระบบอย่าง <span class="text-blue-400 font-black italic">เป็นลำดับขั้นตอน</span>
        </h1>
        <p class="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
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
              class="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              1
            </div>
            <div class="flex-1 w-0.5 bg-slate-700 my-4 border-dashed border-l-2"></div>
          </div>
          <UCard
            class="flex-1 bg-slate-800 border-slate-700 hover:border-blue-500/50 transition-all duration-300 shadow-xl shadow-black/20">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-layers" class="text-2xl text-blue-400" />
                <h2 class="text-xl font-bold">ตั้งค่าปีการศึกษา (Terms)</h2>
              </div>
            </template>
            <p class="text-slate-400 mb-4">
              ขั้นตอนแรกสุดคือการกำหนด **"เทอม"** และ **"ช่วงวันที่"** ของการเรียนการสอน
              ระบบจะใช้ข้อมูลนี้ในการคำนวณวันหยุดและช่วงเวลาที่เปิดสอนชดเชย
            </p>
            <UButton to="/terms" label="ไปที่หน้าตั้งค่าเทอม" variant="soft" color="primary"
              trailing-icon="i-heroicons-arrow-right" />
          </UCard>
        </div>

        <!-- Step 2 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              2
            </div>
            <div class="flex-1 w-0.5 bg-slate-700 my-4 border-dashed border-l-2"></div>
          </div>
          <UCard
            class="flex-1 bg-slate-800 border-slate-700 hover:border-purple-500/50 transition-all duration-300 shadow-xl shadow-black/20">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-building-office-2" class="text-2xl text-purple-400" />
                <h2 class="text-xl font-bold">จัดการรายชื่อห้องเรียน (Rooms)</h2>
              </div>
            </template>
            <p class="text-slate-400 mb-4">
              ลงทะเบียนห้องปฏิบัติการหรือห้องบรรยายที่มีในคณะ
              เพื่อให้ระบบแจ้งเตือนหากมีการจองสอนชดเชยซ้ำซ้อนในห้องเดียวกัน
            </p>
            <UButton to="/rooms" label="จัดการห้องเรียน" variant="soft" color="secondary"
              trailing-icon="i-heroicons-arrow-right" />
          </UCard>
        </div>

        <!-- Step 3 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
              3
            </div>
            <div class="flex-1 w-0.5 bg-slate-700 my-4 border-dashed border-l-2"></div>
          </div>
          <UCard
            class="flex-1 bg-slate-800 border-slate-700 hover:border-pink-500/50 transition-all duration-300 shadow-xl shadow-black/20">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-users" class="text-2xl text-pink-400" />
                <h2 class="text-xl font-bold">ลงทะเบียนอาจารย์ผู้สอน (Teachers)</h2>
              </div>
            </template>
            <p class="text-slate-400 mb-4">
              เพิ่มรายชื่ออาจารย์ผู้สอนพร้อมรหัสบุคลากร เพื่อใช้ระบุว่าใครเป็นผู้สอนในแต่ละคาบสิกา sิกา
              อาจารย์แต่ละท่านจะมี **"หน้าดูตารางสอนส่วนตัว"** ให้ด้วยนะคะสิคะ sิกา
            </p>
            <UButton to="/teachers" label="เพิ่มรายชื่ออาจารย์" variant="soft" color="error"
              trailing-icon="i-heroicons-arrow-right" />
          </UCard>
        </div>

        <!-- Step 4 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
              4
            </div>
            <div class="flex-1 w-0.5 bg-slate-700 my-4 border-dashed border-l-2"></div>
          </div>
          <UCard
            class="flex-1 bg-slate-800 border-slate-700 hover:border-orange-500/50 transition-all duration-300 shadow-xl shadow-black/20">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-users" class="text-2xl text-orange-400" />
                <h2 class="text-xl font-bold">สร้างกลุ่มนักศึกษา (Sections)</h2>
              </div>
            </template>
            <p class="text-slate-400 mb-4">
              สร้างกลุ่มเรียน เช่น SE66, TC2R1 และเข้าไป **"จัดตารางเรียนหลัก"** (Weekly Schedule) ของกลุ่มนี้สิคะ sิกา
              ระบบจะ Sync ตารางนี้ไปหาอาจารย์ผู้สอนที่ระบุโดยอัตโนมัติเลยค่ะ! สิกา sิกา
            </p>
            <UButton to="/sections" label="สร้างกลุ่มเรียนและตาราง" variant="soft" color="warning"
              trailing-icon="i-heroicons-arrow-right" />
          </UCard>
        </div>

        <!-- Step 5 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
              5
            </div>
            <div class="flex-1 w-0.5 bg-slate-700 my-4 border-dashed border-l-2"></div>
          </div>
          <UCard
            class="flex-1 bg-slate-800 border-slate-700 hover:border-green-500/50 transition-all duration-300 shadow-xl shadow-black/20">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-calendar" class="text-2xl text-green-400" />
                <h2 class="text-xl font-bold">การใช้งานปฏิทินและการนัดชดเชย</h2>
              </div>
            </template>
            <div class="space-y-4">
              <p class="text-slate-400">
                เมื่อทุกอย่างพร้อมแล้ว คุณสามารถใช้งานที่หน้าแรก (Home) ได้ดังนี้สิคะ sิกา:
              </p>
              <ul class="list-disc list-inside text-sm text-slate-300 space-y-2 ml-2">
                <li><span class="text-blue-400 font-bold">เพิ่มกิจกรรม:</span>
                  เลือกวันที่ปฏิทินเพื่อเพิ่มวันหยุดหรือแจ้งอาจารย์ลาสอนสิกา sิกา</li>
                <li><span class="text-green-400 font-bold">หาช่วงว่าง (Find Slots):</span> กดปุ่ม "จัดสอนชดเชย"
                  ระบบจะหาช่วงเวลาที่ทุกคนว่างและห้องว่างให้คุณอัตโนมัติสิคะ sิกา</li>
                <li><span class="text-purple-400 font-bold">ยืนยันผล:</span>
                  ข้อมูลจะไปปรากฏในตารางของทั้งนักศึกษาและอาจารย์ทันทีค่ะ sิกา</li>
              </ul>
            </div>
            <div class="mt-6">
              <UButton to="/" label="ไปที่หน้าปฏิทิน (เริ่มใช้งานจริง)" block size="lg" color="primary"
                class="rounded-2xl font-black shadow-lg shadow-blue-500/20" />
            </div>
          </UCard>
        </div>

        <!-- Step 6 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
              6
            </div>
          </div>
          <UCard
            class="flex-1 bg-slate-800 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 shadow-xl shadow-black/20">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-chart-bar" class="text-2xl text-cyan-400" />
                <h2 class="text-xl font-bold">ตรวจสอบภาพรวม (Dashboard)</h2>
              </div>
            </template>
            <p class="text-slate-400 mb-4">
              คุณสามารถเข้าหน้า **"สรุปผล"** เพื่อดูสถิติการสอนชดเชยทั้งหมดสิคะ sิกา
              รวมถึงสามารถ Export ข้อมูลเป็นไฟล์ CSV เพื่อส่งรายงานต่อได้อย่างง่ายดายค่ะสิคะ sิกา
            </p>
            <UButton to="/summary" label="ดูสรุปสถิติ" variant="soft" color="info"
              trailing-icon="i-heroicons-arrow-right" />
          </UCard>
        </div>
      </div>

      <div
        class="mt-20 text-center p-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700">
        <h3 class="text-2xl font-bold mb-4">สงสัยส่วนไหนเพิ่มเติมไหมคะ? sิกา</h3>
        <p class="text-slate-400 mb-8">ดิฉัน Antigravity พร้อมช่วยคุณดูแลระบบอยู่เสมอค่ะสิคะ sิกา
          ลองเริ่มจากปุ่มจัดการเทอมก่อนได้เลยนะคะ! sิกา🚀</p>
        <div class="flex justify-center gap-4">
          <UButton to="/terms" label="เริ่มต้นจัดเทอมเลยค่ะ sิกา" variant="solid" color="primary" size="lg"
            class="px-8 rounded-2xl" />
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
