<template>
  <div class="min-h-screen bg-white text-slate-900 pb-20">
    <!-- Navbar (Sticky) -->
    <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-3 shadow-sm no-print">
      <div class="container mx-auto flex items-center">
        <UButton icon="i-lucide-arrow-left" label="ย้อนกลับ" color="gray" variant="ghost" size="lg" to="/" class="font-bold text-md cursor-pointer hover:bg-slate-100" />
      </div>
    </nav>
    
    <!-- Header (Not sticky) -->
    <div class="bg-white border-b border-slate-200 p-6 shadow-sm mb-8 no-print">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <UIcon
              name="i-heroicons-academic-cap"
              class="text-amber-600"
            />
            จัดการเทอมการศึกษา
          </h1>
          <p class="text-slate-600 mt-1">
            กำหนดช่วงเวลาภาคการศึกษาเพื่อใช้จัดตารางเรียน
          </p>
        </div>
        <!-- Quick Stats -->
        <div class="flex flex-wrap gap-4">
          <div class="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-200 backdrop-blur-sm">
            <p class="text-lg font-black uppercase tracking-widest text-slate-500 mb-1">
              จำนวนเทอมทั้งหมด
            </p>
            <p class="text-2xl font-black text-slate-900">
              {{ terms?.length || 0 }} <span
                class="text-lg font-normal text-slate-500"
              >รายการ</span>
            </p>
          </div>
          <div class="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-200 backdrop-blur-sm">
            <p class="text-lg font-black uppercase tracking-widest text-slate-500 mb-1">
              ปีการศึกษาล่าสุด
            </p>
            <p class="text-2xl font-black text-amber-600">
              {{ latestYear }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Side: Add Form -->
        <div class="lg:col-span-1">
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl sticky top-28">
            <h3 class="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <UIcon
                name="i-heroicons-plus-circle"
                class="text-blue-600"
              />
              เพิ่มเทอมใหม่
            </h3>
            <FormTerm @added-term="onAddedTerm" />
          </div>
        </div>

        <!-- Right Side: Term List -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold flex items-center gap-2 text-slate-900">
              <UIcon
                name="i-heroicons-list-bullet"
                class="text-slate-500"
              />
              รายการเทอมการศึกษา
            </h2>
            <div class="text-lg text-slate-500 italic">
              เรียงตามปีการศึกษาล่าสสุด
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-if="!terms || terms.length === 0"
              class="text-center py-32 bg-slate-100 rounded-[40px] relative overflow-hidden"
            >
              <div
                class="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200"
              >
                <UIcon
                  name="i-heroicons-calendar-days"
                  class="text-4xl text-slate-500"
                />
              </div>
              <p class="text-slate-600 font-medium">
                ยังไม่มีข้อมูลเทอมในระบบ
              </p>
              <p class="text-slate-500 text-sm mt-2">
                กรุณาเพิ่มข้อมูลที่ฟอร์มด้านซ้ายมือค่ะ
              </p>
            </div>

            <div
              v-for="term in sortedTerms"
              :key="term.id_term"
              class="relative overflow-hidden p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-500/50 transition-all duration-300 shadow-xl group hover:shadow-blue-500/5"
            >
              <!-- Background Decor -->
              <div
                class="absolute -right-8 -top-8 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700"
              >
                <UIcon
                  name="i-heroicons-academic-cap"
                  class="w-48 h-48 text-slate-900"
                />
              </div>

              <div class="flex flex-col sm:flex-row justify-between items-center relative z-10 gap-6">
                <div class="flex items-center gap-6 w-full">
                  <div
                    class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner border border-slate-200/50"
                  >
                    <span class="text-2xl font-black text-amber-600 group-hover:text-white">{{ term.term }}</span>
                  </div>
                  <div>
                    <div class="text-2xl font-black text-slate-900 flex items-center gap-2">
                      ปีการศึกษา {{ term.academic_year }}
                      <span
                        v-if="isCurrentTerm(term)"
                        class="text-[10px] bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full border border-green-500/30 whitespace-nowrap"
                      >ปัจจุบัน</span>
                    </div>
                    <div class="text-slate-600 text-md flex items-center gap-2 mt-2 font-medium">
                      <UIcon
                        name="i-heroicons-calendar-days"
                        class="text-slate-500"
                      />
                      {{ formatDate(term.start_date) }}
                      <UIcon
                        name="i-heroicons-arrow-right-circle"
                        class="text-slate-400"
                      /> {{
                        formatDate(term.end_date) }}
                    </div>
                  </div>
                </div>

                <div
                  class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 w-full sm:w-auto"
                >
                  <UButton
                    icon="i-lucide-edit"
                    color="primary"
                    variant="soft"
                    label="แก้ไข"
                    size="md"
                    class="rounded-xl flex-1 sm:flex-none border border-blue-500/20 cursor-pointer"
                    @click="openEditTerm(term)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    color="error"
                    variant="soft"
                    label="ลบรายการ"
                    size="md"
                    class="rounded-xl flex-1 sm:flex-none border border-red-500/20 cursor-pointer"
                    :disabled="deletingTermId === term.id_term"
                    :loading="deletingTermId === term.id_term"
                    @click="confirmDeleteTermFunc(term)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการลบ -->
    <UModal
      v-model:open="confirmDeleteTerm"
      :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }"
    >
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div
              class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20"
            >
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="text-4xl text-red-500"
              />
            </div>

            <h3 class="text-2xl font-bold text-slate-900 text-center mb-2">
              ยืนยันการลบเทอมการศึกษา
            </h3>
            <p class="text-slate-600 text-center mb-8">
              การดำเนินการนี้จะลบข้อมูลตารางเรียนและข้อมูลที่เกี่ยวข้องทั้งหม
              ดในเทอมนี้อย่างถาวร ไม่สามารถย้อนคืนได้
            </p>

            <div class="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl text-center relative overflow-hidden">
              <div class="relative z-10">
                <p class="text-xs font-black uppercase tracking-widest text-red-400/80 mb-1">
                  เทอมที่เลือก
                </p>
                <p class="text-3xl font-black text-slate-900">
                  {{ selectedTermForDelete?.term }} / {{ selectedTermForDelete?.academic_year }}
                </p>
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
                class="rounded-2xl border-slate-200 py-4 flex-1"
                @click="confirmDeleteTerm = false"
              />
              <UButton
                label="ยืนยันการลบถาวร"
                color="error"
                size="xl"
                block
                class="rounded-2xl py-4 flex-1 shadow-lg shadow-red-500/20"
                :loading="deletingTermId === selectedTermForDelete?.id_term"
                @click="deleteTerm(selectedTermForDelete?.id_term)"
              />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal แก้ไขเทอม -->
    <UModal
      v-model:open="editTermModalOpen"
      :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }"
    >
      <template #content>
        <div class="flex flex-col max-h-[90vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div
              class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100"
            >
              <UIcon name="i-lucide-edit" class="text-3xl text-blue-600" />
            </div>
            <h3 class="text-2xl font-bold text-slate-900 text-center mb-6">
              แก้ไขเทอมการศึกษา
            </h3>

            <div class="space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">เทอมที่ <span class="text-red-500">*</span></label>
                  <UInput
                    v-model.number="editForm.term"
                    type="number"
                    min="1"
                    max="3"
                    placeholder="1, 2, หรือ 3"
                    size="xl"
                    :ui="{ base: 'rounded-2xl' }"
                  />
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">ปีการศึกษา <span class="text-red-500">*</span></label>
                  <UInput
                    v-model.number="editForm.academic_year"
                    type="number"
                    placeholder="68 หรือ 2568"
                    size="xl"
                    :ui="{ base: 'rounded-2xl' }"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">ช่วงวันเรียน <span class="text-red-500">*</span></label>
                <UInputDate
                  ref="editInputDate"
                  v-model="editModelValue"
                  range
                  class="rounded-xl overflow-hidden shadow-inner w-full"
                >
                  <template #trailing>
                    <UPopover :reference="editInputDate?.inputsRef?.[0]?.$el">
                      <UButton
                        color="neutral"
                        variant="link"
                        size="sm"
                        icon="i-lucide-calendar"
                        aria-label="Select a date range"
                        class="px-0"
                      />
                      <template #content>
                        <UCalendar
                          v-model="editModelValue"
                          class="p-2"
                          :number-of-months="2"
                          range
                        />
                      </template>
                    </UPopover>
                  </template>
                </UInputDate>
              </div>

              <!-- Preview -->
              <div
                v-if="editForm.term || editForm.academic_year"
                class="p-4 bg-slate-800 border border-slate-700 rounded-2xl relative overflow-hidden"
              >
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">แสดงตัวอย่าง</p>
                <div class="space-y-1">
                  <p class="text-xl font-black text-amber-400">
                    <span v-if="editForm.term" class="text-white">เทอม {{ editForm.term }}</span>
                    <span v-if="editForm.term && editForm.academic_year" class="text-slate-500"> / </span>
                    <span v-if="editForm.academic_year">{{ editForm.academic_year }}</span>
                  </p>
                  <div class="flex items-center gap-2 text-xs font-medium text-slate-300">
                    <UIcon name="i-heroicons-calendar-days" class="text-slate-400" />
                    {{ editDateRangePreview }}
                  </div>
                </div>
              </div>
            </div>
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
                @click="editTermModalOpen = false"
              />
              <UButton
                label="บันทึกการแก้ไข"
                color="primary"
                size="xl"
                block
                class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/10 font-bold"
                :loading="savingEdit"
                :disabled="!editForm.term || !editForm.academic_year"
                @click="saveEditTerm"
              />
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { parseDate } from '@internationalized/date'

