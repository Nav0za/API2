<template>
  <div class="min-h-screen bg-linear-to-br from-slate-800 to-slate-900 text-white">
    <!-- แถบนำทาง -->
    <nav class="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <h2 class="text-xl font-bold text-blue-400">
            ระบบจัดตารางสอน
          </h2>
        </div>
      </div>
    </nav>

    <!-- เนื้อหาหลัก -->
    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- รายชื่ออาจารย์ (ซ้าย) -->
        <div class="w-full lg:w-80 shrink-0">
          <div class="bg-slate-800 rounded-lg shadow-xl border border-slate-700">
            <div class="p-4 border-b border-slate-700">
              <h1 class="text-lg font-bold text-blue-300">
                รายชื่ออาจารย์
              </h1>
            </div>
            <div class="overflow-y-auto max-h-[calc(40vh)] lg:max-h-[calc(100vh-250px)] custom-scrollbar">
              <div class="p-2 space-y-2">
                <button
                  v-for="(template, index) in templates"
                  :key="index"
                  :class="[
                    'w-full px-4 py-3 rounded-lg text-left transition-all',
                    selectedTemplate === template
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  ]"
                  @click="selectedTemplate = template"
                >
                  {{ template }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ตารางสอน (ขวา) -->
        <div class="flex-1 min-w-0">
          <div class="rounded-lg shadow-xl border border-slate-700 p-2 sm:p-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <h1 class="text-xl sm:text-2xl font-bold text-blue-300">
                  ตารางสอน
                </h1>
                <div class="flex items-center space-x-2">
                  <!-- ปุ่มเพิ่มวิชา / ปุ่มเพิ่มตาราง -->
                  <UButton
                    icon="i-heroicons-plus-circle"
                    label="เพิ่มวิชา"
                    to="/addSubject"
                  />
                  <UButton
                    icon="i-heroicons-table-cells"
                    label="เพิ่มตาราง"
                    color="primary"
                    to="/addTable"
                  />
                </div>
              </div>
              <!-- เลือกเทอม / ปีการศึกษา (Dropdown) -->
              <div
                ref="termDropdownContainer"
                class="relative"
              >
                <button
                  class="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-200"
                  @click="toggleTermDropdown"
                >
                  <span>เทอม: {{ selectedTerm }} / {{ selectedYear }}</span>
                  <svg
                    class="w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': isTermDropdownOpen }"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                <!-- Dropdown ที่่อยู่ในช่องว่าง -->
                <Transition name="dropdown">
                  <div
                    v-if="isTermDropdownOpen"
                    class="absolute top-full right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-2xl border border-slate-600 overflow-hidden z-50"
                  >
                    <div class="p-3 space-y-2">
                      <div>
                        <label
                          for="term"
                          class="text-xs font-medium text-slate-400"
                        >เทอม</label>
                        <select
                          id="term"
                          v-model="selectedTerm"
                          class="w-full mt-1 bg-slate-700 text-white rounded-md px-3 py-2 text-sm border border-slate-600 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option
                            v-for="term in terms"
                            :key="term"
                            :value="term"
                          >
                            {{ term }}
                          </option>
                        </select>
                      </div>
                      <div>
                        <label
                          for="year"
                          class="text-xs font-medium text-slate-400"
                        >ปีการศึกษา</label>
                        <select
                          id="year"
                          v-model="selectedYear"
                          class="w-full mt-1 bg-slate-700 text-white rounded-md px-3 py-2 text-sm border border-slate-600 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option
                            v-for="year in academicYears"
                            :key="year"
                            :value="year"
                          >
                            {{ year }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- ตารางสอน -->
            <div class="overflow-x-auto">
              <div class="inline-block min-w-full">
                <!-- หัวตาราง -->
                <div class="flex border-b text-xs sm:text-sm">
                  <div class="w-16 sm:w-20 shrink-0 px-2 sm:px-4 py-2 sm:py-3 font-bold text-center border-r border-slate-600">
                    วัน
                  </div>
                  <div class="flex flex-1">
                    <div
                      v-for="hour in 13"
                      :key="hour"
                      class="flex-1 min-w-16 sm:min-w-20 px-1 sm:px-2 py-2 sm:py-3 bg-slate-700 font-bold text-center border-r border-slate-600 last:border-r-0"
                    >
                      <span class="hidden sm:inline">ชม.ที่</span> {{ hour }}
                    </div>
                  </div>
                </div>

                <!-- ตาราง -->
                <div
                  v-for="(row, rowIndex) in scheduleRows"
                  :key="rowIndex"
                  class="flex border-b border-slate-600 last:border-b-0 text-xs sm:text-sm"
                >
                  <!-- หัวแถว -->
                  <div class="w-16 sm:w-20 shrink-0 px-2 sm:px-4 py-4 sm:py-8 bg-slate-700/50 font-medium border-r border-slate-600 flex items-center justify-center">
                    {{ row.day }}
                  </div>

                  <!-- ช่องเวลา -->
                  <div class="flex flex-1">
                    <div
                      v-for="(slot, slotIndex) in row.slots"
                      :key="slotIndex"
                      class="relative flex-1 min-w-16 sm:min-w-20 border-r border-slate-600 last:border-r-0"
                    >
                      <div
                        :class="[
                          'h-full px-1 sm:px-2 py-4 sm:py-8 transition-colors flex items-center justify-center cursor-pointer',
                          slot ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 hover:bg-gray-600'
                        ]"
                        @click="toggleDropdown(rowIndex, slotIndex)"
                      >
                        <span :class="slot ? 'text-white text-xs sm:text-sm font-medium' : 'text-slate-400 text-xs sm:text-sm'">
                          {{ slot || 'ว่าง' }}
                        </span>
                      </div>

                      <!-- เมนู Dropdown -->
                      <Transition name="dropdown">
                        <div
                          v-if="activeDropdown.row === rowIndex && activeDropdown.slot === slotIndex"
                          class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 sm:w-64 bg-slate-800 rounded-lg shadow-2xl border border-slate-600 overflow-hidden z-50"
                          @click.stop
                        >
                          <!-- ส่วนหัว -->
                          <div class="px-4 py-3 bg-slate-700 border-b border-slate-600">
                            <h3 class="text-sm font-bold text-blue-300">
                              เลือกรายวิชา
                            </h3>
                          </div>

                          <!-- รายชื่อวิชา -->
                          <div class="max-h-48 sm:max-h-64 overflow-y-auto custom-scrollbar">
                            <button
                              v-for="(subject, index) in subjects"
                              :key="index"
                              class="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center gap-3 border-b border-slate-700/50 last:border-b-0"
                              @click="selectOption(rowIndex, slotIndex, subject)"
                            >
                              <span class="text-blue-400 text-lg">📚</span>
                              <span class="text-white text-sm">{{ subject }}</span>
                            </button>
                          </div>

                          <!-- ตัวเลือกเพิ่มเติม -->
                          <div class="border-t border-slate-600">
                            <button
                              class="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center gap-3 border-b border-slate-700/50"
                              @click="selectOption(rowIndex, slotIndex, 'พักเบรก')"
                            >
                              <span class="text-green-400 text-lg">☕</span>
                              <span class="text-white text-sm">พักเบรก</span>
                            </button>

                            <button
                              class="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center gap-3 border-b border-slate-700/50"
                              @click="selectOption(rowIndex, slotIndex, 'ติวเสริม')"
                            >
                              <span class="text-yellow-400 text-lg">✏️</span>
                              <span class="text-white text-sm">ติวเสริม</span>
                            </button>

                            <button
                              v-if="slot"
                              class="w-full px-4 py-3 text-left hover:bg-red-600/20 transition-colors flex items-center gap-3"
                              @click="selectOption(rowIndex, slotIndex, '')"
                            >
                              <span class="text-red-400 text-lg">🗑️</span>
                              <span class="text-red-400 text-sm font-medium">ลบรายการ</span>
                            </button>
                          </div>
                        </div>
                      </Transition>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// รายชื่ออาจารย์ (Template)
const templates = ref([
  'นายสมชาย',
  'นายสมศักดิ์',
  'นายปภพ',
  'นายธนภัทร',
  'นางสาวสมศรี',
  'นายจีรัง',
  'นางสาวสุดารัตน์',
  'นายงู',
  'นายนก',
  'นายหมา',
  'นายกา',
  'นางสาวไก่',
  'นายแมว',
  'นางสาวกระต่าย'
])

const selectedTemplate = ref('นายสมชาย')

// รายวิชา
const subjects = ref([
  'คณิตศาสตร์ 1',
  'คณิตศาสตร์ 2',
  'ฟิสิกส์',
  'เคมี',
  'ชีววิทยา',
  'ภาษาไทย',
  'ภาษาอังกฤษ',
  'สังคมศึกษา',
  'ประวัติศาสตร์',
  'พลศึกษา',
  'ศิลปะ',
  'ดนตรี',
  'คอมพิวเตอร์',
  'วิทยาศาสตร์',
  'การงานอาชีพ'
])

// ข้อมูลตาราง - 5 แถว (วัน) และ 13 ช่องเวลา
const scheduleRows = ref([
  { day: 'จันทร์', slots: Array(13).fill('') },
  { day: 'อังคาร', slots: Array(13).fill('') },
  { day: 'พุธ', slots: Array(13).fill('') },
  { day: 'พฤหัสบดี', slots: Array(13).fill('') },
  { day: 'ศุกร์', slots: Array(13).fill('') }
])

// สถานะของ Dropdown ในแต่ละช่อง
const activeDropdown = ref({ row: null, slot: null })

// สถานะของ Dropdown เลือกเทอม/ปี
const isTermDropdownOpen = ref(false)
const termDropdownContainer = ref(null)
const terms = ref([1, 2, 3])
const currentYear = new Date().getFullYear() + 543
const academicYears = ref(Array.from({ length: 5 }, (_, i) => currentYear - i))
const selectedTerm = ref(1)
const selectedYear = ref(currentYear)

const toggleTermDropdown = () => {
  isTermDropdownOpen.value = !isTermDropdownOpen.value
}

// เปิด/ปิด Dropdown ในช่องตาราง
const toggleDropdown = (rowIndex, slotIndex) => {
  if (activeDropdown.value.row === rowIndex && activeDropdown.value.slot === slotIndex) {
    activeDropdown.value = { row: null, slot: null }
  } else {
    activeDropdown.value = { row: rowIndex, slot: slotIndex }
  }
}

// เลือกรายการจาก Dropdown
const selectOption = (rowIndex, slotIndex, value) => {
  scheduleRows.value[rowIndex].slots[slotIndex] = value
  activeDropdown.value = { row: null, slot: null }
}

// ฟังก์ชันปิด Dropdown เมื่อคลิกนอกพื้นที่
const handleClickOutside = (event) => {
  // ปิด Dropdown ของช่องตาราง
  if (!event.target.closest('.relative')) {
    activeDropdown.value = { row: null, slot: null }
  }

  // ปิด Dropdown ของเทอม/ปี
  if (termDropdownContainer.value && !termDropdownContainer.value.contains(event.target)) {
    isTermDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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

/* dropdown ในช่องตารางสอน */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.4s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(50%) translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(50%) translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(50%) translateY(-10);
}

/* Responsive tweaks */
@media (max-width: 1023px) {
  .container {
    max-width: 100vw;
  }
}
</style>
