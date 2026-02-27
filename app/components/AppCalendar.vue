<template>
  <div class="w-full">
    <!-- Header -->
    <div class="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-20 shadow-lg mb-8">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 class="text-3xl font-bold text-white flex items-center gap-2">
            <UIcon name="i-heroicons-calendar-days" class="text-blue-400" />
            ปฏิทินการสอน
          </h1>
          <p class="text-slate-400 mt-1">จัดการวันหยุด อาจารย์ติดราชการ และการสอนชดเชย</p>
        </div>

        <div class="flex flex-wrap gap-3 justify-center">
          <UButton label="เพิ่มวันหยุด" icon="i-lucide-calendar-off" color="warning" variant="subtle" size="lg"
            class="rounded-xl font-bold cursor-pointer" @click="openHolidayModal" />
          <UButton label="อาจารย์ติดราชการ" icon="i-lucide-user-x" color="error" variant="subtle" size="lg"
            class="rounded-xl font-bold cursor-pointer" @click="openAbsenceModal" />
          <UButton label="รายการชดเชย" icon="i-heroicons-clipboard-document-list" color="primary" variant="soft"
            size="lg" class="rounded-xl font-bold" to="/makeup-classes" />
          <UButton label="สรุปรายงาน" icon="i-lucide-bar-chart-3" color="secondary" variant="soft" size="lg"
            class="rounded-xl font-bold" to="/summary" />
        </div>
      </div>
    </div>

    <!-- Calendar Container -->
    <div class="container mx-auto px-4">
      <div class="bg-slate-800 border border-slate-700 p-6 shadow-xl rounded-3xl text-white">

        <FullCalendar v-if="events" ref="calendarRef" :options="calendarOptions" />
      </div>
    </div>

    <!-- Modal เพิ่มวันหยุด -->
    <UModal v-model:open="holidayModalOpen"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div class="flex items-center gap-4 mb-8">
              <div
                class="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                <UIcon name="i-lucide-calendar-off" class="text-2xl text-amber-500" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">{{ isEditingHoliday ? 'แก้ไขวันหยุด' : 'เพิ่มวันหยุด' }}</h3>
                <p class="text-slate-400 text-sm">กำหนดวันหยุดพิเศษสำหรับการคำนวณตารางสอน</p>
              </div>
            </div>
            <div class="space-y-6">
              <UFormField label="ชื่อวันหยุด *" color="error" help="เช่น วันสงกรานต์, วันหยุดพิเศษ">
                <UInput v-model="holidayForm.title" placeholder="ระบุชื่อวันหยุด..." size="xl" class="rounded-xl" />
              </UFormField>

              <UFormField label="วันที่ *">
                <UInput v-model="holidayForm.date" type="date" size="xl" class="rounded-xl" />
              </UFormField>

              <UFormField label="รายละเอียดเพิ่มเติม">
                <UTextarea v-model="holidayForm.description" placeholder="หมายเหตุหรือรายละเอียดเพิ่มเติม (ถ้ามี)..."
                  :rows="3" size="xl" class="rounded-xl" />
              </UFormField>
            </div>
          </div>
          <div class="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-10">
            <div class="flex gap-3">
              <UButton label="ยกเลิก" color="neutral" variant="soft" size="xl" block
                class="rounded-2xl py-4 flex-1 font-bold" @click="holidayModalOpen = false" />
              <UButton :label="isEditingHoliday ? 'บันทึกการแก้ไข' : 'เพิ่มวันหยุด'" color="primary" size="xl" block
                class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold" :loading="saving"
                @click="saveHoliday" />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal อาจารย์ติดราชการ -->
    <UModal v-model:open="absenceModalOpen"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div class="flex items-center gap-4 mb-8">
              <div class="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                <UIcon name="i-lucide-user-x" class="text-2xl text-red-500" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">บันทึกอาจารย์ติดราชการ</h3>
                <p class="text-slate-400 text-sm">ระบุวันที่ติดราชการเพื่อหาช่วงเวลาชดเชยที่เหมาะสม</p>
              </div>
            </div>

            <div class="space-y-6">
              <UFormField label="อาจารย์ *" help="เลือกอาจารย์ที่ต้องการบันทึกวันติดราชการ"
                :ui="{ label: 'text-white font-semibold', help: 'text-slate-400' }">
                <USelect v-model="absenceForm.teacherId" :items="teacherOptions" placeholder="เลือกอาจารย์" size="xl"
                  class="rounded-xl w-full" />
              </UFormField>

              <UFormField label="เทอม *" help="เทอมการศึกษาที่เกี่ยวข้อง"
                :ui="{ label: 'text-white font-semibold', help: 'text-slate-400' }">
                <USelect v-model="absenceForm.term" :items="termOptions" placeholder="เลือกเทอม" size="xl"
                  class="rounded-xl" />
              </UFormField>

              <UFormField label="วันที่ติดราชการ *" :ui="{ label: 'text-white font-semibold' }">
                <UInput v-model="absenceForm.date" type="date" size="xl" class="rounded-xl" />
              </UFormField>

              <!-- แสดงรายการวิชาที่สอนในวันนั้น -->
              <div v-if="loadingMissedClasses" class="flex justify-center p-4">
                <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6 text-slate-400" />
              </div>

              <div
                v-else-if="absenceForm.teacherId && absenceForm.date && absenceForm.term && missedClasses.length === 0"
                class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
                <div class="flex items-start gap-2">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p class="font-medium">ไม่พบรายการวิชาที่สอนในวันที่เลือก</p>
                    <p class="text-xs text-amber-400/80 mt-1">กรุณาตรวจสอบว่าเลือกเทอมถูกต้อง</p>
                  </div>
                </div>
              </div>

              <div v-else-if="missedClasses.length > 0" class="border border-slate-700 rounded-xl p-4 bg-slate-800/50">
                <div class="flex items-center justify-between mb-3">
                  <label class="block text-sm font-semibold text-white">วิชาที่ติดราชการ</label>
                  <div class="flex gap-2">
                    <UButton label="เลือกทั้งหมด" size="xs" color="primary" variant="soft"
                      class="text-[10px] px-2 py-1 h-6 rounded-md"
                      @click="missedClasses.filter(c => !c.hasMakeup).forEach(c => c.selected = true)" />
                    <UButton label="ไม่เลือกเลย" size="xs" color="neutral" variant="soft"
                      class="text-[10px] px-2 py-1 h-6 rounded-md"
                      @click="missedClasses.forEach(c => c.selected = false)" />
                  </div>
                </div>
                <p class="text-xs text-slate-400 mb-3">(เลือกวิชาที่ต้องการจัดชดเชย)</p>

                <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  <div v-for="cls in missedClasses" :key="cls.subjectId"
                    class="flex items-start gap-3 p-3 rounded-lg border transition-all" :class="{
                      'bg-slate-700/50 border-slate-700 opacity-50': !cls.selected && !cls.hasMakeup,
                      'border-blue-500/50 bg-blue-500/10 cursor-pointer': cls.selected && !cls.hasMakeup,
                      'opacity-40 bg-slate-800 border-slate-700 cursor-not-allowed': cls.hasMakeup
                    }" @click="!cls.hasMakeup && (cls.selected = !cls.selected)">
                    <UCheckbox v-model="cls.selected" class="mt-1" :disabled="cls.hasMakeup"
                      @click.stop="!cls.hasMakeup && (cls.selected = !cls.selected)" />
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-start">
                        <p class="font-medium text-white truncate">{{ cls.subjectName }}</p>
                        <UBadge v-if="cls.hasMakeup" color="primary" variant="soft" size="xs">จัดชดเชยแล้ว</UBadge>
                      </div>
                      <p class="text-xs text-slate-400 mt-1">
                        {{ cls.timeStart }} - {{ cls.timeEnd }} ({{ cls.duration }} ชม.)
                        <span v-if="cls.sectionName"> • {{ cls.sectionName }}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-slate-700 flex justify-between text-xs font-medium">
                  <span class="text-slate-400">เลือกแล้ว: {{ selectedClassesCount }} วิชา</span>
                  <span class="text-blue-400">รวม: {{ totalDuration }} ชั่วโมง</span>
                </div>
              </div>

              <UFormField label="เหตุผล" help="เช่น ราชการ, ป่วย, ลากิจ"
                :ui="{ label: 'text-white font-semibold', help: 'text-slate-400' }">
                <UTextarea v-model="absenceForm.reason" placeholder="ระบุเหตุผลในการติดราชการ..." :rows="3" size="xl"
                  class="rounded-xl" />
              </UFormField>
            </div>
          </div>
          <div class="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-10">
            <div class="flex gap-3">
              <UButton label="ยกเลิก" color="neutral" variant="soft" size="xl" block
                class="rounded-2xl py-4 flex-1 font-bold" @click="absenceModalOpen = false" />
              <UButton label="บันทึกและหาช่วงชดเชย" color="primary" size="xl" block
                class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold" :loading="saving"
                @click="saveAbsenceAndFindSlots" />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal แสดงช่วงว่างที่แนะนำ -->
    <!-- Modal แสดงช่วงว่างที่แนะนำ -->
    <UModal v-model:open="slotsModalOpen"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden', width: 'max-w-4xl' }">
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div class="flex items-center gap-4 mb-8">
              <div
                class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                <UIcon name="i-heroicons-light-bulb" class="text-2xl text-blue-500" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">ช่วงว่างที่แนะนำสำหรับสอนชดเชย</h3>
                <p class="text-slate-400 text-sm">ระบบค้นหาช่วงเวลาที่อาจารย์และนักศึกษาว่างตรงกัน</p>
              </div>
            </div>

            <div v-if="loadingSlots"
              class="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
              <UIcon name="i-heroicons-arrow-path" class="animate-spin w-10 h-10 text-blue-500 mx-auto mb-4" />
              <p class="text-slate-400 font-medium">กำลังค้นหาช่วงว่างที่เหมาะสม...</p>
            </div>

            <div v-else-if="availableSlots.length === 0"
              class="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
              <div
                class="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-700">
                <UIcon name="i-heroicons-calendar-days" class="text-3xl text-slate-500" />
              </div>
              <p class="text-slate-400 font-bold mb-1">ไม่พบช่วงว่างที่เหมาะสม</p>
              <p class="text-slate-500 text-sm">ลองเลื่อนวันหรือปรับตารางสอนหลักเพื่อให้มีช่วงว่างเพิ่มขึ้น</p>
            </div>

            <div v-else class="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              <div v-for="(slot, index) in availableSlots" :key="index"
                class="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 hover:border-blue-500/50 transition-all group shadow-sm hover:shadow-blue-500/5">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 mb-3">
                      <span
                        class="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/10 flex-shrink-0">
                        {{ slot.dayOfWeek }}
                      </span>
                      <span class="text-xl font-black text-white truncate">
                        {{ formatDateThai(slot.date) }}
                      </span>
                    </div>

                    <div class="flex items-center gap-4 text-slate-300">
                      <div class="flex items-center gap-1.5 overflow-hidden">
                        <UIcon name="i-heroicons-clock" class="text-slate-500 flex-shrink-0" />
                        <span class="font-bold whitespace-nowrap">{{ slot.timeStart }} - {{ slot.timeEnd }}</span>
                        <span class="text-xs text-slate-500 whitespace-nowrap">({{ slot.duration }} ชม.)</span>
                      </div>
                    </div>

                    <!-- แสดงรายการวิชาทั้งหมด (ถ้ามี) -->
                    <div v-if="slot.classes && slot.classes.length > 0"
                      class="mt-4 pt-3 border-t border-slate-700/50 space-y-3 overflow-hidden">
                      <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">สถานะความพร้อม:</p>

                      <div
                        class="flex flex-col gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 overflow-hidden">
                        <div class="flex items-center gap-2 text-green-400 text-sm font-medium">
                          <UIcon name="i-heroicons-check-circle" class="w-5 h-5 flex-shrink-0" />
                          <span class="truncate">อาจารย์และนักศึกษาทุกกลุ่มว่างตรงกัน</span>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-1">
                          <div v-for="cls in slot.classes" :key="cls.subjectId"
                            class="flex items-center gap-1.5 bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-700/80 text-xs text-slate-300 max-w-full overflow-hidden">
                            <UIcon name="i-heroicons-book-open" class="text-blue-400 flex-shrink-0" />
                            <span class="truncate max-w-[100px]">{{ cls.subjectName }}</span>
                            <span v-if="cls.sectionName" class="text-slate-500 text-[10px] truncate">({{ cls.sectionName
                            }})</span>

                            <UIcon name="i-heroicons-map-pin" class="text-green-400 ml-1 flex-shrink-0" />
                            <span class="text-green-400 font-medium truncate">
                              {{rooms?.find(r => Number(r.id_room) === Number(cls.roomId))?.room_name || 'ไม่ระบุห้อง'
                              }} (ห้องว่าง)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <UButton label="เลือกช่วงเวลานี้" color="primary" size="lg"
                    class="rounded-xl font-bold px-6 w-full sm:w-auto" @click="confirmMakeupClass(slot)" />
                </div>
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-10">
            <UButton label="ปิดหน้าต่าง" color="neutral" variant="soft" size="xl" block
              class="rounded-2xl py-4 font-bold" @click="slotsModalOpen = false" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal ยืนยันการจัดสอนชดเชย -->
    <!-- Modal ยืนยันการจัดสอนชดเชย -->
    <UModal v-model:open="confirmMakeupModalOpen"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div class="flex items-center gap-4 mb-8">
              <div
                class="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                <UIcon name="i-heroicons-check-badge" class="text-2xl text-green-500" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">ยืนยันการจัดสอนชดเชย</h3>
                <p class="text-slate-400 text-sm">ตรวจสอบความถูกต้องและระบุห้องเรียน</p>
              </div>
            </div>

            <div v-if="selectedSlot" class="space-y-6">
              <div class="bg-slate-800/80 border border-slate-700/50 p-6 rounded-2xl shadow-inner group">
                <div class="flex flex-col gap-4">
                  <div class="flex items-center gap-6">
                    <div class="flex flex-col">
                      <span
                        class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">วันที่สอนชดเชย</span>
                      <span class="text-xl font-black text-white flex items-center gap-2">
                        {{ formatDateThai(selectedSlot.date) }}
                        <span class="text-sm font-medium text-slate-400">({{ selectedSlot.dayOfWeek }})</span>
                      </span>
                    </div>
                    <div class="w-px h-10 bg-slate-700 mx-2"></div>
                    <div class="flex flex-col">
                      <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ช่วงเวลา</span>
                      <span class="text-xl font-black text-white">{{ selectedSlot.timeStart }} - {{ selectedSlot.timeEnd
                      }}</span>
                    </div>
                  </div>

                  <div v-if="selectedSlot.classes && selectedSlot.classes.length > 0"
                    class="pt-4 border-t border-slate-700/50">
                    <span
                      class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">วิชาที่สอน</span>
                    <div class="flex flex-wrap gap-2">
                      <span v-for="cls in selectedSlot.classes" :key="cls.subjectId"
                        class="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-sm font-bold border border-blue-500/10">
                        {{ cls.subjectName }}
                      </span>
                    </div>
                  </div>
                  <div v-else-if="selectedSlot.missedClass" class="pt-4 border-t border-slate-700/50">
                    <span
                      class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">วิชาที่สอน</span>
                    <span class="text-lg font-bold text-blue-400">{{ selectedSlot.missedClass }}</span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-6">
                <UFormField label="หมายเหตุ (ถ้ามี)" :ui="{ label: 'text-white font-bold mb-2 ml-1' }">
                  <UTextarea v-model="makeupForm.notes" placeholder="ระบุรายละเอียดเพิ่มเติม..." :rows="2" size="xl"
                    class="rounded-xl" :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                </UFormField>
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-10">
            <div class="flex gap-3">
              <UButton label="ย้อนกลับ" color="neutral" variant="soft" size="xl" block
                class="rounded-2xl py-4 flex-1 font-bold" @click="confirmMakeupModalOpen = false" />
              <UButton label="ยืนยันการจัดสอน" color="primary" size="xl" block
                class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold" :loading="saving"
                @click="saveMakeupClass" />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal รายละเอียด Event -->
    <!-- Modal รายละเอียด Event -->
    <UModal v-model:open="viewEventModalOpen"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div v-if="selectedEvent" class="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div class="flex items-center gap-4 mb-8">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center border"
                :class="getEventTypeClass(selectedEvent.extendedProps?.eventType, true)">
                <UIcon :name="getEventTypeIcon(selectedEvent.extendedProps?.eventType)" class="text-2xl" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white line-clamp-1">{{ selectedEvent.title }}</h3>
                <p class="text-slate-400 text-sm">{{ getEventTypeLabel(selectedEvent.extendedProps?.eventType) }}</p>
              </div>
            </div>

            <div class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                  <span
                    class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">วัน/เวลา</span>
                  <p class="text-white font-bold">{{ formatDateThai(selectedEvent.start) }}</p>
                  <p class="text-slate-400 text-sm mt-0.5">
                    {{ dayjs(selectedEvent.start).format('HH:mm') }}
                    <template v-if="selectedEvent.end"> - {{ dayjs(selectedEvent.end).format('HH:mm') }}</template>
                  </p>
                </div>

                <div v-if="selectedEvent.extendedProps?.teacherName"
                  class="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                  <span
                    class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">อาจารย์ผู้สอน</span>
                  <p class="text-white font-bold">{{ selectedEvent.extendedProps.teacherName }}</p>
                  <p class="text-slate-400 text-xs mt-0.5">รหัส: {{ selectedEvent.extendedProps.teacherId }}</p>
                </div>
              </div>

              <div v-if="selectedEvent.extendedProps?.description"
                class="bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
                <span
                  class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">รายละเอียด</span>
                <p class="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{{
                  selectedEvent.extendedProps.description }}
                </p>
              </div>
            </div>
          </div>
          <div v-if="selectedEvent"
            class="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-10 w-full">
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div class="flex gap-3 w-full sm:w-auto">
                <!-- ปุ่มลบ: แสดงถ้าไม่ใช่ hardcoded holiday หรือถ้ามี ID (วันหยุดที่เพิ่มเอง) -->
                <UButton v-if="selectedEvent?.id && selectedEvent.extendedProps?.eventType !== 'normal'"
                  label="ลบรายการ" color="error" variant="soft" icon="i-lucide-trash" size="lg"
                  class="rounded-xl flex-1 font-bold" @click="confirmDeleteEvent" />

                <!-- ปุ่มแก้ไข: แสดงเฉพาะวันหยุดที่เพิ่มเอง (มี ID และเป็น holiday) -->
                <UButton v-if="selectedEvent?.id && selectedEvent.extendedProps?.eventType === 'holiday'" label="แก้ไข"
                  color="warning" variant="soft" icon="i-lucide-edit" size="lg" class="rounded-xl flex-1 font-bold"
                  @click="editHoliday" />

                <!-- ปุ่มจัดสอนชดเชย: สำหรับ teacher_absence ที่ถูกเพิ่มเข้ามาแต่ยังเลือกเวลาไม่สำเร็จ -->
                <UButton v-if="selectedEvent?.id && selectedEvent.extendedProps?.eventType === 'teacher_absence'"
                  label="จัดชดเชย" color="primary" variant="soft" icon="i-heroicons-calendar-days" size="lg"
                  class="rounded-xl flex-1 font-bold" @click="scheduleMakeupForAbsence" />

                <!-- ปุ่มเปลี่ยนเวลา (Reschedule): สำหรับ makeup_class -->
                <UButton v-if="selectedEvent?.id && selectedEvent.extendedProps?.eventType === 'makeup_class'"
                  label="เปลี่ยนเวลา" color="warning" variant="soft" icon="i-heroicons-clock" size="lg"
                  class="rounded-xl flex-1 font-bold" @click="confirmRescheduleMakeupClass" />
              </div>

              <UButton label="ปิดหน้าต่าง" color="neutral" variant="outline" size="lg"
                class="rounded-xl w-full sm:w-32 font-bold" @click="viewEventModalOpen = false" />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal ยืนยันการดำเนินการ -->
    <UModal v-model:open="confirmModalOpen"
      :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-md' }">
      <template #content>
        <div class="flex flex-col max-h-[85vh]">
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1 text-center">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              :class="confirmModal.color === 'error' ? 'bg-red-500/10 border border-red-500/20' : 'bg-warning-500/10 border border-warning-500/20'">
              <UIcon :name="confirmModal.icon" class="text-3xl"
                :class="confirmModal.color === 'error' ? 'text-red-500' : 'text-warning-500'" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-2">{{ confirmModal.title }}</h3>
            <p class="text-slate-400 mb-2">{{ confirmModal.message }}</p>
          </div>
          <div
            class="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-10 w-full text-center">
            <div class="flex gap-3">
              <UButton label="ยกเลิก" color="neutral" variant="soft" size="lg" block class="rounded-xl flex-1 font-bold"
                @click="confirmModalOpen = false" />
              <UButton :label="confirmModal.confirmText" :color="confirmModal.color" size="lg" block
                class="rounded-xl flex-1 font-bold" @click="executeConfirm" :loading="confirmModal.loading" />
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import thLocale from '@fullcalendar/core/locales/th'
import dayjs from 'dayjs'
import { onMounted } from 'vue'

