<template>
  <div>
    <div class="w-2/3 border-2 border-amber-600 p-4 mx-auto mt-10 shadow-lg rounded-2xl">
      <h1 class="text-2xl font-bold mb-5">
        Show Users
      </h1>
      <div class="flex flex-col">
        <div v-if="pending">
          Loading...
        </div>
        <div v-else>
          <div
            v-for="user in users"
            :key="user.id"
            class="border-2 border-green-600 p-4 mb-2 rounded-lg flex justify-between items-center"
          >
            {{ user.username }}
            <div class="flex gap-3">
              <UButton icon="i-lucide-edit" color="warning" @click="openEditModal(user)" />
              <UButton icon="i-lucide-trash" color="error" @click="delUser(user.id)" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- edit user -->
    <UModal
      title="Edit Username"
      v-model:open="editModalopen"
    >
      <template #body>
        <h2>Old username: {{ seletedUser?.username }}</h2>
        <UInput placeholder="New username" v-model="newUsername" />
      </template>
      <template #footer>
        <UButton label="Save" color="primary" @click="updateUser(seletedUser?.id)" />
        <UButton label="Cancel" color="error" @click="editModalopen = false" />
      </template>
    </UModal>
    <!-- add user -->
    <div class="w-2/3 border-2 border-blue-600 p-4 mx-auto mt-10 shadow-lg rounded-2xl">
      <h1 class="text-2xl font-bold mb-1">
        Add User
      </h1>
      <p>noti</p>
      <UInput v-model="username" />
      <UButton
        label="Add"
        @click="addUser(username)"
      />
    </div>

  </div>
</template>

<script setup>
const { data: users, pending } = await useFetch('/api/users')

const username = ref('')
const addUser = async () => {
  if (!username.value) return
  
  try {
    const newUser = await $fetch('/api/users', {
      method: 'POST',
      body: { username: username.value }
    })
    
    // เคลียร์ช่องกรอก
    username.value = ''
    
    // อัปเดตข้อมูลในหน้าโดยไม่ต้อง reload
    users.value.push(newUser)
    
    // ถ้าอยากแน่ใจว่าข้อมูลตรงกับฐานจริง (optional)
    // await refresh()
  } catch (err) {
    console.error(err)
  }
}
const delUser = async (id) => {
  try {
    await $fetch(`/api/users/${id}`, {
      method: 'DELETE'
    })
    
    // อัปเดตข้อมูลในหน้าโดยไม่ต้อง reload
    users.value = users.value.filter(user => user.id !== id)
    
    // ถ้าอยากแน่ใจว่าข้อมูลตรงกับฐานจริง (optional)
    // await refresh()
  } catch (err) {
    console.error(err)
  }
}
const editModalopen = ref(false)
const seletedUser = ref(null)
const newUsername = ref('')
const updateUser = async (id) => {
  if (!newUsername.value.trim()) return
  
  try {
    await $fetch(`/api/users/${id}`, {
      method: 'PUT',
      body: { username: newUsername.value }
    })

    const user = users.value.find(u => u.id === id)
    if (user) user.username = newUsername.value

    newUsername.value = ''
    editModalopen.value = false
  } catch (err) {
    console.error('Update failed:', err)
  }
}
const openEditModal = (user) => {
  seletedUser.value = user
  newUsername.value = user.username
  editModalopen.value = true
}

</script>
