<template>
  <div class="bg-linear-to-br from-slate-800 to-slate-900 text-white min-h-screen">
    <!-- ปุ่มย้อนกลับ -->
    <UButton
      label="ย้อนกลับ"
      icon="i-lucide-arrow-left"
      color="error"
      class="m-4 cursor-pointer"
      @click="$router.back()"
    />
    <div class="container mx-auto py-2 pb-10">
      <!-- แสดงรายละเอียดอาจารย์ตาม id -->
      <h1 class="text-4xl mb-10">
        รายละเอียดอาจารย์
      </h1>
      <p class="text-2xl mb-4">
        ชื่ออาจารย์ : <b v-if="pending">กำลังโหลดข้อมูล</b><b v-else>{{ teacherName }}</b>
      </p>

      <!-- แสดงรายวิชาที่สอนโดยอาจารย์ท่านนี้ -->
      <div class="w-3/7 shrink-0">
        <div class="bg-slate-800 rounded-lg shadow-xl border border-slate-700">
          <div class="p-4 border-b border-slate-700 flex justify-between items-center">
            <h1 class="text-lg font-bold text-blue-300">
              รายวิชาที่สอน
            </h1>

            <!-- เพิ่มรายวิชา -->
            <UModal
              v-model:open="open"
              title="เพิ่มรายวิชา"
            >
              <UButton
                label="เพิ่มรายวิชา"
                class="cursor-pointer"
              />
              <template #body>
                <h3 class="text-xl mb-2">
                  ชื่อวิชา
                </h3>
                <UInput v-model="subjectName" />
                <h3 class="text-xl mb-2 mt-4">
                  กลุ่มเรียน (Section)
                </h3>
                <USelect
                  v-model="selectedSection"
                  placeholder="เลือกกลุ่มเรียน"
                  :items="sectionOptions"
                />
              </template>
              <template #footer="{ close }">
                <UButton
                  label="ยกเลิก"
                  color="error"
                  @click="close"
                />
                <UButton
                  label="บันทึก"
                  color="primary"
                  @click="async () => {
                    await addSubject()
                    close()
                  }"
                />
              </template>
            </UModal>

            <!-- แก้ไขรายวิชา -->
            <UModal
              v-model:open="editOpen"
              title="แก้ไขรายวิชา"
            >
              <template #body>
                <h3 class="text-xl mb-2">
                  ชื่อวิชา
                </h3>
                <UInput v-model="editSubjectName" />
              </template>
              <template #footer="{ close }">
                <UButton
                  class="cursor-pointer"
                  label="ยกเลิก"
                  color="error"
                  @click="close"
                />
                <UButton
                  class="cursor-pointer"
                  label="บันทึก"
                  color="primary"
                  @click="async () => {
                    await updateSubject()
                    close()
                  }"
                />
              </template>
            </UModal>
          </div>
          <div class="overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
            <div v-if="pending">
              Loading...
            </div>
            <div
              v-else
              class="p-2 space-y-2"
            >
              <p
                v-if="subjects.length === 0"
                class="my-3 text-center text-slate-400"
              >
                ไม่มีรายวิชาที่สอน
              </p>

              <!-- แสดงรายวิชาที่สอนโดยอาจารย์ท่านนี้ -->
              <div
                v-for="subject in subjects"
                v-else
                :key="subject.id_subject"
                class="w-full px-4 py-3 rounded-lg text-left bg-slate-700 text-slate-200 flex justify-between items-center"
              >
                <div class="flex flex-col gap-1 items-start">
                  <span class="text-lg font-bold">
                    {{ subject.name_subject }} <span class="text-sm font-normal text-gray-400">({{ subject.section_name || 'ไม่ระบุกลุ่ม' }})</span>
                  </span>
                  <p class="text-sm">
                    ID: {{ subject.id_subject }}
                  </p>
                </div>
                <div class="flex gap-3">
                  <!-- ปุ่มแก้ไขวิชา -->
                  <span class="flex flex-col items-center gap-1">
                    <UButton
                      class="cursor-pointer"
                      icon="i-lucide-edit"
                      color="warning"
                      @click="editSubject(subject)"
                    />
                    <span class="text-xs text-slate-300">แก้ไข</span>
                  </span>
                  <!-- ปุ่มลบวิชา -->
                  <span class="flex flex-col items-center gap-1">
                    <UButton
                      class="cursor-pointer"
                      icon="i-lucide-trash"
                      color="error"
                      @click="deleteSubject(subject.id_subject)"
                    />
                    <span class="text-xs text-slate-300">ลบ</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- เลือกเทอมและดูตารางสอน -->
      <div class="flex justify-between items-center mt-8">
        <p class="text-xl font-bold">
          ตารางสอน
        </p>
        <USelect
          v-model="selectedTerm"
          placeholder="เลือกภาคการศึกษา"
          color="primary"
          variant="outline"
          :items="termOptions"
          class="w-1/4 my-4"
        />
      </div>

      <!-- Debug -->
      <div class="bg-blue-500 text-white p-2 mb-2 rounded text-sm">
        Debug: เทอมที่เลือก = "{{ selectedTerm }}" | มีเทอมทั้งหมด {{ termOptions.length }} เทอม
      </div>

      <div
        v-if="!selectedTerm"
        class="text-center text-slate-400 py-10"
      >
        กรุณาเลือกภาคการศึกษาเพื่อแสดง/จัดการตารางสอน
      </div>

      <!-- ตารางสอน -->
      <div
        v-else
        class="mt-4 overflow-x-auto pb-4"
      >
        <div class="min-w-[1500px]">
          <div class="grid grid-cols-14 text-center border-b border-slate-600">
            <!-- แสดงเวลา -->
            <div
              class="shrink-0 px-4 py-3 bg-slate-700 font-bold border-r border-slate-600 flex items-center justify-center text-white sticky left-0 z-10"
            >
              วัน/เวลา
            </div>
            <div
              v-for="time in timeSlots"
              :key="time"
              class="flex-1 px-1 py-3 bg-slate-700 text-center text-sm border-r border-slate-600 last:border-r-0 text-white"
            >
              {{ time }}
            </div>

            <!-- ลูปทุกวัน -->
            <template
              v-for="(day, dayIndex) in days"
              :key="dayIndex"
            >
              <div
                class="border-r border-t border-slate-600 p-1 text-center bg-slate-700/50 text-white flex items-center justify-center w-full sticky left-0 z-10 font-bold"
              >
                {{ day }}
              </div>

              <!-- ช่วงเวลาทั้งหมด 13 ช่อง (ไม่รวมพักเที่ยง) -->
              <template
                v-for="(slot, slotIndex) in (scheduleSlots[dayIndex] || [])"
                :key="`${dayIndex}-${slotIndex}`"
              >
                <!-- ช่วงเช้า 0-3 -->
                <div
                  v-if="slotIndex < 4"
                  class="border-r border-t border-slate-600 text-center bg-slate-800 w-full"
                >
                  <USelect
                    v-model="slot.value"
                    placeholder="ว่าง"
                    :items="subjectOptions"
                    variant="none"
                    class="w-full h-20 transition-colors flex items-center justify-center cursor-pointer bg-slate-800 hover:bg-slate-700 text-sm rounded-none text-amber-200"
                    :ui="{ placeholder: 'text-slate-500' }"
                  />
                </div>

                <!-- ช่อง พักกลางวัน (Index 4) -->
                <div
                  v-else-if="slotIndex === 4"
                  class="border-r border-t border-slate-600 p-1 text-center bg-slate-800 text-white flex items-center justify-center select-none"
                >
                  พักกลางวัน
                </div>

                <!-- ช่วงบ่าย 5-12 -->
                <div
                  v-else
                  class="border-r border-t border-slate-600 text-center bg-slate-800 w-full"
                >
                  <USelect
                    v-model="slot.value"
                    placeholder="ว่าง"
                    :items="subjectOptions"
                    variant="none"
                    class="w-full h-20 transition-colors flex items-center justify-center cursor-pointer bg-slate-800 hover:bg-slate-700 text-sm rounded-none text-amber-200"
                    :ui="{ placeholder: 'text-slate-500' }"
                  />
                </div>
              </template>
            </template>
          </div>
        </div>

        <!-- ปุ่มบันทึกตารางสอน -->
        <div class="flex gap-3 mt-6 sticky left-0">
          <UButton
            label="บันทึกตารางสอน"
            color="primary"
            icon="i-heroicons-table-cells"
            class="cursor-pointer"
            :loading="saving"
            @click="saveSchedule"
          />
          <UButton
            label="ล้างตาราง"
            color="error"
            icon="i-lucide-trash"
            class="cursor-pointer"
            @click="clearSchedule"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ดึง id จากพารามิเตอร์
