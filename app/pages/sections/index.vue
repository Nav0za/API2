<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
    <div class="container mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          จัดการกลุ่มเรียน
        </h1>
        <p class="text-gray-600">
          เพิ่ม แก้ไข และจัดการกลุ่มเรียนนักศึกษา
        </p>
      </div>

      <!-- Filter และปุ่มเพิ่ม -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-center gap-4">
          <div class="flex-1">
            <label class="text-sm font-medium text-gray-700 mb-2 block">
              กรองตามเทอม
            </label>
            <USelect
              v-model="selectedTerm"
              :options="termOptions"
              placeholder="ทุกเทอม"
              class="w-64"
            />
          </div>

          <UButton
            label="เพิ่มกลุ่มเรียน"
            icon="i-lucide-plus"
            color="primary"
            size="lg"
            @click="openAddModal"
          />
        </div>
      </div>

      <!-- Loading -->
      <div
        v-if="pending"
        class="text-center py-20"
      >
        <div class="text-gray-500">
          กำลังโหลดข้อมูล...
        </div>
      </div>

      <!-- รายการกลุ่มเรียน -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-if="filteredSections.length === 0"
          class="col-span-full text-center py-20 bg-white rounded-lg shadow-md"
        >
          <p class="text-gray-500 text-lg">
            ไม่พบกลุ่มเรียนในระบบ
          </p>
          <UButton
            label="เพิ่มกลุ่มเรียนแรก"
            icon="i-lucide-plus"
            color="primary"
            class="mt-4"
            @click="openAddModal"
          />
        </div>

        <!-- Card กลุ่มเรียน -->
        <div
          v-for="section in filteredSections"
          :key="section.id_section"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-1">
                {{ section.section_name }}
              </h3>
              <p class="text-sm text-gray-500">
                เทอม {{ section.term }}
              </p>
            </div>
            <div class="flex gap-2">
              <UButton
                icon="i-lucide-edit"
                color="warning"
                size="sm"
                square
                @click="openEditModal(section)"
              />
              <UButton
                icon="i-lucide-trash"
                color="error"
                size="sm"
                square
                @click="confirmDelete(section)"
              />
            </div>
          </div>

          <p
            v-if="section.description"
            class="text-gray-600 text-sm mb-4"
          >
            {{ section.description }}
          </p>

          <UButton
            label="จัดการตารางเรียน"
            icon="i-lucide-calendar"
            color="primary"
            variant="outline"
            block
            :to="`/sections/${section.id_section}`"
          />
        </div>
      </div>
    </div>

    <!-- Modal เพิ่ม/แก้ไขกลุ่มเรียน -->
    <UModal
      v-model:open="modalOpen"
      :title="editingSection ? 'แก้ไขกลุ่มเรียน' : 'เพิ่มกลุ่มเรียน'"
    >
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">ชื่อกลุ่มเรียน</label>
            <UInput
              v-model="formData.section_name"
              placeholder="เช่น TC2R1, TC2R2"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">เทอม</label>
            <USelect
              v-model="formData.term"
              :options="termOptions"
              placeholder="เลือกเทอม"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">คำอธิบาย (ถ้ามี)</label>
            <UTextarea
              v-model="formData.description"
              placeholder="รายละเอียดเพิ่มเติม"
              :rows="3"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <UButton
          label="ยกเลิก"
          color="neutral"
          @click="modalOpen = false"
        />
        <UButton
          :label="editingSection ? 'บันทึก' : 'เพิ่ม'"
          color="primary"
          :loading="saving"
          @click="saveSection"
        />
      </template>
    </UModal>

    <!-- Modal ยืนยันการลบ -->
    <UModal
      v-model:open="deleteModalOpen"
      title="ยืนยันการลบ"
    >
      <template #body>
        <div class="py-3">
          <p class="mb-2">
            คุณแน่ใจว่าจะลบกลุ่มเรียนนี้หรือไม่?
          </p>
          <p class="text-sm text-gray-600 mb-3">
            <strong>กลุ่ม:</strong> {{ sectionToDelete?.section_name }}
          </p>
          <p class="text-sm text-red-600">
            ⚠️ การลบจะลบตารางเรียนของกลุ่มนี้ด้วย
          </p>
        </div>
      </template>
      <template #footer>
        <UButton
          label="ยกเลิก"
          color="neutral"
          @click="deleteModalOpen = false"
        />
        <UButton
          label="ลบ"
          color="error"
          :loading="deleting"
          @click="deleteSection"
        />
      </template>
    </UModal>
  </div>
