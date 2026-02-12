<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">จัดการอาจารย์</h1>
        </div>
      </template>

      <div v-if="pending" class="py-8 text-center text-gray-500">
        <UIcon name="i-lucide-loader" class="animate-spin text-2xl" />
        <p class="mt-2">กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else>
        <div v-if="teachers && teachers.length" class="space-y-3 mb-6">
          <div
            v-for="teacher in teachers"
            :key="teacher.id_teacher"
            class="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <!-- ซ้าย : ชื่ออาจารย์ -->
            <div class="flex items-center gap-3">
              <UAvatar
                :alt="teacher.name.toUpperCase()"
                size="md"
                :ui="{ background: 'bg-amber-100 text-gray-700' }"
              />
              <div class="font-medium text-gray-800">
                {{ teacher.name }}
              </div>
            </div>

            <!-- ขวา : ปุ่มดำเนินการ -->
            <div class="flex items-center gap-2">
              <UTooltip text="จัดการข้อมูล">
                <UButton
                  icon="i-lucide-settings"
                  color="primary"
                  variant="ghost"
                  :to="`/teacher/${teacher.id_teacher}`"
                />
              </UTooltip>

              <UTooltip text="แก้ไขชื่อ">
                <UButton
                  icon="i-lucide-edit"
                  color="warning"
                  variant="ghost"
                  @click="openEditModal(teacher)"
                />
              </UTooltip>

              <UTooltip text="ลบ">
                <UButton
                  icon="i-lucide-trash"
                  color="error"
                  variant="ghost"
                  :disabled="deletingTeacherId === teacher.id_teacher"
                  :loading="deletingTeacherId === teacher.id_teacher"
                  @click="confirmDeleteTeacher(teacher)"
                />
              </UTooltip>
            </div>
          </div>
        </div>

        <div v-else class="text-gray-500 italic mb-6 text-center py-8 bg-gray-50 rounded-lg">
          ไม่มีอาจารย์ในระบบ
        </div>

        <!-- เพิ่มอาจารย์ -->
        <div class="mt-6 border-t pt-6">
          <h3 class="text-sm font-medium text-gray-700 mb-3">เพิ่มอาจารย์ใหม่</h3>
          <div class="flex items-center gap-3">
            <UInput
              v-model="name"
              placeholder="กรอกชื่ออาจารย์"
              class="flex-1"
              :disabled="addingTeacher"
              @keyup.enter="addTeacher"
              icon="i-lucide-user-plus"
            />
            <UButton
              label="เพิ่ม"
              color="primary"
              icon="i-lucide-plus"
              :loading="addingTeacher"
              :disabled="!name.trim()"
              @click="addTeacher"
            />
          </div>
        </div>

        <UAlert
          v-if="errorMessage"
          icon="i-heroicons-exclamation-triangle"
          color="red"
          variant="soft"
          title="เกิดข้อผิดพลาด"
          :description="errorMessage"
          class="mt-4"
          @close="errorMessage = ''"
        />
      </div>
    </UCard>

    <!-- Modals -->
    <UModal v-model:open="deleteTeacherModalOpen" title="ยืนยันการลบ">
      <template #body>
        <div class="py-2">
          <p class="mb-4 text-gray-600">
            คุณแน่ใจหรือไม่ที่จะลบอาจารย์ท่านนี้? การลบจะทำให้ข้อมูลที่เกี่ยวข้องทั้งหมด (รายวิชา, ตารางสอน) ถูกลบออกไปด้วย
          </p>
          <div class="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
            <UAvatar :alt="selectedTeacherForDelete?.name.charAt(0)" size="md" class="bg-red-200 text-red-700 font-bold" />
            <span class="font-bold text-lg text-gray-900">{{ selectedTeacherForDelete?.name }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            label="ยกเลิก"
            color="gray"
            variant="soft"
            @click="deleteTeacherModalOpen = false"
          />
          <UButton
            label="ยืนยันการลบ"
            color="error"
            :loading="deletingTeacherId === selectedTeacherForDelete?.id_teacher"
            @click="delTeacher(selectedTeacherForDelete?.id_teacher)"
          />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="editModalopen" title="แก้ไขชื่ออาจารย์">
      <template #body>
        <div class="space-y-4 py-2">
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">ชื่อปัจจุบัน</label>
            <div class="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100">{{ seletedTeacher?.name }}</div>
          </div>
          <div>
            <label class="text-sm font-bold text-gray-900 mb-1 block">ชื่อใหม่</label>
            <UInput
              v-model="newName"
              placeholder="กรอกชื่อที่ต้องการแก้ไข"
              autofocus
              @keyup.enter="updateTeacher(seletedTeacher?.id_teacher)"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            label="ยกเลิก"
            color="gray"
            variant="soft"
            @click="editModalopen = false"
          />
          <UButton
            label="บันทึกการเปลี่ยนแปลง"
            color="primary"
            :disabled="!newName.trim() || newName === seletedTeacher?.name"
            :loading="updatingTeacher"
            @click="updateTeacher(seletedTeacher?.id_teacher)"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const { data: teachers, pending, refresh: refreshTeachers } = await useFetch('/api/teachers')

const name = ref('')
const errorMessage = ref('')
const addingTeacher = ref(false)
const updatingTeacher = ref(false)
const deletingTeacherId = ref(null)

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