const route = useRoute()
const id = route.params.id

// get API
const { data: subjects, refresh: refreshSubjects } = await useFetch('/api/Subjects', {
  query: {
    id_teacher: id
  },
  watch: false
})
const { data: teachers, pending } = await useFetch('/api/teachers')
const { data: terms } = await useFetch('/api/terms')
const { data: sections } = await useFetch('/api/sections')

// เพิ่ม toast
const toast = useToast()

// ข้อมูลวันเวลา
const timeSlots = [
  '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
  '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
  '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00'
]
const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

// หาอาจารย์ตาม id จากพารามิเตอร์
const teacherName = computed(() =>
  teachers.value?.find(t => t.id_teacher == id)?.name || 'ไม่พบชื่ออาจารย์'
)

// โมดัลเพิ่มรายวิชา
const open = ref(false)

// โมดัลแก้ไขรายวิชา
const editOpen = ref(false)
const editSubjectName = ref('')
const currentEditSubject = ref(null)

// function เพิ่มวิชา
const subjectName = ref('')
const selectedSection = ref(null)

// ตัวเลือก Section
const sectionOptions = computed(() => {
  if (!sections.value) return []
  return sections.value.map(s => ({
    value: s.id_section,
    label: `${s.section_name} (${s.term})`
  }))
})

