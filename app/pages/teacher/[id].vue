<template>
  <div class="bg-linear-to-br from-slate-800 to-slate-900 text-white min-h-screen">
    <!-- ปุ่มย้อนกลับ -->
    <UButton label="ย้อนกลับ" icon="i-lucide-arrow-left" color="error" class="m-4 cursor-pointer"
      @click="$router.back()" />
    <div class="container mx-auto py-2 pb-10">
      <!-- แสดงรายละเอียดอาจารย์ตาม id -->
      <div class="flex flex-col md:flex-row gap-6 mb-8">
        <!-- Profile Card -->
        <div class="flex-1 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-6">
          <UAvatar :alt="teacherName.toUpperCase()" size="xl" class="bg-amber-100 text-slate-800 font-bold text-2xl" />
          <div>
            <h1 class="text-3xl font-bold text-white">{{ teacherName }}</h1>
            <p class="text-slate-400 mt-1">อาจารย์ผู้สอน</p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="flex-[2] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-sm">
            <p class="text-slate-400 text-sm font-medium">วิชาที่สอน</p>
            <p class="text-2xl font-bold text-blue-400 mt-1">{{ subjects.length }} วิชา</p>
          </div>
          <div class="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-sm">
            <p class="text-slate-400 text-sm font-medium">ชั่วโมงสอน/สัปดาห์</p>
            <p class="text-2xl font-bold text-green-400 mt-1">{{ hoursPerWeek }} ชม.</p>
          </div>
          <div class="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-sm">
            <p class="text-slate-400 text-sm font-medium">เทอมที่แสดง</p>
            <p class="text-xl font-bold text-amber-400 mt-1">{{ selectedTerm || 'ยังไม่เลือก' }}</p>
          </div>
        </div>
      </div>

      <!-- แสดงรายวิชาที่สอนโดยอาจารย์ท่านนี้ -->
      <div class="w-3/7 shrink-0">
        <div class="bg-slate-800 rounded-lg shadow-xl border border-slate-700">
          <div class="p-4 border-b border-slate-700 flex justify-between items-center">
            <h1 class="text-lg font-bold text-blue-300">
              รายวิชาที่สอน
            </h1>

            <!-- เพิ่มรายวิชา -->
            <UModal v-model:open="open"
              :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
              <UButton label="เพิ่มรายวิชา" class="cursor-pointer" />
              <template #content>
                <div class="flex flex-col max-h-[85vh]">
                  <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div
                      class="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                      <UIcon name="i-heroicons-plus-circle" class="text-3xl text-blue-400" />
                    </div>
                    <h3 class="text-2xl font-bold text-white text-center mb-6">เพิ่มรายวิชาที่สอน</h3>

                    <div class="space-y-6">
                      <div>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">ชื่อวิชา</h3>
                        <UInput v-model="subjectName" placeholder="กรอกชื่อวิชา" size="xl" class="w-full"
                          :ui="{ base: 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500 rounded-2xl' }" />
                      </div>

                      <div>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">กลุ่มเรียน
                          (Sections)</h3>
                        <div
                          class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar border border-slate-800 rounded-2xl p-4 bg-slate-800/50 shadow-inner">
                          <div v-for="section in sections" :key="section.id_section"
                            class="flex items-center gap-3 p-2.5 hover:bg-slate-700/50 rounded-xl cursor-pointer text-slate-300 transition-colors"
                            @click="toggleSection(section.id_section)">
                            <UCheckbox :model-value="selectedSections.includes(section.id_section)"
                              @update:model-value="toggleSection(section.id_section)" />
                            <span class="text-sm font-medium">{{ section.section_name }} ({{ section.term }})</span>
                          </div>
                          <p v-if="!sections || sections.length === 0"
                            class="text-slate-500 text-sm text-center py-4 italic">
                            ไม่มีกลุ่มเรียนในระบบ
                          </p>
                        </div>
                      </div>

                      <div v-if="selectedSections.length > 0"
                        class="bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl text-center">
                        <p class="text-sm text-blue-400 font-medium">เลือกแล้ว {{ selectedSections.length }} กลุ่มเรียน
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    class="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-10 w-full">
                    <div class="flex gap-3">
                      <UButton label="ยกเลิก" color="neutral" variant="soft" size="xl" block
                        class="rounded-2xl py-4 flex-1 font-bold" @click="open = false" />
                      <UButton label="บันทึกรายวิชา" color="primary" size="xl" block
                        class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20 font-bold" @click="async () => {
                          await addSubject()
                          open = false
                        }" />
                    </div>
                  </div>
                </div>
              </template>
            </UModal>

            <!-- แก้ไขรายวิชา -->
            <UModal v-model:open="editOpen"
              :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
              <template #content>
                <div class="flex flex-col max-h-[85vh]">
                  <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div
                      class="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                      <UIcon name="i-lucide-edit" class="text-3xl text-amber-500" />
                    </div>
                    <h3 class="text-2xl font-bold text-white text-center mb-6">แก้ไขรายวิชา</h3>

                    <div class="space-y-6">
                      <div>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">ชื่อวิชา</h3>
                        <UInput v-model="editSubjectName" size="xl" class="w-full"
                          :ui="{ base: 'bg-slate-800 border-slate-700 text-white focus:ring-amber-500 rounded-2xl' }" />
                      </div>

                      <div>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">กลุ่มเรียน
                          (Sections)</h3>
                        <div
                          class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar border border-slate-800 rounded-2xl p-4 bg-slate-800/50 shadow-inner">
                          <div v-for="section in sections" :key="section.id_section"
                            class="flex items-center gap-3 p-2.5 hover:bg-slate-700/50 rounded-xl cursor-pointer text-slate-300 transition-colors"
                            @click="toggleEditSection(section.id_section)">
                            <UCheckbox :model-value="editSelectedSections.includes(section.id_section)"
                              @update:model-value="toggleEditSection(section.id_section)" />
                            <span class="text-sm font-medium">{{ section.section_name }} ({{ section.term }})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    class="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-10 w-full">
                    <div class="flex gap-3">
                      <UButton label="ยกเลิก" color="neutral" variant="soft" size="xl" block
                        class="rounded-2xl py-4 flex-1 font-bold" @click="editOpen = false" />
                      <UButton label="บันทึกการแก้ไข" color="warning" size="xl" block
                        class="rounded-2xl py-4 flex-1 shadow-lg shadow-amber-500/20 font-bold" @click="async () => {
                          await updateSubject()
                          editOpen = false
                        }" />
                    </div>
                  </div>
                </div>
              </template>
            </UModal>
          </div>
          <div class="overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
            <div v-if="pending">
              Loading...
            </div>
            <div v-else class="p-2 space-y-2">
              <p v-if="subjects.length === 0" class="my-3 text-center text-slate-400">
                ไม่มีรายวิชาที่สอน
              </p>

              <!-- แสดงรายวิชาที่สอนโดยอาจารย์ท่านนี้ -->
              <div v-for="subject in subjects" v-else :key="subject.id_subject"
                class="w-full px-4 py-3 rounded-lg text-left bg-slate-700 text-slate-200 flex justify-between items-center">
                <div class="flex flex-col gap-1 items-start">
                  <span class="text-lg font-bold">
                    {{ subject.name_subject }} <span class="text-sm font-normal text-gray-400">({{ subject.section_names
                      ||
                      'ไม่ระบุกลุ่ม' }})</span>
                  </span>
                  <p class="text-sm">
                    ID: {{ subject.id_subject }}
                  </p>
                </div>
                <div class="flex gap-3">
                  <!-- ปุ่มแก้ไขวิชา -->
                  <span class="flex flex-col items-center gap-1">
                    <UButton class="cursor-pointer" icon="i-lucide-edit" color="warning"
                      @click="editSubject(subject)" />
                    <span class="text-xs text-slate-300">แก้ไข</span>
                  </span>
                  <!-- ปุ่มลบวิชา -->
                  <span class="flex flex-col items-center gap-1">
                    <UButton class="cursor-pointer" icon="i-lucide-trash" color="error"
                      @click="deleteSubject(subject.id_subject)" />
                    <span class="text-xs text-slate-300">ลบ</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Add Subject to Schedule Modal -->
      <div class="w-3/7 shrink-0 mt-6">
        <div class="bg-slate-800 rounded-lg shadow-xl border border-slate-700">
          <div class="p-4 border-b border-slate-700 flex justify-between items-center">
            <h1 class="text-lg font-bold text-blue-300">
              เพิ่มรายวิชาในตาราง
            </h1>
            <UModal v-model:open="quickAddOpen"
              :ui="{ content: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden' }">
              <UButton label="เพิ่มรายวิชาในตาราง" icon="i-heroicons-plus" class="cursor-pointer" />
              <template #content>
                <div class="flex flex-col max-h-[90vh]">
                  <!-- Header -->
                  <div class="p-8 pb-4">
                    <div
                      class="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                      <UIcon name="i-heroicons-calendar-days" class="text-3xl text-blue-400" />
                    </div>
                    <h3 class="text-2xl font-bold text-white text-center mb-4">เพิ่มรายวิชาในตารางสอน</h3>
                  </div>

                  <!-- Scrollable Form Content -->
                  <div class="flex-1 overflow-y-auto custom-scrollbar px-8 space-y-6 pb-4">
                    <div>
                      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">เลือกวิชา</h3>
                      <USelect v-model="quickAddSubject" placeholder="เลือกรายวิชา" :items="subjectOptions" size="xl"
                        class="w-full" :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                    </div>

                    <div v-if="quickAddSubject">
                      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">กลุ่มเรียน
                        (เลือกเฉพาะที่เรียนคาบนี้)</h3>
                      <div
                        class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar border border-slate-800 rounded-2xl p-4 bg-slate-800/50 shadow-inner">
                        <div v-for="sec in subjects.find(s => s.id_subject == quickAddSubject)?.sections"
                          :key="sec.id_section"
                          class="flex items-center gap-3 p-2 hover:bg-slate-700/50 rounded-xl cursor-pointer text-slate-300 transition-colors"
                          @click="() => {
                            if (quickAddSelectedSections.includes(sec.id_section)) {
                              quickAddSelectedSections = quickAddSelectedSections.filter(id => id !== sec.id_section)
                            } else {
                              quickAddSelectedSections = [...quickAddSelectedSections, sec.id_section]
                            }
                          }">
                          <UCheckbox :model-value="quickAddSelectedSections.includes(sec.id_section)"
                            @update:model-value="(val) => {
                              if (val) quickAddSelectedSections = [...quickAddSelectedSections, sec.id_section]
                              else quickAddSelectedSections = quickAddSelectedSections.filter(id => id !== sec.id_section)
                            }" />
                          <span class="text-sm font-medium">{{ sec.section_name }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">วัน</h3>
                        <USelect v-model="quickAddDay" placeholder="เลือกวัน" :items="dayOptions" size="xl"
                          class="w-full" :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                      </div>
                      <div>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">ห้องเรียน</h3>
                        <USelect v-model="quickAddRoom" placeholder="ไม่ระบุ" :items="roomOptions" size="xl"
                          class="w-full" :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">เวลาเริ่ม</h3>
                        <USelect v-model="quickAddStartTime" placeholder="เลือกเวลา" :items="timeSlotIndexOptions"
                          size="xl" class="w-full"
                          :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                      </div>
                      <div>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">จำนวนชั่วโมง
                        </h3>
                        <USelect v-model="quickAddDuration" :items="durationOptions" size="xl" class="w-full"
                          :ui="{ base: 'bg-slate-800 border-slate-700 text-white rounded-2xl' }" />
                      </div>
                    </div>

                    <div v-if="quickAddPreview"
                      class="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl text-center">
                      <p class="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">แสดงตัวอย่าง</p>
                      <p class="text-white font-bold leading-tight">{{ quickAddPreview }}</p>
                    </div>
                  </div>

                  <!-- Sticky Footer Buttons -->
                  <div class="p-6 pt-4 border-t border-slate-800 bg-slate-900 flex gap-3">
                    <UButton label="ยกเลิก" color="neutral" variant="soft" size="xl" block
                      class="rounded-2xl py-4 flex-1" @click="quickAddOpen = false" />
                    <UButton label="เพิ่มลงตาราง" color="primary" size="xl" block
                      class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20" @click="async () => {
                        await addToSchedule()
                        quickAddOpen = false
                      }" />
                  </div>
                </div>
              </template>
            </UModal>
          </div>
          <div class="p-4">
            <p class="text-slate-400 text-sm">
              คลิก "เพิ่มในตาราง" เพื่อเพิ่มรายวิชาในตารางสอนได้หลายชั่วโมงพร้อมกัน
            </p>
          </div>
        </div>
      </div>

      <!-- ตารางสอน Section Header -->
      <div class="flex flex-col md:flex-row justify-between items-end mt-12 mb-6 gap-4">
        <div>
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            <UIcon name="i-heroicons-calendar-days" class="text-blue-400" />
            ตารางสอน
          </h2>
          <p class="text-slate-400 text-sm mt-1">จัดการคาบสอนหลักของอาจารย์ในแต่ละเทอม</p>
        </div>
        <div class="w-full md:w-64">
          <label class="block text-xs font-medium text-slate-500 mb-1 ml-1">เปลี่ยนภาคการศึกษา</label>
          <USelect v-model="selectedTerm" placeholder="เลือกภาคการศึกษา" color="primary" variant="subtle"
            :items="termOptions" class="w-full" icon="i-heroicons-academic-cap" />
        </div>
      </div>


      <div v-if="!selectedTerm" class="text-center text-slate-400 py-10">
        กรุณาเลือกภาคการศึกษาเพื่อแสดง/จัดการตารางสอน
      </div>

      <!-- ตารางสอน -->
      <div v-else class="mt-4 overflow-x-auto pb-4 custom-scrollbar">
        <div class="min-w-fit md:min-w-full">
          <div
            class="grid grid-cols-[80px_repeat(13,minmax(85px,1fr))] text-center border border-slate-600 rounded-lg overflow-hidden shadow-2xl">
            <!-- แสดงเวลา Header -->
            <div
              class="bg-slate-700 font-bold border-r border-b border-slate-600 flex items-center justify-center text-white sticky left-0 z-40 p-2 text-xs">
              วัน/เวลา
            </div>
            <div v-for="time in timeSlots" :key="time"
              class="bg-slate-700 p-2 text-center text-xs font-medium border-b border-r border-slate-600 last:border-r-0 text-slate-300">
              {{ time }}
            </div>

            <!-- ลูปทุกวัน -->
            <template v-for="(day, dayIndex) in days" :key="dayIndex">
              <div
                class="border-r border-b border-slate-600 p-2 text-center bg-slate-700/80 text-white flex items-center justify-center font-bold sticky left-0 z-40">
                {{ day }}
              </div>

              <!-- ช่วงเวลาทั้งหมด 13 ช่อง (แสดงแบบ Merge ตาม displaySlots) -->
              <template v-for="(slot, gIndex) in displaySlots[dayIndex]" :key="`${dayIndex}-${slot.originalIndex}`">
                <!-- ช่วงปกติ (ข้ามคาบที่ 5/index 4 พักเที่ยง) -->
                <div v-if="!slot.isLunch" class="relative border-r border-b border-slate-600 last:border-r-0"
                  :style="{ gridColumn: `span ${slot.span}`, minWidth: `${slot.span * 80}px` }">
                  <div
                    class="h-full min-h-[80px] p-1 cursor-pointer transition-colors flex flex-col items-center justify-center text-center gap-1"
                    :class="[
                      slot.value ? 'bg-blue-600/20 hover:bg-blue-600/30 font-bold text-blue-300' : 'bg-slate-800 hover:bg-slate-700/50 text-slate-500',
                      isActiveBox(dayIndex, slot.originalIndex) ? 'ring-2 ring-inset ring-blue-500 bg-blue-500/10' : ''
                    ]" @click="toggleDropdown(dayIndex, slot.originalIndex)">
                    <template v-if="slot.value">
                      <span class="text-xs line-clamp-2 leading-tight">
                        {{ getSubjectLabel(slot.value, slot.room_id, slot.section_ids) }}
                      </span>
                    </template>
                    <span v-else class="text-[10px]">ว่าง</span>
                  </div>

                  <!-- Dropdown -->
                  <div v-if="isActiveBox(dayIndex, slot.originalIndex)"
                    class="absolute z-20 w-52 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl overflow-hidden"
                    :class="[
                      dayIndex >= 4 ? 'bottom-full mb-1' : 'top-full mt-1',
                      slot.originalIndex <= 1 ? 'left-0' : slot.originalIndex >= 10 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                    ]">
                    <div class="max-h-72 overflow-y-auto custom-scrollbar">
                      <button
                        class="w-full text-left px-3 py-2 hover:bg-slate-700 text-slate-300 text-xs border-b border-slate-700 flex items-center gap-2"
                        @click="setSlotValue(dayIndex, slot.originalIndex, null, slot.span)">
                        <UIcon name="i-lucide-trash" class="text-red-400" />
                        <span class="text-red-400">ล้างข้อมูล</span>
                      </button>

                      <div
                        class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-900/50 uppercase tracking-wider">
                        เลือกวิชา
                      </div>
                      <button v-for="opt in subjectOptions" :key="opt.value"
                        class="w-full text-left px-3 py-2 hover:bg-slate-700 text-white text-xs truncate"
                        :class="{ 'bg-blue-500/10 text-blue-200': slot.value === opt.value }"
                        @click="setSlotValue(dayIndex, slot.originalIndex, opt.value, slot.span)">
                        {{ opt.label }}
                      </button>

                      <template v-if="slot.value">
                        <div
                          class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-900/50 uppercase tracking-wider mt-1">
                          กลุ่มเรียน (Sections)
                        </div>
                        <div v-for="sec in subjects.find(s => s.id_subject == slot.value)?.sections"
                          :key="sec.id_section"
                          class="w-full text-left px-3 py-2 hover:bg-slate-700 text-amber-200 text-xs flex items-center gap-2 cursor-pointer"
                          @click="toggleSlotSection(dayIndex, slot.originalIndex, sec.id_section, slot.span)">
                          <UCheckbox
                            :model-value="(scheduleSlots[dayIndex][slot.originalIndex].section_ids || []).includes(sec.id_section)"
                            @update:model-value="toggleSlotSection(dayIndex, slot.originalIndex, sec.id_section, slot.span)" />
                          <span class="truncate">{{ sec.section_name }}</span>
                        </div>

                        <div
                          class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-900/50 uppercase tracking-wider mt-1">
                          ห้องเรียน (คาบนี้)
                        </div>
                        <button v-for="room in roomOptions" :key="room.value"
                          class="w-full text-left px-3 py-2 hover:bg-slate-700 text-blue-400 text-xs truncate"
                          :class="{ 'bg-blue-500/10 text-blue-200': slot.room_id === room.value }"
                          @click="setSlotRoom(dayIndex, slot.originalIndex, room.value, slot.span)">
                          {{ room.label || 'ไม่ระบุห้อง' }}
                        </button>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- ช่อง พักกลางวัน -->
                <div v-else
                  class="border-r border-b border-slate-600 p-1 text-center bg-slate-900/50 text-slate-500 italic flex items-center justify-center text-[10px] select-none">
                  พักกลางวัน
                </div>
              </template>
            </template>
          </div>
        </div>

        <!-- ปุ่มบันทึกตารางสอน -->
        <div class="flex gap-3 mt-6 sticky left-0">
          <UButton label="บันทึกตารางสอน" color="primary" icon="i-heroicons-table-cells" class="cursor-pointer"
            :loading="saving" @click="saveSchedule" />
          <UButton label="ล้างตาราง" color="error" icon="i-lucide-trash" class="cursor-pointer"
            @click="clearSchedule" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ดึง id จากพารามิเตอร์