const props = defineProps({
  teachers: {
    type: Array,
    default: () => []
  }
})

const calendarRef = ref(null)
const toast = useToast()

// Modals
const holidayModalOpen = ref(false)
const absenceModalOpen = ref(false)
const slotsModalOpen = ref(false)
const confirmMakeupModalOpen = ref(false)
const viewEventModalOpen = ref(false)
const confirmModalOpen = ref(false)

const confirmModal = ref({
  title: '',
  message: '',
  confirmText: 'ยืนยัน',
  color: 'primary',
  icon: 'i-heroicons-exclamation-triangle',
  action: null,
  loading: false
})

const openConfirmModal = (options) => {
  confirmModal.value = { ...confirmModal.value, ...options, loading: false }
  confirmModalOpen.value = true
}

const executeConfirm = async () => {
  if (confirmModal.value.action) {
    confirmModal.value.loading = true
    await confirmModal.value.action()
    confirmModal.value.loading = false
  }
  confirmModalOpen.value = false
}

const saving = ref(false)
const loadingSlots = ref(false)
const isEditingHoliday = ref(false)
const editingHolidayId = ref(null)

// Forms
const holidayForm = ref({
  title: '',
  date: '',
  description: ''
})

const absenceForm = ref({
  teacherId: null,
  date: '',
  term: null,
  reason: ''
})

