<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-gray-900">จัดการเทอมการศึกษา</h1>
        </div>
      </template>

      <div class="border border-gray-200 rounded-xl p-3 shadow-inner bg-gray-50 mb-6 h-96 overflow-y-auto custom-scrollbar">
        <div
          v-if="!terms || terms.length === 0"
          class="text-gray-400 text-center py-20 flex flex-col items-center"
        >
          <UIcon name="i-lucide-calendar-off" class="text-5xl mb-4 opacity-20" />
          <p class="text-lg">ไม่มีเทอมการศึกษาในระบบ</p>
        </div>
        
        <div
          v-for="term in terms"
          :key="term.id_term"
          class="flex flex-row justify-between items-center p-4 rounded-xl bg-white border border-gray-200 mb-3 shadow-sm hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 bg-primary-50 text-primary-600 rounded-xl">
              <UIcon name="i-lucide-calendar" class="text-2xl" />
            </div>
            <div>
              <div class="text-gray-900 font-bold text-lg">
                เทอม {{ term.term }} / {{ term.academic_year }}
              </div>
              <div class="text-gray-500 text-sm flex items-center gap-1">
                <UIcon name="i-lucide-clock" class="text-xs" />
                {{ formatDate(term.start_date) }} - {{ formatDate(term.end_date) }}
              </div>
            </div>
          </div>

          <UButton
            icon="i-lucide-trash"
            color="error"
            variant="ghost"
            size="md"
            label="ลบ"
            :disabled="deletingTermId === term.id_term"
            :loading="deletingTermId === term.id_term"
            @click="confirmDeleteTermFunc(term)"
          />
        </div>
      </div>

      <!-- ฟอร์มเพิ่มเทอมการศึกษา -->
      <div class="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-plus-circle" class="text-primary-500" />
          เพิ่มเทอมการศึกษาใหม่
        </h3>
        <FormTerm @added-term="onAddedTerm" />
      </div>
    </UCard>

    <!-- Modal ยืนยันการลบ -->
    <UModal v-model:open="confirmDeleteTerm" title="ยืนยันการลบเทอม">
      <template #body>
        <div class="py-2">
          <p class="mb-4 text-gray-600 font-medium">คุณแน่ใจหรือไม่ที่จะลบเทอมนี้?</p>
          <div class="p-4 bg-red-50 rounded-xl border border-red-100 mb-4 font-bold text-center text-red-800 text-xl shadow-inner">
            เทอม {{ selectedTermForDelete?.term }} / {{ selectedTermForDelete?.academic_year }}
          </div>
          <p class="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
            <UIcon name="i-lucide-alert-triangle" class="mt-0.5 flex-shrink-0" />
            <span>คำเตือน: การลบเทอมจะทำให้ข้อมูลตารางสอนและรายละเอียดคาบเรียนทั้งหมดที่เกี่ยวข้องกับเทอมนี้ถูกลบออกถาวร</span>
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            label="ยกเลิก"
            color="gray"
            variant="soft"
            @click="confirmDeleteTerm = false"
          />
          <UButton
            label="ยืนยันการลบเทอม"
            color="error"
            :loading="deletingTermId === selectedTermForDelete?.id_term"
            @click="deleteTerm(selectedTermForDelete?.id_term)"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const { data } = await useFetch('/api/terms', {
  default: () => []
})
const terms = ref(data.value)
const deletingTermId = ref(null)

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
  deletingTermId.value = id

  try {
    await $fetch(`/api/terms/${id}`, {
      method: 'DELETE'
    })

    terms.value = terms.value.filter(term => term.id_term !== id)
    confirmDeleteTerm.value = false
    selectedTermForDelete.value = null
  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาดในการลบเทอม')
  } finally {
    deletingTermId.value = null
  }
}

// ฟอร์แมตวันที่
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
