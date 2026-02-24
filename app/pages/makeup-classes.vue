<template>
  <div class="min-h-screen bg-slate-900 text-white pb-20">
    <!-- Header -->
    <div class="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-10 shadow-lg mb-8">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-4">
          <UButton icon="i-heroicons-arrow-left" color="gray" variant="ghost" to="/" class="rounded-full" />
          <div>
            <h1 class="text-2xl font-bold text-white flex items-center gap-2">
              <UIcon name="i-heroicons-calendar-days" class="text-blue-400" />
              รายการสอนชดเชย
            </h1>
            <p class="text-slate-400 text-sm">ติดตามและจัดการคำขอสอนชดเชยทั้งหมด</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 w-full md:w-auto">
          <USelectMenu v-model="selectedTeacher" :options="teachers || []" option-attribute="name"
            value-attribute="id_teacher" placeholder="อาจารย์" class="w-40" searchable icon="i-heroicons-user" />
          <USelectMenu v-model="selectedStatus" :options="statusOptions" placeholder="สถานะ" class="w-40"
            icon="i-heroicons-adjustments-horizontal" />
          <UButton v-if="selectedTeacher || selectedStatus" icon="i-heroicons-x-mark" color="gray" variant="ghost"
            @click="clearFilters" />
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="container mx-auto px-4 mb-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-sm">
          <p class="text-slate-400 text-xs font-medium uppercase tracking-wider">ทั้งหมด</p>
          <p class="text-2xl font-bold text-white mt-1">{{ makeupClasses?.length || 0 }} รายการ</p>
        </div>
        <div class="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-sm">
          <p class="text-slate-400 text-xs font-medium uppercase tracking-wider text-yellow-500">รอการยืนยัน</p>
          <p class="text-2xl font-bold text-white mt-1">{{ stats.suggested }}</p>
        </div>
        <div class="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-sm">
          <p class="text-slate-400 text-xs font-medium uppercase tracking-wider text-green-500">ยืนยันแล้ว</p>
          <p class="text-2xl font-bold text-white mt-1">{{ stats.confirmed }}</p>
        </div>
        <div class="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-sm">
          <p class="text-slate-400 text-xs font-medium uppercase tracking-wider text-blue-500">เสร็จสิ้น</p>
          <p class="text-2xl font-bold text-white mt-1">{{ stats.completed }}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container mx-auto p-4">
      <div v-if="pending" class="flex justify-center py-10">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-500" />
      </div>

      <div v-else-if="!makeupClasses || !makeupClasses.length" class="text-center py-20 text-slate-500">
        <UIcon name="i-heroicons-calendar" class="w-16 h-16 mb-4 opacity-50" />
        <p>ไม่พบรายการสอนชดเชย</p>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="group in groupedMakeupClasses" :key="group.key"
          class="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all relative overflow-hidden group">
          <!-- Status Strip -->
          <div :class="['absolute left-0 top-0 bottom-0 w-1.5', getStatusColor(group.status)]"></div>

          <div class="flex justify-between items-start mb-4">
            <UBadge :color="getStatusBadgeColor(group.status)" variant="subtle" size="md" class="rounded-full px-3">
              {{ getStatusLabel(group.status) }}
            </UBadge>
            <div class="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">
              {{ group.items.length }} วิชา
            </div>
          </div>

          <div class="mb-4">
            <div class="space-y-1 mb-3">
              <h3 v-for="item in group.items" :key="item.id_makeup" class="font-bold text-lg text-white line-clamp-1"
                :title="item.name_subject">
                {{ item.name_subject || 'ไม่ระบุวิชา' }}
                <span class="text-sm font-normal text-slate-400">({{ item.section_name || 'ไม่ระบุกลุ่ม' }})</span>
              </h3>
            </div>

            <div class="text-slate-400 text-sm flex items-center gap-2">
              <UIcon name="i-heroicons-calendar" class="text-blue-400" />
              {{ formatDate(group.makeup_date) }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/50">
              <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">เวลา</p>
              <p class="text-white text-sm font-medium">{{ group.makeup_time_start }} - {{ group.makeup_time_end }}</p>
            </div>
            <div class="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/50">
              <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">ห้องเรียน</p>
              <p class="text-white text-sm font-medium truncate"
                :class="{ 'text-yellow-500 italic': !group.room_name }">
                {{ group.room_name || 'ยังไม่กำหนด' }}
              </p>
            </div>
          </div>

          <div class="space-y-3 text-sm text-slate-300 mb-6">
            <div class="flex items-center gap-3">
              <UAvatar :alt="group.teacher_name || '?'" size="xs"
                :class="getStatusBadgeColor(group.status) === 'green' ? 'bg-green-500/20' : 'bg-slate-700'" />
              <span class="font-medium">{{ group.teacher_name || 'ไม่ระบุอาจารย์' }}</span>
            </div>
          </div>

          <div v-if="group.notes" class="mb-6">
            <p class="text-[10px] text-slate-500 uppercase font-bold mb-2">หมายเหตุ</p>
            <div class="text-slate-400 text-xs bg-slate-900/50 p-3 rounded-2xl border border-slate-700/30">
              <div v-for="(note, i) in group.notes.split('\n').filter(n => n.trim())" :key="i">
                {{ note }}
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-700 flex justify-between items-center">
            <div class="flex gap-1">
              <UButton v-if="group.status !== 'cancelled' && group.status !== 'completed'" size="sm" color="primary"
                variant="ghost" icon="i-heroicons-pencil-square" square @click="openEditModal(group)" />
              <UButton size="sm" color="neutral" variant="ghost" icon="i-heroicons-trash" square
                @click="confirmDelete(group)" />
            </div>

            <div class="flex gap-2">
              <UButton v-if="group.status !== 'cancelled' && group.status !== 'completed'" size="sm" color="error"
                variant="subtle" label="ยกเลิก" class="rounded-full" @click="confirmCancel(group)" />
              <UButton v-if="group.status === 'suggested'" size="sm" color="green" variant="solid" label="ยืนยันคาบสอน"
                class="rounded-full shadow-lg shadow-green-500/20" @click="updateStatus(group, 'confirmed')" />
              <UButton v-if="group.status === 'confirmed'" size="sm" color="blue" variant="solid" label="สอนเสร็จสิ้น"
                class="rounded-full shadow-lg shadow-blue-500/20" @click="updateStatus(group, 'completed')" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Cancel Confirm -->
    <UModal v-model:open="showCancelModal"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <UIcon name="i-heroicons-x-circle" class="text-4xl text-red-500" />
            </div>

            <h3 class="text-2xl font-bold text-white text-center mb-2">ยืนยันการยกเลิก</h3>
            <p class="text-slate-400 text-center mb-8">คุณต้องการยกเลิกคลาสชดเชยนี้ใช่หรือไม่?
              การยกเลิกจะทำให้ช่วงเวลานี้ว่างลงเพื่อให้สามารถลงตารางใหม่ได้</p>

            <div v-if="selectedItem" class="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">กลุ่มวิชาที่จะยกเลิก</p>
              <div v-for="item in selectedItem.items" :key="item.id_makeup" class="mb-2">
                <p class="text-sm font-bold text-white">{{ item.name_subject }} <span
                    class="text-xs text-slate-400 font-normal">({{ item.section_name }})</span></p>
              </div>
              <div class="mt-3 pt-3 border-t border-slate-700/50">
                <p class="text-xs text-slate-400">{{ formatDate(selectedItem.makeup_date) }} | {{
                  selectedItem.makeup_time_start }} - {{ selectedItem.makeup_time_end }}</p>
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-10">
            <div class="flex flex-col sm:flex-row gap-3">
              <UButton label="ย้อนกลับ" color="neutral" variant="soft" size="xl" block
                class="rounded-2xl py-4 flex-1 font-bold" @click="showCancelModal = false" />
              <UButton label="ยืนยันการยกเลิก" color="error" size="xl" block
                class="rounded-2xl py-4 flex-1 shadow-lg shadow-red-500/20 font-bold" :loading="processing"
                @click="handleCancel" />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirm -->
    <UModal v-model:open="showDeleteModal"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <UIcon name="i-heroicons-trash" class="text-4xl text-red-500" />
            </div>

            <h3 class="text-2xl font-bold text-white text-center mb-2">ลบรายการถาวร</h3>
            <p class="text-slate-400 text-center mb-8">การลบนี้ไม่สามารถกู้คืนได้
              คุณแน่ใจหรือไม่ที่จะลบรายการนี้ออกจากระบบอย่างสมบูรณ์?</p>

            <div v-if="selectedItem" class="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl">
              <p class="text-[10px] font-black uppercase tracking-widest text-red-400/80 mb-2 text-center">
                กลุ่มวิชาที่เลือก
              </p>
              <div v-for="item in selectedItem.items" :key="item.id_makeup" class="mb-1 text-center">
                <p class="text-sm font-bold text-white">{{ item.name_subject }} <span
                    class="text-xs text-red-400/80 font-normal">({{ item.section_name }})</span></p>
              </div>
              <p class="text-xs text-red-400/60 text-center mt-3">{{ formatDate(selectedItem.makeup_date) }}</p>
            </div>
          </div>
          <div class="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-10">
            <div class="flex flex-col sm:flex-row gap-3">
              <UButton label="ยกเลิก" color="neutral" variant="outline" size="xl" block
                class="rounded-2xl border-slate-700 py-4 flex-1 font-bold" @click="showDeleteModal = false" />
              <UButton label="ยืนยันการลบถาวร" color="error" size="xl" block
                class="rounded-2xl py-4 flex-1 shadow-lg shadow-red-500/20 font-bold" :loading="processing"
                @click="handleDelete" />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model:open="showEditModal"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div class="flex items-center gap-4 mb-8">
              <div class="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                <UIcon name="i-heroicons-pencil-square" class="text-2xl text-amber-500" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">แก้ไขคลาสชดเชย</h3>
                <p class="text-slate-400 text-sm">ปรับปรุงรายละเอียด วันที่ เวลา หรือห้องเรียน</p>
              </div>
            </div>

            <div v-if="editingItem" class="space-y-6">
              <UFormField label="วันที่สอนชดเชย *" :ui="{ label: 'text-white font-bold mb-2' }">
                <UInput v-model="editingItem.makeup_date" type="date" size="xl" class="rounded-xl"
                  :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
              </UFormField>

              <div class="grid grid-cols-2 gap-4">
                <UFormField label="เวลาเริ่ม *" :ui="{ label: 'text-white font-bold mb-2' }">
                  <UInput v-model="editingItem.makeup_time_start" type="time" size="xl" class="rounded-xl"
                    :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                </UFormField>
                <UFormField label="เวลาสิ้นสุด *" :ui="{ label: 'text-white font-bold mb-2' }">
                  <UInput v-model="editingItem.makeup_time_end" type="time" size="xl" class="rounded-xl"
                    :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                </UFormField>
              </div>

              <UFormField label="ห้องเรียน" :ui="{ label: 'text-white font-bold mb-2' }">
                <USelect v-model="editingItem.room_id" :items="rooms || []" label-attribute="room_name"
                  value-attribute="id_room" placeholder="เลือกห้องเรียน" size="xl" class="rounded-xl"
                  :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
              </UFormField>

              <UFormField label="หมายเหตุ (ใช้ทับทั้งหมดในกลุ่ม)" :ui="{ label: 'text-white font-bold mb-2' }">
                <UTextarea v-model="editingItem.notes" placeholder="หมายเหตุเพิ่มเติม..." :rows="3" size="xl"
                  class="rounded-xl" :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
              </UFormField>
            </div>
          </div>
          <div class="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-10">
            <div class="flex gap-3">
              <UButton label="ยกเลิก" color="neutral" variant="soft" size="xl" block
                class="rounded-2xl py-4 flex-1 font-bold" @click="showEditModal = false" />
              <UButton label="บันทึกการแก้ไข" color="primary" size="xl" block
                class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold" :loading="processing"
                @click="handleEdit" />
            </div>
          </div>
        </div>
      </template>
    </UModal>

  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

const toast = useToast()

// Data fetching
const { data: teachers } = await useFetch('/api/teachers')
const { data: rooms } = await useFetch('/api/rooms')

const selectedTeacher = ref(null)
const selectedStatus = ref(null)
const statusOptions = [
  { label: 'แนะนำ (Suggested)', value: 'suggested' },
  { label: 'ยืนยัน (Confirmed)', value: 'confirmed' },
  { label: 'เสร็จสิ้น (Completed)', value: 'completed' },
  { label: 'ยกเลิก (Cancelled)', value: 'cancelled' }
]

// Fetch items
const { data: makeupClasses, pending, refresh } = await useFetch('/api/makeup-classes', {
  query: computed(() => ({
    teacher_id: selectedTeacher.value,
    status: selectedStatus.value
  }))
})

// Grouping Logic
const groupedMakeupClasses = computed(() => {
  if (!makeupClasses.value) return []

  const groups = {}

  makeupClasses.value.forEach(item => {
    // ใช้ string key ที่รวมทุกอย่างเพื่อใช้ group (อิงจากปฏิทินด้วย)
    // เปลี่ยนจาก makeup_time_start เป็น original_date เพื่อรวมวิชาที่ชดเชยสำหรับกรณีขาดสอนวันเดียวกัน
    const key = `${item.makeup_date}_${item.original_date || item.makeup_time_start}_${item.teacher_id}_${item.room_id || 'noroom'}_${item.status}`

    if (!groups[key]) {
      groups[key] = {
        key,
        makeup_date: item.makeup_date,
        makeup_time_start: item.makeup_time_start,
        makeup_time_end: item.makeup_time_end,
        room_id: item.room_id,
        room_name: item.room_name,
        teacher_id: item.teacher_id,
        teacher_name: item.teacher_name,
        status: item.status,
        original_date: item.original_date,
        items: [],
        notes: ''
      }
    }

    groups[key].items.push(item)

    // ต่อ notes
    if (item.notes) {
      if (groups[key].notes && !groups[key].notes.includes(item.notes)) {
        groups[key].notes += '\n' + item.notes
      } else if (!groups[key].notes) {
        groups[key].notes = item.notes
      }
    }

    // หาเวลาเริ่มที่เร็วที่สุด และเลิกที่ช้าที่สุดเพื่อแสดงผลรวม
    if (item.makeup_time_start < groups[key].makeup_time_start) {
      groups[key].makeup_time_start = item.makeup_time_start
    }
    if (item.makeup_time_end > groups[key].makeup_time_end) {
      groups[key].makeup_time_end = item.makeup_time_end
    }
  })

  // เรียงลำดับตามวันที่และเวลา
  return Object.values(groups).sort((a, b) => {
    const dateA = dayjs(a.makeup_date + 'T' + a.makeup_time_start)
    const dateB = dayjs(b.makeup_date + 'T' + b.makeup_time_start)
    return dateB.diff(dateA) // Descending
  })
})

// Stats Calculation
const stats = computed(() => {
  if (!makeupClasses.value) return { suggested: 0, confirmed: 0, completed: 0 }
  return {
    suggested: makeupClasses.value.filter(i => i.status === 'suggested').length,
    confirmed: makeupClasses.value.filter(i => i.status === 'confirmed').length,
    completed: makeupClasses.value.filter(i => i.status === 'completed').length
  }
})

// Actions
const processing = ref(false)
const showCancelModal = ref(false)
const showDeleteModal = ref(false)
const showEditModal = ref(false)
const selectedItem = ref(null)
const editingItem = ref(null)

const clearFilters = () => {
  selectedTeacher.value = null
  selectedStatus.value = null
}

const getStatusColor = (status) => {
  const map = {
    suggested: 'bg-yellow-500',
    confirmed: 'bg-green-500',
    completed: 'bg-blue-500',
    cancelled: 'bg-red-500'
  }
  return map[status] || 'bg-gray-500'
}

const getStatusBadgeColor = (status) => {
  const map = {
    suggested: 'yellow',
    confirmed: 'green',
    completed: 'blue',
    cancelled: 'red'
  }
  return map[status] || 'gray'
}

const getStatusLabel = (status) => {
  const map = {
    suggested: 'รอการยืนยัน',
    confirmed: 'ยืนยันแล้ว',
    completed: 'เสร็จสิ้น',
    cancelled: 'ยกเลิกแล้ว'
  }
  return map[status] || status
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dayjs(dateStr).format('D MMM YYYY')
}

// Update Status
const updateStatus = async (group, newStatus) => {
  try {
    const promises = group.items.map(item =>
      $fetch(`/api/makeup-classes/${item.id_makeup}`, {
        method: 'PUT',
        body: { status: newStatus }
      })
    )
    await Promise.all(promises)
    toast.add({ title: 'อัปเดตสถานะสำเร็จ', color: 'green' })
    refresh()
  } catch (err) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: err.message, color: 'red' })
  }
}