const { data } = await useFetch('/api/terms', {
  default: () => []
})
const terms = ref(data.value)
const deletingTermId = ref(null)
const confirmDeleteTerm = ref(false)
const selectedTermForDelete = ref(null)

// --- Edit Term ---
const editTermModalOpen = ref(false)
const savingEdit = ref(false)
const editingTermId = ref(null)
const editInputDate = useTemplateRef('editInputDate')
const editForm = reactive({ term: undefined, academic_year: undefined })
const editModelValue = shallowRef({ start: null, end: null })

const editDateRangePreview = computed(() => {
  const s = editModelValue.value?.start
  const e = editModelValue.value?.end
  if (!s || !e) return ''
  const fmt = (d) => `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
  return `${fmt(s)} → ${fmt(e)}`
})

const openEditTerm = (term) => {
  editingTermId.value = term.id_term
  editForm.term = term.term
  editForm.academic_year = term.academic_year
  try {
    editModelValue.value = {
      start: parseDate(term.start_date),
      end: parseDate(term.end_date)
    }
  } catch {
    editModelValue.value = { start: null, end: null }
  }
  editTermModalOpen.value = true
}

const saveEditTerm = async () => {
  if (!editForm.term || !editForm.academic_year || !editModelValue.value?.start || !editModelValue.value?.end) {
    return
  }
  const fmt = (d) => `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
  savingEdit.value = true
  try {
    const updated = await $fetch(`/api/terms/${editingTermId.value}`, {
      method: 'PUT',
      body: {
        term: editForm.term,
        academic_year: editForm.academic_year,
        start_date: fmt(editModelValue.value.start),
        end_date: fmt(editModelValue.value.end)
      }
    })
    const idx = terms.value.findIndex(t => t.id_term === editingTermId.value)
    if (idx !== -1) terms.value[idx] = updated
    editTermModalOpen.value = false
    useToast().add({ title: 'บันทึกสำเร็จ', description: `แก้ไขเทอม ${updated.term}/${updated.academic_year} เรียบร้อยแล้ว`, color: 'primary' })
  } catch (err) {
    const msg = err?.response?._data?.statusMessage || err?.statusMessage || err?.message || 'ไม่สามารถบันทึกได้'
    useToast().add({ title: 'เกิดข้อผิดพลาด', description: msg, color: 'error' })
  } finally {
    savingEdit.value = false
  }
}

const onAddedTerm = (newTerm) => {
  if (newTerm) {
    terms.value.push(newTerm)
  }
}

const latestYear = computed(() => {
  if (!terms.value || terms.value.length === 0) return '-'
  return Math.max(...terms.value.map(t => t.academic_year))
})

const sortedTerms = computed(() => {
  if (!terms.value) return []
  return [...terms.value].sort((a, b) => {
    if (b.academic_year !== a.academic_year) return b.academic_year - a.academic_year
    return b.term - a.term
  })
})

const isCurrentTerm = (term) => {
  if (!terms.value || terms.value.length === 0) return false
  const sorted = [...terms.value].sort((a, b) => {
    if (b.academic_year !== a.academic_year) return b.academic_year - a.academic_year
    return b.term - a.term
  })
  return sorted[0].id_term === term.id_term
}

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
