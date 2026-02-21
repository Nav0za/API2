<template>
  <div class="min-h-screen bg-linear-to-br from-slate-800 to-slate-900 text-white">
    <!-- Navbar -->
    <nav class="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" to="/sections" />
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
          <!-- Quick Add Subject to Schedule -->
          <UModal v-model:open="quickAddOpen"
            :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
            <UButton label="เพิ่มในตาราง" icon="i-heroicons-plus" color="blue" variant="soft" class="cursor-pointer" />
            <template #content>
              <div class="p-8">
                <div
                  class="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                  <UIcon name="i-heroicons-calendar-days" class="text-3xl text-blue-400" />
                </div>
                <h3 class="text-2xl font-bold text-white text-center mb-6">เพิ่มรายวิชาในตารางเรียน</h3>

                <div class="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar px-1">
                  <div>
                    <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">เลือกวิชา</h3>
                    <USelect v-model="quickAddSubject" placeholder="เลือกรายวิชา" :items="subjectOptions" size="xl"
                      class="w-full" :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                  </div>

                  <div v-if="quickAddSubject">
                    <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                      กลุ่มเรียนที่เรียนด้วยกัน
                      (ถ้ามี)</h3>
                    <div
                      class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar border border-slate-800 rounded-2xl p-4 bg-slate-800/50 shadow-inner">
                      <div v-for="sec in allSubjects.find(s => s.id_subject == quickAddSubject)?.sections"
                        :key="sec.id_section"
                        class="flex items-center gap-3 p-2 hover:bg-slate-700/50 rounded-xl cursor-pointer text-slate-300 transition-colors"
                        @click="() => {
                          if (quickAddSelectedSections.includes(sec.id_section)) {
                            quickAddSelectedSections = quickAddSelectedSections.filter(id => id !== sec.id_section)
                          } else {
                            quickAddSelectedSections = [...quickAddSelectedSections, sec.id_section]
                          }
                        }">
                        <UCheckbox :model-value="quickAddSelectedSections.includes(sec.id_section)" @update:model-value="(val) => {
                          if (val) quickAddSelectedSections = [...quickAddSelectedSections, sec.id_section]
                          else quickAddSelectedSections = quickAddSelectedSections.filter(id => id !== sec.id_section)
                        }" />
                        <span class="text-sm font-medium" :class="{ 'text-blue-400': sec.id_section == sectionId }">
                          {{ sec.section_name }} {{ sec.id_section == sectionId ? '(กลุ่มนี้)' : '' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">วัน</h3>
                      <USelect v-model="quickAddDay" placeholder="เลือกวัน" :items="dayOptions" size="xl" class="w-full"
                        :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                    </div>
                    <div>
                      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">ห้องเรียน</h3>
                      <USelect v-model="quickAddRoom" placeholder="ไม่ระบุ" :items="roomOptions" size="xl"
                        class="w-full" :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">เวลาเริ่ม</h3>
                      <USelect v-model="quickAddStartTime" placeholder="เลือกเวลา" :items="timeSlotIndexOptions"
                        size="xl" class="w-full"
                        :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                    </div>
                    <div>
                      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">จำนวนชั่วโมง
                      </h3>
                      <USelect v-model="quickAddDuration" :items="durationOptions" size="xl" class="w-full"
                        :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                    </div>
                  </div>

                  <div v-if="quickAddPreview"
                    class="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl text-center">
                    <p class="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">แสดงตัวอย่าง</p>
                    <p class="text-white font-bold leading-tight">{{ quickAddPreview }}</p>
                  </div>
                </div>

                <div class="flex gap-3 mt-8">
                  <UButton label="ยกเลิก" color="neutral" variant="soft" size="xl" block class="rounded-2xl py-4 flex-1"
                    @click="quickAddOpen = false" />
                  <UButton label="เพิ่มลงตาราง" color="primary" size="xl" block
                    class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20" @click="async () => {
                      await addToSchedule()
                      quickAddOpen = false
                    }" />
                </div>
              </div>
            </template>
          </UModal>
          <UButton label="บันทึกตาราง" icon="i-heroicons-document-check" color="primary" :loading="saving"
            @click="saveSchedule" />
          <UButton label="ล้างตาราง" icon="i-lucide-trash" color="red" variant="soft" @click="clearSchedule" />
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
                <div v-for="(time, index) in timeSlots" :key="index"
                  class="flex-1 min-w-[80px] p-2 text-center text-slate-400 border-r border-slate-700 last:border-r-0">
                  <span class="block font-bold text-white">คาบที่ {{ index + 1 }}</span>
                  <span class="text-xs">{{ time }}</span>
                </div>
              </div>
            </div>

            <!-- Rows -->
            <div v-for="(day, dayIndex) in days" :key="dayIndex"
              class="flex border-b border-slate-700 last:border-b-0 text-xs sm:text-sm group hover:bg-slate-700/30 transition-colors">
              <!-- Day Header -->
              <div
                class="w-20 shrink-0 flex items-center justify-center p-2 font-bold bg-slate-800/80 border-r border-slate-700 text-slate-300">
                {{ day }}
              </div>

              <!-- Slots (แสดงแบบ Merge ตาม displaySlots) -->
              <div class="flex flex-1">
                <div v-for="(slot, gIndex) in displaySlots[dayIndex]" :key="`${dayIndex}-${slot.originalIndex}`"
                  class="relative border-r border-slate-700 last:border-r-0" :style="`flex: ${slot.span} 1 0%`">
                  <!-- พักกลางวัน (Index 4) -->
                  <div v-if="slot.isLunch"
                    class="h-full min-h-[60px] p-1 flex items-center justify-center text-center bg-slate-900/50 text-slate-500 select-none text-xs">
                    พักกลางวัน
                  </div>

                  <!-- ช่วงเวลาปกติ -->
                  <div v-else
                    class="h-full min-h-[60px] p-1 cursor-pointer transition-colors flex flex-col items-center justify-center text-center gap-1"
                    :class="[
                      slot.value ? 'bg-blue-600/20 hover:bg-blue-600/30' : 'hover:bg-slate-700/50',
                      isActiveBox(dayIndex, slot.originalIndex) ? 'ring-2 ring-inset ring-blue-500 bg-blue-500/10' : ''
                    ]" @click="toggleDropdown(dayIndex, slot.originalIndex)">
                    <template v-if="slot.value">
                      <span class="font-bold text-blue-300 line-clamp-1">
                        {{ getSubjectLabel(slot.value, slot.room_id, slot.section_ids) }}
                      </span>
                    </template>
                    <span v-else class="text-slate-600 text-xs">ว่าง</span>
                  </div>

                  <!-- Dropdown -->
                  <div v-if="!slot.isLunch && isActiveBox(dayIndex, slot.originalIndex)"
                    class="absolute z-10 top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
                    <div class="max-h-60 overflow-y-auto custom-scrollbar">
                      <button
                        class="w-full text-left px-3 py-2 hover:bg-slate-700 text-slate-300 text-xs border-b border-slate-700"
                        @click="setSlotValue(dayIndex, slot.originalIndex, null, slot.span)">
                        <span class="text-red-400">✖ ล้างข้อมูล</span>
                      </button>

                      <div
                        class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-900/50 uppercase tracking-wider">
                        กิจกรรม
                      </div>
                      <button v-for="opt in staticOptions" :key="opt.value"
                        class="w-full text-left px-3 py-2 hover:bg-slate-700 text-white text-xs truncate"
                        @click="setSlotValue(dayIndex, slot.originalIndex, opt.value, slot.span)">
                        {{ opt.label }}
                      </button>

                      <div
                        class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-900/50 uppercase tracking-wider mt-1">
                        วิชา (จากอาจารย์)
                      </div>
                      <button v-for="opt in subjectOptions" :key="opt.value"
                        class="w-full text-left px-3 py-2 hover:bg-slate-700 text-white text-xs truncate"
                        @click="setSlotValue(dayIndex, slot.originalIndex, opt.value, slot.span)">
                        {{ opt.label }}
                      </button>

                      <template v-if="slot.value && !staticOptions.some(o => o.value === slot.value)">
                        <div
                          class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-900/50 uppercase tracking-wider mt-1">
                          กลุ่มเรียน (Sections)
                        </div>
                        <div v-for="sec in allSubjects.find(s => s.id_subject == slot.value)?.sections"
                          :key="sec.id_section"
                          class="w-full text-left px-3 py-2 hover:bg-slate-700 text-amber-200 text-xs flex items-center gap-2 cursor-pointer"
                          @click="toggleSlotSection(dayIndex, slot.originalIndex, sec.id_section, slot.span)">
                          <UCheckbox
                            :model-value="(scheduleSlots[dayIndex][slot.originalIndex].section_ids || []).includes(sec.id_section)"
                            @update:model-value="toggleSlotSection(dayIndex, slot.originalIndex, sec.id_section, slot.span)" />
                          <span class="truncate" :class="{ 'text-blue-400 font-bold': sec.id_section == sectionId }">{{
                            sec.section_name }}</span>
                        </div>

                        <div
                          class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-900/50 uppercase tracking-wider mt-1">
                          ห้องเรียน (คาบนี้)
                        </div>
                        <button v-for="room in roomOptions" :key="room.value"
                          class="w-full text-left px-3 py-2 hover:bg-slate-700 text-blue-400 text-xs truncate"
                          :class="{ 'bg-blue-500/10 text-blue-200': slot.room_id === room.value }"
                          @click="setSlotRoom(dayIndex, slot.originalIndex, room.value, slot.span)">
                          {{ room.label }}
                        </button>
                      </template>
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
  Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] }))
))