const missedClasses = ref([])
const loadingMissedClasses = ref(false)

const selectedClassesCount = computed(() =>
  missedClasses.value.filter(c => c.selected).length
)

const totalDuration = computed(() =>
  missedClasses.value.filter(c => c.selected)
    .reduce((sum, c) => sum + c.duration, 0)
)

// โหลดรายการวิชาเมื่อข้อมูลในฟอร์มเปลี่ยน (ข้ามเมื่ออยู่ใน reschedule mode)
watch(
  () => [absenceForm.value.teacherId, absenceForm.value.date, absenceForm.value.term],
  () => {
    if (!isRescheduling.value) {
      loadMissedClasses()
    }
  }
)

const makeupForm = ref({
  roomId: null,
  notes: ''
})

// ช่วงเวลาที่แสดงในปฏิทินปัจจุบัน
const currentRange = ref({
  start: dayjs().startOf('month').format('YYYY-MM-DD'),
  end: dayjs().endOf('month').format('YYYY-MM-DD')
})

onMounted(async () => {
  // รีเฟรชข้อมูลเมื่อคอมโพเนนต์ถูกเมาท์ใหม่ (เพื่อป้องกันปัญหา cache เมื่อย้อนกลับมาจากหน้าอื่น)
  await refreshEvents()

  // ตรวจสอบว่าปฏิทินเรนเดอร์ถูกต้อง
  if (calendarRef.value) {
    const api = calendarRef.value.getApi()
    api.render()
  }
})

