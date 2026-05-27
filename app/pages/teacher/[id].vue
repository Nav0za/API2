<template>
  <div class="bg-slate-50 text-slate-900 min-h-screen">
    <!-- ปุ่มย้อนกลับ -->
    <UButton label="ย้อนกลับ" icon="i-lucide-arrow-left" color="error" class="m-4 cursor-pointer"
      @click="$router.back()" />
    <div class="container mx-auto py-2 pb-10">
      <!-- แสดงรายละเอียดอาจารย์ตาม id -->
      <div class="flex flex-col md:flex-row gap-6 mb-8">
        <!-- Profile Card -->
        <div class="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
          <div
            class="w-20 h-20 rounded-full bg-amber-100 text-slate-800 font-bold flex items-center justify-center text-3xl shadow-sm border border-amber-200">
            {{ (teacherData?.first_name?.[0] || '') + (teacherData?.last_name?.[0] || '') }}
          </div>
          <div>
            <h1 class="text-3xl font-bold text-slate-900">
              {{ teacherName }}
            </h1>
            <p class="text-slate-500 mt-1">
              อาจารย์ผู้สอน
            </p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="flex-[2] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-slate-500 text-sm font-medium">
              วิชาที่สอน
            </p>
            <p class="text-2xl font-bold text-blue-600 mt-1">
              {{ subjects?.length || 0 }} วิชา
            </p>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-slate-500 text-sm font-medium">
              ชั่วโมงสอน/สัปดาห์
            </p>
            <p class="text-2xl font-bold text-green-600 mt-1">
              {{ hoursPerWeek }} ชม.
            </p>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-slate-500 text-sm font-medium">
              เทอมที่แสดง
            </p>
            <p class="text-xl font-bold text-amber-500 mt-1">
              {{ selectedTerm || 'ยังไม่เลือก' }}
            </p>
          </div>
        </div>
      </div>

      <!-- แสดงรายวิชาที่สอนโดยอาจารย์ท่านนี้ -->
      <div class="w-full mt-6">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex justify-between items-center text-slate-900 bg-slate-50/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <UIcon name="i-heroicons-book-open" class="text-xl text-blue-600" />
              </div>
              <h1 class="text-xl font-bold text-slate-900">
                รายวิชาที่สอน
              </h1>
            </div>
          </div>
          <div class="px-5 py-4 border-t border-slate-50 max-h-80 overflow-y-auto custom-scrollbar">
            <div v-if="pending">
              <div class="flex items-center justify-center py-10 text-slate-400">
                <UIcon name="i-heroicons-arrow-path" class="animate-spin mr-2" />
                กำลังโหลดวิชา...
              </div>
            </div>
            <div v-else>
              <p v-if="!subjects || subjects.length === 0" class="py-10 text-center text-slate-400 font-medium italic">
                ยังไม่มีรายวิชาที่สอน
              </p>

              <!-- แสดงรายวิชาที่สอนเป็น Grid -->
              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div v-for="subject in subjects" :key="subject.id_subject"
                  class="group p-4 rounded-2xl bg-slate-100/50 hover:bg-white border border-blue-200 shadow-md shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between">
                  <div class="mb-3">
                    <h3
                      class="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                      {{ subject.name_subject }}
                    </h3>
                    <p class="text-xs text-slate-500 mt-1 line-clamp-1">
                      {{ subject.section_names || 'ไม่ระบุกลุ่ม' }}
                    </p>
                  </div>

                  <!-- Removed action buttons -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ตารางสอน Section Header -->
    <div
      class="container mx-auto flex flex-col md:flex-row justify-between items-center mt-12 mb-6 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div class="flex-1">
        <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-3 uppercase">
          <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
            <UIcon name="i-heroicons-calendar-days" class="text-xl text-indigo-600" />
          </div>
          ตารางสอน
        </h2>
        <p class="text-slate-500 text-md mt-1 ml-13">
          จัดการคาบสอนหลักของอาจารย์ในแต่ละเทอม
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <!-- Removed Schedule action buttons -->

        <div class="h-8 w-px bg-slate-200 mx-2 hidden md:block" />

        <div class="min-w-[200px]">
          <label
            class="block text-lg font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">เทอมที่แสดง</label>
          <USelect v-model="selectedTerm" placeholder="เลือกภาคการศึกษา" color="primary" variant="outline" size="xl"
            :items="termOptions" class="w-full" icon="i-heroicons-academic-cap"
            :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xs' }" />
        </div>
      </div>
    </div>

    <div class="container mx-auto">
      <div v-if="!selectedTerm" class="text-center text-slate-400 py-10 font-medium italic">
        กรุณาเลือกภาคการศึกษาเพื่อแสดง/จัดการตารางสอน
      </div>

      <!-- ตารางสอนและแถบเครื่องมือ (แสดงเมื่อเลือกเทอมแล้ว) -->
      <div v-else class="mt-4">

        <!-- Removed Paint mode toolbar -->

        <!-- ตัวตารางสอน -->
        <div class="overflow-x-auto pb-6 custom-scrollbar">
          <div class="min-w-fit md:min-w-full p-1">
            <div
              class="grid grid-cols-[80px_repeat(13,minmax(85px,1fr))] text-center border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <!-- แสดงเวลา Header -->
              <div
                class="bg-slate-50 font-bold border-r border-b border-slate-200 flex items-center justify-center text-slate-700 sticky left-0 z-40 p-2 text-sm uppercase tracking-wider">
                วัน / เวลา
              </div>
              <div v-for="time in timeSlots" :key="time"
                class="bg-slate-50 p-2 text-center text-xs font-bold border-b border-r border-slate-200 last:border-r-0 text-slate-500 uppercase tracking-tighter">
                {{ time }}
              </div>

              <!-- ลูปทุกวัน -->
              <template v-for="(day, dayIndex) in days" :key="dayIndex">
                <div
                  class="border-r border-b border-slate-200 p-2 text-center bg-slate-50 text-slate-700 flex items-center justify-center font-bold sticky left-0 z-40 text-lg min-h-[90px]">
                  {{ day }}
                </div>

                <!-- ช่วงเวลาทั้งหมด 13 ช่อง (แสดงแบบ Merge ตาม displaySlots) -->
                <template v-for="(slot, gIndex) in displaySlots[dayIndex]" :key="`${dayIndex}-${slot.originalIndex}`">
                  <!-- ช่วงปกติ (ข้ามคาบที่ 5/index 4 พักเที่ยง) -->
                  <div v-if="!slot.isLunch"
                    class="relative border-r border-b border-slate-200 last:border-r-0 min-h-[90px]"
                    :style="{ gridColumn: `span ${slot.span}`, minWidth: `${slot.span * 85}px` }">
                    <div
                      class="absolute inset-0 transition-all flex flex-col items-center justify-center text-center gap-1.5 select-none"
                      :class="[
                        slot.value ? 'bg-blue-50 font-bold text-blue-700 border border-blue-100/50 m-1 rounded-xl shadow-xs' : 'bg-transparent text-slate-300'
                      ]">
                      <template v-if="slot.value">
                        <span class="text-xs line-clamp-2 leading-tight">
                          {{ getSubjectLabel(slot.value, slot.room_id, slot.section_ids) }}
                        </span>
                        <!-- เพิ่ม badge แสดงเวลาประเภท -->
                        <span v-if="slot.type === 'theory'" class="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">ทฤษฎี</span>
                        <span v-if="slot.type === 'practical'" class="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">ปฏิบัติ</span>
                      </template>
                      <span v-else class="text-md">ว่าง</span>
                    </div>

                    <!-- Removed Dropdown -->
                  </div>

                  <!-- ช่อง พักกลางวัน -->
                  <div v-else
                    class="border-r border-b border-slate-200 p-1 text-center bg-slate-50 text-slate-400 font-bold flex items-center justify-center text-md select-none uppercase tracking-tighter min-h-[90px]">
                    พักกลางวัน
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ดึง id จากพารามิเตอร์
const route = useRoute()
const id = route.params.id