// Cancel Flow
const confirmCancel = (group) => {
  selectedItem.value = group
  showCancelModal.value = true
}

const handleCancel = async () => {
  if (!selectedItem.value) return
  processing.value = true
  try {
    const group = selectedItem.value
    await updateStatus(group, 'cancelled')

    // Cleanup Calendar Event (Green block) - we assume they share one block based on our grouping logic
    const firstItemId = group.items[0].id_makeup
    const calendarEvents = await $fetch('/api/calendar-events')
    const makeupEvent = calendarEvents.find(e =>
      e.extendedProps?.eventType === 'makeup_class' &&
      JSON.parse(e.extendedProps?.makeupClassIds || '[]').includes(firstItemId)
    )

    if (makeupEvent) {
      const idsInEvent = JSON.parse(makeupEvent.extendedProps?.makeupClassIds || '[]')
      const cancelledIds = group.items.map(i => i.id_makeup)
      const remainingIds = idsInEvent.filter(id => !cancelledIds.includes(id))

      if (remainingIds.length === 0) {
        // All classes in this block cancelled
        await $fetch(`/api/calendar-events/${makeupEvent.id}`, { method: 'DELETE' })
      } else {
        // Some classes remain
        await $fetch(`/api/calendar-events/${makeupEvent.id}`, {
          method: 'PUT',
          body: {
            title: makeupEvent.title.replace(/\(\d+ วิชา\)/, `(${remainingIds.length} วิชา)`),
            extendedProps: {
              ...makeupEvent.extendedProps,
              makeupClassIds: JSON.stringify(remainingIds)
            }
          }
        })
      }
    }

    showCancelModal.value = false
  } catch (err) {
    console.error('Error in handleCancel:', err)
  } finally {
    processing.value = false
    selectedItem.value = null
  }
}