watch(currentRange, () => {
  refreshEvents()
}, { deep: true })

// Data
const events = ref([])

const refreshEvents = async () => {
  try {
    const data = await $fetch('/api/calendar-events', {
      query: currentRange.value
    })
    events.value = data || []
  } catch (error) {
    console.error('Error fetching calendar events:', error)
  }
}

const { data: terms } = await useFetch('/api/terms')
const { data: rooms } = await useFetch('/api/rooms')
const { data: allSubjects } = await useFetch('/api/Subjects')

const availableSlots = ref([])
const selectedSlot = ref(null)
const selectedEvent = ref(null)

// Options
const teacherOptions = computed(() => {
  return props.teachers.map(t => ({
    label: t.name,
    value: t.id_teacher
  }))
})

const termOptions = computed(() => {
  if (!terms.value || terms.value.length === 0) return []
  return terms.value.map(t => ({
    label: `เทอม ${t.term}/${t.academic_year}`,
    value: `${t.term}/${t.academic_year}`
  }))
})

// เมื่อเปิด modal อาจารย์ติดราชการ ให้เลือกเทอมแรกถ้ามี
watch(absenceModalOpen, (isOpen) => {
  if (isOpen && terms.value && terms.value.length > 0) {
    absenceForm.value.term = `${terms.value[0].term}/${terms.value[0].academic_year}`
  }
})

const roomOptions = computed(() => {
  if (!rooms.value) return [{ label: 'ไม่ระบุห้องเรียน', value: null }]
  const opts = rooms.value.map(r => ({
    label: `${r.room_name}${r.building ? ` (${r.building})` : ''}`,
    value: r.id_room
  }))
  return [{ label: 'ไม่ระบุห้องเรียน', value: null }, ...opts]
})

// Filters
const filter = ref({
  teacherId: 'all',
  type: 'all'
})

const filteredEvents = computed(() => {
  if (!events.value) return []

  return events.value.filter(event => {
    // กรองตามอาจารย์
    const matchTeacher = filter.value.teacherId === 'all' ||
      event.extendedProps?.teacherId == filter.value.teacherId // ใช้ == เผื่อ type mismatch

    // กรองตามประเภท
    const matchType = filter.value.type === 'all' ||
      event.extendedProps?.eventType === filter.value.type

    return matchTeacher && matchType
  })
})

// Calendar Options
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  locale: thLocale,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,listWeek'
  },
  buttonText: {
    today: 'วันนี้',
    month: 'เดือน',
    week: 'สัปดาห์',
    list: 'รายการ'
  },
  height: 'auto',
  editable: false,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  events: filteredEvents.value,
  eventClick: handleEventClick,
  datesSet: (info) => {
    // อัปเดตช่วงเวลาเมื่อมีการเปลี่ยนมุมมอง (เดือน/สัปดาห์/เลื่อน)
    currentRange.value = {
      start: info.startStr.split('T')[0],
      end: info.endStr.split('T')[0]
    }
  },
  viewDidMount: (info) => {
    // แก้ไขสีพื้นหลังของ header หลังจาก calendar render เสร็จ
    setTimeout(() => {
      const headerCells = document.querySelectorAll('.fc-col-header-cell')
      headerCells.forEach((cell) => {
        cell.style.backgroundColor = '#1e293b' // slate-800
        cell.style.borderColor = '#475569' // slate-600
      })
    }, 100)
  }
}))

// เปิด Modal วันหยุด
const openHolidayModal = () => {
  isEditingHoliday.value = false
  editingHolidayId.value = null
  holidayForm.value = {
    title: '',
    date: '',
    description: ''
  }
  holidayModalOpen.value = true
}

// แก้ไขวันหยุด
const editHoliday = () => {
  if (!selectedEvent.value) return

  isEditingHoliday.value = true
  editingHolidayId.value = selectedEvent.value.id
  holidayForm.value = {
    title: selectedEvent.value.title,
    date: selectedEvent.value.startStr.split('T')[0],
    description: selectedEvent.value.extendedProps?.description || ''
  }

  viewEventModalOpen.value = false
  holidayModalOpen.value = true
}

