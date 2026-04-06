<template>
  <div class="min-h-screen bg-white text-slate-900 pb-20">
    <!-- Navbar -->
    <nav class="bg-white border-b border-slate-200 p-4 sticky top-0 z-50 shadow-lg">
      <div class="container mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <UButton
            icon="i-lucide-arrow-left"
            color="gray"
            variant="ghost"
            to="/"
          />
          <h2 class="text-xl font-bold text-blue-600">
            จัดการกลุ่มเรียน (Sections)
          </h2>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
      <!-- Header & Add Button -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
            รายชื่อกลุ่มเรียน
          </h1>
          <p class="text-slate-600 mt-1">
            จัดการข้อมูลกลุ่มนักศึกษาและตารางเรียนในแต่ละเทอม
          </p>
        </div>
        <div class="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <USelect
            v-if="termOptions.length > 0"
            v-model="selectedTerm"
            :items="filterTermOptions"
            placeholder="เลือกเทอม"
            class="w-48 cursor-pointer"
            variant="subtle"
            icon="i-heroicons-funnel"
            size="xl"
          />
          <UButton
            icon="i-heroicons-plus-circle"
            label="เพิ่มกลุ่มเรียน"
            color="primary"
            size="xl"
            class="px-6 rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer"
            @click="openAddModal = true"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="pending"
        class="flex flex-col items-center justify-center py-20"
      >
        <UIcon
          name="i-lucide-loader"
          class="animate-spin text-4xl text-blue-500"
        />
        <p class="mt-4 text-slate-400 font-medium">
          กำลังโหลดข้อมูล...
        </p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!sections || sections.length === 0"
        class="text-center py-32 bg-slate-100 rounded-[40px] relative overflow-hidden"
      >
        <div
          class="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200"
        >
          <UIcon
            name="i-heroicons-user-group"
            class="w-12 h-12 text-slate-500"
          />
        </div>
        <h3 class="text-2xl font-bold text-slate-600 mb-2">
          ยังไม่มีกลุ่มเรียน
        </h3>
        <p class="text-slate-500 mb-8">
          เริ่มสร้างกลุ่มเรียนแรกเพื่อจัดการตารางสอนได้เลย
        </p>
        <UButton
          label="สร้างกลุ่มเรียนแรก"
          icon="i-heroicons-plus-circle"
          variant="solid"
          color="primary"
          size="xl"
          class="rounded-full px-10 font-bold shadow-none"
          @click="openAddModal = true"
        />
      </div>

      <!-- Section List -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="section in sections"
          :key="section.id_section"
          class="group bg-white rounded-2xl border border-slate-200 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden"
        >
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1 min-w-0">
                <h3 class="text-xl font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {{ section.section_name }}
                </h3>

              </div>
              <UDropdownMenu :items="getActionItems(section)">
                <UButton
                  icon="i-heroicons-ellipsis-vertical"
                  color="gray"
                  variant="ghost"
                  class="rounded-full hover:bg-slate-100"
                />
              </UDropdownMenu>
            </div>

            <p class="text-sm text-slate-600 line-clamp-2 h-10 mb-6">
              {{ section.description || 'ไม่มีรายละเอียดเพิ่มเติม' }}
            </p>

            <div class="flex gap-3 mt-auto">
              <UButton
                v-if="terms && terms.length > 0"
                block
                label="จัดการตารางเรียน"
                icon="i-heroicons-calendar"
                color="primary"
                variant="solid"
                size="xl"
                class="rounded-xl flex-1 font-bold"
                :to="`/sections/${section.id_section}?term=${selectedTerm || (termOptions.length > 0 ? termOptions[0].value : '')}`"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals (Add, Edit, Delete) - Let's keep the logic mostly but fix UI -->
    <!-- Add Section Modal -->
    <UModal
      v-model:open="openAddModal"
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
                  name="i-heroicons-plus-circle"
                  class="text-2xl text-blue-600"
                />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-slate-900">
                  เพิ่มกลุ่มเรียน
                </h3>
                <p class="text-slate-500 text-sm">
                  สร้างกลุ่มนักศึกษาใหม่สำหรับจัดการตารางเรียน
                </p>
              </div>
            </div>

            <form
              class="space-y-6"
              @submit.prevent="handleAddSection"
            >
              <UFormField
                class="text-lg"
                label="ชื่อกลุ่มเรียน (Section Name) *"
                help="เช่น TC2R1, SE66 เป็นต้น"
                :ui="{ label: 'text-slate-900 font-bold mb-2' }"
              >
                <UInput
                  v-model="newSection.name"
                  placeholder="กรอกชื่อกลุ่มเรียน..."
                  size="xl"
                  class="rounded-xl"
                  autofocus
                  :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl' }"
                />
              </UFormField>



              <UFormField
                class="text-lg"
                label="รายละเอียดเพิ่มเติม"
                :ui="{ label: 'text-slate-900 font-bold mb-2' }"
              >
                <UTextarea
                  v-model="newSection.description"
                  placeholder="รายละเอียดกลุ่มเรียน (ถ้ามี)..."
                  size="xl"
                  class="rounded-xl"
                  :rows="3"
                  :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl' }"
                />
              </UFormField>
            </form>
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
                @click="openAddModal = false"
              />
              <UButton
                label="บันทึกข้อมูล"
                color="primary"
                size="xl"
                block
                class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold cursor-pointer"
                :loading="adding"
                @click="handleAddSection"
              />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Edit Section Modal -->
    <UModal
      v-model:open="openEditModal"
      :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }"
    >
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div class="flex items-center gap-4 mb-8">
              <div
                class="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20"
              >
                <UIcon
                  name="i-heroicons-pencil-square"
                  class="text-2xl text-amber-600"
                />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-slate-900">
                  แก้ไขข้อมูลกลุ่มเรียน
                </h3>
                <p class="text-slate-500 text-sm">
                  การเปลี่ยนชื่อกลุ่มจะไม่ส่งผลต่อตารางเรียนเดิม
                </p>
              </div>
            </div>

            <form
              class="space-y-6"
              @submit.prevent="handleEditSection"
            >
              <UFormField
                label="ชื่อกลุ่มเรียน *"
                help="ระบุชื่อที่ต้องการแก้ไข"
                :ui="{ label: 'text-slate-900 font-bold mb-2' }"
              >
                <UInput
                  v-model="editingSection.name"
                  placeholder="ชื่อกลุ่มเรียน..."
                  size="xl"
                  class="rounded-xl"
                  autofocus
                  :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl' }"
                />
              </UFormField>

              <UFormField
                label="เทอมปัจจุบัน"
                :ui="{ label: 'text-slate-900 font-bold mb-2' }"
              >
                <UInput
                  :model-value="`เทอม ${editingSection.term}`"
                  disabled
                  size="xl"
                  class="rounded-xl opacity-70"
                  :ui="{ base: 'bg-slate-50 border-slate-200 text-slate-500 rounded-2xl' }"
                />
                <p class="text-xs text-slate-500 mt-2">
                  หมายเหตุ: ไม่สามารถเปลี่ยนเทอมได้หลังจากสร้างแล้วค่ะ
                </p>
              </UFormField>

              <UFormField
                label="รายละเอียด"
                :ui="{ label: 'text-slate-900 font-bold mb-2' }"
              >
                <UTextarea
                  v-model="editingSection.description"
                  placeholder="รายละเอียด..."
                  size="xl"
                  class="rounded-xl"
                  :rows="3"
                  :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl' }"
                />
              </UFormField>
            </form>
          </div>
          <div class="p-6 border-t border-slate-200 bg-white/95 backdrop-blur-sm sticky bottom-0 z-10">
            <div class="flex gap-3">
              <UButton
                label="ยกเลิก"
                color="neutral"
                variant="soft"
                size="xl"
                block
                class="rounded-2xl py-4 flex-1 font-bold"
                @click="openEditModal = false"
              />
              <UButton
                label="บันทึกการแก้ไข"
                color="primary"
                size="xl"
                block
                class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold"
                :loading="editing"
                @click="handleEditSection"
              />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal
      v-model:open="openDeleteModal"
      :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }"
    >
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div
              class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20"
            >
              <UIcon
                name="i-heroicons-trash"
                class="text-4xl text-red-500"
              />
            </div>

            <h3 class="text-2xl font-bold text-slate-900 text-center mb-2">
              ยืนยันการลบกลุ่มเรียน
            </h3>
            <p class="text-slate-500 text-center mb-8">
              คุณแน่ใจหรือไม่ที่จะลบกลุ่มเรียน <span
                class="text-slate-900 font-bold"
              >{{ deletingSection?.section_name }}</span>?
              การดำเนินการนี้ไม่สามารถย้อนคืนได้
            </p>

            <div class="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl mb-2">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                  <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="text-xl text-red-500"
                  />
                </div>
                <div>
                  <p class="text-red-500 font-bold text-sm">
                    คำเตือนสำคัญ!
                  </p>
                  <p class="text-red-400/80 text-xs mt-1 leading-relaxed">
                    การลบกลุ่มเรียนจะทำให้ข้อมูลตารางเรียนทั้งหมดของกลุ่มนี้ถูกลบอย่างถาวร
                    หากมีคลาสชดเชยที่เกี่ยวข้องอาจส่งผลกระทบต่อการแสดงผลได้
                  </p>
                </div>
              </div>
            </div>
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
                @click="openDeleteModal = false"
              />
              <UButton
                label="ยืนยันการลบถาวร"
                color="error"
                size="xl"
                block
                class="rounded-2xl py-4 flex-1 shadow-lg shadow-red-500/20 font-bold"
                :loading="deleting"
                @click="handleDeleteSection"
              />
            </div>
          </div>
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
const { data: sections, pending, refresh } = await useFetch('/api/sections')

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
const getActionItems = section => {
  const items = []
  if (terms.value && terms.value.length > 0) {
    items.push([{
      label: 'จัดการตารางเรียน',
      icon: 'i-heroicons-calendar',
      onSelect: () => navigateTo(`/sections/${section.id_section}?term=${selectedTerm.value || (termOptions.value.length > 0 ? termOptions.value[0].value : '')}`)
    }])
  }
  items.push([{
    label: 'แก้ไข',
    icon: 'i-heroicons-pencil-square',
    onSelect: () => openEditSectionModal(section)
  }, {
    label: 'ลบ',
    icon: 'i-heroicons-trash',
    onSelect: () => confirmDeleteSection(section)
  }])
  return items
}

// Handlers
const handleAddSection = async () => {
  if (!newSection.value.name) {
    toast.add({ title: 'กรุณากรอกชื่อกลุ่มเรียน', color: 'red' })
    return
  }

  adding.value = true
  try {
    await $fetch('/api/sections', {
      method: 'POST',
      body: {
        section_name: newSection.value.name,
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
