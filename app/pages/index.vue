<template>
  <div>
    <div class="w-2/3 bg-white border border-gray-200 p-6 mx-auto mt-10 shadow-md rounded-2xl">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">
          รายชื่ออาจารย์
        </h1>
        <div class="flex items-center gap-2">
          <div class="text-sm text-gray-500">
            ตัวเลือก
          </div>
          <NuxtLink to="/formterm/13" class="ml-4"><UButton label="ตารางตึก" color="success" size="sm" /></NuxtLink>
        </div>
      </div>

      <div
        v-if="pending"
        class="py-8 text-center text-gray-500"
      >
        Loading...
      </div>

      <div v-else>
        <div
          v-if="teachers && teachers.length"
          class="space-y-3 mb-4"
        >
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
                  @click="confirmDeleteTeacher(teacher)"
                />
                <span class="text-[11px] text-gray-500 mt-1">ลบ</span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="text-gray-500 italic mb-4"
        >
          ไม่มีอาจารย์ในระบบ
        </div>

        <!-- เพิ่มอาจารย์ -->
        <div class="mt-2 border-t pt-4 flex items-center gap-3">
          <UInput
            v-model="name"
            placeholder="ชื่ออาจารย์"
            class="flex-1"
          />
          <UButton
            label="เพิ่ม"
            color="primary"
            @click="addTeacher"
          />
        </div>
      </div>
    </div>

    <!-- delete teacher confirm MODAL -->
    <UModal
      v-model:open="deleteTeacherModalOpen"
      title="ยืนยันการลบ"
    >
      <template #body>
        <div class="py-3">
          <p class="mb-2">
            คุณแน่ใจว่าจะลบอาจารย์คนนี้หรือไม่?
          </p>
          <p class="text-sm text-gray-600">
            <strong>ชื่อ:</strong> {{ selectedTeacherForDelete?.name }}
          </p>
        </div>
      </template>
      <template #footer>
        <UButton
          label="ยกเลิก"
          color="warning"
          @click="deleteTeacherModalOpen = false"
        />
        <UButton
          label="ลบ"
          color="error"
          @click="delTeacher(selectedTeacherForDelete?.id_teacher)"
        />
      </template>
    </UModal>

    <!-- edit name teacher MODAL -->
    <UModal
      v-model:open="editModalopen"
      title="แก้ไขชื่ออาจารย์"
    >
      <template #body>
        <h2 class="mb-2">
          ชื่อเก่า: {{ seletedTeacher?.name }}
        </h2>
        <UInput
          v-model="newName"
          placeholder="ชื่อใหม่"
        />
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

    <!-- เพิ่มเทอม -->
    <div class="w-4/6 border-2 border-green-600 p-4 mx-auto mt-10 shadow-lg rounded-2xl">
      <h1 class="text-2xl font-bold mb-1">
        2. เพิ่มเทอม
      </h1>
      <p>แสดงเทอม</p>
      <div class="border p-2 shadow-2xl flex flex-col gap-2 mb-3 w-full h-64 overflow-y-auto">
        <!-- box แสดงเทอมการศึกษา -->
        <div
          v-if="terms.length === 0"
          class="text-gray-400"
        >
          ไม่มีเทอมการศึกษาในระบบ
        </div>
        <div
          v-for="term in terms"
          :key="term.id_term"
          class="flex flex-row bg-neutral-500 justify-between p-2 border-b"
        >
          <!-- รายละเอียดเทอมการศึกษา: -->
          <div>
            <div class="text-white font-bold">
              {{ term.term }} / {{ term.academic_year }}
            </div>
            <div class="text-gray-200 text-sm">
              เริ่ม: {{ term.start_date }} - สิ้นสุด: {{ term.end_date }}
            </div>
          </div>

          <UButton
            label="ลบ"
            icon="i-lucide-trash"
            color="error"
            @click="confirmDeleteTermFunc(term)"
          />
        </div>
      </div>
      <!-- ฟอร์มเพิ่มเทอมการศึกษา -->
      <FormTerm @added-term="onAddedTerm" />
    </div>

    <!-- modal ลบเทอมการศึกษา -->
    <UModal
      v-model:open="confirmDeleteTerm"
      title="ยืนยันการลบ"
    >
      <template #body>
        <div class="py-3">
          <p class="mb-2">
            คุณแน่ใจว่าจะลบเทอมนี้หรือไม่?
          </p>
          <p class="text-sm text-gray-600">
            <strong>เทอม:</strong> {{ selectedTermForDelete?.term }} / {{ selectedTermForDelete?.academic_year }}
          </p>
        </div>
      </template>
      <template #footer>
        <UButton
          label="ยกเลิก"
          color="warning"
          @click="confirmDeleteTerm = false"
        />
        <UButton
          label="ลบ"
          color="error"
          @click="deleteTerm(selectedTermForDelete?.id_term)"
        />
      </template>
    </UModal>

    <!-- ปฏิทินการสอน -->
    <div class="w-5/6 mx-auto mt-10 mb-10">
      <AppCalendar :teachers="teachers || []" />
    </div>
  </div>
</template>

<script setup>
const { data } = await useFetch('/api/terms', {
  default: () => []
})
const terms = ref(data.value)
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
const deleteTeacherModalOpen = ref(false)
const selectedTeacherForDelete = ref(null)

const confirmDeleteTeacher = (teacher) => {
  selectedTeacherForDelete.value = teacher
  deleteTeacherModalOpen.value = true
}

const delTeacher = async (id) => {
  try {
    await $fetch(`/api/teachers/${id}`, {
      method: 'DELETE'
    })

    // อัปเดตข้อมูลในหน้าโดยไม่ต้อง reload
    teachers.value = teachers.value.filter(teacher => teacher.id_teacher !== id)
    deleteTeacherModalOpen.value = false
    selectedTeacherForDelete.value = null
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

// ฟังก์ชันเมื่อเพิ่มเทอมสำเร็จ
const onAddedTerm = (newTerm) => {
  if (!terms.value) terms.value = []
  terms.value.push(newTerm)
}

// ลบเทอม
const confirmDeleteTerm = ref(false)
const selectedTermForDelete = ref(null)

const confirmDeleteTermFunc = (term) => {
  selectedTermForDelete.value = term
  confirmDeleteTerm.value = true
}

const deleteTerm = async (id) => {
  await $fetch(`/api/terms/${id}`, {
    method: 'DELETE'
  })
  // อัปเดตข้อมูลในหน้าโดยไม่ต้อง reload
  terms.value = terms.value.filter(term => term.id_term !== id)
  confirmDeleteTerm.value = false
  selectedTermForDelete.value = null
}
</script>