const addSubject = async () => {
  if (!subjectName.value.trim() || !selectedSection.value) {
    alert('กรุณากรอกชื่อวิชาและเลือกกลุ่มเรียน')
    return
  }

  try {
    await $fetch('/api/Subjects', {
      method: 'POST',
      body: {
        name_subject: subjectName.value,
        id_teacher: id,
        id_section: selectedSection.value
      }
    })

    subjectName.value = ''
    selectedSection.value = null
    // รีเฟรชข้อมูลวิชา
    await refreshSubjects()

    toast.add({
      title: 'สำเร็จ',
      description: 'เพิ่มรายวิชาเรียบร้อยแล้ว',
      color: 'primary'
    })
  } catch (err) {
    console.log(err)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถเพิ่มรายวิชาได้',
      color: 'error'
    })
  }
}

// function ลบรายวิชา
const deleteSubject = async (subjectId) => {
  if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายวิชานี้?')) return

  try {
    await $fetch(`/api/Subjects/${subjectId}`, {
      method: 'DELETE'
    })

    // รีเฟรชข้อมูลวิชา
    await refreshSubjects()

    // ลบข้อมูลในตารางสอน
    scheduleSlots.value.forEach((day) => {
      day.forEach((slot) => {
        if (slot.value === subjectId) {
          slot.value = null
        }
      })
    })

    toast.add({
      title: 'สำเร็จ',
      description: 'ลบรายวิชาเรียบร้อยแล้ว',
      color: 'primary'
    })
  } catch (err) {
    console.log(err)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถลบรายวิชาได้',
      color: 'error'
    })
  }
}

// function แก้ไขรายวิชา
const editSubject = async (subject) => {
  currentEditSubject.value = subject
  editSubjectName.value = subject.name_subject
  editOpen.value = true
}

// function อัปเดตรายวิชา
const updateSubject = async () => {
  if (!editSubjectName.value.trim() || !currentEditSubject.value) return

  try {
    await $fetch(`/api/Subjects/${currentEditSubject.value.id_subject}`, {
      method: 'PUT',
      body: {
        name_subject: editSubjectName.value.trim()
      }
    })

    // รีเฟรชข้อมูลวิชา
    await refreshSubjects()

    editSubjectName.value = ''
    currentEditSubject.value = null
    editOpen.value = false

    toast.add({
      title: 'สำเร็จ',
      description: 'แก้ไขรายวิชาเรียบร้อยแล้ว',
      color: 'primary'
    })
  } catch (err) {
    console.log(err)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถแก้ไขรายวิชาได้',
      color: 'error'
    })
  }
}