const route = useRoute()
const id = route.params.id

const { data: rooms } = await useFetch('/api/rooms')

// --- State & Reactive Variables ---
const open = ref(false)
const activeBox = ref({ day: null, slot: null })
const editOpen = ref(false)
const editSubjectName = ref('')
const currentEditSubject = ref(null)
const subjectName = ref('')
const selectedSections = ref([])
const editSelectedSections = ref([])
const selectedTerm = ref(null)
const saving = ref(false)

// Quick Add Subject to Schedule states
const quickAddOpen = ref(false)
const quickAddSubject = ref(null)
const quickAddDay = ref(null)
const quickAddStartTime = ref(null)
const quickAddDuration = ref(1)
const quickAddRoom = ref(null)
const quickAddSelectedSections = ref([])

const toast = useToast()

// --- Data Fetching ---
// ข้อมูลวิชาที่อาจารย์สอน
const { data: subjects, refresh: refreshSubjects } = await useFetch('/api/Subjects', {
  query: computed(() => ({ id_teacher: id })),
  watch: false
})
const { data: teachers, pending } = await useFetch('/api/teachers')
const { data: terms } = await useFetch('/api/terms')
const { data: sections } = await useFetch('/api/sections')

// ข้อมูลตารางสอน
const scheduleSlots = useState(`schedule-slots-${id}`, () => Array.from({ length: 7 }, () =>
  Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] }))
))

