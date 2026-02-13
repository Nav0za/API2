<template>
  <div class="min-h-screen bg-slate-900 text-white pb-20">
    <!-- Header -->
    <div class="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-20 shadow-lg mb-8 no-print">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 class="text-3xl font-bold text-white flex items-center gap-2">
            <UIcon name="i-heroicons-home-modern" class="text-blue-400" />
            จัดการห้องเรียน
          </h1>
          <p class="text-slate-400 mt-1">เพิ่ม แก้ไข และจัดการห้องเรียนสำหรับการสอนชดเชย</p>
        </div>
        
        <!-- Summary Stats -->
        <div class="flex flex-wrap justify-center gap-4">
          <div class="bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-700 backdrop-blur-sm min-w-[140px]">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">ห้องทั้งหมด</p>
            <p class="text-2xl font-black text-white">{{ rooms?.length || 0 }} <span class="text-xs font-normal text-slate-500">ห้อง</span></p>
          </div>
          <div class="bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-700 backdrop-blur-sm min-w-[140px]">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">ความจุรวม</p>
            <p class="text-2xl font-black text-blue-400">{{ totalCapacity }} <span class="text-xs font-normal text-slate-500">ที่นั่ง</span></p>
          </div>
          <UButton
            label="เพิ่มห้องเรียนใหม่"
            icon="i-heroicons-plus-circle"
            color="primary"
            size="xl"
            class="rounded-2xl shadow-lg shadow-blue-500/20 font-bold px-8"
            @click="openAddModal"
          />
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4">
      <!-- Loading -->
      <div v-if="pending" class="flex justify-center py-20">
        <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-blue-500" />
      </div>

      <!-- Content -->
      <div v-else>
        <div v-if="!rooms || rooms.length === 0" class="text-center py-32 bg-slate-800/30 rounded-[40px] border border-dashed border-slate-700 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
          <div class="relative z-10">
            <div class="bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border border-slate-700">
              <UIcon name="i-heroicons-building-office-2" class="w-12 h-12 text-slate-600" />
            </div>
            <h3 class="text-2xl font-bold text-slate-400 mb-2">ยังไม่มีห้องเรียนในระบบ</h3>
            <p class="text-slate-600 mb-8">เริ่มสร้างห้องเรียนเพื่อใช้ในการจัดตารางสอนชดเชยได้ทันทีค่ะ</p>
            <UButton
              color="primary"
              size="xl"
              label="เริ่มสร้างห้องเรียนแรก"
              icon="i-heroicons-plus-circle"
              class="rounded-2xl px-10 shadow-xl shadow-blue-500/10"
              @click="openAddModal"
            />
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="room in rooms" 
            :key="room.id_room"
            class="relative overflow-hidden bg-slate-800 rounded-[32px] border border-slate-700 p-8 shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/40 transition-all duration-500 group"
          >
            <!-- Background Decoration -->
            <div class="absolute -right-6 -top-6 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700">
               <UIcon name="i-heroicons-building-library" class="w-40 h-40 text-white" />
            </div>

            <div class="flex justify-between items-start relative z-10 mb-6">
              <div class="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner border border-slate-700/50">
                <UIcon name="i-heroicons-building-library" class="text-3xl text-blue-400 group-hover:text-white" />
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                <UButton
                  icon="i-heroicons-pencil-square"
                  color="amber"
                  variant="soft"
                  size="md"
                  class="rounded-xl border border-amber-500/10"
                  @click="openEditModal(room)"
                />
                <UButton
                  icon="i-heroicons-trash"
                  color="error"
                  variant="soft"
                  size="md"
                  class="rounded-xl border border-red-500/10"
                  @click="confirmDelete(room)"
                />
              </div>
            </div>

            <div class="relative z-10">
              <h3 class="text-2xl font-black text-white mb-2 decoration-blue-500 underline-offset-4 decoration-2 group-hover:underline transition-all">
                {{ room.room_name }}
              </h3>
              <div class="flex items-center gap-2 text-slate-400 bg-slate-900/50 w-fit px-3 py-1 rounded-full border border-slate-700/50 mb-8">
                <UIcon name="i-heroicons-map-pin" class="text-blue-500" />
                <span class="text-sm font-bold">{{ room.building || 'ไม่ระบุอาคาร' }}</span>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/30 group-hover:border-blue-500/20 transition-colors">
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">ความจุ</p>
                  <p class="text-lg font-black text-white">
                    {{ room.capacity || '-' }} 
                    <span class="text-xs font-normal text-slate-500 ml-1">คน</span>
                  </p>
                </div>
                <div class="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/30 group-hover:border-blue-500/20 transition-colors">
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">สถานะ</p>
                  <div class="flex items-center gap-1.5">
                    <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p class="text-sm font-bold text-green-400">พร้อมใช้</p>
                  </div>
                </div>
              </div>

              <div v-if="room.description" class="mt-4 p-4 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700/50">
                 <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                   {{ room.description }}
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal เพิ่ม/แก้ไขห้อง -->
    <UModal
      v-model:open="modalOpen"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }"
    >
      <template #content>
        <div class="p-8">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <UIcon :name="editingRoom ? 'i-heroicons-pencil-square' : 'i-heroicons-plus-circle'" class="text-2xl text-blue-500" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white">{{ editingRoom ? 'แก้ไขข้อมูลห้องเรียน' : 'เพิ่มห้องเรียนใหม่' }}</h3>
              <p class="text-slate-400 text-sm">ระบุรายละเอียดของห้องเรียนเพื่อให้ระบุในตารางสอนชดเชย</p>
            </div>
          </div>

          <div class="space-y-6">
            <UFormField label="ชื่อห้อง (Room Name) *" help="เช่น EN101, LabCom 1">
              <UInput
                v-model="formData.room_name"
                placeholder="ระบุชื่อห้อง..."
                size="xl"
                class="rounded-xl"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="อาคาร (Building)">
                <UInput
                  v-model="formData.building"
                  placeholder="เช่น อาคาร EN"
                  size="xl"
                  class="rounded-xl"
                />
              </UFormField>

              <UFormField label="ความจุ (Capacity)">
                <UInput
                  v-model.number="formData.capacity"
                  type="number"
                  placeholder="จำนวนที่นั่ง"
                  size="xl"
                  class="rounded-xl"
                  icon="i-heroicons-users"
                />
              </UFormField>
            </div>

            <UFormField label="คำอธิบายเพิ่มเติม">
              <UTextarea
                v-model="formData.description"
                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)..."
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
              @click="modalOpen = false"
            />
            <UButton
              :label="editingRoom ? 'บันทึกการแก้ไข' : 'สร้างห้องเรียน'"
              color="primary"
              size="xl"
              block
              class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold"
              :loading="saving"
              @click="saveRoom"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal ยืนยันการลบ -->
    <!-- Modal ยืนยันการลบ -->
    <UModal
      v-model:open="deleteModalOpen"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }"
    >
      <template #content>
        <div class="p-8">
          <div class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-4xl text-red-500" />
          </div>
          
          <h3 class="text-2xl font-bold text-white text-center mb-2">ยืนยันการลบห้องเรียน</h3>
          <p class="text-slate-400 text-center mb-8">คุณแน่ใจหรือไม่ที่จะลบห้องเรียนนี้ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนคืนได้ค่ะ</p>

          <div class="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl mb-8 text-center relative overflow-hidden">
             <div class="relative z-10">
                <p class="text-xs font-black uppercase tracking-widest text-red-400/80 mb-1">ห้องที่เลือก</p>
                <p class="text-3xl font-black text-white">{{ roomToDelete?.room_name }}</p>
                <p class="text-sm text-slate-500 mt-2">{{ roomToDelete?.building }}</p>
             </div>
          </div>

          <p class="text-xs text-red-500/60 text-center mb-8 bg-red-500/5 py-2 rounded-lg border border-red-500/10">
            ⚠️ หมายเหตุ: การลบห้องจะไม่ส่งผลกระทบต่อข้อมูลคลาสชดเชยที่เคยใช้ห้องนี้ไปแล้ว
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <UButton
              label="ยกเลิก"
              color="neutral"
              variant="outline"
              size="xl"
              block
              class="rounded-2xl border-slate-700 py-4 flex-1 font-bold"
              @click="deleteModalOpen = false"
            />
            <UButton
              label="ยืนยันการลบถาวร"
              color="error"
              size="xl"
              block
              class="rounded-2xl py-4 flex-1 shadow-lg shadow-red-500/20 font-bold"
              :loading="deleting"
              @click="deleteRoom"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const { data: rooms, pending, refresh } = await useFetch('/api/rooms')

const totalCapacity = computed(() => {
  if (!rooms.value) return 0
  return rooms.value.reduce((sum, room) => sum + (room.capacity || 0), 0)
})

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