const { data: rooms } = await useFetch('/api/rooms')

// --- State & Reactive Variables ---
const open = ref(false)
const activeBox = ref({ day: null, slot: null })
const editOpen = ref(false)
const editSubjectName = ref('')
const currentEditSubject = ref(null)
const deleteOpen = ref(false)
const subjectToDelete = ref(null)
const selectedAddPlanId = ref(null)
const selectedAddSubjectId = ref(null)
const selectedSections = ref([])
const editSelectedSections = ref([])
const editSelectedPlanId = ref(null)
const editSelectedSubjectId = ref(null)
const editLegacySubjectName = ref('')
const saving = ref(false)

// --- Paint Mode State (Drag to Schedule) ---
const isPaintMode = ref(false)
const paintSubjectId = ref(null)
const paintSectionIds = ref([])
const paintRoomId = ref(null)
const isDragging = ref(false)
const dragCurrentDay = ref(null)

const paintSectionOptions = computed(() => {
  const rawId = getRawValue(paintSubjectId.value)
  if (!rawId) return []
  const subj = subjects.value?.find(sub => sub.id_subject == rawId)
  if (!subj || !subj.sections) return []
  return subj.sections.map(sec => ({ label: sec.section_name, value: sec.id_section }))
})

watch(() => paintSubjectId.value, (newVal) => {
  const rawId = getRawValue(newVal)
  if (!rawId) {
    paintSectionIds.value = []
  } else {
    const subj = subjects.value?.find(sub => sub.id_subject == rawId)
    if (subj && subj.sections) {
      paintSectionIds.value = subj.sections.map(sec => sec.id_section)
    } else {
      paintSectionIds.value = []
    }
  }
})