// ข้อมูลวันเวลา
const timeSlots = [
  '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
  '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
  '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00'
]
const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

// --- Computeds ---
const teacherName = computed(() =>
  teachers.value?.find(t => t.id_teacher == id)?.name || 'ไม่พบชื่ออาจารย์'
)

const hoursPerWeek = computed(() => {
  if (!scheduleSlots.value) return 0
  let count = 0
  scheduleSlots.value.forEach(day => {
    day.forEach(slot => {
      if (slot.value) count++
    })
  })
  return count
})

const termOptions = computed(() => {
  if (!terms.value || terms.value.length === 0) return []
  return terms.value.map(t => ({
    label: `เทอม ${t.term}/${t.academic_year}`,
    value: `${t.term}/${t.academic_year}`
  }))
})

const sectionOptions = computed(() => {
  if (!sections.value) return []
  return sections.value.map(s => ({
    value: s.id_section,
    label: `${s.section_name} (${s.term})`
  }))
})

const roomOptions = computed(() => {
  if (!rooms.value) return []
  return [
    { label: 'ไม่ระบุห้อง', value: null },
    ...rooms.value.map(r => ({
      value: r.id_room,
      label: `${r.room_name}${r.building ? ` (${r.building})` : ''}`
    }))
  ]
})

// ตัวเลือกวิชาสำหรับตาราง - แสดงชื่อกลุ่มเรียนด้วย
const subjectOptions = computed(() => {
  if (!subjects.value) return []
  return subjects.value.map(s => ({
    value: s.id_subject,
    label: `${s.name_subject} (${s.section_names || '?'})`
  }))
})

