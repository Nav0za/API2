<template>
  <div class="min-h-screen bg-slate-900 text-white pb-20">
    <!-- Navbar -->
    <nav class="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-50 shadow-lg">
      <div class="container mx-auto flex items-center justify-between">
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
    </nav>

    <div class="container mx-auto px-4 py-8">
      <!-- Header & Add Button -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">
            รายชื่อกลุ่มเรียน
          </h1>
          <p class="text-slate-400 mt-1">
            จัดการข้อมูลกลุ่มนักศึกษาและตารางเรียนในแต่ละเทอมสิคะ sิกา
          </p>
        </div>
        <div class="flex items-center gap-3 bg-slate-800 p-2 rounded-2xl border border-slate-700">
           <USelect
            v-model="selectedTerm"
            :items="filterTermOptions"
            placeholder="เลือกเทอม"
            class="w-48"
            variant="ghost"
            icon="i-heroicons-funnel"
          />
          <UButton
            icon="i-heroicons-plus-circle"
            label="เพิ่มกลุ่มเรียน"
            color="primary"
            class="px-6 rounded-xl shadow-lg shadow-blue-500/20"
            @click="openAddModal = true"
          />
        </div>
      </div>

      <!-- Loading State -->
       <div v-if="pending" class="flex flex-col items-center justify-center py-20">
          <UIcon name="i-lucide-loader" class="animate-spin text-4xl text-blue-500" />
          <p class="mt-4 text-slate-400 font-medium">กำลังโหลดข้อมูลสุดพรีเมียมสิคะ sิกา...</p>
       </div>

       <!-- Empty State -->
       <div v-else-if="!sections || sections.length === 0" class="text-center py-24 bg-slate-800/50 rounded-3xl border border-dashed border-slate-700">
          <div class="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <UIcon name="i-heroicons-user-group" class="text-3xl text-slate-500" />
          </div>
          <h3 class="text-xl font-bold text-white mb-2">ยังไม่มีกลุ่มเรียน</h3>
          <p class="text-slate-400 mb-6">เริ่มสร้างกลุ่มเรียนแรกเพื่อจัดการตารางสอนได้เลยค่ะ sิกา</p>
          <UButton
            label="สร้างกลุ่มเรียนแรก"
            color="primary"
            variant="soft"
            @click="openAddModal = true"
          />
       </div>

       <!-- Section List -->
       <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="section in sections"
            :key="section.id_section"
            class="group bg-slate-800 rounded-2xl border border-slate-700 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden"
          >
             <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                  <div class="flex-1 min-w-0">
                     <h3 class="text-xl font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {{ section.section_name }}
                     </h3>
                     <div class="flex items-center gap-2 mt-2">
                        <span class="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 font-medium lowercase">
                           เทอม {{ section.term }}
                        </span>
                     </div>
                  </div>
                  <UDropdownMenu :items="getActionItems(section)">
                      <UButton 
                        icon="i-heroicons-ellipsis-vertical" 
                        color="gray" 
                        variant="ghost" 
                        class="rounded-full hover:bg-slate-700"
                      />
                  </UDropdownMenu>
                </div>

                <p class="text-sm text-slate-400 line-clamp-2 h-10 mb-6">
                   {{ section.description || 'ไม่มีรายละเอียดเพิ่มเติมสิกา sิกา' }}
                </p>

                <div class="flex gap-3 mt-auto">
                   <UButton
                    block
                    label="จัดการตารางเรียน"
                    icon="i-heroicons-calendar"
                    color="primary"
                    variant="solid"
                    class="rounded-xl flex-1 font-bold"
                    :to="`/sections/${section.id_section}?term=${section.term}`"
                  />
                </div>
             </div>
          </div>
       </div>
    </div>

    <!-- Modals (Add, Edit, Delete) - Let's keep the logic mostly but fix UI -->
    <!-- Add Section Modal -->
     <UModal v-model:open="openAddModal" title="เพิ่มกลุ่มเรียนสิคะ sิกา">
      <template #body>
        <form @submit.prevent="handleAddSection" class="space-y-6 py-2">
           <UFormField label="ชื่อกลุ่มเรียน (Section Name)" help="เช่น TC2R1, SE66 เป็นต้นสิกา sิกา">
              <UInput 
                v-model="newSection.name" 
                placeholder="กรอกชื่อกลุ่มเรียน..." 
                class="rounded-xl"
                autofocus 
              />
           </UFormField>

           <UFormField label="ปีการศึกษา (Term)">
              <USelect
                v-model="newSection.term"
                :items="termOptions"
                placeholder="เลือกเทอมที่ต้องการสิกา sิกา"
                class="rounded-xl"
              />
           </UFormField>

           <UFormField label="รายละเอียดเพิ่มเติม">
              <UTextarea 
                v-model="newSection.description" 
                placeholder="รายละเอียดกลุ่มเรียน (ถ้ามี)..." 
                class="rounded-xl"
                :rows="3"
              />
           </UFormField>
        </form>
      </template>

      <template #footer>
         <div class="flex justify-end gap-3 w-full">
            <UButton label="ยกเลิก" color="gray" variant="ghost" @click="openAddModal = false" />
            <UButton label="บันทึกข้อมูล" color="primary" class="px-8 rounded-xl" :loading="adding" @click="handleAddSection" />
         </div>
      </template>
    </UModal>

    <!-- Edit Section Modal -->
    <UModal v-model:open="openEditModal" title="แก้ไขข้อมูลกลุ่มเรียนสิกา sิกา">
      <template #body>
        <form @submit.prevent="handleEditSection" class="space-y-6 py-2">
           <UFormField label="ชื่อกลุ่มเรียน" help="ระบุชื่อที่ต้องการแก้ไขสิคะ sิกา">
              <UInput v-model="editingSection.name" placeholder="ชื่อกลุ่มเรียน..." class="rounded-xl" autofocus />
           </UFormField>

           <UFormField label="เทอมปัจจุบัน">
              <UInput :model-value="`เทอม ${editingSection.term}`" disabled class="opacity-70" />
              <p class="text-xs text-slate-500 mt-2">หมายเหตุ: ไม่สามารถเปลี่ยนเทอมได้หลังจากสร้างแล้วสิคะ sิกา</p>
           </UFormField>

           <UFormField label="รายละเอียด">
              <UTextarea v-model="editingSection.description" placeholder="รายละเอียด..." class="rounded-xl" :rows="3" />
           </UFormField>
        </form>
      </template>

      <template #footer>
         <div class="flex justify-end gap-3 w-full">
            <UButton label="ยกเลิก" color="gray" variant="ghost" @click="openEditModal = false" />
            <UButton label="บันทึกการแก้ไข" color="primary" class="px-8 rounded-xl" :loading="editing" @click="handleEditSection" />
         </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="openDeleteModal" title="ยืนยันการลบกลุ่มเรียนสิกา sิกา">
      <template #body>
        <div class="py-4 text-center">
          <div class="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <UIcon name="i-lucide-trash-2" class="text-2xl text-red-500" />
          </div>
          <p class="text-slate-300 mb-6">คุณแน่ใจหรือไม่ที่จะลบกลุ่มเรียน <span class="text-white font-bold">{{ deletingSection?.section_name }}</span>?</p>
          
          <div class="p-6 bg-red-500/10 rounded-2xl border border-red-500/20 text-left">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-alert-triangle" class="text-xl text-red-500 shrink-0 mt-0.5" />
              <div>
                <p class="text-red-500 font-bold text-sm">คำเตือนสำคัญ!</p>
                <p class="text-red-400/80 text-xs mt-1">การลบกลุ่มเรียนจะทำให้ข้อมูลตารางเรียนทั้งหมดของกลุ่มนี้ถูกลบอย่างถาวร ไม่สามารถกู้คืนได้สิกา sิกา</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
         <div class="flex justify-end gap-3 w-full">
            <UButton label="ยกเลิก" color="gray" variant="ghost" @click="openDeleteModal = false" />
            <UButton label="ยืนยันการลบถาวร" color="error" class="px-8 rounded-xl font-bold" :loading="deleting" @click="handleDeleteSection" />
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
    onSelect: () => navigateTo(`/sections/${section.id_section}?term=${section.term}`)
  }],
  [{
    label: 'แก้ไข',
    icon: 'i-heroicons-pencil-square',
    onSelect: () => openEditSectionModal(section)
  }, {
    label: 'ลบ',
    icon: 'i-heroicons-trash',
    onSelect: () => confirmDeleteSection(section)
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