// Quick Add states
const quickAddOpen = ref(false)
const quickAddSubject = ref(null)
const quickAddDay = ref(null)
const quickAddStartTime = ref(null)
const quickAddDuration = ref(1)
const quickAddRoom = ref(null)
const quickAddSelectedSections = ref([])

const { data: rooms } = await useFetch('/api/rooms')
const roomOptions = computed(() => {
  const opts = rooms.value?.map(r => ({ value: r.id_room, label: `${r.room_name}${r.building ? ` (${r.building})` : ''}` })) || []
  return [{ value: null, label: 'ไม่ระบุห้อง' }, ...opts]
})

// Fetch Data
// 1. Get Section Info (Just filter from list for now or assume ID is valid)
// Ideally we should have a GET /api/sections/:id, but we can list all and find
const { data: sections } = await useFetch('/api/sections', { query: { term } })
const section = computed(() => sections.value?.find(s => s.id_section == sectionId))

// 2. Get Subjects for this section (To show in dropdown)
const { data: allSubjects } = await useFetch('/api/Subjects')
const sectionSubjects = computed(() =>
  allSubjects.value?.filter(s =>
    s.sections && s.sections.some(sec => sec.id_section == sectionId)
  ) || []
)

const subjectOptions = computed(() =>
  sectionSubjects.value.map(s => ({
    value: s.id_subject, // Store Subject ID
    label: s.name_subject
  }))
)