const dayOptions = computed(() => {
  return days.map((day, index) => ({
    value: index,
    label: day
  }))
})

const timeSlotIndexOptions = computed(() => {
  return timeSlots.map((time, index) => ({
    value: index,
    label: time
  })).filter(opt => opt.value !== 4) // ข้ามพักเที่ยง
})

const durationOptions = [
  { value: 1, label: '1 ชั่วโมง' },
  { value: 2, label: '2 ชั่วโมง' },
  { value: 3, label: '3 ชั่วโมง' },
  { value: 4, label: '4 ชั่วโมง' },
  { value: 5, label: '5 ชั่วโมง' },
  { value: 6, label: '6 ชั่วโมง' },
  { value: 7, label: '7 ชั่วโมง' },
  { value: 8, label: '8 ชั่วโมง' },
  { value: 9, label: '9 ชั่วโมง' },
  { value: 10, label: '10 ชั่วโมง' },
  { value: 11, label: '11 ชั่วโมง' },
  { value: 12, label: '12 ชั่วโมง' }
]

const quickAddPreview = computed(() => {
  if (!quickAddSubject.value || quickAddDay.value === null || quickAddStartTime.value === null || !quickAddDuration.value) {
    return null
  }
  const subjectLabel = subjectOptions.value.find(s => s.value === quickAddSubject.value)?.label || '-'
  const dayLabel = dayOptions.value.find(d => d.value === quickAddDay.value)?.label || '-'
  const startTimeLabel = timeSlotIndexOptions.value.find(t => t.value === quickAddStartTime.value)?.label || '-'
  const roomLabel = quickAddRoom.value ? roomOptions.value.find(r => r.value === quickAddRoom.value)?.label : 'ไม่ระบุ'
  return `${subjectLabel} | ${dayLabel} | ${startTimeLabel} | ${quickAddDuration.value} ชั่วโมง | ห้อง: ${roomLabel}`
})

