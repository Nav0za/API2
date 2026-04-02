<template>
  <div class="min-h-screen bg-white text-slate-900 pb-20">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200 p-6 shadow-lg mb-8 no-print">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <UIcon
              name="i-heroicons-home-modern"
              class="text-blue-600"
            />
            ตารางการใช้ห้องเรียน
          </h1>
          <p class="text-slate-600 mt-1">
            ดูสถานะการใช้งาน จัดการ และเพิ่มห้องเรียนสำหรับการเรียนการสอน
          </p>
        </div>

        <!-- Filters & Actions -->
        <div class="flex flex-wrap items-center justify-center gap-4">
          <USelect
            v-model="selectedTerm"
            :items="termOptions"
            value-key="value"
            label-key="label"
            placeholder="เลือกเทอม"
            size="xl"
            class="min-w-[150px]"
          />
          <UInput
            v-model="selectedDate"
            type="date"
            size="xl"
            icon="i-heroicons-calendar"
          />
          <div class="h-8 w-px bg-slate-200 mx-2 hidden md:block" />
          <UButton
            label="เพิ่มห้อง"
            icon="i-heroicons-plus-circle"
            color="primary"
            size="xl"
            class="rounded-xl shadow-lg shadow-blue-500/20 font-bold"
            @click="openAddModal"
          />
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4">
      <!-- Loading State -->
      <div
        v-if="pending"
        class="flex justify-center py-20"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-10 h-10 animate-spin text-blue-500"
        />
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Empty State -->
        <div
          v-if="!rooms || rooms.length === 0"
          class="text-center py-32 bg-slate-100 rounded-[40px] relative overflow-hidden"
        >
          <div class="relative z-10">
            <div
              class="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200"
            >
              <UIcon
                name="i-heroicons-building-office-2"
                class="w-12 h-12 text-slate-500"
              />
            </div>
            <h3 class="text-2xl font-bold text-slate-600 mb-2">
              ยังไม่มีห้องเรียนในระบบ
            </h3>
            <p class="text-slate-500 mb-8">
              เริ่มสร้างห้องเรียนเพื่อจัดตารางสอนได้ทันทีค่ะ
            </p>
            <UButton
              variant="solid"
              color="primary"
              size="xl"
              label="เริ่มสร้างห้องเรียนแรก"
              icon="i-heroicons-plus-circle"
              class="rounded-full px-10 font-bold"
              @click="openAddModal"
            />
          </div>
        </div>

        <!-- Schedule Matrix -->
        <div
          v-else
          class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl relative"
        >
          <!-- Guide Legend -->
          <div class="flex gap-6 p-4 border-b border-slate-200 bg-slate-50 sticky left-0 z-20">
            <div class="flex items-center gap-2 text-lg font-bold text-slate-700">
              <div class="w-4 h-4 rounded-md bg-amber-500/20 border border-amber-500/50" />
              เรียนปกติ
            </div>
            <div class="flex items-center gap-2 text-lg font-bold text-slate-700">
              <div class="w-4 h-4 rounded-md bg-red-500/20 border border-red-500/50" />
              สอนชดเชย
            </div>
          </div>

          <div class="overflow-x-auto w-full custom-scrollbar">
            <table class="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr class="bg-slate-100 border-b border-slate-200 text-sm font-black text-slate-600">
                  <th
                    class="text-lg p-4 whitespace-nowrap sticky left-0 bg-slate-100 z-10 w-48 shadow-[2px_0_5px_rgba(0,0,0,0.1)]"
                  >
                    ห้องเรียน
                  </th>
                  <th
                    v-for="time in times"
                    :key="time"
                    class="p-4 whitespace-nowrap text-center w-[120px] border-l border-slate-200"
                  >
                    {{ time }}
                  </th>
                  <th
                    class="text-lg p-4 whitespace-nowrap text-center sticky right-0 bg-slate-100 z-10 border-l border-slate-200 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]"
                  >
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr
                  v-for="room in rooms"
                  :key="room.id_room"
                  class="hover:bg-slate-50 transition-colors"
                >
                  <!-- Room Info -->
                  <td
                    class="p-4 sticky left-0 bg-white z-10 w-48 shadow-[2px_0_5px_rgba(0,0,0,0.1)] group-hover:bg-slate-50 transition-colors"
                  >
                    <p class="font-bold text-slate-900 truncate max-w-[160px]">
                      {{ room.room_name }}
                    </p>
                    <p class="text-md text-slate-500 truncate max-w-[160px]">
                      {{ room.building || 'ไม่ระบุอาคาร' }}
                    </p>
                  </td>

                  <!-- Slots -->
                  <td
                    v-for="(slot, idx) in room.slots"
                    :key="idx"
                    class="p-2 border-l border-slate-700/30 align-top relative min-w-[120px] max-w-[120px] h-[90px]"
                  >
                    <div
                      v-if="slot"
                      class="w-full h-full p-2.5 rounded-xl flex flex-col justify-center gap-1 shadow-sm group/slot transition-all hover:scale-105 hover:z-20 cursor-default"
                      :class="slot.type === 'makeup' ? 'bg-red-500/10 border border-red-500/30 text-red-200' : 'bg-amber-500/10 border border-amber-500/30 text-amber-200'"
                    >
                      <!-- Hover Details Popup -->
                      <div
                        class="absolute inset-0 z-30 hidden group-hover/slot:flex items-center justify-center p-3 rounded-xl shadow-2xl backdrop-blur-md"
                        :class="slot.type === 'makeup' ? 'bg-red-950/90 border border-red-500/50 text-red-100' : 'bg-amber-950/90 border border-amber-500/50 text-amber-100'"
                      >
                        <div class="text-center w-full relative z-40">
                          <p
                            class="font-bold text-xs line-clamp-2 leading-snug break-words whitespace-normal"
                            :class="slot.type === 'makeup' ? 'text-red-400' : 'text-amber-400'"
                          >
                            {{ slot.subjectName }}
                          </p>
                          <p class="text-[10px] mt-1 text-slate-300 line-clamp-1 whitespace-normal text-opacity-80">
                            {{
                              slot.teacherName }}
                          </p>
                          <UBadge
                            v-if="slot.type === 'makeup'"
                            size="xs"
                            color="red"
                            variant="soft"
                            class="mt-1.5 mx-auto w-fit scale-[0.85] origin-top"
                          >
                            ชดเชย (-{{ slot.timeEnd }})
                          </UBadge>
                        </div>
                      </div>

                      <p class="text-[11px] font-bold truncate">
                        {{ slot.subjectName }}
                      </p>
                      <p class="text-[10px] truncate opacity-80">
                        {{ slot.teacherName }}
                      </p>
                    </div>
                  </td>

                  <!-- Actions -->
                  <td
                    class="p-4 text-center sticky right-0 bg-white z-10 border-l border-slate-200 shadow-[-2px_0_5px_rgba(0,0,0,0.1)] group-hover:bg-slate-50 transition-colors"
                  >
                    <div class="flex items-center justify-center gap-1">
                      <UButton
                        icon="i-heroicons-pencil-square"
                        color="warning"
                        variant="ghost"
                        size="lg"
                        class="rounded-lg cursor-pointer"
                        @click="openEditModal(room)"
                      />
                      <UButton
                        icon="i-heroicons-trash"
                        color="error"
                        variant="ghost"
                        size="lg"
                        class="rounded-lg cursor-pointer"
                        @click="confirmDelete(room)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal เพิ่ม/แก้ไขห้อง -->
    <UModal
      v-model:open="modalOpen"
      :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }"
    >
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div class="flex items-center gap-4 mb-8">
              <div
                class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20"
              >
                <UIcon
                  :name="editingRoom ? 'i-heroicons-pencil-square' : 'i-heroicons-plus-circle'"
                  class="text-2xl text-blue-500"
                />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-slate-900">
                  {{ editingRoom ? 'แก้ไขข้อมูลห้องเรียน'
                    : 'เพิ่มห้องเรียนใหม่'
                  }}
                </h3>
                <p class="text-slate-600 text-md">
                  ระบุรายละเอียดของห้องเรียนเพื่อให้สะดวกในการค้นหาเวลาว่าง
                </p>
              </div>
            </div>

            <div class="space-y-6">
              <UFormField
                class="text-lg"
                label="ชื่อห้อง (Room Name) *"
                help="เช่น EN101, LabCom 1"
              >
                <UInput
                  v-model="formData.room_name"
                  placeholder="ระบุชื่อห้อง..."
                  size="xl"
                  class="rounded-xl"
                />
              </UFormField>

              <UFormField
                class="text-lg"
                label="อาคาร (Building)"
              >
                <UInput
                  v-model="formData.building"
                  placeholder="เช่น อาคาร EN"
                  size="xl"
                  class="rounded-xl"
                />
              </UFormField>

              <UFormField
                class="text-lg"
                label="คำอธิบายเพิ่มเติม"
              >
                <UTextarea
                  v-model="formData.description"
                  placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)..."
                  :rows="3"
                  size="xl"
                  class="rounded-xl"
                />
              </UFormField>
            </div>
          </div>
          <div class="p-6 border-t border-slate-200 bg-white/95 backdrop-blur-sm sticky bottom-0 z-10">
            <div class="flex gap-3">
              <UButton
                label="ยกเลิก"
                color="neutral"
                variant="soft"
                size="xl"
                block
                class="rounded-2xl py-4 flex-1 font-bold cursor-pointer"
                @click="modalOpen = false"
              />
              <UButton
                :label="editingRoom ? 'บันทึกการแก้ไข' : 'สร้างห้องเรียน'"
                color="primary"
                size="xl"
                block
                class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold cursor-pointer"
                :loading="saving"
                @click="saveRoom"
              />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal ยืนยันการลบ -->
    <UModal
      v-model:open="deleteModalOpen"
      :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }"
    >
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div
              class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20"
            >
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="text-4xl text-red-500"
              />
            </div>

            <h3 class="text-2xl font-bold text-slate-900 text-center mb-2">
              ยืนยันการลบห้องเรียน
            </h3>
            <p class="text-slate-600 text-center mb-8">
              คุณแน่ใจหรือไม่ที่จะลบห้องเรียนนี้ออกจากระบบ?
              การดำเนินการนี้ไม่สามารถย้อนคืนได้ค่ะ
            </p>

            <div
              class="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl mb-8 text-center relative overflow-hidden"
            >
              <div class="relative z-10">
                <p class="text-xs font-black uppercase tracking-widest text-red-400/80 mb-1">
                  ห้องที่เลือก
                </p>
                <p class="text-3xl font-black text-slate-900">
                  {{ roomToDelete?.room_name }}
                </p>
                <p class="text-sm text-slate-500 mt-2">
                  {{ roomToDelete?.building }}
                </p>
              </div>
            </div>

            <p class="text-xs text-red-500/60 text-center mb-2 bg-red-500/5 py-2 rounded-lg border border-red-500/10">
              ⚠️ หมายเหตุ: การลบห้องจะไม่ส่งผลกระทบต่อข้อมูลคลาสสอนที่เคยใช้ห้องนี้ไปแล้ว
            </p>
          </div>
          <div class="p-6 border-t border-slate-200 bg-white/95 backdrop-blur-sm sticky bottom-0 z-10">
            <div class="flex flex-col sm:flex-row gap-3">
              <UButton
                label="ยกเลิก"
                color="neutral"
                variant="outline"
                size="xl"
                block
                class="rounded-2xl border-slate-200 py-4 flex-1 font-bold"
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
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import dayjs from 'dayjs'