const togglePaintMode = (val = null) => {
  if (!isPaintMode.value) {
    isDragging.value = false
    dragCurrentDay.value = null
  }
}

const applyPaint = (dayIndex, slotIndex) => {
  if (slotIndex === 4) return // Skip lunch break

  const rawPaintSubjectId = getRawValue(paintSubjectId.value)
  const rawPaintRoomId = getRawValue(paintRoomId.value)

  let sectionIds = []
  if (rawPaintSubjectId) {
    sectionIds = [...paintSectionIds.value]
  }

  // Erase mode (if rawPaintSubjectId is null), otherwise paint mode
  scheduleSlots.value[dayIndex][slotIndex].value = rawPaintSubjectId || null
  scheduleSlots.value[dayIndex][slotIndex].room_id = rawPaintSubjectId ? (rawPaintRoomId || null) : null
  scheduleSlots.value[dayIndex][slotIndex].section_ids = rawPaintSubjectId ? sectionIds : []
}

const startDrag = (dayIndex, slotIndex) => {
  if (!isPaintMode.value) return
  isDragging.value = true
  dragCurrentDay.value = dayIndex
  applyPaint(dayIndex, slotIndex)
}

const onDragOver = (dayIndex, slotIndex) => {
  if (!isPaintMode.value || !isDragging.value) return
  if (dragCurrentDay.value !== dayIndex) return // Can only drag vertically across same day
  applyPaint(dayIndex, slotIndex)
}

const endDrag = () => {
  if (isDragging.value) {
    isDragging.value = false
    dragCurrentDay.value = null
  }
}

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener('mouseup', endDrag)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('mouseup', endDrag)
  }
})

// Quick Add Subject to Schedule states
const quickAddOpen = ref(false)
const quickAddSubject = ref(null)
const quickAddDay = ref(null)
const quickAddStartTime = ref(null)
const quickAddDuration = ref(1)
const quickAddRoom = ref(null)
const quickAddSelectedSections = ref([])

const toast = useToast()

// --- Data Fetching ---
const { data: teachers, pending } = await useFetch('/api/teachers')
const { data: terms } = await useFetch('/api/terms')
// sections เป็น master table ไม่ขึ้นกับ term — fetch ครั้งเดียวพอ
const { data: sections, refresh: refreshSections, status: sectionsStatus } = await useFetch('/api/sections')
const { data: studyPlans } = await useFetch('/api/study-plans')

const studyPlanOptions = computed(() => {
  if (!studyPlans.value) return []
  return studyPlans.value.map(p => ({ value: p.id_plan, label: p.name_plan }))
})

// Helper to strictly get the primitive value from select boxes
const getRawValue = (val) => {
  if (val && typeof val === 'object' && 'value' in val) return val.value
  return val
}

// Variables for fetching subjects dynamically
const availableAddSubjectOptions = ref([])
watch(selectedAddPlanId, async (newVal) => {
  selectedAddSubjectId.value = null
  const planId = getRawValue(newVal)
  if (!planId) {
    availableAddSubjectOptions.value = []
    return
  }
  const subs = await $fetch('/api/study-plan-subjects', { query: { id_plan: planId } })
  availableAddSubjectOptions.value = subs.map(s => ({ value: s.id_subject_curr, label: `${s.subject_code || ''} ${s.name_subject}`, name_subject: s.name_subject }))
})

