<template>
  <div class="min-h-screen bg-slate-900 text-white pb-20">
    <!-- Header -->
    <div class="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-20 shadow-lg mb-8 no-print">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 class="text-3xl font-bold text-white flex items-center gap-2">
            <UIcon name="i-heroicons-user-group" class="text-amber-400" />
            รายชื่ออาจารย์
          </h1>
          <p class="text-slate-400 mt-1">จัดการข้อมูลอาจารย์ผู้สอนและวิชาที่รับผิดชอบ</p>
        </div>

        <!-- Quick Stats -->
        <div class="flex flex-wrap justify-center gap-4">
          <div class="bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-700 backdrop-blur-sm min-w-[140px]">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">อาจารย์ทั้งหมด</p>
            <p class="text-2xl font-black text-white">{{ teachers?.length || 0 }} <span
                class="text-xs font-normal text-slate-500">ท่าน</span></p>
          </div>

          <div class="flex items-center gap-3">
            <UInput v-model="name" placeholder="กรอกชื่ออาจารย์ใหม่..." size="xl" class="w-64 rounded-xl"
              :disabled="addingTeacher" @keyup.enter="addTeacher" icon="i-heroicons-user-plus" />
            <UButton label="เพิ่มอาจารย์" color="primary" size="xl"
              class="rounded-xl shadow-lg shadow-blue-500/20 font-bold" :loading="addingTeacher"
              :disabled="!name.trim()" @click="addTeacher" />
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4">
      <!-- Search & Filter -->
      <div class="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="relative w-full md:w-96 group">
          <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="ค้นหาชื่ออาจารย์..." size="xl"
            class="rounded-2xl bg-slate-800/50 w-full text-white" variant="none" />
          <div
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300">
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="flex justify-center py-20">
        <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-amber-500" />
      </div>

      <!-- Content -->
      <div v-else>
        <div v-if="filteredTeachers && filteredTeachers.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="teacher in filteredTeachers" :key="teacher.id_teacher"
            class="relative overflow-hidden bg-slate-800 rounded-[32px] border border-slate-700 p-6 shadow-xl hover:shadow-amber-500/5 hover:border-amber-500/40 transition-all duration-500 group">
            <!-- Background Decoration -->
            <div
              class="absolute -right-4 -top-4 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700">
              <UIcon name="i-heroicons-user" class="w-32 h-32 text-white" />
            </div>

            <div class="flex flex-col items-center text-center relative z-10">
              <UAvatar :alt="teacher.name.toUpperCase()" size="3xl"
                class="mb-6 ring-4 ring-slate-900 shadow-2xl group-hover:ring-amber-500/30 transition-all duration-500"
                :ui="{ background: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black' }" />

              <h3 class="text-xl font-black text-white mb-2 leading-tight group-hover:text-amber-400 transition-colors">
                {{ teacher.name }}
              </h3>

              <div
                class="flex items-center gap-1.5 px-3 py-1 bg-slate-900/50 rounded-full border border-slate-700/50 mb-6 font-bold text-xs text-slate-400">
                <UIcon name="i-heroicons-identification" class="text-amber-500" />
                ID: {{ teacher.id_teacher }}
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-3 w-full">
                <UButton label="ดูตารางสอน" icon="i-heroicons-calendar-days" color="primary" variant="soft" block
                  class="rounded-xl flex-1 font-bold bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50"
                  :to="`/teacher/${teacher.id_teacher}`" />
                <div class="flex gap-1">
                  <UButton icon="i-heroicons-pencil-square" color="amber" variant="soft"
                    class="rounded-xl border border-amber-500/10" @click="openEditModal(teacher)" />
                  <UButton icon="i-heroicons-trash" color="error" variant="soft" class="rounded-xl border-red-500/10"
                    @click="confirmDeleteTeacher(teacher)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else
          class="text-center py-32 bg-slate-800/30 rounded-[40px] border border-dashed border-slate-700 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent"></div>
          <div class="relative z-10">
            <div
              class="bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border border-slate-700">
              <UIcon name="i-heroicons-users" class="w-12 h-12 text-slate-600" />
            </div>
            <h3 class="text-2xl font-bold text-slate-400 mb-2">
              {{ searchQuery ? 'ไม่พบรายชื่อที่ค้นหา' : 'ยังไม่มีรายชื่ออาจารย์ในระบบ' }}
            </h3>
            <p class="text-slate-600 mb-8">กรุณากรอกชื่อในแถบ Header เพื่อเพิ่มอาจารย์คนแรก</p>
          </div>
        </div>
      </div>

      <UAlert v-if="errorMessage" icon="i-heroicons-exclamation-triangle" color="error" variant="soft"
        title="เกิดข้อผิดพลาด" :description="errorMessage" class="mt-8 rounded-2xl" @close="errorMessage = ''" />
    </div>

    <!-- Modal ลบอาจารย์ -->
    <UModal v-model:open="deleteTeacherModalOpen"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
      <template #content>
        <div class="p-8">
          <div
            class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-4xl text-red-500" />
          </div>

          <h3 class="text-2xl font-bold text-white text-center mb-2">ยืนยันการลบอาจารย์</h3>
          <p class="text-slate-400 text-center mb-8 truncate-2-lines">คุณแน่ใจหรือไม่ที่จะลบรายชื่ออาจารย์ท่านนี้?
            การลบจะทำให้ข้อมูลตารางสอนทั้งหมดหายไปด้วยนะคะ</p>

          <div class="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl mb-8 text-center relative overflow-hidden">
            <div class="relative z-10">
              <p class="text-xs font-black uppercase tracking-widest text-red-400/80 mb-2">อาจารย์ที่เลือก</p>
              <div class="flex items-center justify-center gap-3">
                <UAvatar :alt="selectedTeacherForDelete?.name.toUpperCase()" size="lg"
                  :ui="{ background: 'bg-red-500/20 text-red-500 font-black' }" />
                <p class="text-2xl font-black text-white">{{ selectedTeacherForDelete?.name }}</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <UButton label="ยกเลิก" color="neutral" variant="outline" size="xl" block
              class="rounded-2xl border-slate-700 py-4 flex-1 font-bold" @click="deleteTeacherModalOpen = false" />
            <UButton label="ยืนยันการลบถาวร" color="error" size="xl" block
              class="rounded-2xl py-4 flex-1 shadow-lg shadow-red-500/20 font-bold"
              :loading="deletingTeacherId === selectedTeacherForDelete?.id_teacher"
              @click="delTeacher(selectedTeacherForDelete?.id_teacher)" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal แก้ไขชื่อ -->
    <UModal v-model:open="editModalopen"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
      <template #content>
        <div class="p-8">
          <div class="flex items-center gap-4 mb-8">
            <div
              class="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <UIcon name="i-heroicons-pencil-square" class="text-2xl text-amber-500" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white">แก้ไขชื่ออาจารย์</h3>
              <p class="text-slate-400 text-sm">การเปลี่ยนชื่อจะไม่ส่งผลต่อประวัติการสอนชดเชย</p>
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <label
                class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">ชื่อปัจจุบัน</label>
              <div class="p-4 bg-slate-800 rounded-2xl text-slate-300 border border-slate-700 font-bold italic">{{
                seletedTeacher?.name }}</div>
            </div>

            <UFormField label="ชื่อที่ต้องการเปลี่ยนแปลง *">
              <UInput v-model="newName" placeholder="ระบุชื่อใหม่..." size="xl" class="rounded-xl" autofocus
                @keyup.enter="updateTeacher(seletedTeacher?.id_teacher)" />
            </UFormField>
          </div>

          <div class="flex gap-3 mt-10">
            <UButton label="ยกเลิก" color="neutral" variant="soft" size="xl" block
              class="rounded-2xl py-4 flex-1 font-bold font-heading" @click="editModalopen = false" />
            <UButton label="บันทึกข้อมูล" color="primary" size="xl" block
              class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold font-heading"
              :disabled="!newName.trim() || newName === seletedTeacher?.name" :loading="updatingTeacher"
              @click="updateTeacher(seletedTeacher?.id_teacher)" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const { data: teachers, pending, refresh: refreshTeachers } = await useFetch('/api/teachers')

