<template>
  <div class="bg-gradient-to-br from-slate-800 to-slate-900 text-white min-h-screen">
    <!-- ปุ่มย้อนกลับ -->
    <UButton
      label="ย้อนกลับ"
      icon="i-lucide-arrow-left"
      color="error"
      class="m-4 cursor-pointer"
      to="/sections"
    />

    <div class="container mx-auto py-2 pb-10 px-4">
      <!-- Header -->
      <div v-if="pending">
        Loading...
      </div>
      <div v-else>
        <h1 class="text-4xl mb-4">
          กลุ่มเรียน: <b>{{ sectionName }}</b>
        </h1>
        <p class="text-xl mb-8 text-slate-300">
          เทอม: {{ sectionTerm }}
        </p>

        <!-- เลือกเทอมสำหรับดู/จัดการตารางเรียน -->
        <div class="flex justify-between items-center mb-4">
          <p class="text-xl font-bold">
            ตารางเรียน
          </p>
          <USelect
            v-model="selectedTerm"
            placeholder="เลือกภาคการศึกษา"
            color="primary"
            variant="outline"
            :options="termOptions"
            class="w-1/4"
            @change="loadSchedule"
          />
        </div>

        <div
          v-if="!selectedTerm"
          class="text-center text-slate-400 py-10"
        >
          กรุณาเลือกภาคการศึกษาเพื่อแสดง/จัดการตารางเรียน
        </div>

        <!-- ตารางเรียน -->
        <div
          v-else
          class="mt-4"
        >
          <div class="grid grid-cols-14 text-center">
            <!-- Header เวลา -->
            <div
              class="shrink-0 px-4 py-3 bg-slate-700 font-bold border-r border-slate-600 flex items-center justify-center text-white"
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
                class="border-r border-t border-slate-600 p-1 text-center bg-slate-700/50 text-white flex items-center justify-center w-full"
              >
                {{ day }}
              </div>

              <!-- ช่วงเวลาทั้งหมด 12 ช่อง -->
              <template
                v-for="(slot, slotIndex) in scheduleSlots[dayIndex]"
                :key="`${dayIndex}-${slotIndex}`"
              >
                <!-- ช่วงเช้า 0-3 -->
                <div
                  v-if="slotIndex < 4"
                  class="border-r border-t border-slate-600 text-center bg-slate-800 w-full"
                >
                  <UInput
                    v-model="slot.value"
                    placeholder="ว่าง"
                    class="w-full h-20 bg-gray-500 hover:bg-gray-600 text-white text-center rounded-none border-0"
                  />
                </div>

                <!-- ช่อง พักกลางวัน -->
                <div
                  v-if="slotIndex === 4"
                  class="border-r border-t border-slate-600 p-1 text-center bg-slate-800 text-white flex items-center justify-center"
                >
                  พักกลางวัน
                </div>

                <!-- ช่วงบ่าย 4-11 -->
                <div
                  v-if="slotIndex >= 4"
                  class="border-r border-t border-slate-600 text-center bg-slate-800 w-full"
                >
                  <UInput
                    v-model="slot.value"
                    placeholder="ว่าง"
                    class="w-full h-20 bg-gray-500 hover:bg-gray-600 text-white text-center rounded-none border-0"
                  />
                </div>
              </template>
            </template>
          </div>

          <!-- ปุ่มบันทึก/ล้าง -->
          <div class="flex gap-3 mt-6">
            <UButton
              label="บันทึกตารางเรียน"
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
  </div>
</template>

<script setup>
const route = useRoute()
const id = route.params.id

// ดึงข้อมูลกลุ่มเรียน
const { data: allSections, pending } = await useFetch('/api/sections')
const { data: terms } = await useFetch('/api/terms')

const section = computed(() => {
  if (!allSections.value) return null
  return allSections.value.find(s => s.id_section == id)
})

const sectionName = computed(() => section.value?.section_name || 'ไม่พบชื่อกลุ่ม')
const sectionTerm = computed(() => section.value?.term || '-')

// ตัวเลือกเทอม
const termOptions = computed(() => {
  if (!terms.value) return []
  return terms.value.map(t => ({
    label: `เทอม ${t.term}/${t.academic_year}`,
    value: `${t.term}/${t.academic_year}`
  }))
})

// เทอมที่เลือก
const selectedTerm = ref(null)

// ข้อมูลเวลาและวัน
const timeSlots = [
  '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
  '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
  '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00'
]
const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

// ตารางเรียน (7 วัน x 12 ช่วงเวลา)
const scheduleSlots = ref(Array.from({ length: 7 }, () =>
  Array.from({ length: 12 }, () => ({ value: null }))
))

// โหลดตารางเรียน
const loadSchedule = async () => {
  if (!selectedTerm.value) return

  try {
    const schedule = await $fetch('/api/section-schedules', {
      query: {
        id_section: id,
        term: selectedTerm.value
      }
    })

    if (schedule && schedule.scheduleData) {
      scheduleSlots.value = schedule.scheduleData
    } else {
      clearSchedule()
    }
  } catch (err) {
    console.log('Error loading schedule:', err)
    clearSchedule()
  }
}

// บันทึกตารางเรียน
const saving = ref(false)
const toast = useToast()

const saveSchedule = async () => {
  if (!selectedTerm.value) {
    toast.add({
      title: 'ผิดพลาด',
      description: 'กรุณาเลือกภาคการศึกษาก่อน',
      color: 'error'
    })
    return
  }

  saving.value = true

  try {
    await $fetch('/api/section-schedules', {
      method: 'POST',
      body: {
        schedule: scheduleSlots.value,
        id_section: id,
        term: selectedTerm.value
      }
    })

    toast.add({
      title: 'สำเร็จ',
      description: 'บันทึกตารางเรียนเรียบร้อยแล้ว',
      color: 'primary'
    })
  } catch (err) {
    console.error('Error saving schedule:', err)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถบันทึกตารางเรียนได้',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

// ล้างตาราง
const clearSchedule = () => {
  scheduleSlots.value = Array.from({ length: 7 }, () =>
    Array.from({ length: 12 }, () => ({ value: null }))
  )
}

// โหลดตารางเมื่อเลือกเทอม
watch(selectedTerm, () => {
  if (selectedTerm.value) {
    loadSchedule()
  }
})
</script>

<style scoped>
.grid-cols-14 {
  grid-template-columns: 100px repeat(13, 1fr);
}
</style>
