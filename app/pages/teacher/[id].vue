<template>
  <div class="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
    <!-- ปุ่มย้อนกลับ -->
    <UButton
      label="ย้อนกลับ"
      icon="i-lucide-arrow-left"
      color="error"
      class="m-4 cursor-pointer"
      @click="$router.back()"
    />
    <div class="container mx-auto py-2 pb-10">
      <!-- // แสดงรายละเอียดอาจารย์ตาม id -->
      <h1 class="text-4xl mb-10">
        รายละเอียดอาจารย์
      </h1>
      <p class="text-2xl mb-4">
        ชื่ออาจารย์ : <b v-if="pending">กำลังโหลดข้อมูล</b><b v-else>{{ teacherName
        }}</b>
      </p>

      <!-- แสดงรายวิชาที่สอนโดยอาจารย์ท่านนี้ -->
      <div class="w-80 flex-shrink-0">
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
              <template
                #body
              >
                <h3 class="text-xl">
                  ชื่อวิชา
                </h3>
                <UInput v-model="subjectName" />
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
                    // เพิ่มรายวิชาและ ปิด modal
                    await addSubject()
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
                v-for="(subject, index) in subjects"
                v-else
                :key="index"
                class="
                                                w-full px-4 py-3 rounded-lg text-left bg-slate-700 text-slate-200 flex justify-between items-center"
              >
                <span>
                  {{ subject.name_subject }}
                </span>
                <UButton
                  class="cursor-pointer"
                  icon="i-lucide-trash"
                  color="error"
                  @click="deleteSubject(subject.id_subject)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <p>ตารางสอน</p>
        <USelect
          placeholder="เลือกภาคการศึกษา"
          color="primary"
          variant="outline"
          :items="['เทอม 1/68', 'เทอม 2/68']"
          class="w-1/4 my-4"
        />
      </div>
      <!-- ตารางสอน -->
      <div class="grid grid-cols-14 mt-1 text-center">
        <!-- แสดงเวลา -->
        <div
          class="flex-shrink-0 px-4 py-3 bg-slate-700 font-bold border-r border-slate-600 flex items-center justify-center text-white"
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
          v-for="(day, index) in days"
          :key="index"
        >
          <div
            class="border-r border-t border-slate-600 p-1 text-center bg-slate-700/50 text-white flex items-center justify-center w-full"
          >
            {{ day }}
          </div>

          <!-- เช้า -->
          <div
            v-for="(slot, i) in scheduleSlots[index].slice(0, 4)"
            :key="`morning-${index}-${i}`"
            class="border-r border-t border-slate-600 text-center bg-slate-800 w-full"
          >
            <USelect
              v-model="slot.value"
              placeholder="ว่าง"
              :items="subjectOptions"
              value-key="id_subject"
              label-key="name_subject"
              variant="none"
              class="w-full h-full transition-colors flex items-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-slate-400 text-sm rounded-none text-amber-200"
            />
          </div>
          <!-- พักกลางวัน -->
          <div
            class="border-r border-t border-slate-600 p-1 text-center bg-slate-800 text-white flex items-center justify-center"
          >
            พักกลางวัน
          </div>

          <!-- บ่าย -->
          <div
            v-for="(slot, i) in scheduleSlots[index].slice(4)"
            :key="`afternoon-${index}-${i}`"
            class="border-r border-t border-slate-600 text-center bg-slate-800 w-full"
          >
            <USelect
              v-model="slot.value"
              placeholder="ว่าง"
              :items="subjectOptions"
              value-key="id_subject"
              label-key="name_subject"
              variant="none"
              class="w-full h-20 transition-colors flex items-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-slate-400 text-sm rounded-none text-amber-200"
            />
          </div>
        </template>
      </div>

      <!-- ปุ่มบันทึกตารางสอน -->
      <UButton
        label="บันทึกตารางสอน"
        color="primary"
        icon="i-heroicons-table-cells"
        class="mt-6 cursor-pointer"
      />
    </div>
  </div>
</template>

<script setup>
// ดึง id จากพารามิเตอร์
const route = useRoute()
const id = route.params.id
// get API
const { data: subjects } = await useFetch('/api/Subjects', {
  query: {
    id_teacher: id
  }
})
const { data: teachers, pending } = await useFetch('/api/teachers')

// ข้อมูลวันเวลา
const timeSlots = [
  '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
  '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
  '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00'
]
const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

// หาอาจารย์ตาม id จากพารามิเตอร์
const teacherName = teachers.value.find(t => t.id_teacher == id)?.name || 'ไม่พบชื่ออาจารย์'

// โมดัลเพิ่มรายวิชา
const open = ref(false)

// function เพิ่มวิชา
const subjectName = ref('')
const addSubject = async () => {
  if (!subjectName.value.trim()) return

  try {
    const newSubject = await $fetch('/api/Subjects', {
      method: 'POST',
      body: {
        name_subject: subjectName.value,
        id_teacher: id
      }
    })

    subjectName.value = ''
    subjects.value = [...(subjects.value || []), newSubject]
  } catch (err) {
    console.log(err)
  }
}

// function ลบรายวิชา
const deleteSubject = async (id) => {
  try {
    await $fetch(`/api/Subjects/${id}`, {
      method: 'DELETE'
    })
    // ลบข้อมูลในตัวแปร subjects
    subjects.value = subjects.value.filter(subject => subject.id_subject !== id)
    // ลบข้อมูลในตารางสอน
    scheduleSlots.value.forEach((day) => {
      day.forEach((slot) => {
        if (slot.value === id) {
          slot.value = null
        }
      })
    })
  } catch (err) {
    console.log(err)
  }
}

// ข้อมูลในตารางแบบ array 2d
const scheduleSlots = ref(Array.from({ length: 7 }, () =>
  Array.from({ length: 12 }, () => ({ value: null }))
))

// วิชาสำหรับ select
const subjectOptions = computed(() => {
  return [
    { id_subject: null, name_subject: 'ว่าง' },
    ...(subjects.value || [])
  ]
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
</style>
