<template>
  <div class="min-h-screen bg-slate-900 text-white pb-20">
    <!-- Header -->
    <div class="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-10 shadow-lg mb-8">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 class="text-3xl font-bold text-white flex items-center gap-2">
            <UIcon name="i-heroicons-presentation-chart-line" class="text-blue-400" />
            ตัวชี้วัดและรายงาน
          </h1>
          <p class="text-slate-400 mt-1">สรุปข้อมูลการสอนชดเชยและสถิติต่างๆ ในระบบ</p>
        </div>
        <div class="flex gap-3">
          <UButton
            label="ส่งออก PDF"
            icon="i-heroicons-document-text"
            color="secondary"
            variant="soft"
            size="lg"
            class="rounded-xl shadow-lg border border-slate-700 no-print"
            @click="exportToPDF"
          />
          <UButton
            label="ดาวน์โหลด CSV"
            icon="i-heroicons-cloud-arrow-down"
            color="primary"
            variant="solid"
            size="lg"
            class="rounded-xl shadow-lg shadow-blue-500/20 no-print"
            @click="exportToCSV"
          />
        </div>
      </div>
    </div>

    <!-- Print Only Header -->
    <div class="print-only mb-8 text-black bg-white p-6 border-b-2 border-black hidden">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-black uppercase text-black">รายงานสรุปผลการจัดการเรียนสอนชดเชย</h1>
          <p class="text-sm font-bold mt-1 text-slate-700">คณะวิทยาศาสตร์และศิลปศาสตร์ มทร.อีสาน</p>
          <p class="text-xs text-slate-500 mt-1 italic">Semi-Auto Makeup Class Report - {{ new Date().toLocaleDateString('th-TH') }}</p>
        </div>
        <div class="text-right">
           <img src="/image/rmutiLogo.png" class="h-16 w-auto mb-2 ml-auto filter grayscale opacity-50" />
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-sm relative overflow-hidden group">
          <div class="absolute right-0 bottom-0 opacity-10 scale-150 group-hover:scale-125 transition-transform">
             <UIcon name="i-heroicons-clipboard-document-list" class="w-24 h-24" />
          </div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">รวมรายการชดเชย</p>
          <p class="text-4xl font-black text-white mt-2">{{ makeupClasses.length }}</p>
        </div>
        <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-sm relative overflow-hidden group">
           <div class="absolute right-0 bottom-0 opacity-10 scale-150 text-green-500 group-hover:scale-125 transition-transform">
             <UIcon name="i-heroicons-check-badge" class="w-24 h-24" />
          </div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest text-green-500/80">ยืนยันแล้ว</p>
          <p class="text-4xl font-black text-green-400 mt-2">{{ confirmedCount }}</p>
        </div>
        <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-sm relative overflow-hidden group">
           <div class="absolute right-0 bottom-0 opacity-10 scale-150 text-amber-500 group-hover:scale-125 transition-transform">
             <UIcon name="i-heroicons-clock" class="w-24 h-24" />
          </div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest text-amber-500/80">รอยืนยัน/แนะนำ</p>
          <p class="text-4xl font-black text-amber-400 mt-2">{{ suggestedCount }}</p>
        </div>
        <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-sm relative overflow-hidden group">
           <div class="absolute right-0 bottom-0 opacity-10 scale-150 text-red-500 group-hover:scale-125 transition-transform">
             <UIcon name="i-heroicons-no-symbol" class="w-24 h-24" />
          </div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest text-red-500/80">ยกเลิกแล้ว</p>
          <p class="text-4xl font-black text-red-400 mt-2">{{ cancelledCount }}</p>
        </div>
      </div>

      <!-- Distribution Chart Section -->
      <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700 mb-8 shadow-xl">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <UIcon name="i-heroicons-chart-pie" class="text-blue-400" />
          สัดส่วนความสำเร็จ (Distribution)
        </h2>
        <div class="flex flex-col gap-6">
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">ยืนยันและเสร็จสิ้น</span>
              <span class="font-bold">{{ successRate }}%</span>
            </div>
            <div class="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
               <div class="h-full bg-gradient-to-r from-green-500 to-green-300 transition-all duration-1000" :style="{ width: successRate + '%' }"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">รอยืนยัน/กำลังหาช่วงว่าง</span>
              <span class="font-bold">{{ pendingRate }}%</span>
            </div>
            <div class="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
               <div class="h-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-1000" :style="{ width: pendingRate + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- สรุปตามอาจารย์ -->
        <div class="bg-slate-800 rounded-3xl border border-slate-700 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-700 bg-slate-800/50">
            <h2 class="font-bold text-white flex items-center gap-2">
              <UIcon name="i-heroicons-user-group" class="text-blue-400" />
              สรุปตามอาจารย์
            </h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-700">
                  <th class="px-8 py-5">ชื่ออาจารย์</th>
                  <th class="px-8 py-5 text-center">จำนวนครั้ง</th>
                  <th class="px-8 py-5 text-center">ชั่วโมงชดเชย</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700/50">
                <tr v-for="teacher in teacherStats" :key="teacher.name" class="hover:bg-slate-900 transition-colors group">
                  <td class="px-8 py-5 font-bold text-white">{{ teacher.name }}</td>
                  <td class="px-8 py-5 text-center">
                    <span class="bg-slate-700 px-3 py-1 rounded-full text-sm font-bold group-hover:bg-blue-500 transition-colors">{{ teacher.count }}</span>
                  </td>
                  <td class="px-8 py-5 text-center text-slate-400 font-medium">{{ teacher.hours }} ชม.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

         <!-- สรุปตามกลุ่มเรียน -->
        <div class="bg-slate-800 rounded-3xl border border-slate-700 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-700 bg-slate-800/50">
             <h2 class="font-bold text-white flex items-center gap-2">
              <UIcon name="i-heroicons-academic-cap" class="text-amber-400" />
              สรุปตามกลุ่มเรียน
            </h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-700">
                  <th class="px-8 py-5">กลุ่มเรียน</th>
                  <th class="px-8 py-5 text-center">จำนวนครั้ง</th>
                  <th class="px-8 py-5 text-center">ชั่วโมงรวม</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700/50">
                <tr v-for="section in sectionStats" :key="section.name" class="hover:bg-slate-900 transition-colors group">
                  <td class="px-8 py-5 font-bold text-white">{{ section.name }}</td>
                  <td class="px-8 py-5 text-center">
                    <span class="bg-slate-700 px-3 py-1 rounded-full text-sm font-bold group-hover:bg-amber-500 transition-colors">{{ section.count }}</span>
                  </td>
                  <td class="px-8 py-5 text-center text-slate-400 font-medium">{{ section.hours }} ชม.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: makeupClasses } = await useFetch('/api/makeup-classes', {
    default: () => []
})

