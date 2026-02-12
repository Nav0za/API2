<template>
  <div class="w-full bg-white border border-gray-200 p-6 shadow-md rounded-2xl">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">
        ปฏิทินการสอน
      </h1>
      <div class="flex gap-2">
        <UButton
          label="เพิ่มวันหยุด"
          icon="i-lucide-calendar-off"
          color="warning"
          @click="openHolidayModal"
        />
        <UButton
          label="อาจารย์ติดธุระ"
          icon="i-lucide-user-x"
          color="error"
          @click="openAbsenceModal"
        />
      </div>
    </div>

    <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
    />

    <!-- Modal เพิ่มวันหยุด -->
    <UModal
      v-model:open="holidayModalOpen"
      title="เพิ่มวันหยุด"
    >
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">ชื่อวันหยุด</label>
            <UInput
              v-model="holidayForm.title"
              placeholder="เช่น วันสงกรานต์"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">วันที่</label>
            <UInput
              v-model="holidayForm.date"
              type="date"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">รายละเอียด</label>
            <UTextarea
              v-model="holidayForm.description"
              placeholder="รายละเอียดเพิ่มเติม"
              :rows="2"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <UButton
          label="ยกเลิก"
          color="neutral"
          @click="holidayModalOpen = false"
        />
        <UButton
          label="บันทึก"
          color="primary"
          :loading="saving"
          @click="saveHoliday"
        />
      </template>
    </UModal>

    <!-- Modal อาจารย์ติดธุระ -->
    <UModal
      v-model:open="absenceModalOpen"
      title="บันทึกอาจารย์ติดธุระ"
    >
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">อาจารย์</label>
            <USelect
              v-model="absenceForm.teacherId"
              :items="teacherOptions"
              placeholder="เลือกอาจารย์"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">วันที่ขาดสอน</label>
            <UInput
              v-model="absenceForm.date"
              type="date"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">เทอม</label>
            <USelect
              v-model="absenceForm.term"
              :items="termOptions"
              placeholder="เลือกเทอม"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">เหตุผล</label>
            <UTextarea
              v-model="absenceForm.reason"
              placeholder="เช่น ราชการ, ป่วย"
              :rows="2"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <UButton
          label="ยกเลิก"
          color="neutral"
          @click="absenceModalOpen = false"
        />
        <UButton
          label="บันทึกและหาช่วงชดเชย"
          color="primary"
          :loading="saving"
          @click="saveAbsenceAndFindSlots"
        />
      </template>
    </UModal>

    <!-- Modal แสดงช่วงว่างที่แนะนำ -->
    <UModal
      v-model:open="slotsModalOpen"
      title="ช่วงว่างที่แนะนำสำหรับสอนชดเชย"
      :ui="{ width: 'max-w-4xl' }"
    >
      <template #body>
        <div
          v-if="loadingSlots"
          class="text-center py-10"
        >
          กำลังค้นหาช่วงว่าง...
        </div>

        <div
          v-else-if="availableSlots.length === 0"
          class="text-center py-10 text-gray-500"
        >
          <p class="mb-2">
            ไม่พบช่วงว่างที่เหมาะสม
          </p>
          <p class="text-sm">
            ลองเลื่อนวันหรือปรับตารางสอน
          </p>
        </div>

        <div
          v-else
          class="space-y-3 max-h-96 overflow-y-auto"
        >
          <div
            v-for="(slot, index) in availableSlots"
            :key="index"
            class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                    {{ slot.dayOfWeek }}
                  </span>
                  <span class="text-lg font-semibold">
                    {{ formatDateThai(slot.date) }}
                  </span>
                </div>

                <div class="text-gray-700 mb-1">
                  <span class="font-medium">เวลา:</span>
                  {{ slot.timeStart }} - {{ slot.timeEnd }}
                  <span class="text-sm text-gray-500">({{ slot.duration }} ชั่วโมง)</span>
                </div>

                <div
                  v-if="slot.missedClass"
                  class="text-sm text-gray-600"
                >
                  <span class="font-medium">วิชา:</span> {{ slot.missedClass }}
                </div>

                <div
                  v-if="slot.sectionName"
                  class="text-sm text-gray-600"
                >
                  <span class="font-medium">กลุ่ม:</span> {{ slot.sectionName }}
                </div>
              </div>

              <UButton
                label="เลือก"
                color="primary"
                size="sm"
                @click="confirmMakeupClass(slot)"
              />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <UButton
          label="ปิด"
          color="neutral"
          @click="slotsModalOpen = false"
        />
      </template>
    </UModal>

    <!-- Modal ยืนยันการจัดสอนชดเชย -->
    <UModal
      v-model:open="confirmMakeupModalOpen"
      title="ยืนยันการจัดสอนชดเชย"
    >
      <template #body>
        <div
          v-if="selectedSlot"
          class="space-y-3"
        >
          <p class="text-lg font-medium mb-3">
            กรุณาเลือกห้องเรียน
          </p>

          <div class="bg-blue-50 p-3 rounded-lg text-sm">
            <p><strong>วันที่:</strong> {{ formatDateThai(selectedSlot.date) }} ({{ selectedSlot.dayOfWeek }})</p>
            <p><strong>เวลา:</strong> {{ selectedSlot.timeStart }} - {{ selectedSlot.timeEnd }}</p>
            <p v-if="selectedSlot.missedClass">
              <strong>วิชา:</strong> {{ selectedSlot.missedClass }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">ห้องเรียน</label>
            <USelect
              v-model="makeupForm.roomId"
              :items="roomOptions"
              placeholder="เลือกห้องเรียน"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">หมายเหตุ</label>
            <UTextarea
              v-model="makeupForm.notes"
              placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
              :rows="2"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <UButton
          label="ยกเลิก"
          color="neutral"
          @click="confirmMakeupModalOpen = false"
        />
        <UButton
          label="ยืนยัน"
          color="primary"
          :loading="saving"
          @click="saveMakeupClass"
        />
      </template>
    </UModal>

    <!-- Modal รายละเอียด Event -->
    <UModal
      v-model:open="viewEventModalOpen"
      title="รายละเอียด"
    >
      <template #body>
        <div
          v-if="selectedEvent"
          class="space-y-3"
        >
          <div>
            <h3 class="font-bold text-lg">
              {{ selectedEvent.title }}
            </h3>
          </div>

          <div v-if="selectedEvent.extendedProps?.teacherName">
            <span class="text-sm text-gray-600">อาจารย์: </span>
            <span class="font-medium">{{ selectedEvent.extendedProps.teacherName }}</span>
          </div>

          <div>
            <span class="text-sm text-gray-600">เริ่ม: </span>
            <span>{{ formatDate(selectedEvent.start) }}</span>
          </div>

          <div v-if="selectedEvent.end">
            <span class="text-sm text-gray-600">สิ้นสุด: </span>
            <span>{{ formatDate(selectedEvent.end) }}</span>
          </div>

          <div v-if="selectedEvent.extendedProps?.description">
            <span class="text-sm text-gray-600">รายละเอียด: </span>
            <p class="mt-1">
              {{ selectedEvent.extendedProps.description }}
            </p>
          </div>

          <div v-if="selectedEvent.extendedProps?.eventType">
            <span class="text-sm text-gray-600">ประเภท: </span>
            <span
              class="px-2 py-1 rounded text-sm"
              :class="getEventTypeClass(selectedEvent.extendedProps.eventType)"
            >
              {{ getEventTypeLabel(selectedEvent.extendedProps.eventType) }}
            </span>
          </div>
        </div>
      </template>
      <template #footer>
        <UButton
          v-if="selectedEvent?.extendedProps?.eventType !== 'holiday'"
          label="ลบ"
          color="error"
          icon="i-lucide-trash"
          @click="deleteEvent"
        />
        <UButton
          label="ปิด"
          color="neutral"
          @click="viewEventModalOpen = false"
        />
      </template>
    </UModal>
  </div>
</template>

<script setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import thLocale from '@fullcalendar/core/locales/th'

const props = defineProps({
  teachers: {
    type: Array,
    default: () => []
  }
})

const calendarRef = ref(null)
const toast = useToast()

// Modals
const holidayModalOpen = ref(false)
const absenceModalOpen = ref(false)
const slotsModalOpen = ref(false)
const confirmMakeupModalOpen = ref(false)
const viewEventModalOpen = ref(false)

const saving = ref(false)
const loadingSlots = ref(false)

// Forms
const holidayForm = ref({
  title: '',
  date: '',
  description: ''
})

const absenceForm = ref({
  teacherId: null,
  date: '',
  term: null,
  reason: ''
})

const makeupForm = ref({
  roomId: null,
  notes: ''
})

// Data
const { data: events, refresh: refreshEvents } = await useFetch('/api/calendar-events', {
  default: () => []
})

const { data: terms } = await useFetch('/api/terms')
const { data: rooms } = await useFetch('/api/rooms')

const availableSlots = ref([])
const selectedSlot = ref(null)
const selectedEvent = ref(null)

// Options
const teacherOptions = computed(() => {
  return props.teachers.map(t => ({
    label: t.name,
    value: t.id_teacher
  }))
})

const termOptions = computed(() => {
  if (!terms.value || terms.value.length === 0) return []
  return terms.value.map(t => ({
    label: `เทอม ${t.term}/${t.academic_year}`,
    value: `${t.term}/${t.academic_year}`
  }))
})

// เมื่อเปิด modal อาจารย์ติดธุระ ให้เลือกเทอมแรกถ้ามี
watch(absenceModalOpen, (isOpen) => {
  if (isOpen && terms.value && terms.value.length > 0) {
    absenceForm.value.term = `${terms.value[0].term}/${terms.value[0].academic_year}`
  }
})

const roomOptions = computed(() => {
  if (!rooms.value) return []
  return rooms.value.map(r => ({
    label: `${r.room_name}${r.building ? ` (${r.building})` : ''}`,
    value: r.id_room
  }))
})

// Calendar Options
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  locale: thLocale,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,listWeek'
  },
  buttonText: {
    today: 'วันนี้',
    month: 'เดือน',
    week: 'สัปดาห์',
    list: 'รายการ'
  },
  height: 'auto',
  editable: false,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  events: events.value || [],
  eventClick: handleEventClick
}))