// เมื่อเปลี่ยนวิชาใน Quick Add ให้เลือกทุกกลุ่มเป็นค่าเริ่มต้น
watch(quickAddSubject, (newVal) => {
  if (newVal) {
    const subj = subjects.value?.find(s => s.id_subject == newVal)
    quickAddSelectedSections.value = subj ? subj.sections.map(s => s.id_section) : []
  } else {
    quickAddSelectedSections.value = []
  }
})

// Logic สำหรับการ Merge ช่องที่วิชาเหมือนกันและติดกัน
const displaySlots = computed(() => {
  if (!scheduleSlots.value) return []
  return scheduleSlots.value.map(daySlots => {
    const grouped = []
    for (let i = 0; i < daySlots.length; i++) {
      const current = daySlots[i]
      if (i === 4) { // พักเที่ยง ไม่ Merge
        grouped.push({ ...current, span: 1, isLunch: true, originalIndex: i })
        continue
      }
      let span = 1
      while (
        i + span < daySlots.length &&
        i + span !== 4 && // ไม่ Merge ข้ามพักเที่ยง
        daySlots[i + span].value === current.value &&
        current.value !== null // รวมเฉพาะที่มีวิชา (หรือจะรวมช่องว่างด้วยก็ได้ถ้าต้องการ)
      ) {
        span++
      }
      grouped.push({ ...current, span, originalIndex: i })
      i += span - 1
    }
    return grouped
  })
})

