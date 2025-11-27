<template>
  <div>
    <!-- show User -->
    <div class="w-2/3 border-2 border-amber-600 p-4 mx-auto mt-10 shadow-lg rounded-2xl">
      <h1 class="text-2xl font-bold mb-5">
        รายชื่ออาจารย์
      </h1>
      <div class="flex flex-col">
        <div v-if="pending">
          Loading...
        </div>
        <div v-else>
          <div
            v-for="teacher in teachers"
            :key="teacher.id_teacher"
            class="border-2 border-green-600 p-4 mb-2 rounded-lg flex justify-between items-center"
          >
            {{teacher.name }}
            <div class="flex gap-3">
              <UButton icon="i-lucide-edit" color="warning" @click="openEditModal(teacher)" />
              <UButton icon="i-lucide-trash" color="error" @click="delTeacher(teacher.id_teacher)" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- edit user -->
    <UModal
      title="แก้ไขชื่ออาจารย์"
      v-model:open="editModalopen"
    >
      <template #body>
        <h2>ชื่อเก่า: {{ seletedTeacher?.name }}</h2>
        <UInput placeholder="ชื่อใหม่" v-model="newName" />
      </template>
      <template #footer>
        <UButton label="บันทีก" color="primary" @click="updateTeacher(seletedTeacher?.id_teacher)" />
        <UButton label="ยกเลิก" color="error" @click="editModalopen = false" />
      </template>
    </UModal>
    <!-- add user -->
    <div class="w-2/3 border-2 border-blue-600 p-4 mx-auto mt-10 shadow-lg rounded-2xl">
      <h1 class="text-2xl font-bold mb-1">
        เพิ่มอาจารย์
      </h1>
      <p v-if="error" class="text-red-600 mb-2">{{ error }}</p>
      <UInput v-model="name" />
      <UButton
        label="เพิ่ม"
        @click="addTeacher"
      />
    </div>

  </div>
</template>

<script setup>
const { data: teachers, pending } = await useFetch('/api/teachers')

const name = ref('')
const addTeacher = async () => {
  if (!name.value) return // ตรวจสอบว่าช่องกรอกไม่ว่างเปล่า
  
  try {
    const newTeacher = await $fetch('/api/teachers', {
      method: 'POST',
      body: { name: name.value } // ส่งข้อมูลชื่อครูไปยัง API
    })
    
    // เคลียร์ช่องกรอก
    name.value = ''
    
    // อัปเดตข้อมูลในหน้าโดยไม่ต้อง reload
    teachers.value.push(newTeacher)
    
    // ถ้าอยากแน่ใจว่าข้อมูลตรงกับฐานจริง (optional)
    // await refresh()
  } catch (err) {
    console.error(err)
  }
}
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
const editModalopen = ref(false)
const seletedTeacher = ref(null)
const newName = ref('')
const updateTeacher = async (id) => {
  if (!newName.value.trim()) return
  
  try {
    await $fetch(`/api/teachers/${id}`, {
      method: 'PUT',
      body: { name: newName.value }
    })

    const teacher = teachers.value.find(t => t.id_teacher === id) // หาอาจารย์ที่ถูกแก้ไข
    if (teacher) teacher.name = newName.value // ถ้ามี ให้แก้ไขชื่อในรายการ

    newName.value = ''
    editModalopen.value = false
  } catch (err) {
    console.error('Update failed:', err)
  }
}
// เปิด modal แก้ไข
const openEditModal = (user) => {
  seletedTeacher.value = user
  newName.value = user.name
  editModalopen.value = true
}

</script>