// Options for Quick Add
const dayOptions = computed(() => days.map((day, index) => ({ value: index, label: day })))
const timeSlotIndexOptions = computed(() => timeSlots.map((time, index) => ({ value: index, label: time })).filter(opt => opt.value !== 4))
const durationOptions = [
  { value: 1, label: '1 ชั่วโมง' },
  { value: 2, label: '2 ชั่วโมง' },
  { value: 3, label: '3 ชั่วโมง' },
  { value: 4, label: '4 ชั่วโมง' },
  { value: 5, label: '5 ชั่วโมง' },
  { value: 6, label: '6 ชั่วโมง' },
  { value: 7, label: '7 ชั่วโมง' },
  { value: 8, label: '8 ชั่วโมง' }
]

const quickAddPreview = computed(() => {
  if (!quickAddSubject.value || quickAddDay.value === null || quickAddStartTime.value === null || !quickAddDuration.value) return null
  const subjectLabel = subjectOptions.value.find(s => s.value === quickAddSubject.value)?.label || '-'
  const dayLabel = dayOptions.value.find(d => d.value === quickAddDay.value)?.label || '-'
  const startTimeLabel = timeSlotIndexOptions.value.find(t => t.value === quickAddStartTime.value)?.label || '-'
  const roomLabel = quickAddRoom.value ? roomOptions.value.find(r => r.value === quickAddRoom.value)?.label : 'ไม่ระบุ'
  return `${subjectLabel} | ${dayLabel} | ${startTimeLabel} | ${quickAddDuration.value} ชั่วโมง | ห้อง: ${roomLabel}`
})

// Watch subject change in Quick Add
watch(quickAddSubject, (newVal) => {
  if (newVal) {
    const subj = allSubjects.value?.find(s => s.id_subject == newVal)
    quickAddSelectedSections.value = subj ? subj.sections.map(s => s.id_section) : []
  } else {
    quickAddSelectedSections.value = []
  }
})

// 3. Load existing schedule
const { data: existingSchedule, refresh: refreshSchedule } = await useFetch('/api/section-schedules', {
  query: { id_section: sectionId, term }
})

watch(existingSchedule, (data) => {
  if (data && data.scheduleData) {
    // Normalize existing data
    const raw = data.scheduleData
    scheduleSlots.value = raw.map(day => {
      if (!Array.isArray(day)) return Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] }))
      return day.map(slot => {
        if (typeof slot === 'object' && slot !== null) {
          return {
            value: slot.value,
            room_id: slot.room_id || null,
            section_ids: slot.section_ids || []
          }
        }
        return { value: slot, room_id: null, section_ids: [] }
      })
    })
  }
}, { immediate: true })

