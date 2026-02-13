<template>
  <div class="w-full">
    <!-- Header -->
    <div class="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-20 shadow-lg mb-8">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 class="text-3xl font-bold text-white flex items-center gap-2">
            <UIcon name="i-heroicons-calendar-days" class="text-blue-400" />
            ปฏิทินการสอน
          </h1>
          <p class="text-slate-400 mt-1">จัดการวันหยุด อาจารย์ติดธุระ และการสอนชดเชย</p>
        </div>
        
        <div class="flex flex-wrap gap-3 justify-center">
          <UButton
            label="เพิ่มวันหยุด"
            icon="i-lucide-calendar-off"
            color="warning"
            variant="subtle"
            size="lg"
            class="rounded-xl font-bold cursor-pointer"
            @click="openHolidayModal"
          />
          <UButton
            label="อาจารย์ติดธุระ"
            icon="i-lucide-user-x"
            color="error"
            variant="subtle"
            size="lg"
            class="rounded-xl font-bold cursor-pointer"
            @click="openAbsenceModal"
          />
          <UButton
            label="รายการชดเชย"
            icon="i-heroicons-clipboard-document-list"
            color="primary"
            variant="soft"
            size="lg"
            class="rounded-xl font-bold"
            to="/makeup-classes"
          />
          <UButton
            label="สรุปรายงาน"
            icon="i-lucide-bar-chart-3"
            color="secondary"
            variant="soft"
            size="lg"
            class="rounded-xl font-bold"
            to="/summary"
          />
        </div>
      </div>
    </div>

    <!-- Calendar Container -->
    <div class="container mx-auto px-4">
      <div class="bg-slate-800 border border-slate-700 p-6 shadow-xl rounded-3xl text-white">

        <FullCalendar
          ref="calendarRef"
          :options="calendarOptions"
        />
      </div>
    </div>

    <!-- Modal เพิ่มวันหยุด -->
    <UModal
      v-model:open="holidayModalOpen"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }"
    >
      <template #content>
        <div class="p-8">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <UIcon name="i-lucide-calendar-off" class="text-2xl text-amber-500" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white">{{ isEditingHoliday ? 'แก้ไขวันหยุด' : 'เพิ่มวันหยุด' }}</h3>
              <p class="text-slate-400 text-sm">กำหนดวันหยุดพิเศษสำหรับการคำนวณตารางสอน</p>
            </div>
          </div>
          <div class="space-y-6">
            <UFormField label="ชื่อวันหยุด *" color="error" help="เช่น วันสงกรานต์, วันหยุดพิเศษ">
              <UInput
                v-model="holidayForm.title"
                placeholder="ระบุชื่อวันหยุด..."
                size="xl"
                class="rounded-xl"
              />
            </UFormField>

            <UFormField label="วันที่ *">
              <UInput
                v-model="holidayForm.date"
                type="date"
                size="xl"
                class="rounded-xl"
              />
            </UFormField>

            <UFormField label="รายละเอียดเพิ่มเติม">
              <UTextarea
                v-model="holidayForm.description"
                placeholder="หมายเหตุหรือรายละเอียดเพิ่มเติม (ถ้ามี)..."
                :rows="3"
                size="xl"
                class="rounded-xl"
              />
            </UFormField>
          </div>

          <div class="flex gap-3 mt-10">
            <UButton
              label="ยกเลิก"
              color="neutral"
              variant="soft"
              size="xl"
              block
              class="rounded-2xl py-4 flex-1 font-bold"
              @click="holidayModalOpen = false"
            />
            <UButton
              :label="isEditingHoliday ? 'บันทึกการแก้ไข' : 'เพิ่มวันหยุด'"
              color="primary"
              size="xl"
              block
              class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold"
              :loading="saving"
              @click="saveHoliday"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal อาจารย์ติดธุระ -->
    <UModal
      v-model:open="absenceModalOpen"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }"
    >
      <template #content>
        <div class="p-8">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
              <UIcon name="i-lucide-user-x" class="text-2xl text-red-500" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white">บันทึกอาจารย์ติดธุระ</h3>
              <p class="text-slate-400 text-sm">ระบุวันที่ขาดสอนเพื่อหาช่วงเวลาชดเชยที่เหมาะสม</p>
            </div>
          </div>

          <div class="space-y-6">
            <UFormField label="อาจารย์ *" help="เลือกอาจารย์ที่ต้องการบันทึกวันติดธุระ" :ui="{ label: 'text-white font-semibold', help: 'text-slate-400' }">
              <USelect
                v-model="absenceForm.teacherId"
                :items="teacherOptions"
                placeholder="เลือกอาจารย์"
                size="xl"
                class="rounded-xl"
              />
            </UFormField>

            <UFormField label="เทอม *" help="เทอมการศึกษาที่เกี่ยวข้อง" :ui="{ label: 'text-white font-semibold', help: 'text-slate-400' }">
              <USelect
                v-model="absenceForm.term"
                :items="termOptions"
                placeholder="เลือกเทอม"
                size="xl"
                class="rounded-xl"
              />
            </UFormField>

            <UFormField label="วันที่ขาดสอน *" :ui="{ label: 'text-white font-semibold' }">
              <UInput
                v-model="absenceForm.date"
                type="date"
                size="xl"
                class="rounded-xl"
              />
            </UFormField>

            <!-- แสดงรายการวิชาที่สอนในวันนั้น -->
            <div v-if="loadingMissedClasses" class="flex justify-center p-4">
              <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6 text-slate-400" />
            </div>

            <div v-else-if="absenceForm.teacherId && absenceForm.date && absenceForm.term && missedClasses.length === 0" class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
              <div class="flex items-start gap-2">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p class="font-medium">ไม่พบรายการวิชาที่สอนในวันที่เลือก</p>
                  <p class="text-xs text-amber-400/80 mt-1">กรุณาตรวจสอบว่าเลือกเทอมถูกต้อง</p>
                </div>
              </div>
            </div>

            <div v-else-if="missedClasses.length > 0" class="border border-slate-700 rounded-xl p-4 bg-slate-800/50">
              <label class="block text-sm font-semibold mb-3 text-white">วิชาที่ขาดสอน (เลือกวิชาที่ต้องการจัดชดเชย)</label>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div 
                  v-for="cls in missedClasses" 
                  :key="cls.subjectId" 
                  class="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500/50 transition-all cursor-pointer"
                  :class="{ 'opacity-50 border-slate-700': !cls.selected, 'border-blue-500/50 bg-blue-500/10': cls.selected }"
                >
                  <UCheckbox v-model="cls.selected" class="mt-1" />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-white truncate">{{ cls.subjectName }}</p>
                    <p class="text-xs text-slate-400 mt-1">
                      {{ cls.timeStart }} - {{ cls.timeEnd }} ({{ cls.duration }} ชม.)
                      <span v-if="cls.sectionName"> • {{ cls.sectionName }}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-slate-700 flex justify-between text-xs font-medium">
                <span class="text-slate-400">เลือกแล้ว: {{ selectedClassesCount }} วิชา</span>
                <span class="text-blue-400">รวม: {{ totalDuration }} ชั่วโมง</span>
              </div>
            </div>

            <UFormField label="เหตุผล" help="เช่น ราชการ, ป่วย, ลากิจ" :ui="{ label: 'text-white font-semibold', help: 'text-slate-400' }">
              <UTextarea
                v-model="absenceForm.reason"
                placeholder="ระบุเหตุผลในการขาดสอน..."
                :rows="3"
                size="xl"
                class="rounded-xl"
              />
            </UFormField>
          </div>

          <div class="flex gap-3 mt-10">
            <UButton
              label="ยกเลิก"
              color="neutral"
              variant="soft"
              size="xl"
              block
              class="rounded-2xl py-4 flex-1 font-bold"
              @click="absenceModalOpen = false"
            />
            <UButton
              label="บันทึกและหาช่วงชดเชย"
              color="primary"
              size="xl"
              block
              class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold"
              :loading="saving"
              @click="saveAbsenceAndFindSlots"
            />
          </div>
        </div>
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

                <!-- แสดงรายการวิชาทั้งหมด (ถ้ามี) -->
                <div v-if="slot.classes && slot.classes.length > 0" class="mt-2 space-y-1">
                  <p class="text-sm font-medium text-gray-600">วิชาที่จะสอนชดเชย:</p>
                  <div 
                    v-for="cls in slot.classes" 
                    :key="cls.subjectId" 
                    class="text-sm text-gray-600 pl-3"
                  >
                    • {{ cls.subjectName }} 
                    <span v-if="cls.sectionName" class="text-gray-500">({{ cls.sectionName }})</span>
                    - {{ cls.duration }} ชม.
                  </div>
                </div>

                <!-- แสดงแบบเดิม (ถ้าไม่มี classes) -->
                <template v-else>
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
                </template>
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
        <div class="flex justify-between w-full">
          <div class="flex gap-2">
            <!-- ปุ่มลบ: แสดงถ้าไม่ใช่ hardcoded holiday หรือถ้ามี ID (วันหยุดที่เพิ่มเอง) -->
            <UButton
              v-if="selectedEvent?.id && selectedEvent.extendedProps?.eventType !== 'normal'"
              label="ลบ"
              color="error"
              variant="soft"
              icon="i-lucide-trash"
              @click="deleteEvent"
            />
            <!-- ปุ่มแก้ไข: แสดงเฉพาะวันหยุดที่เพิ่มเอง (มี ID และเป็น holiday) -->
            <UButton
              v-if="selectedEvent?.id && selectedEvent.extendedProps?.eventType === 'holiday'"
              label="แก้ไข"
              color="warning"
              variant="soft"
              icon="i-lucide-edit"
              @click="editHoliday"
            />
          </div>
          <UButton
            label="ปิด"
            color="neutral"
            @click="viewEventModalOpen = false"
          />
        </div>
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
const isEditingHoliday = ref(false)
const editingHolidayId = ref(null)

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

