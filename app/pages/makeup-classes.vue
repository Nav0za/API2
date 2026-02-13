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
            <USelectMenu
              v-model="selectedTeacher"
              :options="teachers || []"
              option-attribute="name"
              value-attribute="id_teacher"
              placeholder="อาจารย์"
              class="w-40"
              searchable
              icon="i-heroicons-user"
            />
            <USelectMenu
              v-model="selectedStatus"
              :options="statusOptions"
              placeholder="สถานะ"
              class="w-40"
              icon="i-heroicons-adjustments-horizontal"
            />
            <UButton 
              v-if="selectedTeacher || selectedStatus"
              icon="i-heroicons-x-mark"
              color="gray"
              variant="ghost"
              @click="clearFilters"
            />
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
        <div 
          v-for="item in makeupClasses" 
          :key="item.id_makeup"
          class="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all relative overflow-hidden group"
        >
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
               <p class="text-white text-sm font-medium truncate" :class="{'text-yellow-500 italic': !item.room_name}">
                  {{ item.room_name || 'ยังไม่กำหนด' }}
               </p>
            </div>
          </div>

          <div class="space-y-3 text-sm text-slate-300 mb-6">
            <div class="flex items-center gap-3">
               <UAvatar :alt="item.teacher_name || '?'" size="xs" :class="getStatusBadgeColor(item.status) === 'green' ? 'bg-green-500/20' : 'bg-slate-700'" />
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
               <UButton
                v-if="item.status !== 'cancelled' && item.status !== 'completed'"
                size="sm"
                color="primary"
                variant="ghost"
                icon="i-heroicons-pencil-square"
                square
                @click="openEditModal(item)"
               />
               <UButton
                 size="sm"
                 color="neutral"
                 variant="ghost"
                 icon="i-heroicons-trash"
                 square
                 @click="confirmDelete(item)"
               />
             </div>
             
             <div class="flex gap-2">
               <UButton
                v-if="item.status !== 'cancelled' && item.status !== 'completed'"
                size="sm"
                color="error"
                variant="subtle"
                label="ยกเลิก"
                class="rounded-full"
                @click="confirmCancel(item)"
               />
               <UButton
                v-if="item.status === 'suggested'"
                size="sm"
                color="green"
                variant="solid"
                label="ยืนยันคาบสอน"
                class="rounded-full shadow-lg shadow-green-500/20"
                @click="updateStatus(item.id_makeup, 'confirmed')"
               />
               <UButton
                v-if="item.status === 'confirmed'"
                size="sm"
                color="blue"
                variant="solid"
                label="สอนเสร็จสิ้น"
                class="rounded-full shadow-lg shadow-blue-500/20"
                @click="updateStatus(item.id_makeup, 'completed')"
               />
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Cancel Confirm -->
    <UModal v-model:open="showCancelModal" title="ยืนยันการยกเลิก">
      <template #body>
        <p class="text-slate-300">คุณต้องการยกเลิกคลาสชดเชยนี้ใช่หรือไม่?</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="ไม่" color="neutral" variant="ghost" @click="showCancelModal = false" />
          <UButton label="ใช่, ยกเลิกคลาส" color="error" variant="solid" @click="handleCancel" :loading="processing" />
        </div>
      </template>
    </UModal>

    <!-- Delete Confirm -->
    <UModal v-model:open="showDeleteModal" title="ลบรายการถาวร">
      <template #body>
        <p class="text-slate-300">การลบนี้ไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่?</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="ยกเลิก" color="neutral" variant="ghost" @click="showDeleteModal = false" />
          <UButton label="ลบรายการ" color="error" variant="solid" @click="handleDelete" :loading="processing" />
        </div>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model:open="showEditModal" title="แก้ไขคลาสชดเชย">
      <template #body>
        <div v-if="editingItem" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">วันที่สอนชดเชย</label>
            <UInput
              v-model="editingItem.makeup_date"
              type="date"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">เวลาเริ่ม</label>
              <UInput
                v-model="editingItem.makeup_time_start"
                type="time"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">เวลาสิ้นสุด</label>
              <UInput
                v-model="editingItem.makeup_time_end"
                type="time"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">ห้องเรียน</label>
            <USelectMenu
              v-model="editingItem.room_id"
              :options="rooms || []"
              option-attribute="room_name"
              value-attribute="id_room"
              placeholder="เลือกห้องเรียน"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">หมายเหตุ</label>
            <UTextarea
              v-model="editingItem.notes"
              placeholder="หมายเหตุเพิ่มเติม"
              :rows="3"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="ยกเลิก" color="neutral" variant="ghost" @click="showEditModal = false" />
          <UButton label="บันทึก" color="primary" variant="solid" @click="handleEdit" :loading="processing" />
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
    await updateStatus(selectedItem.value.id_makeup, 'cancelled')
    showCancelModal.value = false
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
        await $fetch(`/api/makeup-classes/${selectedItem.value.id_makeup}`, {
            method: 'DELETE'
        })
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
