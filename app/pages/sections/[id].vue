<template>
  <div class="min-h-screen bg-linear-to-br from-slate-800 to-slate-900 text-white">
    <!-- Navbar -->
    <nav class="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
             <UButton
              icon="i-lucide-arrow-left"
              color="gray"
              variant="ghost"
              to="/sections"
            />
            <h2 class="text-xl font-bold text-blue-400">
              ตารางเรียน - {{ section?.section_name || 'Loading...' }}
            </h2>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-2 sm:px-4 py-8">
      <!-- Info & Controls -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold">
            จัดการตารางเรียน: {{ section?.section_name }}
          </h1>
          <p class="text-slate-400">
             ภาคการศึกษา: {{ term }}
          </p>
        </div>

        <div class="flex gap-2">
           <UButton
            label="บันทึกตาราง"
            icon="i-heroicons-document-check"
            color="primary"
            :loading="saving"
            @click="saveSchedule"
          />
           <UButton
            label="ล้างตาราง"
            icon="i-lucide-trash"
            color="red"
            variant="soft"
            @click="clearSchedule"
          />
        </div>
      </div>

       <!-- Schedule Table -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <div class="inline-block min-w-full">
            <!-- Header -->
            <div class="flex border-b border-slate-700 bg-slate-900/50 text-xs sm:text-sm">
              <div class="w-20 shrink-0 p-3 font-bold text-center text-slate-300 border-r border-slate-700">
                วัน/เวลา
              </div>
              <div class="flex flex-1">
                <div
                  v-for="(time, index) in timeSlots"
                  :key="index"
                  class="flex-1 min-w-[80px] p-2 text-center text-slate-400 border-r border-slate-700 last:border-r-0"
                >
                  <span class="block font-bold text-white">คาบที่ {{ index + 1 }}</span>
                  <span class="text-xs">{{ time }}</span>
                </div>
              </div>
            </div>

            <!-- Rows -->
             <div
              v-for="(day, dayIndex) in days"
              :key="dayIndex"
              class="flex border-b border-slate-700 last:border-b-0 text-xs sm:text-sm group hover:bg-slate-700/30 transition-colors"
            >
              <!-- Day Header -->
              <div class="w-20 shrink-0 flex items-center justify-center p-2 font-bold bg-slate-800/80 border-r border-slate-700 text-slate-300">
                {{ day }}
              </div>

               <!-- Slots -->
              <div class="flex flex-1">
                <div
                  v-for="(slot, slotIndex) in scheduleSlots[dayIndex]"
                  :key="slotIndex"
                  class="relative flex-1 min-w-[80px] border-r border-slate-700 last:border-r-0"
                >
                   <div
                    class="h-full min-h-[60px] p-1 cursor-pointer transition-colors flex flex-col items-center justify-center text-center gap-1"
                    :class="[
                      slot.value ? 'bg-blue-600/20 hover:bg-blue-600/30' : 'hover:bg-slate-700/50',
                      isActiveBox(dayIndex, slotIndex) ? 'ring-2 ring-inset ring-blue-500 bg-blue-500/10' : ''
                    ]"
                    @click="toggleDropdown(dayIndex, slotIndex)"
                  >
                     <template v-if="slot.value">
                        <span class="font-bold text-blue-300 line-clamp-2">
                          {{ getSubjectLabel(slot.value) }}
                        </span>
                     </template>
                     <span v-else class="text-slate-600 text-xs">ว่าง</span>
                  </div>

                   <!-- Dropdown -->
                   <div
                    v-if="isActiveBox(dayIndex, slotIndex)"
                    class="absolute z-10 top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden"
                  >
                     <div class="max-h-60 overflow-y-auto custom-scrollbar">
                        <button
                          class="w-full text-left px-3 py-2 hover:bg-slate-700 text-slate-300 text-xs border-b border-slate-700"
                          @click="setSlotValue(dayIndex, slotIndex, null)"
                        >
                          <span class="text-red-400">✖ ล้างข้อมูล</span>
                        </button>
                        
                        <div class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-900/50 uppercase tracking-wider">
                          กิจกรรม
                        </div>
                        <button
                           v-for="opt in staticOptions"
                          :key="opt.value"
                           class="w-full text-left px-3 py-2 hover:bg-slate-700 text-white text-xs truncate"
                           @click="setSlotValue(dayIndex, slotIndex, opt.value)"
                        >
                          {{ opt.label }}
                        </button>

                         <div class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-900/50 uppercase tracking-wider mt-1">
                          วิชา (จากอาจารย์)
                        </div>
                         <button
                           v-for="opt in subjectOptions"
                          :key="opt.value"
                           class="w-full text-left px-3 py-2 hover:bg-slate-700 text-white text-xs truncate"
                           @click="setSlotValue(dayIndex, slotIndex, opt.value)"
                        >
                          {{ opt.label }}
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const sectionId = route.params.id
const term = route.query.term
const toast = useToast()