const name = ref('')
const searchQuery = ref('')
const errorMessage = ref('')
const addingTeacher = ref(false)
const updatingTeacher = ref(false)
const deletingTeacherId = ref(null)

const filteredTeachers = computed(() => {
  if (!teachers.value) return []
  if (!searchQuery.value) return teachers.value
  return teachers.value.filter(t => t.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

// เพิ่มอาจารย์
const addTeacher = async () => {
  if (!name.value.trim()) return

  addingTeacher.value = true
  errorMessage.value = ''

  try {
    const newTeacher = await $fetch('/api/teachers', {
      method: 'POST',
      body: { name: name.value.trim() }
    })

    name.value = ''
    if (teachers.value) {
      teachers.value.push(newTeacher)
    } else {
      await refreshTeachers()
    }
  } catch (err) {
    console.error(err)
    if (err.statusCode === 409) {
      errorMessage.value = 'ชื่ออาจารย์นี้มีอยู่ในระบบแล้ว'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาดในการเพิ่มอาจารย์'
    }
  } finally {
    addingTeacher.value = false
  }
}

// ลบอาจารย์
const deleteTeacherModalOpen = ref(false)
const selectedTeacherForDelete = ref(null)

const confirmDeleteTeacher = (teacher) => {
  selectedTeacherForDelete.value = teacher
  deleteTeacherModalOpen.value = true
}

const delTeacher = async (id) => {
  deletingTeacherId.value = id

  try {
    await $fetch(`/api/teachers/${id}`, {
      method: 'DELETE'
    })

    if (teachers.value) {
      teachers.value = teachers.value.filter(teacher => teacher.id_teacher !== id)
    }
    deleteTeacherModalOpen.value = false
    selectedTeacherForDelete.value = null
  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาดในการลบอาจารย์')
  } finally {
    deletingTeacherId.value = null
  }
}

// แก้ไขชื่ออาจารย์
const editModalopen = ref(false)
const seletedTeacher = ref(null)
const newName = ref('')

const openEditModal = (teacher) => {
  seletedTeacher.value = teacher
  newName.value = teacher.name
  editModalopen.value = true
}

const updateTeacher = async (id) => {
  if (!newName.value.trim() || newName.value === seletedTeacher.value?.name) return

  updatingTeacher.value = true

  try {
    await $fetch(`/api/teachers/${id}`, {
      method: 'PUT',
      body: { name: newName.value.trim() }
    })

    const teacher = teachers.value?.find(t => t.id_teacher === id)
    if (teacher) teacher.name = newName.value.trim()

    editModalopen.value = false
    newName.value = ''
    seletedTeacher.value = null
  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาดในการแก้ไขชื่ออาจารย์')
  } finally {
    updatingTeacher.value = false
  }
}

// Clear error message เมื่อพิมพ์
watch(name, () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
})
</script>
