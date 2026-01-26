<template>
  <div class="w-full bg-white border border-gray-200 p-6 shadow-md rounded-2xl">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">
        ปฏิทินกิจกรรมอาจารย์
      </h1>
      <UButton
        label="เพิ่มกิจกรรม"
        icon="i-lucide-plus"
        color="primary"
        @click="openAddEventModal"
      />
    </div>

    <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
    />

    <!-- Modal เพิ่ม/แก้ไขกิจกรรม -->
    <UModal
      v-model:open="eventModalOpen"
      :title="editingEvent ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรม'"
    >
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">ชื่อกิจกรรม</label>
            <UInput
              v-model="eventForm.title"
              placeholder="ระบุชื่อกิจกรรม"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">อาจารย์</label>
            <USelect
              v-model="eventForm.teacherId"
              :options="teacherOptions"
              placeholder="เลือกอาจารย์"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">วันที่เริ่ม</label>
              <UInput
                v-model="eventForm.start"
                type="datetime-local"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">วันที่สิ้นสุด</label>
              <UInput
                v-model="eventForm.end"
                type="datetime-local"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">สี</label>
            <div class="flex gap-2">
              <button
                v-for="color in colorOptions"
                :key="color"
                :class="[
                  'w-8 h-8 rounded-full border-2',
                  eventForm.color === color ? 'border-gray-800' : 'border-transparent'
                ]"
                :style="{ backgroundColor: color }"
                @click="eventForm.color = color"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">รายละเอียด</label>
            <UTextarea
              v-model="eventForm.description"
              placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
              :rows="3"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-between w-full">
          <UButton
            v-if="editingEvent"
            label="ลบ"
            color="error"
            icon="i-lucide-trash"
            @click="deleteEvent"
          />
          <div class="flex gap-2 ml-auto">
            <UButton
              label="ยกเลิก"
              color="gray"
              @click="eventModalOpen = false"
            />
            <UButton
              label="บันทึก"
              color="primary"
              @click="saveEvent"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal รายละเอียดกิจกรรม -->
    <UModal
      v-model:open="viewEventModalOpen"
      title="รายละเอียดกิจกรรม"
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
          <div>
            <span class="text-sm text-gray-600">สิ้นสุด: </span>
            <span>{{ formatDate(selectedEvent.end) }}</span>
          </div>
          <div v-if="selectedEvent.extendedProps?.description">
            <span class="text-sm text-gray-600">รายละเอียด: </span>
            <p class="mt-1">
              {{ selectedEvent.extendedProps.description }}
            </p>
          </div>
        </div>
      </template>
      <template #footer>
        <UButton
          label="แก้ไข"
          color="warning"
          icon="i-lucide-edit"
          @click="editEvent"
        />
        <UButton
          label="ปิด"
          color="gray"
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
const eventModalOpen = ref(false)
const viewEventModalOpen = ref(false)
const editingEvent = ref(null)
const selectedEvent = ref(null)

// ตัวเลือกสีสำหรับกิจกรรม
const colorOptions = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4' // cyan
]

// ฟอร์มกิจกรรม
const eventForm = ref({
  title: '',
  teacherId: null,
  start: '',
  end: '',
  color: colorOptions[0],
  description: ''
})

// แปลง teachers เป็น options สำหรับ select
const teacherOptions = computed(() => {
  return props.teachers.map(t => ({
    label: t.name,
    value: t.id_teacher
  }))
})

// ดึงข้อมูลกิจกรรมจาก API
const { data: events, refresh: refreshEvents } = await useFetch('/api/calendar-events', {
  default: () => []
})

// ตั้งค่า FullCalendar
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  locale: thLocale,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  },
  buttonText: {
    today: 'วันนี้',
    month: 'เดือน',
    week: 'สัปดาห์',
    day: 'วัน',
    list: 'รายการ'
  },
  height: 'auto',
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  events: events.value || [],
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize
}))