// Logic สำหรับการ Merge ช่องที่วิชาเหมือนกันและติดกัน
const displaySlots = computed(() => {
  if (!scheduleSlots.value) return []
  return scheduleSlots.value.map(daySlots => {
    const grouped = []
    for (let i = 0; i < daySlots.length; i++) {
      const current = daySlots[i]
      if (i === 4) { // พักกลางวัน ไม่ Merge
        grouped.push({ ...current, span: 1, isLunch: true, originalIndex: i })
        continue
      }
      let span = 1
      while (
        i + span < daySlots.length &&
        i + span !== 4 && // ไม่ Merge ข้ามพักเที่ยง
        daySlots[i + span].value === current.value &&
        current.value !== null
      ) {
        span++
      }
      grouped.push({ ...current, span, originalIndex: i })
      i += span - 1
    }
    return grouped
  })
})

// Methods
const isActiveBox = (d, s) => activeBox.value.day === d && activeBox.value.slot === s

const toggleDropdown = (d, s) => {
  if (isActiveBox(d, s)) {
    activeBox.value = { day: null, slot: null }
  } else {
    activeBox.value = { day: d, slot: s }
  }
}

const setSlotValue = (d, s, val, span = 1) => {
  const subj = allSubjects.value?.find(sub => sub.id_subject == val)
  // Default to ALL sections of the subject if it's a new assignment
  const defaultSections = subj ? subj.sections.map(sec => sec.id_section) : []

  for (let i = 0; i < span; i++) {
    scheduleSlots.value[d][s + i].value = val
    if (!val) {
      scheduleSlots.value[d][s + i].room_id = null
      scheduleSlots.value[d][s + i].section_ids = []
    } else {
      scheduleSlots.value[d][s + i].section_ids = [...defaultSections]
    }
  }
}

const toggleSlotSection = (d, s, sectionId, span = 1) => {
  const currentSections = scheduleSlots.value[d][s].section_ids || []
  let nextSections
  if (currentSections.includes(sectionId)) {
    nextSections = currentSections.filter(id => id !== sectionId)
  } else {
    nextSections = [...currentSections, sectionId]
  }

  for (let i = 0; i < span; i++) {
    scheduleSlots.value[d][s + i].section_ids = nextSections
  }
}

const setSlotRoom = (d, s, roomId, span = 1) => {
  for (let i = 0; i < span; i++) {
    scheduleSlots.value[d][s + i].room_id = roomId
  }
}

const addToSchedule = async () => {
  if (!quickAddSubject.value || quickAddDay.value === null || quickAddStartTime.value === null || !quickAddDuration.value) return

  const dayIdx = quickAddDay.value
  const startIdx = quickAddStartTime.value
  const duration = quickAddDuration.value
  const subjectId = quickAddSubject.value
  const roomId = quickAddRoom.value

  for (let i = 0; i < duration; i++) {
    const slotIdx = startIdx + i
    if (slotIdx >= 13) break
    if (slotIdx === 4) continue // ข้ามพักเที่ยง

    scheduleSlots.value[dayIdx][slotIdx].value = subjectId
    scheduleSlots.value[dayIdx][slotIdx].room_id = roomId
    scheduleSlots.value[dayIdx][slotIdx].section_ids = [...quickAddSelectedSections.value]
  }

  // Reset
  quickAddSubject.value = null
  quickAddDay.value = null
  quickAddRoom.value = null
  toast.add({ title: 'สำเร็จ', description: 'เพิ่มวิชาในตารางแล้ว' })
  quickAddOpen.value = false
}

const getSubjectLabel = (val, roomId = null, sectionIds = null) => {
  const staticOpt = staticOptions.find(o => o.value === val)
  if (staticOpt) return staticOpt.label

  const subj = allSubjects.value?.find(s => s.id_subject == val)
  if (!subj) return 'Unknown'

  let sectionDisplay = ''
  if (sectionIds && Array.isArray(sectionIds) && sectionIds.length > 0) {
    const names = subj.sections
      .filter(s => sectionIds.includes(s.id_section))
      .map(s => s.section_name)
      .join(', ')
    sectionDisplay = names ? `(${names})` : '(No section)'
  } else {
    // Backwards compatibility or if sectionIds is missing
    sectionDisplay = `(${subj.section_names || '?'})`
  }

  // If we have a specific roomId for this slot, use it. Otherwise use subj.room_name
  let roomName = ''
  if (roomId) {
    const r = rooms.value?.find(rm => rm.id_room == roomId)
    if (r) roomName = r.room_name
  } else if (subj.room_name) {
    roomName = subj.room_name
  }

  return `${subj.name_subject} ${sectionDisplay} ${roomName ? `[${roomName}]` : ''}`
}

const clearSchedule = () => {
  if (!confirm('ล้างตารางทั้งหมด?')) return
  scheduleSlots.value = Array.from({ length: 7 }, () =>
    Array.from({ length: 13 }, () => ({ value: null, room_id: null }))
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