// โหลดรายการวิชาที่ติดราชการ
const loadMissedClasses = async () => {
  if (!absenceForm.value.teacherId || !absenceForm.value.date || !absenceForm.value.term) {
    missedClasses.value = []
    return
  }

  loadingMissedClasses.value = true
  try {
    const classes = await $fetch('/api/teacher-classes-on-date', {
      query: {
        teacher_id: absenceForm.value.teacherId,
        date: absenceForm.value.date,
        term: absenceForm.value.term
      }
    })

    missedClasses.value = classes.map(cls => ({
      ...cls,
      selected: !cls.hasMakeup // เลือกทั้งหมดโดย default ยกเว้นอันที่จัดแล้ว
    }))
  } catch (error) {
    console.error('Error loading missed classes:', error)
    missedClasses.value = []
  } finally {
    loadingMissedClasses.value = false
  }
}

// เปิด Modal อาจารย์ติดราชการ
const openAbsenceModal = () => {
  absenceForm.value = {
    teacherId: null,
    date: '',
    term: null,
    reason: ''
  }
  missedClasses.value = []
  absenceModalOpen.value = true
}

// บันทึกวันหยุด (สร้างใหม่ หรือ อัปเดต)
const saveHoliday = async () => {
  if (!holidayForm.value.title || !holidayForm.value.date) {
    toast.add({
      title: 'ข้อมูลไม่ครบ',
      description: 'กรุณากรอกชื่อและวันที่',
      color: 'error'
    })
    return
  }

  saving.value = true

  try {
    const endpoint = isEditingHoliday.value
      ? `/api/calendar-events/${editingHolidayId.value}`
      : '/api/calendar-events'

    const method = isEditingHoliday.value ? 'PUT' : 'POST'

    await $fetch(endpoint, {
      method,
      body: {
        title: holidayForm.value.title,
        start: holidayForm.value.date,
        end: holidayForm.value.date,
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        textColor: '#ffffff',
        extendedProps: {
          eventType: 'holiday',
          description: holidayForm.value.description
        }
      }
    })

    toast.add({
      title: 'สำเร็จ',
      description: isEditingHoliday.value ? 'อัปเดตวันหยุดเรียบร้อยแล้ว' : 'บันทึกวันหยุดเรียบร้อยแล้ว',
      color: 'primary'
    })

    await refreshEvents()
    holidayModalOpen.value = false
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถบันทึกได้',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

// บันทึกอาจารย์ติดราชการและหาช่วงว่าง
const saveAbsenceAndFindSlots = async () => {
  if (!absenceForm.value.teacherId || !absenceForm.value.date || !absenceForm.value.term) {
    toast.add({
      title: 'ข้อมูลไม่ครบ',
      description: 'กรุณากรอกข้อมูลให้ครบ',
      color: 'error'
    })
    return
  }

  // เช็คว่ามีวิชาที่เลือกหรือไม่
  const selectedClasses = missedClasses.value.filter(c => c.selected)
  if (missedClasses.value.length > 0 && selectedClasses.length === 0) {
    toast.add({
      title: 'กรุณาเลือกวิชา',
      description: 'กรุณาเลือกอย่างน้อย 1 วิชาที่ต้องการจัดชดเชย',
      color: 'error'
    })
    return
  }

  saving.value = true

  try {
    // 0. เราสามารถบันทึก event ติดราชการไปเลยได้ เพราะเราต้องการ record ว่าวันนี่หยุด
    const existingAbsence = events.value.find(e =>
      e.extendedProps?.eventType === 'teacher_absence' &&
      e.extendedProps?.teacherId === absenceForm.value.teacherId &&
      e.start && (typeof e.start === 'string' ? e.start.split('T')[0] : dayjs(e.start).format('YYYY-MM-DD')) === absenceForm.value.date
    )

    if (!existingAbsence) {
      const teacher = props.teachers.find(t => t.id_teacher === absenceForm.value.teacherId)
      await $fetch('/api/calendar-events', {
        method: 'POST',
        body: {
          title: `${teacher?.name} - ติดราชการ`,
          start: absenceForm.value.date,
          end: absenceForm.value.date,
          backgroundColor: '#ef4444',
          borderColor: '#ef4444',
          textColor: '#ffffff',
          extendedProps: {
            eventType: 'teacher_absence',
            teacherId: absenceForm.value.teacherId,
            teacherName: teacher?.name,
            term: absenceForm.value.term, // เก็บ term เพื่อใช้อ้างอิงตอนจัดชดเชยทีหลัง
            description: absenceForm.value.reason
          }
        }
      })
      await refreshEvents()
    }

    // 1. ค้นหาช่วงว่างก่อน (ยังไม่บันทึก event ติดราชการ)
    loadingSlots.value = true
    slotsModalOpen.value = true

    // เช็คคลาสสอนชดเชยที่ทับซ้อน (Conflict Resolution) เพื่อนำวิชามาจัดใหม่พร้อมกัน
    const conflictingEvents = events.value.filter(e => {
      if (e.extendedProps?.eventType !== 'makeup_class') return false
      if (Number(e.extendedProps?.teacherId) !== Number(absenceForm.value.teacherId)) return false
      const eventDate = e.start
        ? (typeof e.start === 'string' ? e.start.split('T')[0] : dayjs(e.start).format('YYYY-MM-DD'))
        : null
      return eventDate === absenceForm.value.date
    })

    let rescheduledClasses = []
    for (const conflict of conflictingEvents) {
      try {
        const rawIds = conflict.extendedProps?.makeupClassIds || conflict.extendedProps?.makeup_class_ids
        if (rawIds) {
          let makeupIds = typeof rawIds === 'string'
            ? JSON.parse(rawIds)
            : rawIds

          if (Array.isArray(makeupIds)) {
            // Fetch the full records to get originalDate, duration, etc.
            for (const mid of makeupIds) {
              const makeupRecord = await $fetch(`/api/makeup-classes/${mid}`).catch(() => null)
              if (makeupRecord) {
                const startDateTime = dayjs(`${makeupRecord.makeup_date}T${makeupRecord.makeup_time_start}`)
                const endDateTime = dayjs(`${makeupRecord.makeup_date}T${makeupRecord.makeup_time_end}`)
                const duration = endDateTime.diff(startDateTime, 'hour')

                rescheduledClasses.push({
                  makeupId: makeupRecord.id_makeup,
                  subjectId: makeupRecord.subject_id,
                  sectionId: makeupRecord.section_id,
                  duration: duration > 0 ? duration : 1, // Default to 1 if parsing fails
                  subjectName: makeupRecord.name_subject,
                  originalDate: makeupRecord.original_date
                })
              }
            }
          }
        }
      } catch (e) {
        console.error('Error parsing conflict classes:', e)
      }
    }

    const queryParams = {
      teacher_id: absenceForm.value.teacherId,
      missed_date: absenceForm.value.date,
      term: absenceForm.value.term
    }

    // Phase 1: if conflict exists → save pendingNewAbsence (Day2 data), reschedule old makeup first
    if (conflictingEvents.length > 0 && rescheduledClasses.length > 0) {
      // Store Day2 data before overriding
      pendingNewAbsence.value = {
        form: { ...absenceForm.value },
        classes: selectedClasses.map(c => ({
          subjectId: c.subjectId,
          sectionId: c.sectionId,
          duration: c.duration,
          subjectName: c.subjectName
        }))
      }

      // Mark old makeup as pending
      for (const cls of rescheduledClasses) {
        if (cls.makeupId) {
          await $fetch(`/api/makeup-classes/${cls.makeupId}`, {
            method: 'PUT',
            body: { status: 'pending', makeup_date: null, makeup_time_start: null, makeup_time_end: null }
          })
        }
      }

      toast.add({
        title: 'ลำดับการจัดชดเชย',
        description: 'รายการชดเชยเดิมถูกย้ายออกเป็นค้าง เลือกเวลาชดเชยใหม่สำหรับวิชานี้ก่อน',
        color: 'warning',
        timeout: 8000
      })

      await refreshEvents()

      // Switch context to reschedule the old makeup (Day1 subjects)
      isRescheduling.value = true
      absenceForm.value = {
        teacherId: absenceForm.value.teacherId,
        date: rescheduledClasses[0].originalDate,
        term: absenceForm.value.term,
        reason: 'การจัดชดเชยใหม่เนื่องจากติดราชการซ้อน'
      }
      // Manually set missedClasses to old makeup's classes (watch is guarded by isRescheduling)
      missedClasses.value = rescheduledClasses.map(c => ({ ...c, selected: true }))

      // Find slots for the old makeup (Day1 subjects)
      const queryParamsPhase1 = {
        teacher_id: absenceForm.value.teacherId,
        missed_date: rescheduledClasses[0].originalDate,
        term: absenceForm.value.term,
        classes: JSON.stringify(rescheduledClasses.map(c => ({
          subjectId: c.subjectId,
          sectionId: c.sectionId,
          duration: c.duration,
          subjectName: c.subjectName
        })))
      }

      const slotsPhase1 = await $fetch('/api/find-slots', { query: queryParamsPhase1 })
      availableSlots.value = slotsPhase1.suggestions || []
      loadingSlots.value = false
      absenceModalOpen.value = false
      toast.add({
        title: 'เลือกเวลาชดเชยสำหรับวิชาเดิม',
        description: 'กรุณาเลือกวัน/เวลาชดเชยใหม่สำหรับวิชาเดิม',
        color: 'primary'
      })
      return
    }

    // Normal flow (no conflict)
    const allClassesToSchedule = selectedClasses.map(c => ({
      subjectId: c.subjectId,
      sectionId: c.sectionId,
      duration: c.duration,
      subjectName: c.subjectName
    }))

    queryParams.classes = JSON.stringify(allClassesToSchedule)

    if (allClassesToSchedule.length === 0) {
      toast.add({
        title: 'ไม่สามารถบันทึกได้',
        description: 'ไม่พบวิชาที่สอนในวันที่เลือก กรุณาเลือกวันที่หรือเทอมให้ถูกต้อง',
        color: 'error'
      })
      saving.value = false
      return
    }

    const slotsData = await $fetch('/api/find-slots', {
      query: queryParams
    })

    const suggestions = slotsData.suggestions || []
    availableSlots.value = suggestions
    loadingSlots.value = false

    if (suggestions.length > 0) {
      await refreshEvents()
      absenceModalOpen.value = false
      toast.add({
        title: 'พบช่วงเวลายืดหยุ่น',
        description: 'กรุณาเลือกช่วงเวลาที่คุณต้องการใช้สอนชดเชย',
        color: 'primary'
      })
    } else {
      // 3. ไม่พบช่วงว่าง -> แจ้งเตือน และไม่บันทึกอะไร
      slotsModalOpen.value = false // ปิด modal ค้นหา
      const totalHours = allClassesToSchedule.reduce((sum, c) => sum + c.duration, 0)
      if (totalHours > 6) {
        toast.add({
          title: 'ช่วงเวลาชดเชยรวมยาวเกินไป',
          description: `รวม ${totalHours} ชม. ทำให้หาช่วงว่างยาวต่อเนื่องได้ยาก กรุณาเลือกวิชาให้น้อยลงเพื่อแยกจัดชดเชย`,
          color: 'warning',
          timeout: 8000
        })
      } else {
        toast.add({
          title: 'ไม่พบช่วงเวลาว่าง',
          description: 'ไม่สามารถจัดสอนชดเชยได้ในขณะนี้ กรุณาตรวจสอบความพร้อมของอาจารย์และห้องเรียน',
          color: 'warning'
        })
      }
    }
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถประมวลผลได้',
      color: 'error'
    })
    loadingSlots.value = false
    slotsModalOpen.value = false
  } finally {
    saving.value = false
  }
}