const confirmedCount = computed(() => 
    makeupClasses.value.filter(m => m.status === 'confirmed' || m.status === 'completed').length
)

const suggestedCount = computed(() => 
    makeupClasses.value.filter(m => m.status === 'suggested').length
)

const cancelledCount = computed(() => 
    makeupClasses.value.filter(m => m.status === 'cancelled').length
)

const successRate = computed(() => {
  if (makeupClasses.value.length === 0) return 0
  return Math.round((confirmedCount.value / makeupClasses.value.length) * 100)
})

const pendingRate = computed(() => {
  if (makeupClasses.value.length === 0) return 0
  return Math.round((suggestedCount.value / makeupClasses.value.length) * 100)
})

// คำนวณสถิติแยกตามอาจารย์
const teacherStats = computed(() => {
  const groups = {}
  makeupClasses.value.forEach(item => {
    const key = item.teacher_name || 'ไม่ทราบชื่อ'
    if (!groups[key]) groups[key] = { count: 0, hours: 0 }
    groups[key].count++
    const start = (item.makeup_time_start || "00:00").split(':').map(Number)
    const end = (item.makeup_time_end || "00:00").split(':').map(Number)
    groups[key].hours += (end[0] - start[0])
  })
  return Object.entries(groups).map(([name, data]) => ({ name, count: data.count, hours: data.hours }))
})

// คำนวณสถิติแยกตามกลุ่มเรียน
const sectionStats = computed(() => {
  const groups = {}
  makeupClasses.value.forEach(item => {
    const key = item.section_name || 'ไม่ระบุกลุ่ม'
    if (!groups[key]) groups[key] = { count: 0, hours: 0 }
    groups[key].count++
    const start = (item.makeup_time_start || "00:00").split(':').map(Number)
    const end = (item.makeup_time_end || "00:00").split(':').map(Number)
    groups[key].hours += (end[0] - start[0])
  })
  return Object.entries(groups).map(([name, data]) => ({ 
    name, 
    count: data.count, 
    hours: data.hours 
  }))
})

// Export CSV
const exportToCSV = () => {
    const headers = ['Teacher', 'Section', 'Subject', 'Date', 'Start', 'End', 'Status']
    const rows = makeupClasses.value.map(m => [
        m.teacher_name,
        m.section_name,
        m.subject_name,
        m.makeup_date,
        m.makeup_time_start,
        m.makeup_time_end,
        m.status
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(e => e.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `makeup_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// Export PDF (Window Print)
const exportToPDF = () => {
    window.print()
}
</script>

<style scoped>
@media print {
  /* 1. Global Reset for Print */
  :deep(body), .min-h-screen {
    background-color: white !important;
    color: black !important;
  }
  
  .min-h-screen {
    background: white !important;
    padding-bottom: 0 !important;
  }

  /* 2. Hide Elements */
  .no-print, header, nav, .bg-slate-800.sticky {
    display: none !important;
  }

  /* 3. Show Print Header */
  .print-only {
    display: block !important;
  }

  /* 4. Force Backgrounds for Stats & Charts */
  .bg-slate-800 {
    background-color: #f8fafc !important; /* slate-50 */
    border: 1px solid #e2e8f0 !important; /* slate-200 */
    color: black !important;
    box-shadow: none !important;
  }

  .text-white {
    color: black !important;
  }

  .text-slate-400 {
    color: #475569 !important; /* slate-600 */
  }

  /* 5. Color Overrides for Report Utility */
  .text-green-500, .text-green-400 { color: #166534 !important; }
  .text-amber-500, .text-amber-400 { color: #92400e !important; }
  .text-red-500, .text-red-400 { color: #991b1b !important; }

  /* 6. Chart Optimization */
  .bg-slate-900 {
    background-color: #f1f5f9 !important; /* slate-100 */
  }

  .bg-gradient-to-r {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  /* 7. Table Optimization */
  table {
    width: 100% !important;
    border-collapse: collapse !important;
  }

  th {
    background-color: #f1f5f9 !important;
    color: black !important;
    border-bottom: 2px solid black !important;
  }

  td {
    border-bottom: 1px solid #e2e8f0 !important;
  }

  /* 8. Spacing & Page Break */
  .container {
    max-width: 100% !important;
    width: 100% !important;
    padding: 0 !important;
  }

  .grid {
    display: grid !important;
  }

  .lg\:grid-cols-2 {
    grid-template-columns: 1fr 1fr !important;
  }

  .mb-8 { margin-bottom: 2rem !important; }

  @page {
    margin: 1cm;
    size: A4;
  }
}
</style>