// เปิด Modal เพิ่มกิจกรรม
const openAddEventModal = () => {
  editingEvent.value = null
  eventForm.value = {
    title: '',
    teacherId: null,
    start: '',
    end: '',
    color: colorOptions[0],
    description: ''
  }
  eventModalOpen.value = true
}

// เลือกวันในปฏิทิน
const handleDateSelect = (selectInfo) => {
  editingEvent.value = null
  const startDate = new Date(selectInfo.start)
  const endDate = new Date(selectInfo.end)

  eventForm.value = {
    title: '',
    teacherId: null,
    start: formatDateTimeLocal(startDate),
    end: formatDateTimeLocal(endDate),
    color: colorOptions[0],
    description: ''
  }
  eventModalOpen.value = true
}

// คลิกที่กิจกรรม
const handleEventClick = (clickInfo) => {
  selectedEvent.value = clickInfo.event
  viewEventModalOpen.value = true
}

// แก้ไขกิจกรรม
const editEvent = () => {
  viewEventModalOpen.value = false
  editingEvent.value = selectedEvent.value

  eventForm.value = {
    title: selectedEvent.value.title,
    teacherId: selectedEvent.value.extendedProps?.teacherId || null,
    start: formatDateTimeLocal(selectedEvent.value.start),
    end: formatDateTimeLocal(selectedEvent.value.end || selectedEvent.value.start),
    color: selectedEvent.value.backgroundColor || colorOptions[0],
    description: selectedEvent.value.extendedProps?.description || ''
  }
  eventModalOpen.value = true
}

// ลากเปลี่ยนวันกิจกรรม
const handleEventDrop = async (info) => {
  const eventData = {
    start: info.event.start.toISOString(),
    end: info.event.end ? info.event.end.toISOString() : info.event.start.toISOString()
  }

  try {
    await $fetch(`/api/calendar-events/${info.event.id}`, {
      method: 'PUT',
      body: eventData
    })
  } catch (err) {
    console.error(err)
    info.revert()
  }
}

// ปรับขนาดกิจกรรม
const handleEventResize = async (info) => {
  const eventData = {
    end: info.event.end.toISOString()
  }

  try {
    await $fetch(`/api/calendar-events/${info.event.id}`, {
      method: 'PUT',
      body: eventData
    })
  } catch (err) {
    console.error(err)
    info.revert()
  }
}

// บันทึกกิจกรรม
const saveEvent = async () => {
  if (!eventForm.value.title || !eventForm.value.start) return

  const teacherName = props.teachers.find(t => t.id_teacher === eventForm.value.teacherId)?.name || ''

  const eventData = {
    title: eventForm.value.title,
    start: new Date(eventForm.value.start).toISOString(),
    end: new Date(eventForm.value.end || eventForm.value.start).toISOString(),
    backgroundColor: eventForm.value.color,
    borderColor: eventForm.value.color,
    extendedProps: {
      teacherId: eventForm.value.teacherId,
      teacherName: teacherName,
      description: eventForm.value.description
    }
  }

  try {
    if (editingEvent.value) {
      // อัปเดตกิจกรรม
      await $fetch(`/api/calendar-events/${editingEvent.value.id}`, {
        method: 'PUT',
        body: eventData
      })
    } else {
      // เพิ่มกิจกรรมใหม่
      await $fetch('/api/calendar-events', {
        method: 'POST',
        body: eventData
      })
    }

    await refreshEvents()
    eventModalOpen.value = false
  } catch (err) {
    console.error(err)
  }
}

// ลบกิจกรรม
const deleteEvent = async () => {
  if (!editingEvent.value) return

  try {
    await $fetch(`/api/calendar-events/${editingEvent.value.id}`, {
      method: 'DELETE'
    })

    await refreshEvents()
    eventModalOpen.value = false
  } catch (err) {
    console.error(err)
  }
}

// ฟังก์ชันช่วยจัดรูปแบบวันที่
const formatDateTimeLocal = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

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
</script>

<style>
/* ปรับแต่ง FullCalendar ให้เข้ากับธีม */
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
