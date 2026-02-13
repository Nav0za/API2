<template>
  <div class="min-h-screen bg-slate-900 text-white pb-20">
    <!-- Header -->
    <div class="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-20 shadow-lg mb-8 no-print">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 class="text-3xl font-bold text-white flex items-center gap-2">
            <UIcon name="i-heroicons-academic-cap" class="text-amber-400" />
            จัดการเทอมการศึกษา
          </h1>
          <p class="text-slate-400 mt-1">กำหนดช่วงเวลาภาคการศึกษาเพื่อใช้จัดตารางเรียน</p>
        </div>
        <!-- Quick Stats -->
        <div class="flex gap-4">
          <div class="bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">จำนวนเทอมทั้งหมด</p>
            <p class="text-2xl font-black text-white">{{ terms?.length || 0 }} <span class="text-xs font-normal text-slate-500">รายการ</span></p>
          </div>
          <div class="bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">ปีการศึกษาล่าสุด</p>
            <p class="text-2xl font-black text-amber-400">{{ latestYear }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Side: Add Form -->
        <div class="lg:col-span-1">
          <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl sticky top-28">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UIcon name="i-heroicons-plus-circle" class="text-blue-400" />
              เพิ่มเทอมใหม่
            </h3>
            <FormTerm @added-term="onAddedTerm" />
          </div>
        </div>

        <!-- Right Side: Term List -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold flex items-center gap-2">
              <UIcon name="i-heroicons-list-bullet" class="text-slate-500" />
              รายการเทอมการศึกษา
            </h2>
            <div class="text-xs text-slate-500 italic">เรียงตามปีการศึกษาล่าสุด</div>
          </div>
          
          <div class="space-y-4">
            <div v-if="!terms || terms.length === 0" class="text-center py-24 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
              <div class="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-700">
                <UIcon name="i-heroicons-calendar-days" class="text-4xl text-slate-600" />
              </div>
              <p class="text-slate-400 font-medium">ยังไม่มีข้อมูลเทอมในระบบ</p>
              <p class="text-slate-600 text-sm mt-2">กรุณาเพิ่มข้อมูลที่ฟอร์มด้านซ้ายมือค่ะ</p>
            </div>

            <div
              v-for="term in sortedTerms"
              :key="term.id_term"
              class="relative overflow-hidden p-6 rounded-3xl bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 shadow-xl group hover:shadow-blue-500/5"
            >
              <!-- Background Decor -->
              <div class="absolute -right-8 -top-8 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700">
                <UIcon name="i-heroicons-academic-cap" class="w-48 h-48 text-white" />
              </div>

              <div class="flex flex-col sm:flex-row justify-between items-center relative z-10 gap-6">
                <div class="flex items-center gap-6 w-full">
                  <div class="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner border border-slate-700/50">
                    <span class="text-2xl font-black text-amber-400 group-hover:text-white">{{ term.term }}</span>
                  </div>
                  <div>
                    <div class="text-2xl font-black text-white flex items-center gap-2">
                      ปีการศึกษา {{ term.academic_year }}
                      <span v-if="isCurrentTerm(term)" class="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 whitespace-nowrap">ปัจจุบัน</span>
                    </div>
                    <div class="text-slate-400 text-sm flex items-center gap-2 mt-2 font-medium">
                      <UIcon name="i-heroicons-calendar-days" class="text-slate-500" />
                      {{ formatDate(term.start_date) }} <UIcon name="i-heroicons-arrow-right-circle" class="text-slate-600" /> {{ formatDate(term.end_date) }}
                    </div>
                  </div>
                </div>

                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 w-full sm:w-auto">
                  <UButton
                    icon="i-heroicons-trash"
                    color="error"
                    variant="soft"
                    label="ลบรายการ"
                    size="md"
                    class="rounded-xl flex-1 sm:flex-none border border-red-500/20"
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
    <!-- Modal ยืนยันการลบ -->
    <UModal v-model:open="confirmDeleteTerm" :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
      <template #content>
        <div class="p-8">
          <div class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-4xl text-red-500" />
          </div>
          
          <h3 class="text-2xl font-bold text-white text-center mb-2">ยืนยันการลบเทอมการศึกษา</h3>
          <p class="text-slate-400 text-center mb-8">การดำเนินการนี้จะลบข้อมูลตารางเรียนและข้อมูลที่เกี่ยวข้องทั้งหมดในเทอมนี้อย่างถาวร ไม่สามารถย้อนคืนได้</p>

          <div class="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl mb-8 text-center relative overflow-hidden">
             <div class="relative z-10">
                <p class="text-xs font-black uppercase tracking-widest text-red-400/80 mb-1">เทอมที่เลือก</p>
                <p class="text-3xl font-black text-white">
                  {{ selectedTermForDelete?.term }} / {{ selectedTermForDelete?.academic_year }}
                </p>
             </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <UButton
              label="ยกเลิก"
              color="neutral"
              variant="outline"
              size="xl"
              block
              class="rounded-2xl border-slate-700 py-4 flex-1"
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
