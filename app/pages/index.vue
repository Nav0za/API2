<template>
  <div>
    <div class="w-2/3 bg-white border border-gray-200 p-6 mx-auto mt-10 shadow-md rounded-2xl">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">รายชื่ออาจารย์</h1>
        <div class="text-sm text-gray-500">แก้ไข</div>
      </div>

      <div v-if="pending" class="py-8 text-center text-gray-500">
        Loading...
      </div>

      <div v-else>
        <div v-if="teachers && teachers.length" class="space-y-3 mb-4">
          <div
            v-for="teacher in teachers"
            :key="teacher.id_teacher"
            class="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg"
          >
            <!-- ซ้าย : ชื่ออาจารย์ -->
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center font-semibold text-gray-700"
              >
                {{ teacher.name.charAt(0).toUpperCase() }}
              </div>
              <div class="font-medium text-gray-800">
                {{ teacher.name }}
              </div>
            </div>

            <!-- ขวา : ไอคอน 3 ปุ่ม (ไม่มีกรอบ) -->
            <div class="flex items-center gap-6">
              <!-- ดูข้อมูล -->
              <div class="flex flex-col items-center">
                <UButton
                  icon="i-lucide-menu"
                  color="primary"
                  size="sm"
                  :to="`/teacher/${teacher.id_teacher}`"
                />
                <span class="text-[11px] text-gray-500 mt-1">ดูข้อมูล</span>
              </div>

              <!-- แก้ไข -->
              <div class="flex flex-col items-center">
                <UButton
                  icon="i-lucide-edit"
                  color="warning"
                  size="sm"
                  @click="openEditModal(teacher)"
                />
                <span class="text-[11px] text-gray-500 mt-1">แก้ไข</span>
              </div>

              <!-- ลบ -->
              <div class="flex flex-col items-center">
                <UButton
                  icon="i-lucide-trash"
                  color="error"
                  size="sm"
                  @click="openDeleteModal(teacher)"
                />
                <span class="text-[11px] text-gray-500 mt-1">ลบ</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-gray-500 italic mb-4">
          ไม่มีอาจารย์ในระบบ
        </div>

        <!-- เพิ่มอาจารย์ -->
        <div class="mt-2 border-t pt-4 flex items-center gap-3">
          <UInput v-model="name" placeholder="ชื่ออาจารย์" class="flex-1" />
          <UButton label="เพิ่ม" color="primary" @click="addTeacher" />
        </div>
      </div>
      <!-- edit user -->
      <UModal
        v-model:open="editModalopen"
        title="แก้ไขชื่ออาจารย์"
      >
        <template #body>
          <h2>ชื่อเก่า: {{ seletedTeacher?.name }}</h2>
          <UInput
            v-model="newName"
            placeholder="ชื่อใหม่"
          />
        </template>
        <template #footer>
          <UButton
            label="บันทีก"
            color="primary"
            @click="updateTeacher(seletedTeacher?.id_teacher)"
          />
          <UButton
            label="ยกเลิก"
            color="error"
            @click="editModalopen = false"
          />
        </template>
      </UModal>
      <!-- add user -->
      <div class="w-2/3 border-2 border-blue-600 p-4 mx-auto mt-10 shadow-lg rounded-2xl">
        <h1 class="text-2xl font-bold mb-1">
          1.เพิ่มอาจารย์
        </h1>
        <p
          v-if="error"
          class="text-red-600 mb-2"
        >
          {{ error }}
        </p>
        <UInput v-model="name" />
        <UButton
          label="เพิ่ม"
          @click="addTeacher"
        />
      </div>
      <div class="w-full border-2 border-green-600 p-4 mx-auto mt-10 shadow-lg rounded-2xl">
        <h1 class="text-2xl font-bold mb-1">
          2.เพิ่มเทอม
        </h1>
        <p>แสดงเทอม</p>
        <div class="border p-2 shadow-2xl flex flex-col gap-2 mb-3 w-full">
          <div
            v-for="term in terms"
            :key="term.id_term"
            class="flex flex-col bg-neutral-500 justify-between p-2 border-b"
          >
            <div class="text-white font-bold">
              {{ term.term }} / {{ term.academic_year }}
            </div>
            <div class="text-gray-200 text-sm">
              เริ่ม: {{ term.start_date }} - สิ้นสุด: {{ term.end_date }}
            </div>
          </div>
        </div>
        <FormTerm />
      </div>
    </div>

    <!-- edit modal -->
    <UModal title="แก้ไขชื่ออาจารย์" v-model:open="editModalopen">
      <template #body>
        <h2 class="mb-2">ชื่อเก่า: {{ seletedTeacher?.name }}</h2>
        <UInput placeholder="ชื่อใหม่" v-model="newName" />
      </template>
      <template #footer>
        <UButton
          label="บันทึก"
          color="primary"
          @click="updateTeacher(seletedTeacher?.id_teacher)"
        />
        <UButton
          label="ยกเลิก"
          color="error"
          @click="editModalopen = false"
        />
      </template>
    </UModal>

    <!-- delete confirm -->
    <UModal title="ยืนยันการลบ" v-model:open="deleteTeacherModalOpen">
      <template #body>
        <div class="py-3">
          <p class="mb-2">คุณแน่ใจว่าจะลบอาจารย์คนนี้หรือไม่?</p>
          <p class="text-sm text-gray-600">
            <strong>ชื่อ:</strong> {{ teacherToDelete?.name }}
          </p>
        </div>
      </template>
      <template #footer>
        <UButton
          label="ยกเลิก"
          color="error"
          @click="deleteTeacherModalOpen = false"
        />
        <UButton
          label="ลบ"
          color="error"
          @click="confirmDeleteTeacher"
        />
      </template>
    </UModal>
  </div>