// เปิด Modal วันหยุด
const openHolidayModal = () => {
  holidayForm.value = {
    title: '',
    date: '',
    description: ''
  }
  holidayModalOpen.value = true
}

// เปิด Modal อาจารย์ติดธุระ
const openAbsenceModal = () => {
  absenceForm.value = {
    teacherId: null,
    date: '',
    term: null,
    reason: ''
  }
  absenceModalOpen.value = true
}

// บันทึกวันหยุด
const saveHoliday = async () => {
  if (!holidayForm.value.title || !holidayForm.value.date) {
    toast.add({
      title: 'ข้อมูลไม่ครบ',
      description: 'กรุณากรอกชื่อและวันที่',
      color: 'error'
    })
    return
  }

  saving.value = true

  try {
    await $fetch('/api/calendar-events', {
      method: 'POST',
      body: {
        title: holidayForm.value.title,
        start: holidayForm.value.date,
        end: holidayForm.value.date,
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        extendedProps: {
          eventType: 'holiday',
          description: holidayForm.value.description
        }
      }
    })

    toast.add({
      title: 'สำเร็จ',
      description: 'บันทึกวันหยุดเรียบร้อยแล้ว',
      color: 'primary'
    })

    await refreshEvents()
    holidayModalOpen.value = false
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถบันทึกวันหยุดได้',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

// บันทึกอาจารย์ติดธุระและหาช่วงว่าง
const saveAbsenceAndFindSlots = async () => {
  if (!absenceForm.value.teacherId || !absenceForm.value.date || !absenceForm.value.term) {
    toast.add({
      title: 'ข้อมูลไม่ครบ',
      description: 'กรุณากรอกข้อมูลให้ครบ',
      color: 'error'
    })
    return
  }

  saving.value = true

  try {
    // บันทึก event อาจารย์ติดธุระ
    const teacher = props.teachers.find(t => t.id_teacher === absenceForm.value.teacherId)

    await $fetch('/api/calendar-events', {
      method: 'POST',
      body: {
        title: `${teacher?.name} - ติดธุระ`,
        start: absenceForm.value.date,
        end: absenceForm.value.date,
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        extendedProps: {
          eventType: 'teacher_absence',
          teacherId: absenceForm.value.teacherId,
          teacherName: teacher?.name,
          description: absenceForm.value.reason
        }
      }
    })

    await refreshEvents()
    absenceModalOpen.value = false

    // หาช่วงว่างอัตโนมัติ
    loadingSlots.value = true
    slotsModalOpen.value = true

    const slotsData = await $fetch('/api/find-slots', {
      query: {
        teacher_id: absenceForm.value.teacherId,
        missed_date: absenceForm.value.date,
        term: absenceForm.value.term
      }
    })

    availableSlots.value = slotsData.suggestions || []

    if (availableSlots.value.length > 0) {
      toast.add({
        title: 'พบช่วงว่าง',
        description: `พบ ${availableSlots.value.length} ช่วงเวลาที่เหมาะสม`,
        color: 'primary'
      })
    }
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถประมวลผลได้',
      color: 'error'
    })
  } finally {
    saving.value = false
    loadingSlots.value = false
  }
}