const times = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
]

// Terms
const { data: termsData } = await useFetch('/api/terms')
const termOptions = computed(() => {
  if (!termsData.value) return []
  return termsData.value.map(t => ({
    label: `เทอม ${t.term}/${t.academic_year}`,
    value: `${t.term}/${t.academic_year}`
  }))
})

const selectedTerm = ref('')
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

watchEffect(() => {
  if (termOptions.value.length > 0 && !selectedTerm.value) {
    selectedTerm.value = termOptions.value[0].value
  }
})

// Rooms Schedule Data
const { data: scheduleData, pending, refresh: refreshRooms } = await useFetch('/api/rooms/schedule', {
  query: {
    term: selectedTerm,
    date: selectedDate
  },
  watch: [selectedTerm, selectedDate]
})

const rooms = computed(() => scheduleData.value?.data || [])

// Modal state
const modalOpen = ref(false)
const editingRoom = ref(null)
const saving = ref(false)

const formData = ref({
  room_name: '',
  building: '',
  description: ''
})

const openAddModal = () => {
  editingRoom.value = null
  formData.value = {
    room_name: '',
    building: '',
    description: ''
  }
  modalOpen.value = true
}

const openEditModal = (room) => {
  editingRoom.value = room
  formData.value = {
    room_name: room.room_name,
    building: room.building || '',
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

    await refreshRooms()
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

// Delete state
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

    await refreshRooms()
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

<style scoped>
/* Scrollbar Styling for Table */
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 1);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(51, 65, 85, 1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 1);
}
</style>