</template>

<script setup>
const { data: sections, pending, refresh } = await useFetch('/api/sections')
const { data: terms } = await useFetch('/api/terms')

// Filter
const selectedTerm = ref(null)

const termOptions = computed(() => {
  if (!terms.value) return [{ label: 'ทุกเทอม', value: null }]
  return [
    { label: 'ทุกเทอม', value: null },
    ...terms.value.map(t => ({
      label: `เทอม ${t.term}/${t.academic_year}`,
      value: `${t.term}/${t.academic_year}`
    }))
  ]
})

const filteredSections = computed(() => {
  if (!sections.value) return []
  if (!selectedTerm.value) return sections.value
  return sections.value.filter(s => s.term === selectedTerm.value)
})

// Modal
const modalOpen = ref(false)
const editingSection = ref(null)
const saving = ref(false)

const formData = ref({
  section_name: '',
  term: null,
  description: ''
})

const openAddModal = () => {
  editingSection.value = null
  formData.value = {
    section_name: '',
    term: null,
    description: ''
  }
  modalOpen.value = true
}

const openEditModal = (section) => {
  editingSection.value = section
  formData.value = {
    section_name: section.section_name,
    term: section.term,
    description: section.description || ''
  }
  modalOpen.value = true
}

const toast = useToast()

const saveSection = async () => {
  if (!formData.value.section_name || !formData.value.term) {
    toast.add({
      title: 'ข้อมูลไม่ครบ',
      description: 'กรุณากรอกชื่อกลุ่มและเลือกเทอม',
      color: 'error'
    })
    return
  }

  saving.value = true

  try {
    if (editingSection.value) {
      // แก้ไข
      await $fetch(`/api/sections/${editingSection.value.id_section}`, {
        method: 'PUT',
        body: formData.value
      })
      toast.add({
        title: 'สำเร็จ',
        description: 'แก้ไขกลุ่มเรียนเรียบร้อยแล้ว',
        color: 'primary'
      })
    } else {
      // เพิ่มใหม่
      await $fetch('/api/sections', {
        method: 'POST',
        body: formData.value
      })
      toast.add({
        title: 'สำเร็จ',
        description: 'เพิ่มกลุ่มเรียนเรียบร้อยแล้ว',
        color: 'primary'
      })
    }

    await refresh()
    modalOpen.value = false
  } catch (error) {
    console.error(error)
    const message = error.statusCode === 409
      ? 'ชื่อกลุ่มนี้มีอยู่ในเทอมนี้แล้ว'
      : 'เกิดข้อผิดพลาด'
    toast.add({
      title: 'ผิดพลาด',
      description: message,
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

// Delete
const deleteModalOpen = ref(false)
const sectionToDelete = ref(null)
const deleting = ref(false)

const confirmDelete = (section) => {
  sectionToDelete.value = section
  deleteModalOpen.value = true
}

const deleteSection = async () => {
  if (!sectionToDelete.value) return

  deleting.value = true

  try {
    await $fetch(`/api/sections/${sectionToDelete.value.id_section}`, {
      method: 'DELETE'
    })

    toast.add({
      title: 'สำเร็จ',
      description: 'ลบกลุ่มเรียนเรียบร้อยแล้ว',
      color: 'primary'
    })

    await refresh()
    deleteModalOpen.value = false
    sectionToDelete.value = null
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถลบกลุ่มเรียนได้',
      color: 'error'
    })
  } finally {
    deleting.value = false
  }
}
</script>
