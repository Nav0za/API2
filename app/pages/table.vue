<template>
  <div class="p-5">
    <h1 class="text-xl font-bold mb-3">จัดตารางเรียน (Drag & Drop)</h1>

    <div class="flex gap-5">
      <!-- 📋 Template วิชา -->
      <div class="w-1/4 bg-gray-100 p-3 rounded shadow">
        <h2 class="font-semibold mb-2">Template วิชา / พัก</h2>

        <div
          v-for="(item, index) in subjects"
          :key="index"
          class="bg-blue-300 text-center p-2 mb-2 rounded cursor-pointer select-none shadow"
          draggable="true"
          @dragstart="onDragStart(item)"
        >
          {{ item }}
        </div>

        <div
          class="bg-gray-400 text-center p-2 mb-2 rounded cursor-pointer select-none shadow"
          draggable="true"
          @dragstart="onDragStart('พักเบรก')"
        >
          ☕ พักเบรก
        </div>
      </div>

      <!-- 🧮 ตาราง schedule -->
      <div class="flex-1">
        <div class="grid grid-cols-13">
          <!-- หัวแถว -->
          <div
            v-for="hour in hours"
            :key="hour"
            class="bg-amber-200 border border-gray-400 w-full h-15 p-1 flex items-center justify-center font-bold"
          >
            ชม.ที่ {{ hour }}
          </div>

          <!-- ช่องกรอก -->
          <div
            v-for="(row, rowIndex) in scheduleSlots"
            :key="rowIndex"
            class="contents"
          >
            <div
              v-for="(slot, colIndex) in row"
              :key="colIndex"
              class="border border-gray-300 w-full h-15 p-1 flex items-center justify-center bg-white relative"
              @dragover.prevent
              @drop="onDrop(rowIndex, colIndex)"
              @contextmenu.prevent="clearSlot(rowIndex, colIndex)"
              :class="{
                'bg-green-100': slot.value && slot.value.includes('พัก'),
                'bg-blue-100': slot.value && !slot.value.includes('พัก'),
              }"
            >
              <transition name="fade">
                <div v-if="slot.value" class="">
                  {{ slot.value }}
                </div>
                <div v-else class="text-gray-400 italic text-sm">ว่าง</div>
              </transition>
            </div>
          </div>
        </div>

        <div class="mt-5">
          <UButton label="เพิ่มตาราง" @click="addSchedule()" />
        </div>
      </div>
    </div>

    <!-- 🎨 ghost element ตอนลาก -->
    <div
      v-if="dragPreview.visible"
      class="fixed pointer-events-none opacity-80 bg-blue-500 text-white px-3 py-1 rounded shadow text-sm"
      :style="{ top: dragPreview.y + 'px', left: dragPreview.x + 'px' }"
    >
      {{ dragPreview.text }}
    </div>
  </div>
</template>

<script setup>
const hours = Array.from({ length: 13 }, (_, i) => i + 1)

// 🧩 Template วิชา
const subjects = ref([
  "คณิตศาสตร์",
  "ภาษาอังกฤษ",
  "วิทยาศาสตร์",
  "คอมพิวเตอร์",
  "สังคมศึกษา",
  "พลศึกษา",
])

// 🎯 สำหรับจับข้อมูลตอนลาก
const draggedItem = ref(null)

// 📋 ตาราง schedule 2D array
const scheduleSlots = ref(
  Array(5)
    .fill(null)
    .map(() =>
      Array(13)
        .fill(null)
        .map(() => ({ value: "" }))
    )
)

// 🎨 สำหรับ preview ตอนลาก
const dragPreview = reactive({
  visible: false,
  text: "",
  x: 0,
  y: 0,
})

// 🧲 เริ่มลาก
const onDragStart = (item) => {
  draggedItem.value = item
  dragPreview.text = item
  dragPreview.visible = true
  document.addEventListener("drag", onDragMove)
  document.addEventListener("dragend", onDragEnd)
}

// 🎯 ขณะลาก (อัปเดตตำแหน่ง ghost)
const onDragMove = (e) => {
  if (e.pageX && e.pageY) {
    dragPreview.x = e.pageX + 10
    dragPreview.y = e.pageY + 10
  }
}

// 🏁 ปล่อยลาก
const onDrop = (row, col) => {
  if (draggedItem.value) {
    scheduleSlots.value[row][col].value = draggedItem.value
  }
  endDrag()
}

// ❌ ลบข้อมูลในช่อง (คลิกขวา)
const clearSlot = (row, col) => {
  scheduleSlots.value[row][col].value = ""
}

// 🔚 จบการลาก
const onDragEnd = () => {
  endDrag()
}

const endDrag = () => {
  draggedItem.value = null
  dragPreview.visible = false
  document.removeEventListener("drag", onDragMove)
  document.removeEventListener("dragend", onDragEnd)
}

// 💾 บันทึกลง DB
const addSchedule = async () => {
  await $fetch("/api/schedule", {
    method: "POST",
    body: { schedule: scheduleSlots.value },
  })
  alert("เพิ่มตารางเรียบร้อย!")
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

