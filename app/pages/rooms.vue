<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
    <div class="container mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          จัดการห้องเรียน
        </h1>
        <p class="text-gray-600">
          เพิ่ม แก้ไข และจัดการห้องเรียนสำหรับการสอนชดเชย
        </p>
      </div>

      <!-- ปุ่มเพิ่มห้อง -->
      <div class="mb-6 flex justify-end">
        <UButton
          label="เพิ่มห้องเรียน"
          icon="i-lucide-plus"
          color="primary"
          size="lg"
          @click="openAddModal"
        />
      </div>

      <!-- Loading -->
      <div
        v-if="pending"
        class="text-center py-20"
      >
        <div class="text-gray-500">
          กำลังโหลดข้อมูล...
        </div>
      </div>

      <!-- ตารางห้องเรียน -->
      <div
        v-else
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div
          v-if="rooms && rooms.length === 0"
          class="text-center py-20"
        >
          <p class="text-gray-500 text-lg mb-4">
            ยังไม่มีห้องเรียนในระบบ
          </p>
          <UButton
            label="เพิ่มห้องเรียนแรก"
            icon="i-lucide-plus"
            color="primary"
            @click="openAddModal"
          />
        </div>

        <table
          v-else
          class="w-full"
        >
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ชื่อห้อง
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                อาคาร
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ความจุ
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                คำอธิบาย
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="room in rooms"
              :key="room.id_room"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ room.room_name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">
                  {{ room.building || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">
                  {{ room.capacity ? `${room.capacity} คน` : '-' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500">
                  {{ room.description || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <UButton
                    icon="i-lucide-edit"
                    color="warning"
                    size="sm"
                    square
                    @click="openEditModal(room)"
                  />
                  <UButton
                    icon="i-lucide-trash"
                    color="error"
                    size="sm"
                    square
                    @click="confirmDelete(room)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal เพิ่ม/แก้ไขห้อง -->
    <UModal
      v-model:open="modalOpen"
      :title="editingRoom ? 'แก้ไขห้องเรียน' : 'เพิ่มห้องเรียน'"
    >
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">ชื่อห้อง *</label>
            <UInput
              v-model="formData.room_name"
              placeholder="เช่น EN101, EN102"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">อาคาร</label>
            <UInput
              v-model="formData.building"
              placeholder="เช่น อาคาร EN"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">ความจุ (คน)</label>
            <UInput
              v-model.number="formData.capacity"
              type="number"
              placeholder="เช่น 40"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">คำอธิบาย</label>
            <UTextarea
              v-model="formData.description"
              placeholder="รายละเอียดเพิ่มเติม"
              :rows="3"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <UButton
          label="ยกเลิก"
          color="neutral"
          @click="modalOpen = false"
        />
        <UButton
          :label="editingRoom ? 'บันทึก' : 'เพิ่ม'"
          color="primary"
          :loading="saving"
          @click="saveRoom"
        />
      </template>
    </UModal>

    <!-- Modal ยืนยันการลบ -->
    <UModal
      v-model:open="deleteModalOpen"
      title="ยืนยันการลบ"
    >
      <template #body>
        <div class="py-3">
          <p class="mb-2">
            คุณแน่ใจว่าจะลบห้องเรียนนี้หรือไม่?
          </p>
          <p class="text-sm text-gray-600 mb-3">
            <strong>ห้อง:</strong> {{ roomToDelete?.room_name }}
          </p>
          <p class="text-sm text-red-600">
            ⚠️ การลบห้องจะไม่ลบข้อมูลคลาสชดเชยที่เคยใช้ห้องนี้
          </p>
        </div>
      </template>
      <template #footer>
        <UButton
          label="ยกเลิก"
          color="neutral"
          @click="deleteModalOpen = false"
        />
        <UButton
          label="ลบ"
          color="error"
          :loading="deleting"
          @click="deleteRoom"
        />
      </template>
    </UModal>
  </div>
</template>

<script setup>
const { data: rooms, pending, refresh } = await useFetch('/api/rooms')

// Modal
const modalOpen = ref(false)
const editingRoom = ref(null)
const saving = ref(false)

const formData = ref({
  room_name: '',
  building: '',
  capacity: null,
  description: ''
})

const openAddModal = () => {
  editingRoom.value = null
  formData.value = {
    room_name: '',
    building: '',
    capacity: null,
    description: ''
  }
  modalOpen.value = true
}

const openEditModal = (room) => {
  editingRoom.value = room
  formData.value = {
    room_name: room.room_name,
    building: room.building || '',
    capacity: room.capacity || null,
    description: room.description || ''
  }
  modalOpen.value = true
}

const toast = useToast()

const saveRoom = async () => {
  if (!formData.value.room_name) {
    toast.add({
      title: 'ข้อมูลไม่ครบ',
      description: 'กรุณากรอกชื่อห้อง',
      color: 'error'
    })
    return
  }

  saving.value = true

  try {
    if (editingRoom.value) {
      // แก้ไข
      await $fetch(`/api/rooms/${editingRoom.value.id_room}`, {
        method: 'PUT',
        body: formData.value
      })
      toast.add({
        title: 'สำเร็จ',
        description: 'แก้ไขห้องเรียนเรียบร้อยแล้ว',
        color: 'primary'
      })
    } else {
      // เพิ่มใหม่
      await $fetch('/api/rooms', {
        method: 'POST',
        body: formData.value
      })
      toast.add({
        title: 'สำเร็จ',
        description: 'เพิ่มห้องเรียนเรียบร้อยแล้ว',
        color: 'primary'
      })
    }

    await refresh()
    modalOpen.value = false
  } catch (error) {
    console.error(error)
    const message = error.statusCode === 409
      ? 'ชื่อห้องนี้มีอยู่ในระบบแล้ว'
      : 'เกิดข้อผิดพลาด'
    toast.add({
      title: 'ผิดพลาด',
      description: message,
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

// Delete
const deleteModalOpen = ref(false)
const roomToDelete = ref(null)
const deleting = ref(false)

const confirmDelete = (room) => {
  roomToDelete.value = room
  deleteModalOpen.value = true
}

const deleteRoom = async () => {
  if (!roomToDelete.value) return

  deleting.value = true

  try {
    await $fetch(`/api/rooms/${roomToDelete.value.id_room}`, {
      method: 'DELETE'
    })

    toast.add({
      title: 'สำเร็จ',
      description: 'ลบห้องเรียนเรียบร้อยแล้ว',
      color: 'primary'
    })

    await refresh()
    deleteModalOpen.value = false
    roomToDelete.value = null
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถลบห้องเรียนได้',
      color: 'error'
    })
  } finally {
    deleting.value = false
  }
}
</script>
