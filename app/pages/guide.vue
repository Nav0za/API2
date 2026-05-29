<template>
  <BackButton to="/" />
  <div class="min-h-screen bg-slate-50 text-slate-900 pb-20">
    <!-- Hero Section -->
    <div class="relative py-20 overflow-hidden">
      <div class="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full -top-24 -left-24" />
      <div class="absolute inset-0 bg-purple-500/5 blur-[100px] rounded-full -bottom-24 -right-24" />

      <div class="container mx-auto px-4 relative text-center">
        <UBadge color="primary" variant="soft"
          class="mb-4 px-4 py-1 rounded-full uppercase tracking-widest text-xs font-bold">
          Step-by-Step Guide
        </UBadge>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
          ลำดับขั้นตอนการตั้งค่า<span class="text-primary-600 font-black">ระบบจัดวันสอนชดเชย</span>
        </h1>
        <p class="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          เพื่อให้ระบบทำงานได้อย่างถูกต้องและสมบูรณ์
          กรุณาตั้งค่าระบบตามลำดับขั้นตอนตั้งแต่เริ่มต้นจนถึงการจัดตารางสอนชดเชย
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
              class="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
              1
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-teal-500/50 transition-all duration-300 shadow-xl shadow-slate-100">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-academic-cap" class="text-2xl text-teal-600" />
                <h2 class="text-xl font-bold text-slate-900">เพิ่มหลักสูตร</h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              เริ่มต้นด้วยการสร้างโครงสร้างหลักสูตรของสาขาวิชา
              เพื่อเป็นฐานข้อมูลสำหรับการนำรายวิชาและแผนการเรียนมาผูกเข้าด้วยกัน
            </p>
            <UButton to="/curriculums" label="จัดการหลักสูตร" variant="soft" color="teal" size="lg"
              trailing-icon="i-heroicons-arrow-right" />
          </UCard>
        </div>

        <!-- Step 2 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              2
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-blue-500/50 transition-all duration-300 shadow-xl shadow-slate-100">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-book-open" class="text-2xl text-blue-600" />
                <h2 class="text-xl font-bold text-slate-900">เพิ่มรายวิชาในหลักสูตร และกำหนดหน่วยกิต</h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              เมื่อมีโครงสร้างหลักสูตรแล้ว ให้ทำการเพิ่มรายวิชาทั้งหมดที่อยู่ในหลักสูตรนั้นๆ พร้อมกับระบุรหัสวิชา
              ชื่อวิชา
              และจำนวนหน่วยกิตให้ถูกต้อง
            </p>
          </UCard>
        </div>

        <!-- Step 3 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              3
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-indigo-500/50 transition-all duration-300 shadow-xl shadow-slate-100">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-map" class="text-2xl text-indigo-600" />
                <h2 class="text-xl font-bold text-slate-900">เพิ่มแผนการเรียน</h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              กำหนดแผนการเรียนว่าในแต่ละชั้นปีหรือแต่ละหมวดหมู่ มีแผนย่อยๆ อะไรบ้าง (เช่น แผนปกติ, แผนสหกิจ ฯลฯ)
              เพื่อให้กลุ่มนักศึกษาสามารถนำไปเชื่อมโยงได้
            </p>
          </UCard>
        </div>

        <!-- Step 4 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-violet-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
              4
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-violet-500/50 transition-all duration-300 shadow-xl shadow-slate-100">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-calendar-days" class="text-2xl text-violet-600" />
                <h2 class="text-xl font-bold text-slate-900">เพิ่มวิชาในแผนแต่ละเทอม และกำหนดชั่วโมงเรียน</h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              นำวิชาจากหลักสูตรมาจัดสรรลงในแผนการเรียนแต่ละเทอม
              พร้อมทั้งกำหนดจำนวนชั่วโมงทฤษฎีและชั่วโมงปฏิบัติของรายวิชานั้นๆ
              ให้ชัดเจน
            </p>
            <UButton to="/curriculums" label="ไปยังเนื้อหาหลักสูตรและแผนการเรียน" variant="soft" color="violet"
              size="lg" trailing-icon="i-heroicons-arrow-right" />
          </UCard>
        </div>

        <!-- Step 5 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              5
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-purple-500/50 transition-all duration-300 shadow-xl shadow-slate-100">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-layers" class="text-2xl text-purple-600" />
                <h2 class="text-xl font-bold text-slate-900">เพิ่มปีการศึกษา (Terms)</h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              ตั้งค่าปีการศึกษาที่เปิดสอน เช่น 1/2567 และกำหนดช่วงวันเปิด-ปิดภาคเรียน
              เพื่อให้ระบบคำนวณวันทำการได้อย่างถูกต้อง
            </p>
            <UButton to="/terms" label="จัดการปีการศึกษา" variant="soft" color="purple" size="lg"
              trailing-icon="i-heroicons-arrow-right" />
          </UCard>
        </div>

        <!-- Step 6 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
              6
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-pink-500/50 transition-all duration-300 shadow-xl shadow-slate-100">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-users" class="text-2xl text-pink-600" />
                <h2 class="text-xl font-bold text-slate-900">เพิ่มกลุ่มเรียน (Sections)</h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              สร้างกลุ่มเรียนจริงของนักศึกษา (เช่น SE66, เทคโนโลยีคอมพิวเตอร์)
              และผูกกลุ่มเรียนเข้ากับแผนการเรียนที่สร้างไว้ก่อนหน้า
            </p>
            <UButton to="/sections" label="จัดการกลุ่มเรียน" variant="soft" color="pink" size="lg"
              trailing-icon="i-heroicons-arrow-right" />
          </UCard>
        </div>

        <!-- Step 7 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
              7
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-rose-500/50 transition-all duration-300 shadow-xl shadow-slate-100">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-users" class="text-2xl text-rose-600" />
                <h2 class="text-xl font-bold text-slate-900">เพิ่มอาจารย์ (Teachers)</h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              เพิ่มรายชื่ออาจารย์ผู้สอนพร้อมกับจัดการรายวิชาที่อาจารย์แต่ละท่านต้องรับผิดชอบสอนในเทอมนั้นๆ
            </p>
            <UButton to="/teachers" label="จัดการข้อมูลอาจารย์" variant="soft" color="rose" size="lg"
              trailing-icon="i-heroicons-arrow-right" />
          </UCard>
        </div>

        <!-- Step 8 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
              8
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-orange-500/50 transition-all duration-300 shadow-xl shadow-slate-100">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-building-office-2" class="text-2xl text-orange-600" />
                <h2 class="text-xl font-bold text-slate-900">เพิ่มห้องเรียน (Rooms)</h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              บันทึกข้อมูลห้องปฏิบัติการและห้องบรรยายเข้าสู่ระบบ
              เพื่อให้ระบบตรวจสอบความว่างของห้องได้ในขั้นตอนการจัดตาราง
            </p>
            <UButton to="/rooms" label="จัดการห้องเรียน" variant="soft" color="orange" size="lg"
              trailing-icon="i-heroicons-arrow-right" />
          </UCard>
        </div>

        <!-- Step 9 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              9
            </div>
            <div class="flex-1 w-0.5 bg-slate-200 my-4 border-dashed border-l-2" />
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 hover:border-amber-500/50 transition-all duration-300 shadow-xl shadow-slate-100">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-table" class="text-2xl text-amber-600" />
                <h2 class="text-xl font-bold text-slate-900">เพิ่มตารางเรียนและลงตาราง (Schedules)</h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              ประกอบร่างทุกอย่างเข้าด้วยกัน โดยการเข้าไปที่เมนูกลุ่มเรียน แล้วเพิ่มคาบเรียนลงในตารางเรียน
              ระบุอาจารย์ผู้สอน
              และห้องเรียน เมื่อจัดตารางเรียนหลักเสร็จสิ้น ระบบจะกระจายข้อมูลไปเชื่อมต่อกับอาจารย์และห้องเรียนต่างๆ
              อัตโนมัติ
            </p>
            <UButton to="/sections" label="เริ่มต้นจัดตารางเรียน" variant="soft" color="amber" size="lg"
              trailing-icon="i-heroicons-arrow-right" />
          </UCard>
        </div>

        <!-- Step 10 -->
        <div class="flex flex-col md:flex-row gap-8 group">
          <div class="flex flex-col items-center">
            <div
              class="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
              10
            </div>
          </div>
          <UCard
            class="flex-1 bg-white border-slate-200 border-2 hover:border-green-500/50 transition-all duration-300 shadow-2xl shadow-green-500/10">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-calendar" class="text-2xl text-green-600" />
                <h2 class="text-xl font-bold text-slate-900">เริ่มจัดสอนชดเชยที่หน้าปฏิทิน</h2>
              </div>
            </template>
            <p class="text-slate-600 mb-4">
              เมื่อตารางเรียนทั้งหมดถูกจัดเตรียมแล้ว คุณสามารถเริ่มใช้ระบบนัดหมายสอนชดเชยแบบอัตโนมัติ
              เพิ่มกิจกรรมการแจ้งลา และค้นหาสล็อตเวลาที่ว่างตรงกันในหน้าปฏิทินแบบ Interactive ได้ทันที
            </p>
            <UButton to="/calendar" label="ไปที่หน้าปฏิทินสอนชดเชย" block size="xl" color="primary"
              class="rounded-2xl font-black shadow-lg shadow-blue-500/20" />
          </UCard>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'คู่มือการใช้งาน - ระบบจัดวันสอนชดเชยกึ่งอัตโนมัติ'
})
</script>