const availableEditSubjectOptions = ref([])
watch(editSelectedPlanId, async (newVal) => {
  editSelectedSubjectId.value = null
  const planId = getRawValue(newVal)
  if (!planId) {
    availableEditSubjectOptions.value = []
    return
  }
  const subs = await $fetch('/api/study-plan-subjects', { query: { id_plan: planId } })
  availableEditSubjectOptions.value = subs.map(s => ({ value: s.id_subject_curr, label: `${s.subject_code || ''} ${s.name_subject}`, name_subject: s.name_subject }))
})

const computedEditSubjectName = computed(() => {
  if (editSelectedSubjectId.value) {
    const s = availableEditSubjectOptions.value.find(s => s.value === editSelectedSubjectId.value)
    return s ? s.label : editLegacySubjectName.value
  }
  return editLegacySubjectName.value
})

const termOptions = computed(() => {
  if (!terms.value || terms.value.length === 0) return []
  return terms.value.map(t => ({
    label: `เทอม ${t.term}/${t.academic_year}`,
    value: `${t.term}/${t.academic_year}`
  }))
})

// Initialize selectedTerm before fetching subjects and schedule
const selectedTerm = ref(route.query.term || (termOptions.value.length > 0 ? termOptions.value[0].value : null))

// Sync selectedTerm changes to URL implicitly
watch(selectedTerm, (newVal) => {
  if (newVal && newVal !== route.query.term) {
    navigateTo({ query: { ...route.query, term: newVal } }, { replace: true })
  }
})

// ข้อมูลวิชาที่อาจารย์สอน
const { data: subjects, refresh: refreshSubjects } = await useFetch('/api/Subjects', {
  query: { id_teacher: id, term: selectedTerm }
})

// ข้อมูลตารางสอน
const scheduleSlots = useState(`schedule-slots-${id}`, () => Array.from({ length: 7 }, () =>
  Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] }))
))

// ข้อมูลวันเวลา
const timeSlots = [
  '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
  '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
  '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00'
]
const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

// --- Computeds ---
const teacherData = computed(() =>
  teachers.value?.find(t => t.id_teacher == id)
)

const teacherName = computed(() =>
  formatName(teacherData.value) || 'ไม่พบชื่ออาจารย์'
)

const formatName = (t) => {
  if (!t) return ''
  return [t.prefix, t.first_name, t.last_name].filter(Boolean).join(' ').trim()
}

const hoursPerWeek = computed(() => {
  if (!scheduleSlots.value) return 0
  let count = 0
  scheduleSlots.value.forEach((day) => {
    day.forEach((slot) => {
      if (slot.value && slot.value !== 'lunch') count++
    })
  })
  return count
})

const sectionOptions = computed(() => {
  if (!sections.value) return []
  return sections.value.map(s => ({
    value: s.id_section,
    label: s.section_name
  }))
})

const roomOptions = computed(() => {
  if (!rooms.value) return []
  return [
    { label: 'ไม่ระบุห้อง', value: null },
    ...rooms.value.map(r => ({
      value: r.id_room,
      label: r.room_name
    }))
  ]
})

// ตัวเลือกวิชาสำหรับตาราง - แสดงชื่อกลุ่มเรียนด้วย
const subjectOptions = computed(() => {
  if (!subjects.value) return []
  return subjects.value.map(s => ({
    value: s.id_subject,
    label: `${s.name_subject} (${s.section_names || '?'})`
  }))
})

const dayOptions = computed(() => {
  return days.map((day, index) => ({
    value: index,
    label: day
  }))
})

const timeSlotIndexOptions = computed(() => {
  if (quickAddDay.value === null || !quickAddDuration.value) {
    return timeSlots.map((time, index) => ({
      value: index,
      label: `เริ่ม ${time.split(' - ')[0]}`
    })).filter(opt => opt.value !== 4)
  }

  const daySlots = scheduleSlots.value[quickAddDay.value]
  const duration = quickAddDuration.value
  const availableOptions = []

  for (let startIdx = 0; startIdx < 13; startIdx++) {
    if (startIdx === 4) continue // ข้ามการเริ่มที่พักเที่ยง

    let canFit = true
    let slotsNeeded = 0
    let checkIdx = startIdx

    while (slotsNeeded < duration) {
      if (checkIdx >= 13) {
        canFit = false // เลยเวลา
        break
      }
      if (checkIdx === 4) {
        checkIdx++ // ข้ามพักเที่ยง
        continue
      }
      if (daySlots[checkIdx].value !== null) {
        canFit = false // ชนวิชาอื่น
        break
      }
      slotsNeeded++
      checkIdx++
    }

    if (canFit) {
      availableOptions.push({
        value: startIdx,
        label: `เริ่ม ${timeSlots[startIdx].split(' - ')[0]}`
      })
    }
  }

  return availableOptions
})