// เลือกเทอมแรกเป็นค่าเริ่มต้น
if (terms.value && terms.value.length > 0 && !selectedTerm.value) {
  selectedTerm.value = `${terms.value[0].term}/${terms.value[0].academic_year}`
}


// --- Logic & Methods ---
const toggleSection = (sectionId) => {
  const index = selectedSections.value.indexOf(sectionId)
  if (index > -1) {
    selectedSections.value.splice(index, 1)
  } else {
    selectedSections.value.push(sectionId)
  }
}

const toggleEditSection = (sectionId) => {
  const index = editSelectedSections.value.indexOf(sectionId)
  if (index > -1) {
    editSelectedSections.value.splice(index, 1)
  } else {
    editSelectedSections.value.push(sectionId)
  }
}

const getSubjectLabel = (val, roomId = null, sectionIds = null) => {
  const subj = subjects.value?.find(s => s.id_subject == val)
  if (!subj) return 'Unknown'

  let sectionDisplay = ''
  if (sectionIds && Array.isArray(sectionIds) && sectionIds.length > 0) {
    const names = subj.sections
      .filter(s => sectionIds.includes(s.id_section))
      .map(s => s.section_name)
      .join(', ')
    sectionDisplay = names ? `(${names})` : '(No section)'
  } else {
    sectionDisplay = `(${subj.section_names || '?'})`
  }

  let roomName = ''
  if (roomId) {
    const r = rooms.value?.find(rm => rm.id_room == roomId)
    if (r) roomName = r.room_name
  }

  return `${subj.name_subject} ${sectionDisplay} ${roomName ? `[${roomName}]` : ''}`
}