// Delete Flow
const confirmDelete = (group) => {
  selectedItem.value = group
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!selectedItem.value) return
  processing.value = true
  try {
    const group = selectedItem.value
    const firstItemId = group.items[0].id_makeup

    const promises = group.items.map(item =>
      $fetch(`/api/makeup-classes/${item.id_makeup}`, { method: 'DELETE' })
    )
    await Promise.all(promises)

    // Cleanup Calendar Event (Green block)
    const calendarEvents = await $fetch('/api/calendar-events')
    const makeupEvent = calendarEvents.find(e =>
      e.extendedProps?.eventType === 'makeup_class' &&
      JSON.parse(e.extendedProps?.makeupClassIds || '[]').includes(firstItemId)
    )

    if (makeupEvent) {
      const idsInEvent = JSON.parse(makeupEvent.extendedProps?.makeupClassIds || '[]')
      const deletedIds = group.items.map(i => i.id_makeup)
      const remainingIds = idsInEvent.filter(id => !deletedIds.includes(id))

      if (remainingIds.length === 0) {
        await $fetch(`/api/calendar-events/${makeupEvent.id}`, { method: 'DELETE' })

        // Also delete teacher_absence (Red block) if no other makeup classes exist for this absence
        const targetDate = group.original_date ? dayjs(group.original_date).format('YYYY-MM-DD') : ''

        const otherMakeupsForThisAbsence = calendarEvents.filter(e =>
          e.extendedProps?.eventType === 'makeup_class' &&
          Number(e.extendedProps?.teacherId) === Number(group.teacher_id) &&
          dayjs(e.extendedProps?.originalDate).format('YYYY-MM-DD') === targetDate &&
          e.id !== makeupEvent.id
        )

        if (otherMakeupsForThisAbsence.length === 0) {
          const absenceEvent = calendarEvents.find(ae =>
            ae.extendedProps?.eventType === 'teacher_absence' &&
            Number(ae.extendedProps?.teacherId) === Number(group.teacher_id) &&
            ae.start && dayjs(ae.start).format('YYYY-MM-DD') === targetDate
          )
          if (absenceEvent) {
            await $fetch(`/api/calendar-events/${absenceEvent.id}`, { method: 'DELETE' })
          }
        }
      } else {
        await $fetch(`/api/calendar-events/${makeupEvent.id}`, {
          method: 'PUT',
          body: {
            title: makeupEvent.title.replace(/\(\d+ วิชา\)/, `(${remainingIds.length} วิชา)`),
            extendedProps: {
              ...makeupEvent.extendedProps,
              makeupClassIds: JSON.stringify(remainingIds)
            }
          }
        })
      }
    }

    toast.add({ title: 'ลบรายการสำเร็จ', color: 'green' })
    refresh()
    showDeleteModal.value = false
  } catch (err) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: err.message, color: 'red' })
  } finally {
    processing.value = false
    selectedItem.value = null
  }
}