const missedClasses = ref([])
const loadingMissedClasses = ref(false)

const selectedClassesCount = computed(() => 
  missedClasses.value.filter(c => c.selected).length
)

const totalDuration = computed(() => 
  missedClasses.value.filter(c => c.selected)
    .reduce((sum, c) => sum + c.duration, 0)
)

// โหลดรายการวิชาเมื่อข้อมูลในฟอร์มเปลี่ยน
watch(
  () => [absenceForm.value.teacherId, absenceForm.value.date, absenceForm.value.term],
  () => {
    loadMissedClasses()
  }
)

const makeupForm = ref({
  roomId: null,
  notes: ''
})

const thailandHolidays = [
  // 2026
  { title: 'วันขึ้นปีใหม่', start: '2026-01-01', end: '2026-01-01', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันมาฆบูชา', start: '2026-03-03', end: '2026-03-03', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันจักรี', start: '2026-04-06', end: '2026-04-06', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันสงกรานต์', start: '2026-04-13', end: '2026-04-15', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันแรงงาน', start: '2026-05-01', end: '2026-05-01', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันวิสาขบูชา', start: '2026-05-31', end: '2026-05-31', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันอาสาฬหบูชา', start: '2026-07-29', end: '2026-07-29', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันเข้าพรรษา', start: '2026-07-30', end: '2026-07-30', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันเฉลิมพระชนมพรรษา ร.10', start: '2026-07-28', end: '2026-07-28', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันแม่แห่งชาติ', start: '2026-08-12', end: '2026-08-12', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันคล้ายวันสวรรคต ร.9', start: '2026-10-13', end: '2026-10-13', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันปิยมหาราช', start: '2026-10-23', end: '2026-10-23', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันพ่อแห่งชาติ', start: '2026-12-05', end: '2026-12-05', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันรัฐธรรมนูญ', start: '2026-12-10', end: '2026-12-10', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } },
  { title: 'วันสิ้นปี', start: '2026-12-31', end: '2026-12-31', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff', extendedProps: { eventType: 'holiday' } }
]

// Data
const { data: events, refresh: refreshEvents } = await useFetch('/api/calendar-events', {
  default: () => [],
  transform: (data) => {
    // นำวันหยุดไทยมารวมกับ Event จาก DB
    return [...data, ...thailandHolidays]
  }
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

// Filters
const filter = ref({
  teacherId: 'all',
  type: 'all'
})

const filteredEvents = computed(() => {
  if (!events.value) return []
  
  return events.value.filter(event => {
    // กรองตามอาจารย์
    const matchTeacher = filter.value.teacherId === 'all' || 
      event.extendedProps?.teacherId == filter.value.teacherId // ใช้ == เผื่อ type mismatch

    // กรองตามประเภท
    const matchType = filter.value.type === 'all' || 
      event.extendedProps?.eventType === filter.value.type

    return matchTeacher && matchType
  })
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
  events: filteredEvents.value,
  eventClick: handleEventClick,
  viewDidMount: (info) => {
    // แก้ไขสีพื้นหลังของ header หลังจาก calendar render เสร็จ
    setTimeout(() => {
      const headerCells = document.querySelectorAll('.fc-col-header-cell')
      headerCells.forEach((cell) => {
        cell.style.backgroundColor = '#1e293b' // slate-800
        cell.style.borderColor = '#475569' // slate-600
      })
    }, 100)
  }
}))

// เปิด Modal วันหยุด
const openHolidayModal = () => {
  isEditingHoliday.value = false
  editingHolidayId.value = null
  holidayForm.value = {
    title: '',
    date: '',
    description: ''
  }
  holidayModalOpen.value = true
}

// แก้ไขวันหยุด
const editHoliday = () => {
  if (!selectedEvent.value) return
  
  isEditingHoliday.value = true
  editingHolidayId.value = selectedEvent.value.id
  holidayForm.value = {
    title: selectedEvent.value.title,
    date: selectedEvent.value.startStr.split('T')[0],
    description: selectedEvent.value.extendedProps?.description || ''
  }
  
  viewEventModalOpen.value = false
  holidayModalOpen.value = true
}

// โหลดรายการวิชาที่ขาดสอน
const loadMissedClasses = async () => {
  if (!absenceForm.value.teacherId || !absenceForm.value.date || !absenceForm.value.term) {
    missedClasses.value = []
    return
  }
  
  loadingMissedClasses.value = true
  try {
    const classes = await $fetch('/api/teacher-classes-on-date', {
      query: {
        teacher_id: absenceForm.value.teacherId,
        date: absenceForm.value.date,
        term: absenceForm.value.term
      }
    })
    
    missedClasses.value = classes.map(cls => ({
      ...cls,
      selected: true // เลือกทั้งหมดโดย default
    }))
  } catch (error) {
    console.error('Error loading missed classes:', error)
    missedClasses.value = []
  } finally {
    loadingMissedClasses.value = false
  }
}

// เปิด Modal อาจารย์ติดธุระ
const openAbsenceModal = () => {
  absenceForm.value = {
    teacherId: null,
    date: '',
    term: null,
    reason: ''
  }
  missedClasses.value = []
  absenceModalOpen.value = true
}

// บันทึกวันหยุด (สร้างใหม่ หรือ อัปเดต)
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
    const endpoint = isEditingHoliday.value 
      ? `/api/calendar-events/${editingHolidayId.value}`
      : '/api/calendar-events'
    
    const method = isEditingHoliday.value ? 'PUT' : 'POST'

    await $fetch(endpoint, {
      method,
      body: {
        title: holidayForm.value.title,
        start: holidayForm.value.date,
        end: holidayForm.value.date,
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        textColor: '#ffffff',
        extendedProps: {
          eventType: 'holiday',
          description: holidayForm.value.description
        }
      }
    })

    toast.add({
      title: 'สำเร็จ',
      description: isEditingHoliday.value ? 'อัปเดตวันหยุดเรียบร้อยแล้ว' : 'บันทึกวันหยุดเรียบร้อยแล้ว',
      color: 'primary'
    })

    await refreshEvents()
    holidayModalOpen.value = false
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

  // เช็คว่ามีวิชาที่เลือกหรือไม่
  const selectedClasses = missedClasses.value.filter(c => c.selected)
  if (missedClasses.value.length > 0 && selectedClasses.length === 0) {
    toast.add({
      title: 'กรุณาเลือกวิชา',
      description: 'กรุณาเลือกอย่างน้อย 1 วิชาที่ต้องการจัดชดเชย',
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
        textColor: '#ffffff',
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

    const queryParams = {
      teacher_id: absenceForm.value.teacherId,
      missed_date: absenceForm.value.date,
      term: absenceForm.value.term
    }

    // ถ้ามีวิชาที่เลือก ให้ส่งไปด้วย
    if (selectedClasses.length > 0) {
      queryParams.classes = JSON.stringify(selectedClasses.map(c => ({
        subjectId: c.subjectId,
        sectionId: c.sectionId,
        duration: c.duration
      })))
    }

    const slotsData = await $fetch('/api/find-slots', {
      query: queryParams
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
    const teacher = props.teachers.find(t => t.id_teacher === absenceForm.value.teacherId)
    const room = rooms.value?.find(r => r.id_room === makeupForm.value.roomId)

    // ตรวจสอบว่ามีหลายวิชาหรือไม่
    const classes = selectedSlot.value.classes || []
    
    if (classes.length > 0) {
      // กรณีมีหลายวิชา: สร้างหลายรายการ
      let currentTime = selectedSlot.value.timeStart
      
      for (const cls of classes) {
        const endTime = addHours(currentTime, cls.duration)
        
        await $fetch('/api/makeup-classes', {
          method: 'POST',
          body: {
            original_date: selectedSlot.value.missedDate,
            original_time_slot: '',
            makeup_date: selectedSlot.value.date,
            makeup_time_start: currentTime,
            makeup_time_end: endTime,
            teacher_id: absenceForm.value.teacherId,
            section_id: cls.sectionId,
            subject_id: cls.subjectId,
            room_id: makeupForm.value.roomId,
            status: 'confirmed',
            notes: makeupForm.value.notes
          }
        })
        
        currentTime = endTime // เวลาถัดไปเริ่มจากตรงที่วิชาก่อนหน้าจบ
      }

      // เพิ่ม event ในปฏิทิน (1 event รวม)
      await $fetch('/api/calendar-events', {
        method: 'POST',
        body: {
          title: `สอนชดเชย - ${teacher?.name} (${classes.length} วิชา)`,
          start: `${selectedSlot.value.date}T${selectedSlot.value.timeStart}:00`,
          end: `${selectedSlot.value.date}T${selectedSlot.value.timeEnd}:00`,
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          extendedProps: {
            eventType: 'makeup_class',
            teacherId: absenceForm.value.teacherId,
            teacherName: teacher?.name,
            description: `ห้อง: ${room?.room_name || 'ไม่ระบุ'}\n${classes.map(c => c.subjectName).join(', ')}\n${makeupForm.value.notes || ''}`
          }
        }
      })

      toast.add({
        title: 'สำเร็จ',
        description: `จัดสอนชดเชย ${classes.length} วิชาเรียบร้อยแล้ว`,
        color: 'primary'
      })
    } else {
      // กรณีวิชาเดียว: ใช้ logic เดิม
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
    }

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

// Helper function: เพิ่มชั่วโมงเข้ากับเวลา
function addHours(timeStr, hours) {
  const [h, m] = timeStr.split(':').map(Number)
  const newHour = h + hours
  return `${String(newHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// คลิก Event
const handleEventClick = (clickInfo) => {
  selectedEvent.value = clickInfo.event
  viewEventModalOpen.value = true
}

// ลบ Event
const deleteEvent = async () => {
  if (!selectedEvent.value) return
  if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) return

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

/* แก้ไขสีพื้นหลังของ header table */
:deep(.fc .fc-col-header),
:deep(.fc .fc-col-header tr),
:deep(.fc .fc-col-header th) {
  background-color: #1e293b !important; /* slate-800 */
}

/* แก้ไขสีพื้นหลังและข้อความของ header cells */
:deep(.fc .fc-col-header-cell) {
  background-color: #1e293b !important; /* slate-800 */
  border-color: #475569 !important; /* slate-600 */
}

:deep(.fc .fc-col-header-cell-cushion) {
  color: #ffffff !important;
  font-weight: 600;
}

/* แก้ไขสีหัวเรื่อง (เดือน-ปี) */
:deep(.fc .fc-toolbar-title) {
  color: #ffffff !important;
}

/* แก้ไขสีตัวเลขวันที่ */
:deep(.fc .fc-daygrid-day-number) {
  color: #ffffff !important;
}

/* แก้ไขสีเส้นตาราง */
:deep(.fc .fc-scrollgrid) {
  border-color: #475569 !important;
}

:deep(.fc-theme-standard th) {
  background-color: #1e293b !important;
}
</style>