const addSubject = async () => {
  if (!subjectName.value || selectedSections.value.length === 0) {
    toast.add({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกชื่อวิชาและคุณกลุ่มเรียน อย่างน้อย 1 กลุ่ม', color: 'red' })
    return
  }
  try {
    const res = await $fetch('/api/Subjects', {
      method: 'POST',
      body: {
        name_subject: subjectName.value,
        id_teacher: id,
        id_sections: selectedSections.value,
        term: selectedTerm.value
      }
    })
    toast.add({ title: 'สำเร็จ', description: 'เพิ่มรายวิชาเรียบร้อยแล้ว', color: 'primary' })
    subjectName.value = ''
    selectedSections.value = []
    await refreshSubjects()
  } catch (err) {
    console.error(err)
    toast.add({ title: 'ผิดพลาด', description: 'ไม่สามารถเพิ่มรายวิชาได้', color: 'error' })
  }
}

const deleteSubject = async (subjectId) => {
  if (!confirm('ยืนยันการลบรายวิชา?')) return
  try {
    await $fetch(`/api/Subjects/${subjectId}`, { method: 'DELETE' })
    await refreshSubjects()
    // ล้างออกจากตารางสอน (หน้าจอ)
    scheduleSlots.value.forEach(day => {
      day.forEach(slot => {
        if (slot.value === subjectId) {
          slot.value = null
          slot.room_id = null
        }
      })
    })
    toast.add({ title: 'สำเร็จ', description: 'ลบรายวิชาเรียบร้อยแล้ว' })
  } catch (err) {
    console.error(err)
  }
}

const editSubject = (subject) => {
  currentEditSubject.value = subject
  editSubjectName.value = subject.name_subject
  // Get existing sections for this subject
  editSelectedSections.value = subject.sections ? subject.sections.map(s => s.id_section) : []
  editOpen.value = true
}

const updateSubject = async () => {
  if (!editSubjectName.value || editSelectedSections.value.length === 0) {
    toast.add({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกชื่อวิชาและคุณกลุ่มเรียน อย่างน้อย 1 กลุ่ม', color: 'red' })
    return
  }
  try {
    await $fetch(`/api/Subjects/${currentEditSubject.value.id_subject}`, {
      method: 'PUT',
      body: {
        name_subject: editSubjectName.value,
        id_sections: editSelectedSections.value
      }
    })
    await refreshSubjects()
    editOpen.value = false
    toast.add({ title: 'สำเร็จ', description: 'แก้ไขรายวิชาเรียบร้อยแล้ว' })
  } catch (err) {
    console.error(err)
  }
}

const normalizeSchedule = (data) => {
  if (!Array.isArray(data)) return Array.from({ length: 7 }, () => Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] })))
  const res = [...data]
  while (res.length < 7) res.push(Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] })))
  return res.map(day => {
    const d = Array.isArray(day) ? [...day] : []
    while (d.length < 13) d.push({ value: null, room_id: null, section_ids: [] })
    return d.map(slot => {
      // Handle legacy format (just subject ID as value) or null
      if (typeof slot === 'object' && slot !== null) {
        return {
          value: slot.value,
          room_id: slot.room_id || null,
          section_ids: slot.section_ids || []
        }
      }
      return { value: slot, room_id: null, section_ids: [] }
    })
  })
}

