<template>
  <div class="min-h-screen bg-linear-to-br from-slate-800 to-slate-900 text-white">
    <!-- Navbar -->
    <nav class="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <UButton
              icon="i-lucide-arrow-left"
              color="gray"
              variant="ghost"
              to="/"
            />
            <h2 class="text-xl font-bold text-blue-400">
              จัดการกลุ่มเรียน (Sections)
            </h2>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
      <!-- Header & Add Button -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold mb-2">
            รายชื่อกลุ่มเรียน
          </h1>
          <p class="text-slate-400">
            จัดการข้อมูลกลุ่มนักศึกษาและตารางเรียน
          </p>
        </div>
        <div class="flex items-center gap-3">
           <USelect
            v-model="selectedTerm"
            :items="filterTermOptions"
            placeholder="เลือกเทอม"
            class="w-48"
            icon="i-heroicons-funnel"
          />
          <UButton
            icon="i-heroicons-plus-circle"
            label="เพิ่มกลุ่มเรียน"
            color="primary"
            size="lg"
            @click="openAddModal = true"
          />
        </div>
      </div>

      <!-- Section List -->
       <!-- Filters (Optional, can be added later) -->

       <!-- Section List -->
       <div v-if="pending" class="text-center py-10">
          <UIcon name="i-lucide-loader" class="animate-spin text-2xl text-primary" />
          <p class="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
       </div>

       <div v-else-if="!sections || sections.length === 0" class="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <UIcon name="i-heroicons-user-group" class="text-4xl text-gray-300 mb-2" />
          <p class="text-gray-500">ยังไม่มีกลุ่มเรียน</p>
          <UButton
            label="สร้างกลุ่มเรียนแรก"
            variant="link"
            @click="openAddModal = true"
          />
       </div>

       <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard
            v-for="section in sections"
            :key="section.id_section"
            class="hover:ring-2 hover:ring-primary-200 transition-all cursor-pointer group"
          >
             <template #header>
                <div class="flex justify-between items-start">
                  <div>
                     <h3 class="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {{ section.section_name }}
                     </h3>
                     <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                        {{ section.term ? `Term ${section.term}` : 'No Term' }}
                     </span>
                  </div>
                  <UDropdownMenu :items="getActionItems(section)">
                      <UButton icon="i-heroicons-ellipsis-vertical" color="neutral" variant="ghost" />
                  </UDropdownMenu>
                </div>
             </template>

             <p class="text-sm text-gray-600 line-clamp-2 h-10">
                {{ section.description || 'ไม่มีรายละเอียด' }}
             </p>

             <template #footer>
                <UButton
                  block
                  label="จัดการตารางเรียน"
                  icon="i-heroicons-calendar"
                  color="primary"
                  variant="solid"
                  :to="`/sections/${section.id_section}?term=${section.term}`"
                />
             </template>
          </UCard>
       </div>
    </div>

    <!-- Add Section Modal -->
     <UModal v-model:open="openAddModal" title="เพิ่มกลุ่มเรียนใหม่">
      <template #body>
        <form @submit.prevent="handleAddSection" class="space-y-4">
           <UFormField label="ชื่อกลุ่มเรียน (Section Name)" required>
              <UInput v-model="newSection.name" placeholder="เช่น TC2R1, SE66" autofocus />
           </UFormField>

           <UFormField label="ปีการศึกษา (Term)" required>
              <USelect
                v-model="newSection.term"
                :items="termOptions"
                placeholder="เลือกเทอม"
              />
           </UFormField>

           <UFormField label="รายละเอียด (Optional)">
              <UTextarea v-model="newSection.description" placeholder="รายละเอียดเพิ่มเติม..." />
           </UFormField>
        </form>
      </template>

      <template #footer>
         <div class="flex justify-end gap-2">
            <UButton label="ยกเลิก" color="error" variant="ghost" @click="openAddModal = false" />
            <UButton label="บันทึก" color="primary" :loading="adding" @click="handleAddSection" />
         </div>
      </template>
    </UModal>

    <!-- Edit Section Modal -->
    <UModal v-model:open="openEditModal" title="แก้ไขข้อมูลกลุ่มเรียน">
      <template #body>
        <form @submit.prevent="handleEditSection" class="space-y-4">
           <UFormField label="ชื่อกลุ่มเรียน (Section Name)" required>
              <UInput v-model="editingSection.name" placeholder="เช่น TC2R1, SE66" autofocus />
           </UFormField>

           <UFormField label="ปีการศึกษา (Term)">
              <UInput :model-value="editingSection.term" disabled class="bg-gray-50" />
              <p class="text-xs text-gray-500 mt-1">ไม่สามารถแก้ไขเทอมได้</p>
           </UFormField>

           <UFormField label="รายละเอียด (Optional)">
              <UTextarea v-model="editingSection.description" placeholder="รายละเอียดเพิ่มเติม..." />
           </UFormField>
        </form>
      </template>

      <template #footer>
         <div class="flex justify-end gap-2">
            <UButton label="ยกเลิก" color="error" variant="ghost" @click="openEditModal = false" />
            <UButton label="บันทึกการแก้ไข" color="primary" :loading="editing" @click="handleEditSection" />
         </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="openDeleteModal" title="ยืนยันการลบกลุ่มเรียน">
      <template #body>
        <div class="py-4">
          <p class="mb-4 text-gray-600">คุณแน่ใจหรือไม่ที่จะลบกลุ่มเรียนนี้?</p>
          <div class="p-4 bg-red-50 rounded-xl border border-red-100 mb-4 text-center">
            <span class="block font-bold text-red-800 text-lg">{{ deletingSection?.section_name }}</span>
            <span class="text-sm text-red-600">เทอม {{ deletingSection?.term }}</span>
          </div>
          <UAlert
            icon="i-heroicons-exclamation-triangle"
            color="error"
            variant="soft"
            title="คำเตือนสำคัญ"
            description="การลบกลุ่มเรียนจะทำให้ข้อมูลตารางเรียนทั้งหมดของกลุ่มนี้ถูกลบถาวร"
          />
        </div>
      </template>

      <template #footer>
         <div class="flex justify-end gap-2">
            <UButton label="ยกเลิก" color="error" variant="ghost" @click="openDeleteModal = false" />
            <UButton label="ยืนยันการลบ" color="error" :loading="deleting" @click="handleDeleteSection" />
         </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const toast = useToast()

