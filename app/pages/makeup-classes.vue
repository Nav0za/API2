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
        <div v-for="item in makeupClasses" :key="item.id_makeup"
          class="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all relative overflow-hidden group">
          <!-- Status Strip -->
          <div :class="['absolute left-0 top-0 bottom-0 w-1.5', getStatusColor(item.status)]"></div>

          <div class="flex justify-between items-start mb-4">
            <UBadge :color="getStatusBadgeColor(item.status)" variant="subtle" size="md" class="rounded-full px-3">
              {{ getStatusLabel(item.status) }}
            </UBadge>
            <div class="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">
              ID: {{ item.id_makeup }}
            </div>
          </div>

          <div class="mb-4">
            <h3 class="font-bold text-xl text-white line-clamp-1 mb-1" :title="item.name_subject">
              {{ item.name_subject || 'ไม่ระบุวิชา' }}
            </h3>
            <div class="text-slate-400 text-sm flex items-center gap-2">
              <UIcon name="i-heroicons-calendar" class="text-blue-400" />
              {{ formatDate(item.makeup_date) }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/50">
              <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">เวลา</p>
              <p class="text-white text-sm font-medium">{{ item.makeup_time_start }} - {{ item.makeup_time_end }}</p>
            </div>
            <div class="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/50">
              <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">ห้องเรียน</p>
              <p class="text-white text-sm font-medium truncate" :class="{ 'text-yellow-500 italic': !item.room_name }">
                {{ item.room_name || 'ยังไม่กำหนด' }}
              </p>
            </div>
          </div>

          <div class="space-y-3 text-sm text-slate-300 mb-6">
            <div class="flex items-center gap-3">
              <UAvatar :alt="item.teacher_name || '?'" size="xs"
                :class="getStatusBadgeColor(item.status) === 'green' ? 'bg-green-500/20' : 'bg-slate-700'" />
              <span class="font-medium">{{ item.teacher_name || 'ไม่ระบุอาจารย์' }}</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                <UIcon name="i-heroicons-users" class="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span>กลุ่ม: {{ item.section_name || 'ไม่ระบุกลุ่ม' }}</span>
            </div>
          </div>

          <div v-if="item.notes" class="mb-6">
            <p class="text-[10px] text-slate-500 uppercase font-bold mb-2">หมายเหตุ</p>
            <div class="text-slate-400 text-xs bg-slate-900/50 p-3 rounded-2xl border border-slate-700/30">
              {{ item.notes }}
            </div>
          </div>

          <div class="pt-4 border-t border-slate-700 flex justify-between items-center">
            <div class="flex gap-1">
              <UButton v-if="item.status !== 'cancelled' && item.status !== 'completed'" size="sm" color="primary"
                variant="ghost" icon="i-heroicons-pencil-square" square @click="openEditModal(item)" />
              <UButton size="sm" color="neutral" variant="ghost" icon="i-heroicons-trash" square
                @click="confirmDelete(item)" />
            </div>

            <div class="flex gap-2">
              <UButton v-if="item.status !== 'cancelled' && item.status !== 'completed'" size="sm" color="error"
                variant="subtle" label="ยกเลิก" class="rounded-full" @click="confirmCancel(item)" />
              <UButton v-if="item.status === 'suggested'" size="sm" color="green" variant="solid" label="ยืนยันคาบสอน"
                class="rounded-full shadow-lg shadow-green-500/20" @click="updateStatus(item.id_makeup, 'confirmed')" />
              <UButton v-if="item.status === 'confirmed'" size="sm" color="blue" variant="solid" label="สอนเสร็จสิ้น"
                class="rounded-full shadow-lg shadow-blue-500/20" @click="updateStatus(item.id_makeup, 'completed')" />
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
        <div class="p-8">
          <div
            class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <UIcon name="i-heroicons-x-circle" class="text-4xl text-red-500" />
          </div>

          <h3 class="text-2xl font-bold text-white text-center mb-2">ยืนยันการยกเลิก</h3>
          <p class="text-slate-400 text-center mb-8">คุณต้องการยกเลิกคลาสชดเชยนี้ใช่หรือไม่?
            การยกเลิกจะทำให้ช่วงเวลานี้ว่างลงเพื่อให้สามารถลงตารางใหม่ได้</p>

          <div v-if="selectedItem" class="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl mb-8">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">วิชาที่จะยกเลิก</p>
            <p class="text-lg font-bold text-white mb-1">{{ selectedItem.name_subject }}</p>
            <p class="text-sm text-slate-400">{{ formatDate(selectedItem.makeup_date) }} | {{
              selectedItem.makeup_time_start }} - {{ selectedItem.makeup_time_end }}</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <UButton label="ย้อนกลับ" color="neutral" variant="soft" size="xl" block
              class="rounded-2xl py-4 flex-1 font-bold" @click="showCancelModal = false" />
            <UButton label="ยืนยันการยกเลิก" color="error" size="xl" block
              class="rounded-2xl py-4 flex-1 shadow-lg shadow-red-500/20 font-bold" :loading="processing"
              @click="handleCancel" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirm -->
    <UModal v-model:open="showDeleteModal"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
      <template #content>
        <div class="p-8">
          <div
            class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <UIcon name="i-heroicons-trash" class="text-4xl text-red-500" />
          </div>

          <h3 class="text-2xl font-bold text-white text-center mb-2">ลบรายการถาวร</h3>
          <p class="text-slate-400 text-center mb-8">การลบนี้ไม่สามารถกู้คืนได้
            คุณแน่ใจหรือไม่ที่จะลบรายการนี้ออกจากระบบอย่างสมบูรณ์?</p>

          <div v-if="selectedItem" class="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl mb-8">
            <p class="text-[10px] font-black uppercase tracking-widest text-red-400/80 mb-2 text-center">วิชาที่เลือก
            </p>
            <p class="text-xl font-black text-white text-center mb-1">{{ selectedItem.name_subject }}</p>
            <p class="text-sm text-red-400/60 text-center">{{ formatDate(selectedItem.makeup_date) }}</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <UButton label="ยกเลิก" color="neutral" variant="outline" size="xl" block
              class="rounded-2xl border-slate-700 py-4 flex-1 font-bold" @click="showDeleteModal = false" />
            <UButton label="ยืนยันการลบถาวร" color="error" size="xl" block
              class="rounded-2xl py-4 flex-1 shadow-lg shadow-red-500/20 font-bold" :loading="processing"
              @click="handleDelete" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model:open="showEditModal"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
      <template #content>
        <div class="p-8">
          <div class="flex items-center gap-4 mb-8">
            <div
              class="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
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

            <UFormField label="หมายเหตุ" :ui="{ label: 'text-white font-bold mb-2' }">
              <UTextarea v-model="editingItem.notes" placeholder="หมายเหตุเพิ่มเติม..." :rows="3" size="xl"
                class="rounded-xl" :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
            </UFormField>
          </div>

          <div class="flex gap-3 mt-10">
            <UButton label="ยกเลิก" color="neutral" variant="soft" size="xl" block
              class="rounded-2xl py-4 flex-1 font-bold" @click="showEditModal = false" />
            <UButton label="บันทึกการแก้ไข" color="primary" size="xl" block
              class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold" :loading="processing"
              @click="handleEdit" />
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
const updateStatus = async (id, newStatus) => {
  try {
    await $fetch(`/api/makeup-classes/${id}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    toast.add({ title: 'อัปเดตสถานะสำเร็จ', color: 'green' })
    refresh()
  } catch (err) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: err.message, color: 'red' })
  }
}

// Cancel Flow
const confirmCancel = (item) => {
  selectedItem.value = item
  showCancelModal.value = true
}

const handleCancel = async () => {
  if (!selectedItem.value) return
  processing.value = true
  try {
    const item = selectedItem.value
    await updateStatus(item.id_makeup, 'cancelled')

    // Cleanup Calendar Event (Green block)
    const calendarEvents = await $fetch('/api/calendar-events')
    const makeupEvent = calendarEvents.find(e =>
      e.extendedProps?.eventType === 'makeup_class' &&
      JSON.parse(e.extendedProps?.makeupClassIds || '[]').includes(item.id_makeup)
    )

    if (makeupEvent) {
      const ids = JSON.parse(makeupEvent.extendedProps?.makeupClassIds || '[]')
      if (ids.length <= 1) {
        // For Cancel, we remove the green makeup block but KEEP the red absence block
        // so the user can reschedule it later if needed.
        await $fetch(`/api/calendar-events/${makeupEvent.id}`, { method: 'DELETE' })
      } else {
        // Just remove this ID and update title
        const newIds = ids.filter(id => id !== item.id_makeup)
        await $fetch(`/api/calendar-events/${makeupEvent.id}`, {
          method: 'PUT',
          body: {
            title: makeupEvent.title.replace(/\(\d+ วิชา\)/, `(${newIds.length} วิชา)`),
            extendedProps: {
              ...makeupEvent.extendedProps,
              makeupClassIds: JSON.stringify(newIds)
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
const confirmDelete = (item) => {
  selectedItem.value = item
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!selectedItem.value) return
  processing.value = true
  try {
    const item = selectedItem.value
    await $fetch(`/api/makeup-classes/${item.id_makeup}`, {
      method: 'DELETE'
    })

    // Cleanup Calendar Event (Green block)
    const calendarEvents = await $fetch('/api/calendar-events')
    const makeupEvent = calendarEvents.find(e =>
      e.extendedProps?.eventType === 'makeup_class' &&
      JSON.parse(e.extendedProps?.makeupClassIds || '[]').includes(item.id_makeup)
    )

    if (makeupEvent) {
      const ids = JSON.parse(makeupEvent.extendedProps?.makeupClassIds || '[]')
      if (ids.length <= 1) {
        await $fetch(`/api/calendar-events/${makeupEvent.id}`, { method: 'DELETE' })

        // Also delete teacher_absence (Red block) if no other makeup classes exist for this absence
        const targetDate = item.original_date ? dayjs(item.original_date).format('YYYY-MM-DD') : ''

        const otherMakeupsForThisAbsence = calendarEvents.filter(e =>
          e.extendedProps?.eventType === 'makeup_class' &&
          Number(e.extendedProps?.teacherId) === Number(item.teacher_id) &&
          dayjs(e.extendedProps?.originalDate).format('YYYY-MM-DD') === targetDate &&
          e.id !== makeupEvent.id
        )

        if (otherMakeupsForThisAbsence.length === 0) {
          const absenceEvent = calendarEvents.find(ae =>
            ae.extendedProps?.eventType === 'teacher_absence' &&
            Number(ae.extendedProps?.teacherId) === Number(item.teacher_id) &&
            ae.start && dayjs(ae.start).format('YYYY-MM-DD') === targetDate
          )
          if (absenceEvent) {
            await $fetch(`/api/calendar-events/${absenceEvent.id}`, { method: 'DELETE' })
          }
        }
      } else {
        const newIds = ids.filter(id => id !== item.id_makeup)
        await $fetch(`/api/calendar-events/${makeupEvent.id}`, {
          method: 'PUT',
          body: {
            title: makeupEvent.title.replace(/\(\d+ วิชา\)/, `(${newIds.length} วิชา)`),
            extendedProps: {
              ...makeupEvent.extendedProps,
              makeupClassIds: JSON.stringify(newIds)
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
const openEditModal = (item) => {
  editingItem.value = {
    id_makeup: item.id_makeup,
    makeup_date: item.makeup_date,
    makeup_time_start: item.makeup_time_start,
    makeup_time_end: item.makeup_time_end,
    room_id: item.room_id,
    notes: item.notes || ''
  }
  showEditModal.value = true
}

const handleEdit = async () => {
  if (!editingItem.value) return
  processing.value = true
  try {
    await $fetch(`/api/makeup-classes/${editingItem.value.id_makeup}`, {
      method: 'PUT',
      body: {
        makeup_date: editingItem.value.makeup_date,
        makeup_time_start: editingItem.value.makeup_time_start,
        makeup_time_end: editingItem.value.makeup_time_end,
        room_id: editingItem.value.room_id,
        notes: editingItem.value.notes
      }
    })
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