// ยืนยันเลือกช่วงสอนชดเชย
const confirmMakeupClass = (slot) => {
  selectedSlot.value = slot
  makeupForm.value = {
    roomId: null,
    notes: ''
  }
  slotsModalOpen.value = false
  confirmMakeupModalOpen.value = true
}

// บันทึกคลาสชดเชย
const saveMakeupClass = async () => {
  if (!selectedSlot.value || !makeupForm.value.roomId) {
    toast.add({
      title: 'กรุณาเลือกห้องเรียน',
      color: 'error'
    })
    return
  }

  saving.value = true

  try {
    // บันทึกใน makeup_classes
    await $fetch('/api/makeup-classes', {
      method: 'POST',
      body: {
        original_date: selectedSlot.value.missedDate,
        original_time_slot: '',
        makeup_date: selectedSlot.value.date,
        makeup_time_start: selectedSlot.value.timeStart,
        makeup_time_end: selectedSlot.value.timeEnd,
        teacher_id: absenceForm.value.teacherId,
        room_id: makeupForm.value.roomId,
        status: 'confirmed',
        notes: makeupForm.value.notes
      }
    })

    // เพิ่ม event ในปฏิทิน
    const teacher = props.teachers.find(t => t.id_teacher === absenceForm.value.teacherId)
    const room = rooms.value?.find(r => r.id_room === makeupForm.value.roomId)

    await $fetch('/api/calendar-events', {
      method: 'POST',
      body: {
        title: `สอนชดเชย - ${teacher?.name}`,
        start: `${selectedSlot.value.date}T${selectedSlot.value.timeStart}:00`,
        end: `${selectedSlot.value.date}T${selectedSlot.value.timeEnd}:00`,
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        extendedProps: {
          eventType: 'makeup_class',
          teacherId: absenceForm.value.teacherId,
          teacherName: teacher?.name,
          description: `ห้อง: ${room?.room_name || 'ไม่ระบุ'}\n${makeupForm.value.notes || ''}`
        }
      }
    })

    toast.add({
      title: 'สำเร็จ',
      description: 'จัดสอนชดเชยเรียบร้อยแล้ว',
      color: 'primary'
    })

    await refreshEvents()
    confirmMakeupModalOpen.value = false
    selectedSlot.value = null
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถบันทึกได้',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

// คลิก Event
const handleEventClick = (clickInfo) => {
  selectedEvent.value = clickInfo.event
  viewEventModalOpen.value = true
}

// ลบ Event
const deleteEvent = async () => {
  if (!selectedEvent.value) return

  try {
    await $fetch(`/api/calendar-events/${selectedEvent.value.id}`, {
      method: 'DELETE'
    })

    toast.add({
      title: 'สำเร็จ',
      description: 'ลบรายการเรียบร้อยแล้ว',
      color: 'primary'
    })

    await refreshEvents()
    viewEventModalOpen.value = false
    selectedEvent.value = null
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถลบได้',
      color: 'error'
    })
  }
}

// Helper functions
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateThai = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getEventTypeLabel = (type) => {
  const types = {
    holiday: 'วันหยุด',
    teacher_absence: 'อาจารย์ติดธุระ',
    makeup_class: 'สอนชดเชย',
    normal: 'ปกติ'
  }
  return types[type] || type
}

const getEventTypeClass = (type) => {
  const classes = {
    holiday: 'bg-amber-100 text-amber-700',
    teacher_absence: 'bg-red-100 text-red-700',
    makeup_class: 'bg-green-100 text-green-700',
    normal: 'bg-blue-100 text-blue-700'
  }
  return classes[type] || classes.normal
}
</script>

<style>
:deep(.fc) {
  font-family: inherit;
}

:deep(.fc .fc-button) {
  background-color: #3b82f6;
  border-color: #3b82f6;
  text-transform: capitalize;
}

:deep(.fc .fc-button:hover) {
  background-color: #2563eb;
  border-color: #2563eb;
}

:deep(.fc .fc-button-primary:not(:disabled).fc-button-active) {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

:deep(.fc-daygrid-event) {
  cursor: pointer;
}

:deep(.fc-event) {
  border-radius: 4px;
}
</style>
