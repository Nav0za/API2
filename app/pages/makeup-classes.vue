<template>
  <div class="min-h-screen bg-slate-900 text-white pb-20">
    <!-- Header -->
    <div class="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 shadow-lg">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3">
          <UButton icon="i-heroicons-arrow-left" color="gray" variant="ghost" to="/" />
          <h1 class="text-xl font-bold text-blue-400">รายการสอนชดเชย</h1>
        </div>
        
        <div class="flex gap-2 w-full md:w-auto overflow-x-auto">
           <!-- Filters -->
           <USelectMenu
            v-model="selectedTeacher"
            :options="teachers || []"
            option-attribute="name"
            value-attribute="id_teacher"
            placeholder="กรองตามอาจารย์"
            class="min-w-[200px]"
            searchable
           />
           <USelectMenu
            v-model="selectedStatus"
            :options="statusOptions"
            placeholder="สถานะ"
            class="min-w-[150px]"
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

    <!-- Content -->
    <div class="container mx-auto p-4">
      <div v-if="pending" class="flex justify-center py-10">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-500" />
      </div>

      <div v-else-if="!makeupClasses || !makeupClasses.length" class="text-center py-20 text-slate-500">
        <UIcon name="i-heroicons-calendar" class="w-16 h-16 mb-4 opacity-50" />
        <p>ไม่พบรายการสอนชดเชย</p>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="item in makeupClasses" 
          :key="item.id_makeup"
          class="bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <!-- Status Strip -->
          <div :class="['absolute left-0 top-0 bottom-0 w-1', getStatusColor(item.status)]"></div>

          <div class="pl-3">
            <div class="flex justify-between items-start mb-2">
              <div>
                <div class="text-xs text-slate-400 mb-1">
                  {{ formatDate(item.makeup_date) }} • {{ item.makeup_time_start }} - {{ item.makeup_time_end }}
                </div>
                <h3 class="font-bold text-lg text-white truncate pr-2">
                  {{ item.name_subject || 'ไม่ระบุวิชา' }}
                </h3>
              </div>
              <UBadge :color="getStatusBadgeColor(item.status)" variant="subtle" size="xs">
                {{ getStatusLabel(item.status) }}
              </UBadge>
            </div>

            <div class="space-y-2 text-sm text-slate-300">
              <div class="flex items-center gap-2">
                 <UIcon name="i-heroicons-user" class="w-4 h-4 text-slate-500" />
                 <span>{{ item.teacher_name || 'ไม่ระบุอาจารย์' }}</span>
              </div>
              <div class="flex items-center gap-2">
                 <UIcon name="i-heroicons-users" class="w-4 h-4 text-slate-500" />
                 <span>{{ item.section_name || 'ไม่ระบุกลุ่ม' }}</span>
              </div>
              <div class="flex items-center gap-2">
                 <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-slate-500" />
                 <span :class="{'text-yellow-500': !item.room_name}">
                    {{ item.room_name || 'ยังไม่กำหนดห้อง' }}
                 </span>
              </div>
              <div v-if="item.notes" class="flex items-start gap-2 text-slate-400 text-xs bg-slate-900/50 p-2 rounded">
                 <UIcon name="i-heroicons-document-text" class="w-4 h-4 mt-0.5 shrink-0" />
                 <span>{{ item.notes }}</span>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-700 flex justify-end gap-2">
               <UButton
                v-if="item.status !== 'cancelled' && item.status !== 'completed'"
                size="xs"
                color="red"
                variant="ghost"
                label="ยกเลิก"
                icon="i-heroicons-x-circle"
                @click="confirmCancel(item)"
               />
               <UButton
                v-if="item.status === 'suggested'"
                size="xs"
                color="green"
                variant="solid"
                label="ยืนยัน"
                icon="i-heroicons-check"
                @click="updateStatus(item.id_makeup, 'confirmed')"
               />
               <UButton
                v-if="item.status === 'confirmed'"
                size="xs"
                color="blue"
                variant="ghost"
                label="เสร็จสิ้น"
                icon="i-heroicons-check-circle"
                @click="updateStatus(item.id_makeup, 'completed')"
               />
               <UButton
                 size="xs"
                 color="gray"
                 variant="ghost"
                 icon="i-heroicons-trash"
                 @click="confirmDelete(item)"
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
          <UButton label="ไม่" color="gray" variant="ghost" @click="showCancelModal = false" />
          <UButton label="ใช่, ยกเลิกคลาส" color="red" variant="solid" @click="handleCancel" :loading="processing" />
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
          <UButton label="ยกเลิก" color="gray" variant="ghost" @click="showDeleteModal = false" />
          <UButton label="ลบรายการ" color="red" variant="solid" @click="handleDelete" :loading="processing" />
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

// Actions
const processing = ref(false)
const showCancelModal = ref(false)
const showDeleteModal = ref(false)
const selectedItem = ref(null)

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
</script>