const clearSchedule = () => {
  if (!confirm('ล้างตารางทั้งหมด?')) return
  scheduleSlots.value = Array.from({ length: 7 }, () => Array.from({ length: 13 }, () => ({ value: null, room_id: null })))
}

const isActiveBox = (d, s) => activeBox.value.day === d && activeBox.value.slot === s

const toggleDropdown = (d, s) => {
  if (isActiveBox(d, s)) {
    activeBox.value = { day: null, slot: null }
  } else {
    activeBox.value = { day: d, slot: s }
  }
}

const setSlotValue = (d, s, val, span = 1) => {
  const subj = subjects.value?.find(sub => sub.id_subject == val)
  const defaultSections = subj ? subj.sections.map(sec => sec.id_section) : []

  for (let i = 0; i < span; i++) {
    scheduleSlots.value[d][s + i].value = val
    if (!val) {
      scheduleSlots.value[d][s + i].room_id = null
      scheduleSlots.value[d][s + i].section_ids = []
    } else {
      scheduleSlots.value[d][s + i].section_ids = [...defaultSections]
    }
  }
  activeBox.value = { day: null, slot: null }
}

const toggleSlotSection = (d, s, sectionId, span = 1) => {
  const currentSections = scheduleSlots.value[d][s].section_ids || []
  let nextSections
  if (currentSections.includes(sectionId)) {
    nextSections = currentSections.filter(id => id !== sectionId)
  } else {
    nextSections = [...currentSections, sectionId]
  }

  for (let i = 0; i < span; i++) {
    scheduleSlots.value[d][s + i].section_ids = nextSections
  }
}

const setSlotRoom = (d, s, roomId, span = 1) => {
  for (let i = 0; i < span; i++) {
    scheduleSlots.value[d][s + i].room_id = roomId
  }
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      activeBox.value = { day: null, slot: null }
    }
  })
})

const saveSchedule = async () => {
  if (!selectedTerm.value) return
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
    toast.add({ title: 'สำเร็จ', description: 'บันทึกตารางสอนเรียบร้อยแล้ว' })
  } catch (err) {
    console.error(err)
    toast.add({ title: 'ผิดพลาด', description: 'ไม่สามารถบันทึกได้', color: 'error' })
  } finally {
    saving.value = false
  }
}

const addToSchedule = async () => {
  if (!quickAddSubject.value || quickAddDay.value === null || quickAddStartTime.value === null || !quickAddDuration.value) return

  const dayIdx = quickAddDay.value
  const startIdx = quickAddStartTime.value
  const duration = quickAddDuration.value
  const subjectId = quickAddSubject.value
  const roomId = quickAddRoom.value

  const subj = subjects.value?.find(s => s.id_subject == subjectId)
  const defaultSections = subj ? subj.sections.map(s => s.id_section) : []

  let slotsAdded = 0
  let currentIdx = startIdx

  while (slotsAdded < duration) {
    if (currentIdx >= 13) break // หมดวัน

    if (currentIdx === 4) {
      currentIdx++
      continue // ข้ามพักเที่ยง (ไม่นับรวมในจำนวนชั่วโมง)
    }

    scheduleSlots.value[dayIdx][currentIdx].value = subjectId
    scheduleSlots.value[dayIdx][currentIdx].room_id = roomId
    scheduleSlots.value[dayIdx][currentIdx].section_ids = [...quickAddSelectedSections.value]

    slotsAdded++
    currentIdx++
  }

  // Reset
  quickAddSubject.value = null
  quickAddDay.value = null
  quickAddRoom.value = null
  toast.add({ title: 'สำเร็จ', description: 'เพิ่มวิชาในตารางแล้ว' })
  quickAddOpen.value = false
}

// --- Data Synchronization ---
const { data: scheduleData, error: scheduleError } = await useFetch('/api/schedules', {
  query: computed(() => ({ id_teacher: id, term: selectedTerm.value })),
  watch: [selectedTerm],
  immediate: true
})

watch(scheduleData, (newData) => {
  if (newData?.scheduleData) {
    scheduleSlots.value = normalizeSchedule(newData.scheduleData)
  } else {
    clearSchedule()
  }
}, { immediate: true })

watch(scheduleError, (err) => {
  if (err) console.error('[Schedule] API Error:', err)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
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