const durationOptions = [
  { value: 1, label: '1 ชั่วโมง' },
  { value: 2, label: '2 ชั่วโมง' },
  { value: 3, label: '3 ชั่วโมง' },
  { value: 4, label: '4 ชั่วโมง' },
  { value: 5, label: '5 ชั่วโมง' },
  { value: 6, label: '6 ชั่วโมง' },
  { value: 7, label: '7 ชั่วโมง' },
  { value: 8, label: '8 ชั่วโมง' },
  { value: 9, label: '9 ชั่วโมง' },
  { value: 10, label: '10 ชั่วโมง' },
  { value: 11, label: '11 ชั่วโมง' },
  { value: 12, label: '12 ชั่วโมง' }
]

const quickAddPreview = computed(() => {
  if (!quickAddSubject.value || quickAddDay.value === null || quickAddStartTime.value === null || !quickAddDuration.value) {
    return null
  }
  const subjectLabel = subjectOptions.value.find(s => s.value === quickAddSubject.value)?.label || '-'
  const dayLabel = dayOptions.value.find(d => d.value === quickAddDay.value)?.label || '-'
  const startTimeLabel = timeSlotIndexOptions.value.find(t => t.value === quickAddStartTime.value)?.label || '-'
  const roomLabel = quickAddRoom.value ? roomOptions.value.find(r => r.value === quickAddRoom.value)?.label : 'ไม่ระบุ'
  return `${subjectLabel} | ${dayLabel} | ${startTimeLabel} | ${quickAddDuration.value} ชั่วโมง | ห้อง: ${roomLabel}`
})

// เมื่อเปลี่ยนวิชาใน Quick Add ให้เลือกทุกกลุ่มเป็นค่าเริ่มต้น
watch(quickAddSubject, (newVal) => {
  if (newVal) {
    const subj = subjects.value?.find(s => s.id_subject == newVal)
    quickAddSelectedSections.value = subj ? subj.sections.map(s => s.id_section) : []
  } else {
    quickAddSelectedSections.value = []
  }
})

// Helper: เปรียบเทียบว่าสองช่องสามารถ merge ได้หรือไม่
// เงื่อนไข: วิชา + ห้องเรียน + กลุ่มนักศึกษา ต้องตรงกันทั้งหมด
const slotsCanMerge = (a, b) => {
  if (!a.value || a.value !== b.value) return false
  if (a.room_id !== b.room_id) return false
  const aIds = [...(a.section_ids || [])].sort((x, y) => x - y)
  const bIds = [...(b.section_ids || [])].sort((x, y) => x - y)
  if (aIds.length !== bIds.length) return false
  return aIds.every((id, idx) => id === bIds[idx])
}

// Logic สำหรับการ Merge ช่องที่วิชา + ห้อง + กลุ่มนักศึกษาเหมือนกันและติดกัน
const displaySlots = computed(() => {
  if (!scheduleSlots.value) return []
  return scheduleSlots.value.map((daySlots, dayIndex) => {
    const grouped = []
    for (let i = 0; i < daySlots.length; i++) {
      const current = daySlots[i]
      if (i === 4) { // พักเที่ยง ไม่ Merge
        grouped.push({ ...current, span: 1, isLunch: true, originalIndex: i })
        continue
      }
      let span = 1

      // Merge cells only if we are not in Paint Mode
      if (!isPaintMode.value) {
        while (
          i + span < daySlots.length
          && i + span !== 4 // ไม่ Merge ข้ามพักเที่ยง
          && slotsCanMerge(current, daySlots[i + span])
        ) {
          span++
        }
      }

      grouped.push({ ...current, span, originalIndex: i })
      i += span - 1
    }
    return grouped
  })
})

// --- Logic & Methods ---
const toggleSection = (sectionId) => {
  const index = selectedSections.value.indexOf(sectionId)
  if (index > -1) {
    selectedSections.value.splice(index, 1)
  } else {
    selectedSections.value.push(sectionId)
  }
}