// Edit Flow
const openEditModal = (group) => {
  editingItem.value = {
    group_key: group.key,
    items: group.items,
    makeup_date: group.makeup_date,
    makeup_time_start: group.makeup_time_start,
    makeup_time_end: group.makeup_time_end,
    room_id: group.room_id,
    notes: group.notes || ''
  }
  showEditModal.value = true
}

const handleEdit = async () => {
  if (!editingItem.value) return
  processing.value = true
  try {
    // 1. ตรวจสอบห้องว่าง (Room Availability Check)
    if (editingItem.value.room_id) {
      const check = await $fetch('/api/check-room', {
        query: {
          room_id: editingItem.value.room_id,
          date: editingItem.value.makeup_date,
          start_time: editingItem.value.makeup_time_start,
          end_time: editingItem.value.makeup_time_end,
          term: '2/67', // กำหนดเป็นเทอมปัจจุบัน
          current_makeup_id: editingItem.value.items.map(i => i.id_makeup).join(',')
        }
      })
      if (!check.available) {
        toast.add({ title: 'ห้องไม่ว่าง', description: check.reason, color: 'red' })
        processing.value = false
        return
      }
    }

    // 2. อัปเดตทุก id ในกลุ่มเดียวกันด้วยค่าใหม่
    const promises = editingItem.value.items.map(item =>
      $fetch(`/api/makeup-classes/${item.id_makeup}`, {
        method: 'PUT',
        body: {
          makeup_date: editingItem.value.makeup_date,
          makeup_time_start: editingItem.value.makeup_time_start, // Note: This might compress all classes to have the same start/end time. 
          // For true block shifting, we'd need to calculate offsets. 
          // For now, simplicity is requested.
          makeup_time_end: editingItem.value.makeup_time_end,
          room_id: editingItem.value.room_id,
          notes: editingItem.value.notes
        }
      })
    )
    await Promise.all(promises)

    toast.add({ title: 'แก้ไขสำเร็จ', color: 'green' })
    refresh()
    showEditModal.value = false
  } catch (err) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: err.message, color: 'red' })
  } finally {
    processing.value = false
    editingItem.value = null
  }
}
</script>