// ตัวเลือกเทอม
const termOptions = computed(() => {
  if (!terms.value || terms.value.length === 0) return []
  return terms.value.map(t => ({
    label: `เทอม ${t.term}/${t.academic_year}`,
    value: `${t.term}/${t.academic_year}`
  }))
})

// เทอมที่เลือก - เลือกเทอมแรกอัตโนมัติ
const selectedTerm = ref(null)

// เมื่อโหลดเทอมเสร็จ ให้เลือกเทอมแรกอัตโนมัติ
watch(terms, (newTerms) => {
  if (newTerms && newTerms.length > 0 && !selectedTerm.value) {
    selectedTerm.value = `${newTerms[0].term}/${newTerms[0].academic_year}`
  }
}, { immediate: true })

// ข้อมูลในตารางแบบ array 2d (7 วัน x 13 ช่วงเวลา)
const scheduleSlots = ref(Array.from({ length: 7 }, () =>
  Array.from({ length: 13 }, () => ({ value: null }))
))

// ตรวจสอบและซ่อมแซมข้อมูลตาราง
const normalizeSchedule = (data) => {
  if (!Array.isArray(data)) return Array.from({ length: 7 }, () => Array.from({ length: 13 }, () => ({ value: null })))
  
  // ตรวจสอบจำนวนวัน (ต้องมี 7 วัน)
  while (data.length < 7) {
    data.push(Array.from({ length: 13 }, () => ({ value: null })))
  }
  
  // ตรวจสอบแต่ละวัน (ต้องมี 13 ช่อง)
  data = data.map(day => {
    if (!Array.isArray(day)) return Array.from({ length: 13 }, () => ({ value: null }))
    while (day.length < 13) {
      day.push({ value: null })
    }
    return day
  })

  return data
}

// โหลดตารางสอนจาก database
const loadSchedule = async () => {
  if (!selectedTerm.value) return

  try {
    const schedule = await $fetch('/api/schedules', {
      query: {
        id_teacher: id,
        term: selectedTerm.value
      }
    })

    if (schedule && schedule.scheduleData) {
      // ใช้ normalizeSchedule เพื่อป้องกัน layout พัง
      scheduleSlots.value = normalizeSchedule(schedule.scheduleData)
    } else {
      // ถ้าไม่มีข้อมูล ให้เคลียร์ตาราง
      clearSchedule()
    }
  } catch (err) {
    console.log('Error loading schedule:', err)
    clearSchedule()
  }
}

// บันทึกตารางสอน
const saving = ref(false)
const saveSchedule = async () => {
  if (!selectedTerm.value) {
    alert('กรุณาเลือกภาคการศึกษาก่อน')
    return
  }

  saving.value = true

  try {
    await $fetch('/api/schedules', {
      method: 'POST',
      body: {
        schedule: scheduleSlots.value,
        id_teacher: id,
        term: selectedTerm.value
      }
    })

    alert('บันทึกตารางสอนสำเร็จ!')
  } catch (err) {
    console.error('Error saving schedule:', err)
    alert('เกิดข้อผิดพลาดในการบันทึก')
  } finally {
    saving.value = false
  }
}

// ล้างตาราง
const clearSchedule = () => {
  scheduleSlots.value = Array.from({ length: 7 }, () =>
    Array.from({ length: 13 }, () => ({ value: null }))
  )
}

// วิชาสำหรับ select - ใช้ format ที่ Nuxt UI ต้องการ
const subjectOptions = computed(() => {
  if (!subjects.value) {
    return [{ value: null, label: 'ว่าง' }]
  }

  return [
    { value: null, label: 'ว่าง' },
    ...subjects.value.map(s => ({
      value: s.id_subject,
      label: `${s.name_subject} (${s.section_name || '?'})`
    }))
  ]
})

// โหลดตารางเมื่อเลือกเทอม
watch(selectedTerm, () => {
  if (selectedTerm.value) {
    loadSchedule()
  }
})
</script>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1e293b;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.grid-cols-14 {
  grid-template-columns: 100px repeat(13, 1fr);
}
</style>