const toggleEditSection = (sectionId) => {
  const index = editSelectedSections.value.indexOf(sectionId)
  if (index > -1) {
    editSelectedSections.value.splice(index, 1)
  } else {
    editSelectedSections.value.push(sectionId)
  }
}

const getSubjectLabel = (val, roomId = null, sectionIds = null) => {
  const subj = subjects.value?.find(s => s.id_subject == val)
  if (!subj) return 'Unknown'

  let sectionDisplay = ''
  if (sectionIds && Array.isArray(sectionIds) && sectionIds.length > 0) {
    const names = subj.sections
      .filter(s => sectionIds.includes(s.id_section))
      .map(s => s.section_name)
      .join(', ')
    sectionDisplay = names ? `(${names})` : '(No section)'
  } else {
    sectionDisplay = `(${subj.section_names || '?'})`
  }

  let roomName = ''
  if (roomId) {
    const r = rooms.value?.find(rm => rm.id_room == roomId)
    if (r) roomName = r.room_name
  }

  return `${subj.name_subject} ${sectionDisplay} ${roomName ? `[${roomName}]` : ''}`
}

const addSubject = async () => {
  const subjectId = getRawValue(selectedAddSubjectId.value)
  if (!subjectId || selectedSections.value.length === 0) {
    toast.add({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกวิชา และคุณกลุ่มเรียน อย่างน้อย 1 กลุ่ม', color: 'red' })
    return
  }

  const selectedSubjectData = availableAddSubjectOptions.value.find(s => s.value === subjectId)
  if (!selectedSubjectData) return

  try {
    const res = await $fetch('/api/Subjects', {
      method: 'POST',
      body: {
        name_subject: selectedSubjectData.name_subject, // Provide default name
        curriculum_subject_id: selectedSubjectData.value, // Send ID
        id_teacher: id,
        id_sections: selectedSections.value,
        term: selectedTerm.value
      }
    })
    toast.add({ title: 'สำเร็จ', description: 'เพิ่มรายวิชาเรียบร้อยแล้ว', color: 'primary' })
    selectedAddPlanId.value = null
    selectedAddSubjectId.value = null
    selectedSections.value = []
    await refreshSubjects()
  } catch (err) {
    console.error(err)
    toast.add({ title: 'ผิดพลาด', description: 'ไม่สามารถเพิ่มรายวิชาได้', color: 'error' })
  }
}

const confirmDeleteSubject = (subject) => {
  subjectToDelete.value = subject
  deleteOpen.value = true
}

const deleteSubject = async () => {
  if (!subjectToDelete.value) return
  const subjectId = subjectToDelete.value.id_subject
  try {
    await $fetch(`/api/Subjects/${subjectId}`, { method: 'DELETE' })
    await refreshSubjects()
    // ล้างออกจากตารางสอน (หน้าจอ)
    scheduleSlots.value.forEach((day) => {
      day.forEach((slot) => {
        if (slot.value === subjectId) {
          slot.value = null
          slot.room_id = null
        }
      })
    })
    deleteOpen.value = false
    subjectToDelete.value = null
    toast.add({ title: 'สำเร็จ', description: 'ลบรายวิชาเรียบร้อยแล้ว' })
  } catch (err) {
    console.error(err)
  }
}

const editSubject = (subject) => {
  currentEditSubject.value = subject
  editLegacySubjectName.value = subject.name_subject
  editSelectedPlanId.value = null
  editSelectedSubjectId.value = null
  // Get existing sections for this subject
  editSelectedSections.value = subject.sections ? subject.sections.map(s => s.id_section) : []
  editOpen.value = true
}

const updateSubject = async () => {
  if (editSelectedSections.value.length === 0) {
    toast.add({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกกลุ่มเรียน อย่างน้อย 1 กลุ่ม', color: 'red' })
    return
  }

  let newName = editLegacySubjectName.value
  let newCurrId = currentEditSubject.value.curriculum_subject_id || null

  const subjectId = getRawValue(editSelectedSubjectId.value)

  if (subjectId) {
    const s = availableEditSubjectOptions.value.find(s => s.value === subjectId)
    if (s) {
      newName = s.name_subject
      newCurrId = s.value
    }
  }

  try {
    await $fetch(`/api/Subjects/${currentEditSubject.value.id_subject}`, {
      method: 'PUT',
      body: {
        name_subject: newName,
        curriculum_subject_id: newCurrId,
        id_sections: editSelectedSections.value
      }
    })
    await refreshSubjects()
    editOpen.value = false
    toast.add({ title: 'สำเร็จ', description: 'แก้ไขรายวิชาเรียบร้อยแล้ว' })
  } catch (err) {
    console.error(err)
  }
}

const normalizeSchedule = (data) => {
  if (!Array.isArray(data)) return Array.from({ length: 7 }, () => Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] })))
  const res = [...data]
  while (res.length < 7) res.push(Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] })))
  return res.map((day) => {
    const d = Array.isArray(day) ? [...day] : []
    while (d.length < 13) d.push({ value: null, room_id: null, section_ids: [] })
    return d.map((slot) => {
      // Handle legacy format (just subject ID as value) or null
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

const clearSchedule = (noConfirm = false) => {
  if (!noConfirm && !confirm('ล้างตารางทั้งหมด?')) return
  scheduleSlots.value = Array.from({ length: 7 }, () =>
    Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] }))
  )
}