</template>

<script setup>
const { data: terms, error } = await useFetch('/api/terms')
const { data: teachers, pending } = await useFetch('/api/teachers')

const name = ref('')

const addTeacher = async () => {
  if (!name.value) return // ตรวจสอบว่าช่องกรอกไม่ว่างเปล่า
  try {
    const newTeacher = await $fetch('/api/teachers', {
      method: 'POST',
      body: { name: name.value }
    })
    // เคลียร์ช่องกรอกชื่ออาจารย์
    name.value = ''
    // อัปเดตข้อมูลในหน้าโดยไม่ต้อง reload
    teachers.value.push(newTeacher)

  } catch (err) {
    console.error(err)
  }
}
// ลบอาจารย์
const delTeacher = async (id) => {
  try {
    await $fetch(`/api/teachers/${id}`, {
      method: 'DELETE'
    })

    // อัปเดตข้อมูลในหน้าโดยไม่ต้อง reload
    teachers.value = teachers.value.filter(teacher => teacher.id_teacher !== id)

    // ถ้าอยากแน่ใจว่าข้อมูลตรงกับฐานจริง (optional)
  } catch (err) {
    console.error(err)
  }
}
// แก้ไขชื่ออาจารย์
const editModalopen = ref(false)
const seletedTeacher = ref(null)
const newName = ref('')
// เปิด modal แก้ไขชื่ออาจารย์
const openEditModal = (teacher) => {
  seletedTeacher.value = teacher
  newName.value = teacher.name
  editModalopen.value = true
}
// บันทึกการแก้ไขชื่ออาจารย์
const updateTeacher = async (id) => {
  if (!newName.value.trim()) return
  try {
    await $fetch(`/api/teachers/${id}`, {
      method: 'PUT',
      body: { name: newName.value }
    })
    const teacher = teachers.value.find(t => t.id_teacher === id)
    if (teacher) teacher.name = newName.value
    editModalopen.value = false
    newName.value = ''
  } catch (err) {
    console.error(err)
  }
}

// delete
const deleteTeacherModalOpen = ref(false)
const teacherToDelete = ref(null)
// เปิด modal ลบอาจารย์
const openDeleteModal = (teacher) => {
  teacherToDelete.value = teacher
  deleteTeacherModalOpen.value = true
}
// ยืนยันการลบอาจารย์
const confirmDeleteTeacher = async () => {
  if (!teacherToDelete.value) return
  try {
    await $fetch(`/api/teachers/${teacherToDelete.value.id_teacher}`, {
      method: 'DELETE'
    })
    teachers.value = teachers.value.filter(
      t => t.id_teacher !== teacherToDelete.value.id_teacher
    )
    deleteTeacherModalOpen.value = false
    teacherToDelete.value = null
  } catch (err) {
    console.error(err)
  }
}
</script>