// Data fetching
const { data: terms } = await useFetch('/api/terms')

// State
const openAddModal = ref(false)
const openEditModal = ref(false) // New state for Edit Modal
const openDeleteModal = ref(false) // New state for Delete Modal
const adding = ref(false)
const editing = ref(false)
const deleting = ref(false)
const selectedTerm = ref('')

const newSection = ref({
  name: '',
  term: '',
  description: ''
})

const editingSection = ref({ // State for editing
  id: null,
  name: '',
  term: '',
  description: ''
})

const deletingSection = ref(null) // State for deleting

// Fetch sections based on selected term
const { data: sections, pending, refresh } = await useFetch('/api/sections', {
  query: computed(() => ({ term: selectedTerm.value })),
  watch: [selectedTerm]
})

// Options
const termOptions = computed(() => {
  if (!terms.value) return []
  return terms.value.map(t => ({
    label: `เทอม ${t.term}/${t.academic_year}`,
    value: `${t.term}/${t.academic_year}`
  }))
})

const filterTermOptions = computed(() => {
  return [
    { label: 'ทั้งหมด', value: null },
    ...termOptions.value
  ]
})

// Set default term and selected filter
watch(termOptions, (opts) => {
  if (opts.length > 0) {
     // Default for new section
    if (!newSection.value.term) {
       newSection.value.term = opts[0].value
    }
    // Default filter (first term)
    if (!selectedTerm.value) {
       selectedTerm.value = opts[0].value
    }
  }
}, { immediate: true })

// Actions for Dropdown
const getActionItems = (section) => [
  [{
    label: 'จัดการตารางเรียน',
    icon: 'i-heroicons-calendar',
    click: () => navigateTo(`/sections/${section.id_section}?term=${section.term}`)
  }],
  [{
    label: 'แก้ไข',
    icon: 'i-heroicons-pencil-square',
    click: () => openEditSectionModal(section)
  }, {
    label: 'ลบ',
    icon: 'i-heroicons-trash',
    click: () => confirmDeleteSection(section)
  }]
]

// Handlers
const handleAddSection = async () => {
  if (!newSection.value.name || !newSection.value.term) {
    toast.add({ title: 'กรุณากรอกข้อมูลให้ครบถ้วน', color: 'red' })
    return
  }

  adding.value = true
  try {
    await $fetch('/api/sections', {
      method: 'POST',
      body: {
        section_name: newSection.value.name,
        term: newSection.value.term,
        description: newSection.value.description
      }
    })

    toast.add({ title: 'เพิ่มกลุ่มเรียนสำเร็จ', color: 'green' })
    openAddModal.value = false
    newSection.value.name = ''
    newSection.value.description = ''
    refresh()
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: error.data?.statusMessage || error.message,
      color: 'red'
    })
  } finally {
    adding.value = false
  }
}

// Edit Section Handlers
const openEditSectionModal = (section) => {
  editingSection.value = {
    id: section.id_section,
    name: section.section_name,
    term: section.term,
    description: section.description
  }
  openEditModal.value = true
}

const handleEditSection = async () => {
  if (!editingSection.value.name) {
    toast.add({ title: 'กรุณากรอกชื่อกลุ่มเรียน', color: 'red' })
    return
  }

  editing.value = true
  try {
    await $fetch(`/api/sections/${editingSection.value.id}`, {
      method: 'PUT',
      body: {
        section_name: editingSection.value.name,
        description: editingSection.value.description
      }
    })

    toast.add({ title: 'แก้ไขข้อมูลสำเร็จ', color: 'green' })
    openEditModal.value = false
    refresh()
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: error.data?.statusMessage || error.message,
      color: 'red'
    })
  } finally {
    editing.value = false
  }
}

// Delete Section Handlers
const confirmDeleteSection = (section) => {
  deletingSection.value = section
  openDeleteModal.value = true
}

const handleDeleteSection = async () => {
  if (!deletingSection.value) return

  deleting.value = true
  try {
    await $fetch(`/api/sections/${deletingSection.value.id_section}`, {
      method: 'DELETE'
    })

    toast.add({ title: 'ลบกลุ่มเรียนสำเร็จ', color: 'green' })
    openDeleteModal.value = false
    deletingSection.value = null
    refresh()
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: error.data?.statusMessage || error.message,
      color: 'red'
    })
  } finally {
    deleting.value = false
  }
}
</script>
