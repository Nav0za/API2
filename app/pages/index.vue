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
            class="border-2 border-green-600 p-4 mb-2 rounded-lg"
          >
            {{ user.username }}
          </div>
        </div>
      </div>
    </div>
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
const { data: users, pending, refresh, execute } = await useFetch('/api/users')

const username = ref('')
const addUser = async (username) => {
  const newUser = await $fetch('/api/users', {
    method: 'POST',
    body: { username: username }
  })
  username.value = ''
  users.value.push(newUser)
  await refresh() // alternative to push
}
</script>