const isActiveBox = (d, s) => activeBox.value.day === d && activeBox.value.slot === s

const toggleDropdown = (d, s) => {
  if (isPaintMode.value) return // Disable dropdown in paint mode
  if (isActiveBox(d, s)) {
    activeBox.value = { day: null, slot: null }
  } else {
    activeBox.value = { day: d, slot: s }
  }
}

const setSlotValue = (d, s, val, span = 1) => {
  const subj = subjects.value?.find(sub => sub.id_subject == val)
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
  activeBox.value = { day: null, slot: null }
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

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      activeBox.value = { day: null, slot: null }
    }
  })
})

const saveSchedule = async () => {
  if (!selectedTerm.value) return
  saving.value = true
  try {
    await $fetch('/api/schedules', {
      method: 'POST',
      body: {
        schedule: scheduleSlots.value,
        id_teacher: id,
        term: selectedTerm.value
      }
    })
    toast.add({ title: 'สำเร็จ', description: 'บันทึกตารางสอนเรียบร้อยแล้ว' })
  } catch (err) {
    console.error(err)
    toast.add({ title: 'ผิดพลาด', description: 'ไม่สามารถบันทึกได้', color: 'error' })
  } finally {
    saving.value = false
  }
}

const addToSchedule = async () => {
  if (!quickAddSubject.value || quickAddDay.value === null || quickAddStartTime.value === null || !quickAddDuration.value) return

  const dayIdx = quickAddDay.value
  const startIdx = quickAddStartTime.value
  const duration = quickAddDuration.value
  const subjectId = quickAddSubject.value
  const roomId = quickAddRoom.value

  const subj = subjects.value?.find(s => s.id_subject == subjectId)
  const defaultSections = subj ? subj.sections.map(s => s.id_section) : []

  let slotsAdded = 0
  let currentIdx = startIdx

  while (slotsAdded < duration) {
    if (currentIdx >= 13) break // หมดวัน

    if (currentIdx === 4) {
      currentIdx++
      continue // ข้ามพักเที่ยง (ไม่นับรวมในจำนวนชั่วโมง)
    }

    scheduleSlots.value[dayIdx][currentIdx].value = subjectId
    scheduleSlots.value[dayIdx][currentIdx].room_id = roomId
    scheduleSlots.value[dayIdx][currentIdx].section_ids = [...quickAddSelectedSections.value]

    slotsAdded++
    currentIdx++
  }

  // Reset fields for next add
  quickAddSubject.value = null
  quickAddRoom.value = null
  // Preserve day, but advance start time
  if (currentIdx === 4) {
    quickAddStartTime.value = 5 // Skip lunch
  } else if (currentIdx >= 13) {
    quickAddStartTime.value = null // End of day
    quickAddOpen.value = false // Close if day is full
  } else {
    quickAddStartTime.value = currentIdx
  }

  toast.add({ title: 'สำเร็จ', description: 'เพิ่มวิชาในตารางแล้ว' })
  // quickAddOpen.value = false // Keep open for sequential add
}

// --- Data Synchronization ---
const { data: scheduleData, error: scheduleError } = await useFetch('/api/schedules', {
  query: { id_teacher: id, term: selectedTerm },
  immediate: true
})

watch(scheduleData, (newData) => {
  if (newData?.scheduleData) {
    scheduleSlots.value = normalizeSchedule(newData.scheduleData)
  } else {
    clearSchedule(true)
  }
}, { immediate: true })

watch(scheduleError, (err) => {
  if (err) console.error('[Schedule] API Error:', err)
})
</script>