// ยืนยันเลือกช่วงสอนชดเชย
const confirmMakeupClass = (slot) => {
  selectedSlot.value = slot

  makeupForm.value = {
    notes: ''
  }
  slotsModalOpen.value = false
  confirmMakeupModalOpen.value = true
}

// บันทึกคลาสชดเชย
const saveMakeupClass = async () => {
  if (!selectedSlot.value) {
    toast.add({
      title: 'ข้อมูลไม่ครบ',
      description: 'กรุณาเลือกช่วงเวลา',
      color: 'error'
    })
    return
  }

  saving.value = true

  try {
    const teacher = props.teachers.find(t => t.id_teacher === absenceForm.value.teacherId)

    // 0. บันทึก "อาจารย์ติดราชการ" (สีแดง) ถ้ายังไม่มี และไม่ใช่การ reschedule (เพราะ reschedule มีตัวเดิมอยู่แล้ว)
    if (!isRescheduling.value) {
      const existingAbsence = events.value.find(e =>
        e.extendedProps?.eventType === 'teacher_absence' &&
        e.extendedProps?.teacherId === absenceForm.value.teacherId &&
        e.start && (typeof e.start === 'string' ? e.start.split('T')[0] : dayjs(e.start).format('YYYY-MM-DD')) === absenceForm.value.date
      )

      if (!existingAbsence) {
        await $fetch('/api/calendar-events', {
          method: 'POST',
          body: {
            title: `${teacher?.name} - ติดราชการ`,
            start: absenceForm.value.date,
            end: absenceForm.value.date,
            backgroundColor: '#ef4444',
            borderColor: '#ef4444',
            textColor: '#ffffff',
            extendedProps: {
              eventType: 'teacher_absence',
              teacherId: absenceForm.value.teacherId,
              teacherName: teacher?.name,
              description: absenceForm.value.reason
            }
          }
        })
      }
    }

    // ตรวจสอบว่ามีหลายวิชาหรือไม่
    const classes = selectedSlot.value.classes || []
    const createdIds = []

    // 1. บันทึกข้อมูลลง makeup-classes table (บันทึกแยกรายวิชาเสมอใน DB)
    if (classes.length > 0) {
      let currentTime = selectedSlot.value.timeStart
      for (const cls of classes) {
        // ถ้าเวลาเริ่มคือ 12:00 ให้กระโดดไป 13:00
        if (currentTime === '12:00') currentTime = '13:00'

        let endTime = addHours(currentTime, cls.duration)

        // ถ้าเวลาจบคร่อม 12:00 (หมายถึงช่วง 12:00-13:00) ให้บวกเพิ่มอีก 1 ชม. เพื่อข้ามพักเที่ยง
        // เช่น เริ่ม 11:00 เรียน 2 ชม. ปกติจบ 13:00 แต่ต้องจบ 14:00 เพราะพัก 12:00-13:00
        const startHour = parseInt(currentTime.split(':')[0])
        const endHour = parseInt(endTime.split(':')[0])
        if (startHour < 12 && endHour > 12) {
          endTime = addHours(endTime, 1)
        }

        const res = await $fetch('/api/makeup-classes', {
          method: 'POST',
          body: {
            original_date: selectedSlot.value.missedDate || absenceForm.value.date,
            original_time_slot: '',
            makeup_date: selectedSlot.value.date,
            makeup_time_start: currentTime,
            makeup_time_end: endTime,
            teacher_id: absenceForm.value.teacherId,
            section_id: cls.sectionId,
            subject_id: cls.subjectId,
            room_id: null,
            status: 'confirmed',
            notes: makeupForm.value.notes
          }
        })
        createdIds.push(res.id_makeup)
        currentTime = endTime
      }
    } else {
      const res = await $fetch('/api/makeup-classes', {
        method: 'POST',
        body: {
          original_date: selectedSlot.value.missedDate || absenceForm.value.date,
          original_time_slot: '',
          makeup_date: selectedSlot.value.date,
          makeup_time_start: selectedSlot.value.timeStart,
          makeup_time_end: selectedSlot.value.timeEnd,
          teacher_id: absenceForm.value.teacherId,
          room_id: null,
          status: 'confirmed',
          notes: makeupForm.value.notes
        }
      })
      createdIds.push(res.id_makeup)
    }

    // 2. จัดการกับ Calendar Event (แยกเป็น 1 Event ต่อ 1 วิชา)
    if (classes.length > 0) {
      let currentTime = selectedSlot.value.timeStart
      for (let i = 0; i < classes.length; i++) {
        const cls = classes[i]
        const idMakeup = createdIds[i]

        if (currentTime === '12:00') currentTime = '13:00'

        let endTime = addHours(currentTime, cls.duration)
        const startHour = parseInt(currentTime.split(':')[0])
        const endHour = parseInt(endTime.split(':')[0])
        if (startHour < 12 && endHour > 12) {
          endTime = addHours(endTime, 1)
        }

        await $fetch('/api/calendar-events', {
          method: 'POST',
          body: {
            title: `สอนชดเชย - ${teacher?.name} (${cls.subjectName})`,
            start: `${selectedSlot.value.date}T${currentTime}:00`,
            end: `${selectedSlot.value.date}T${endTime}:00`,
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            extendedProps: {
              eventType: 'makeup_class',
              teacherId: absenceForm.value.teacherId,
              teacherName: teacher?.name,
              originalDate: selectedSlot.value.missedDate || absenceForm.value.date,
              term: absenceForm.value.term,
              classes: JSON.stringify([cls]),
              makeupClassIds: JSON.stringify([idMakeup]),
              description: `วิชา: ${cls.subjectName}${makeupForm.value.notes ? '\n' + makeupForm.value.notes : ''}`
            }
          }
        })

        currentTime = endTime
      }
    } else {
      // สร้างใหม่กรณีไม่มีวิชา (แค่จองห้อง/เวลาเปล่าๆ)
      await $fetch('/api/calendar-events', {
        method: 'POST',
        body: {
          title: `สอนชดเชย - ${teacher?.name}`,
          start: `${selectedSlot.value.date}T${selectedSlot.value.timeStart}:00`,
          end: `${selectedSlot.value.date}T${selectedSlot.value.timeEnd}:00`,
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          extendedProps: {
            eventType: 'makeup_class',
            teacherId: absenceForm.value.teacherId,
            teacherName: teacher?.name,
            originalDate: selectedSlot.value.missedDate || absenceForm.value.date,
            term: absenceForm.value.term,
            classes: JSON.stringify([]),
            makeupClassIds: JSON.stringify(createdIds),
            description: `${makeupForm.value.notes ? makeupForm.value.notes : ''}`
          }
        }
      })
    }

    toast.add({
      title: 'สำเร็จ',
      description: 'จัดสอนชดเชยเรียบร้อยแล้ว',
      color: 'primary'
    })

    await refreshEvents()
    confirmMakeupModalOpen.value = false
    selectedSlot.value = null

    // Reset rescheduling state
    const wasRescheduling = isRescheduling.value
    isRescheduling.value = false

    // ถ้าเพิ่งเสร็จการอ้างอิงโดย conflict resolution และมีการติดราชการใหม่ค้างอยู่ ให้เริ่มจัดชดเชยให้กับการติดราชการใหม่ทันที
    if (wasRescheduling && pendingNewAbsence.value) {
      const pending = pendingNewAbsence.value
      pendingNewAbsence.value = null

      toast.add({
        title: 'จัดชดเชยเรียบร้อยแล้ว',
        description: 'กำลังหาเวลาชดเชยสำหรับวันติดราชการใหม่...',
        color: 'primary'
      })

      // ตั้งค่า form เป็นของการติดราชการใหม่
      absenceForm.value = pending.form
      missedClasses.value = pending.classes.map(c => ({ ...c, selected: true }))

      // เริ่มจัดชดเชยให้กับการติดราชการใหม่
      await saveAbsenceAndFindSlots()
    }
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถบันทึกได้',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

// Helper for Resume Scheduling Makeup Class
const scheduleMakeupForAbsence = () => {
  if (!selectedEvent.value) return
  const props = selectedEvent.value.extendedProps
  if (!props || props.eventType !== 'teacher_absence') return

  absenceForm.value = {
    teacherId: Number(props.teacherId),
    date: dayjs(selectedEvent.value.start).format('YYYY-MM-DD'),
    term: props.term || termOptions.value[0]?.value || '',
    reason: props.description || ''
  }

  viewEventModalOpen.value = false
  absenceModalOpen.value = true // Open absence modal so they can confirm missedClasses and proceed
}

// Reschedule Makeup Class
const isRescheduling = ref(false)
const pendingNewAbsence = ref(null) // เก็บข้อมูลการติดราชการใหม่ที่รอจัดชดเชยหลังจากแก้ไขการชนเสร็จ

const confirmRescheduleMakeupClass = () => {
  if (!selectedEvent.value) return
  const props = selectedEvent.value.extendedProps
  if (!props || props.eventType !== 'makeup_class') return

  openConfirmModal({
    title: 'เปลี่ยนเวลาชดเชย?',
    message: 'เวลาชดเชยเดิมจะถูกยกเลิกและต้องจัดตารางใหม่ คุณต้องการดำเนินการต่อหรือไม่?',
    confirmText: 'ดำเนินการต่อ',
    color: 'warning',
    icon: 'i-heroicons-clock',
    action: rescheduleMakeupClass
  })
}

const rescheduleMakeupClass = async () => {
  if (!selectedEvent.value) return

  const props = selectedEvent.value.extendedProps
  if (!props || props.eventType !== 'makeup_class') return

  try {
    // 1. Delete old makeup classes 
    if (props.makeupClassIds) {
      const ids = JSON.parse(props.makeupClassIds)
      await Promise.all(ids.map(id => $fetch(`/api/makeup-classes/${id}`, { method: 'DELETE' })))
    } else {
      await $fetch(`/api/calendar-events/${selectedEvent.value.id}`, { method: 'DELETE' })
    }

    // 2. We don't recreate the teacher_absence anymore because it's no longer cascade deleted.

    await refreshEvents()

    // 3. Prepare finding new slots by opening the exact same flow as "Schedule Makeup" button does
    absenceForm.value = {
      teacherId: Number(props.teacherId),
      date: props.originalDate,
      term: props.term || termOptions.value[0]?.value || '',
      reason: 'Rescheduling'
    }

    // Load classes info to pass to find-slots
    let selectedClassesList = []
    if (props.classes) {
      selectedClassesList = JSON.parse(props.classes)
    }

    // Since we're bypassing loadMissedClasses (which queries the DB and would see they are gone since we deleted them)
    // We just manually populate missedClasses and check them all
    missedClasses.value = selectedClassesList.map(c => ({
      ...c,
      selected: true
    }))

    viewEventModalOpen.value = false // Close detail modal

    // Auto-trigger finding slots
    isRescheduling.value = true
    await saveAbsenceAndFindSlots()

  } catch (err) {
    console.error('Error rescheduling:', err)
    toast.add({ title: 'ผิดพลาด', description: 'ไม่สามารถเปลี่ยนเวลาได้', color: 'error' })
  } finally {
    loadingSlots.value = false
  }
}

// Helper function: เพิ่มชั่วโมงเข้ากับเวลา
function addHours(timeStr, hours) {
  const [h, m] = timeStr.split(':').map(Number)
  const newHour = h + hours
  return `${String(newHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// คลิก Event
const handleEventClick = (clickInfo) => {
  selectedEvent.value = clickInfo.event
  viewEventModalOpen.value = true
}

// ลบ Event
const confirmDeleteEvent = () => {
  if (!selectedEvent.value) return

  openConfirmModal({
    title: 'ยืนยันการลบ',
    message: 'คุณแน่ใจหรือไม่ที่จะลบรายการนี้? ข้อมูลที่เกี่ยวข้องจะถูกยกเลิกไปด้วย',
    confirmText: 'ลบรายการ',
    color: 'error',
    icon: 'i-lucide-trash',
    action: deleteEvent
  })
}

const deleteEvent = async () => {
  if (!selectedEvent.value) return

  try {
    const props = selectedEvent.value.extendedProps

    // ถ้าลบคลาสชดเชย ให้ลบข้อมูลใน DB 
    if (props?.eventType === 'makeup_class') {
      // 1. ลบรายการ makeup-classes ใน Database
      if (props.makeupClassIds) {
        const ids = JSON.parse(props.makeupClassIds)
        await Promise.all(ids.map(id => $fetch(`/api/makeup-classes/${id}`, { method: 'DELETE' })))
      }

      // (ไม่มีการลบ Event ติดราชการ เพื่อให้เก็บประวัติติดราชการเดิมไว้ตามที่ User ต้องการ)
    }

    // ลบ Event หลัก (ตัวที่คลิกเลือกมา)
    await $fetch(`/api/calendar-events/${selectedEvent.value.id}`, {
      method: 'DELETE'
    })

    toast.add({
      title: 'สำเร็จ',
      description: 'ลบรายการและข้อมูลที่เกี่ยวข้องเรียบร้อยแล้ว',
      color: 'primary'
    })

    await refreshEvents()
    viewEventModalOpen.value = false
    selectedEvent.value = null
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'ผิดพลาด',
      description: 'ไม่สามารถลบได้',
      color: 'error'
    })
  }
}

// Helper functions
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateThai = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getEventTypeLabel = (type) => {
  const types = {
    holiday: 'วันหยุด',
    teacher_absence: 'อาจารย์ติดราชการ',
    makeup_class: 'สอนชดเชย',
    normal: 'ปกติ'
  }
  return types[type] || type
}

const getEventTypeIcon = (type) => {
  const icons = {
    holiday: 'i-lucide-calendar-off',
    teacher_absence: 'i-lucide-user-x',
    makeup_class: 'i-heroicons-check-badge',
    normal: 'i-heroicons-academic-cap'
  }
  return icons[type] || 'i-heroicons-information-circle'
}

const getEventTypeClass = (type, isIconContainer = false) => {
  if (isIconContainer) {
    const iconClasses = {
      holiday: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
      teacher_absence: 'bg-red-500/10 border-red-500/20 text-red-500',
      makeup_class: 'bg-green-500/10 border-green-500/20 text-green-500',
      normal: 'bg-blue-500/10 border-blue-500/20 text-blue-500'
    }
    return iconClasses[type] || 'bg-slate-500/10 border-slate-500/20 text-slate-500'
  }

  const classes = {
    holiday: 'bg-amber-100 text-amber-700',
    teacher_absence: 'bg-red-100 text-red-700',
    makeup_class: 'bg-green-100 text-green-700',
    normal: 'bg-blue-100 text-blue-700'
  }
  return classes[type] || classes.normal
}
</script>

<style>
.fc {
  font-family: inherit;
}

.fc .fc-button {
  background-color: #3b82f6;
  border-color: #3b82f6;
  text-transform: capitalize;
}

.fc .fc-button:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

.fc .fc-button-primary:not(:disabled).fc-button-active {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

.fc-daygrid-event {
  cursor: pointer;
}

.fc-event {
  border-radius: 4px;
}

/* แก้ไขสีพื้นหลังของ header table */
.fc .fc-col-header,
.fc .fc-col-header tr,
.fc .fc-col-header th {
  background-color: #1e293b !important;
  /* slate-800 */
}

/* แก้ไขสีพื้นหลังและข้อความของ header cells */
.fc .fc-col-header-cell {
  background-color: #1e293b !important;
  /* slate-800 */
  border-color: #475569 !important;
  /* slate-600 */
}

.fc .fc-col-header-cell-cushion {
  color: #ffffff !important;
  font-weight: 600;
}

/* แก้ไขสีหัวเรื่อง (เดือน-ปี) */
.fc .fc-toolbar-title {
  color: #ffffff !important;
}

/* แก้ไขสีตัวเลขวันที่ */
.fc .fc-daygrid-day-number {
  color: #ffffff !important;
}

/* แก้ไขสีเส้นตาราง */
.fc .fc-scrollgrid {
  border-color: #475569 !important;
}

.fc-theme-standard th {
  background-color: #1e293b !important;
}

/* แก้ไขส่วนหัวของวันในมุมมองรายการ (List View) */
.fc .fc-list-day th,
.fc .fc-list-day td,
.fc .fc-list-day-cushion,
.fc .fc-cell-shaded {
  background-color: #ffffff !important;
}

.fc-list-day-text,
.fc-list-day-side-text,
.fc-list-day-cushion * {
  color: #1e293b !important;
  /* slate-800 */
  font-weight: 800 !important;
  text-decoration: none !important;
}

.fc-list-event:hover td {
  background-color: #334155 !important;
  /* slate-700 */
}
</style>