// Constants
const timeSlots = [
  '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
  '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
  '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00'
]
const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

const staticOptions = [
  { value: 'busy', label: 'ไม่ว่าง (ติดกิจกรรมอื่น)' },
  { value: 'lunch', label: 'พักกลางวัน' }
]

// State
const activeBox = ref({ day: null, slot: null })
const saving = ref(false)
const scheduleSlots = ref(Array.from({ length: 7 }, () =>
  Array.from({ length: 13 }, () => ({ value: null }))
))

// Fetch Data
// 1. Get Section Info (Just filter from list for now or assume ID is valid)
// Ideally we should have a GET /api/sections/:id, but we can list all and find
const { data: sections } = await useFetch('/api/sections', { query: { term } })
const section = computed(() => sections.value?.find(s => s.id_section == sectionId))

// 2. Get Subjects for this section (To show in dropdown)
// We need an API to get subjects by section_id? Or filter subjects
// Existing API /api/Subjects returns all if no teacher_id. Let's fetch all and filter client side for now.
// Better: update /api/Subjects to support filtering by section_id (TODO later if needed, client filter is fine for small scale)
const { data: allSubjects } = await useFetch('/api/Subjects')
const sectionSubjects = computed(() => 
  allSubjects.value?.filter(s => s.id_section == sectionId) || []
)

const subjectOptions = computed(() => 
  sectionSubjects.value.map(s => ({
    value: s.id_subject, // Store Subject ID
    label: s.name_subject
  }))
)

// 3. Load existing schedule
const { data: existingSchedule, refresh: refreshSchedule } = await useFetch('/api/section-schedules', {
  query: { id_section: sectionId, term }
})

watch(existingSchedule, (data) => {
  if (data && data.scheduleData) {
    scheduleSlots.value = data.scheduleData
  }
}, { immediate: true })

// Methods
const isActiveBox = (d, s) => activeBox.value.day === d && activeBox.value.slot === s

const toggleDropdown = (d, s) => {
  if (isActiveBox(d, s)) {
    activeBox.value = { day: null, slot: null }
  } else {
    activeBox.value = { day: d, slot: s }
  }
}

const setSlotValue = (d, s, val) => {
  scheduleSlots.value[d][s].value = val
  activeBox.value = { day: null, slot: null }
}

const getSubjectLabel = (val) => {
  const staticOpt = staticOptions.find(o => o.value === val)
  if (staticOpt) return staticOpt.label
  
  const subj = sectionSubjects.value.find(s => s.id_subject == val)
  return subj ? subj.name_subject : 'Unknown'
}

const clearSchedule = () => {
  if(!confirm('ล้างตารางทั้งหมด?')) return
  scheduleSlots.value = Array.from({ length: 7 }, () =>
    Array.from({ length: 13 }, () => ({ value: null }))
  )
}

const saveSchedule = async () => {
  saving.value = true
  try {
    await $fetch('/api/section-schedules', {
      method: 'POST',
      body: {
        id_section: sectionId,
        term: term,
        schedule: scheduleSlots.value
      }
    })
    toast.add({ title: 'บันทึกสำเร็จ', color: 'green' })
    refreshSchedule()
  } catch (err) {
    toast.add({ title: 'บันทึกไม่สำเร็จ', description: err.message, color: 'red' })
  } finally {
    saving.value = false
  }
}

// Close dropdown on click outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      activeBox.value = { day: null, slot: null }
    }
  })
})
</script>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1e293b;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}
</style>
