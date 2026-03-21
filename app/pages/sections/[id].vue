<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Navbar -->
    <nav class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <UButton
              icon="i-lucide-arrow-left"
              color="gray"
              variant="ghost"
              to="/sections"
            />
            <h2 class="text-xl font-bold text-slate-800">
              ตารางเรียน - {{ section?.section_name || 'Loading...' }}
            </h2>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-2 sm:px-4 py-8">
      <!-- แสดงรายละเอียดกลุ่มเรียน -->
      <div class="flex flex-col md:flex-row gap-6 mb-8 mt-2">
        <!-- Profile Card -->
        <div class="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
          <div
            class="w-20 h-20 rounded-full bg-blue-100 text-slate-800 font-bold flex items-center justify-center text-3xl shadow-sm border border-blue-200"
          >
            <!-- Show initial of section -->
            {{ section?.section_name ? section.section_name.substring(0, 2) : 'S' }}
          </div>
          <div>
            <h1 class="text-3xl font-bold text-slate-900">
              {{ section?.section_name || 'Loading...' }}
            </h1>
            <p class="text-slate-500 mt-1">
              กลุ่มเรียน
            </p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="flex-[2] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-slate-500 text-sm font-medium">
              วิชาในตาราง
            </p>
            <p class="text-2xl font-bold text-blue-600 mt-1">
              {{ totalSubjectsInSchedule }} วิชา
            </p>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-slate-500 text-sm font-medium">
              ชั่วโมงเรียน/สัปดาห์
            </p>
            <p class="text-2xl font-bold text-green-600 mt-1">
              {{ totalStudyHours }} ชม.
            </p>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-slate-500 text-sm font-medium">
              เทอมที่แสดง
            </p>
            <p class="text-xl font-bold text-amber-500 mt-1">
              {{ term || 'ยังไม่เลือก' }}
            </p>
          </div>
        </div>
      </div>

      <!-- External Subjects Grid View -->
      <div class="w-full mt-6 mb-8">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex justify-between items-center text-slate-900 bg-slate-50/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <UIcon
                  name="i-heroicons-book-open"
                  class="text-xl text-blue-600"
                />
              </div>
              <div>
                <h1 class="text-xl font-bold text-slate-900">
                  วิชานอกสาขา
                </h1>
                <p class="text-xs text-slate-500">รายวิชาที่ไม่ได้เรียนกับอาจารย์ในสาขา</p>
              </div>
            </div>

            <div class="flex gap-3">
              <UModal
                v-model:open="extSubjectModalOpen"
                :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }"
              >
                <UButton
                  label="เพิ่มวิชานอกสาขา"
                  size="xl"
                  icon="i-heroicons-plus-circle"
                  class="cursor-pointer rounded-xl font-bold"
                />
                <template #content>
                  <div class="flex flex-col max-h-[85vh]">
                    <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
                      <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
                        <UIcon name="i-heroicons-plus-circle" class="text-3xl text-blue-600" />
                      </div>
                      <h3 class="text-2xl font-bold text-slate-900 text-center mb-6">
                        เพิ่มวิชานอกสาขา
                      </h3>

                      <div class="space-y-6">
                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            ชื่อรายวิชา <span class="text-red-500">*</span>
                          </h3>
                          <UInput
                            v-model="newExtName"
                            placeholder="กรอกชื่อรายวิชา"
                            size="xl"
                            class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 focus:ring-blue-500 rounded-2xl shadow-xs' }"
                          />
                        </div>

                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            ชื่ออาจารย์ผู้สอน (ไม่ระบุก็ได้)
                          </h3>
                          <UInput
                            v-model="newExtInstructor"
                            placeholder="กรอกชื่ออาจารย์ผู้สอน"
                            size="xl"
                            class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 focus:ring-blue-500 rounded-2xl shadow-xs' }"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="p-6 border-t border-slate-100 bg-white/95 backdrop-blur-sm sticky bottom-0 z-10 w-full">
                      <div class="flex gap-3">
                        <UButton
                          label="ยกเลิก"
                          color="neutral"
                          variant="soft"
                          size="xl"
                          block
                          class="rounded-2xl py-4 flex-1 font-bold"
                          @click="extSubjectModalOpen = false"
                        />
                        <UButton
                          label="บันทึกรายวิชา"
                          color="primary"
                          size="xl"
                          block
                          class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/10 font-bold"
                          :loading="addingExt"
                          :disabled="!newExtName.trim()"
                          @click="async () => {
                            await addExtSubject()
                            extSubjectModalOpen = false
                          }"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </UModal>

              <!-- Modal for editing -->
              <UModal
                v-model:open="editExtModalOpen"
                :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }"
              >
                <template #content>
                  <div class="flex flex-col max-h-[85vh]">
                    <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
                      <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
                        <UIcon name="i-lucide-edit" class="text-3xl text-blue-600" />
                      </div>
                      <h3 class="text-2xl font-bold text-slate-900 text-center mb-6">
                        แก้ไขวิชานอกสาขา
                      </h3>

                      <div class="space-y-6">
                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            ชื่อรายวิชา <span class="text-red-500">*</span>
                          </h3>
                          <UInput
                            v-model="editExtName"
                            placeholder="กรอกชื่อรายวิชา"
                            size="xl"
                            class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 focus:ring-blue-500 rounded-2xl shadow-xs' }"
                          />
                        </div>

                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            ชื่ออาจารย์ผู้สอน (ไม่ระบุก็ได้)
                          </h3>
                          <UInput
                            v-model="editExtInstructor"
                            placeholder="กรอกชื่ออาจารย์ผู้สอน"
                            size="xl"
                            class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 focus:ring-blue-500 rounded-2xl shadow-xs' }"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="p-6 border-t border-slate-100 bg-white/95 backdrop-blur-sm sticky bottom-0 z-10 w-full">
                      <div class="flex gap-3">
                        <UButton
                          label="ยกเลิก"
                          color="neutral"
                          variant="soft"
                          size="xl"
                          block
                          class="rounded-2xl py-4 flex-1 font-bold"
                          @click="editExtModalOpen = false"
                        />
                        <UButton
                          label="บันทึกการแก้ไข"
                          color="primary"
                          size="xl"
                          block
                          class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/10 font-bold"
                          :disabled="!editExtName.trim()"
                          @click="async () => {
                            await saveEditExtSubject()
                            editExtModalOpen = false
                          }"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </UModal>
            </div>
          </div>
          <div class="px-5 py-4 border-t border-slate-50 max-h-80 overflow-y-auto custom-scrollbar">
            <p
              v-if="!externalSubjects?.length"
              class="py-10 text-center text-slate-400 font-medium italic"
            >
              ยังไม่มีรายวิชานอกสาขา
            </p>

            <!-- Grid view for external subjects -->
            <div
              v-else
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              <div
                v-for="ext in externalSubjects"
                :key="ext.id_ext_subject"
                class="group p-4 rounded-2xl bg-slate-100/50 hover:bg-white border border-blue-200 shadow-md shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div class="mb-3">
                  <h3 class="text-base font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                    {{ ext.name_subject }}
                  </h3>
                  <p class="text-sm text-slate-500 mt-1 line-clamp-1">
                    อาจารย์: {{ ext.instructor_name || 'ไม่ระบุ' }}
                  </p>
                </div>

                <div class="flex items-center justify-end gap-1 mt-auto pt-3 border-t border-slate-100">
                  <UButton
                    label="แก้ไข"
                    icon="i-lucide-edit"
                    color="warning"
                    variant="outline"
                    size="xs"
                    class="cursor-pointer rounded-lg hover:bg-amber-50"
                    @click="startEditExtSubject(ext)"
                  />
                  <UButton
                    label="ลบ"
                    icon="i-lucide-trash"
                    color="error"
                    variant="ghost"
                    size="xs"
                    class="cursor-pointer rounded-lg hover:bg-red-50"
                    @click="deleteExtSubject(ext.id_ext_subject)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- ตารางสอน Section Header -->
    <div
      class="flex flex-col md:flex-row justify-between items-center mt-12 mb-6 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
    >
      <div class="flex-1">
        <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
            <UIcon
              name="i-heroicons-calendar-days"
              class="text-xl text-indigo-600"
            />
          </div>
          ตารางสอน
        </h2>
        <p class="text-slate-500 text-md mt-1 ml-13">
          จัดการคาบเรียนของกลุ่มเรียนในแต่ละเทอม
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <!-- ปุ่มจัดการตารางสอน -->
        <div class="flex gap-2">
          <!-- Quick Add Subject to Schedule -->
          <UModal
            v-model:open="quickAddOpen"
            :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }"
          >
            <UButton
              label="ลงวิชาทีละหลายชั่วโมง"
              icon="i-heroicons-calendar-days"
              color="primary"
              size="xl"
              variant="solid"
              class="cursor-pointer rounded-xl font-bold"
            />
            <template #content>
              <div class="flex flex-col max-h-[90vh]">
                <!-- Header -->
                <div class="p-8 pb-4">
                  <div
                    class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200"
                  >
                    <UIcon
                      name="i-heroicons-calendar-days"
                      class="text-3xl text-blue-500"
                    />
                  </div>
                  <h3 class="text-2xl font-bold text-slate-800 text-center mb-4">
                    เพิ่มรายวิชาในตารางเรียน
                  </h3>
                </div>

                <!-- Scrollable Form Content -->
                <div class="flex-1 overflow-y-auto custom-scrollbar px-8 space-y-6 pb-4">
                  <div>
                    <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                      เลือกวิชา
                    </h3>
                    <USelect
                      v-model="quickAddSubject"
                      placeholder="เลือกรายวิชานอกสาขา"
                      :items="externalSubjectOptions"
                      size="xl"
                      class="w-full"
                      :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl', placeholder: 'text-slate-900' }"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                        วัน
                      </h3>
                      <USelect
                        v-model="quickAddDay"
                        placeholder="เลือกวัน"
                        :items="dayOptions"
                        size="xl"
                        class="w-full"
                        :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl', placeholder: 'text-slate-900' }"
                      />
                    </div>
                    <div>
                      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                        ห้องเรียน
                      </h3>
                      <USelect
                        v-model="quickAddRoom"
                        placeholder="ไม่ระบุ"
                        :items="roomOptions"
                        size="xl"
                        class="w-full"
                        :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl', placeholder: 'text-slate-900' }"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                        เวลาเริ่ม
                      </h3>
                      <USelect
                        v-model="quickAddStartTime"
                        placeholder="เลือกเวลา"
                        :items="timeSlotIndexOptions"
                        size="xl"
                        class="w-full"
                        :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl', placeholder: 'text-slate-900' }"
                      />
                    </div>
                    <div>
                      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                        จำนวนชั่วโมง
                      </h3>
                      <USelect
                        v-model="quickAddDuration"
                        :items="durationOptions"
                        size="xl"
                        class="w-full"
                        :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl', placeholder: 'text-slate-900' }"
                      />
                    </div>
                  </div>

                  <div
                    v-if="quickAddPreview"
                    class="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl text-center"
                  >
                    <p class="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">
                      แสดงตัวอย่าง
                    </p>
                    <p class="text-slate-900 font-bold leading-tight">
                      {{ quickAddPreview }}
                    </p>
                  </div>
                </div>

                <!-- Sticky Footer Buttons -->
                <div class="p-6 pt-4 border-t border-slate-200 bg-white flex gap-3">
                  <UButton
                    label="ยกเลิก"
                    color="neutral"
                    variant="soft"
                    size="xl"
                    block
                    class="rounded-2xl py-4 flex-1"
                    @click="quickAddOpen = false"
                  />
                  <UButton
                    label="เพิ่มลงตาราง"
                    color="primary"
                    size="xl"
                    block
                    class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/20"
                    @click="async () => {
                      await addToSchedule()
                      quickAddOpen = false
                    }"
                  />
                </div>
              </div>
            </template>
          </UModal>
          <UButton
            label="บันทึกตาราง"
            color="primary"
            icon="i-heroicons-check-circle"
            size="xl"
            class="cursor-pointer px-6 rounded-xl font-bold shadow-lg shadow-blue-500/20"
            :loading="saving"
            @click="saveSchedule"
          />
          <UButton
            label="ล้างตาราง"
            color="error"
            variant="soft"
            icon="i-heroicons-trash"
            size="xl"
            class="cursor-pointer px-4 rounded-xl font-bold"
            @click="clearSchedule"
          />
        </div>

        <div class="h-8 w-px bg-slate-200 mx-2 hidden md:block" />

        <div class="min-w-[200px]">
          <label class="block text-lg font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">เทอมที่แสดง</label>
          <USelect
            v-model="selectedTerm"
            placeholder="เลือกภาคการศึกษา"
            color="primary"
            variant="outline"
            size="xl"
            :items="termOptions"
            class="w-full"
            icon="i-heroicons-academic-cap"
            :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xs' }"
          />
        </div>
      </div>
    </div>

      <!-- Schedule Table -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <div class="inline-block min-w-full">
            <!-- Header -->
            <div class="flex border-b border-slate-200 bg-slate-100 text-xs sm:text-sm">
              <div
                class="w-20 shrink-0 p-3 font-bold text-center text-slate-700 border-r border-slate-200 sticky left-0 z-40 bg-white"
              >
                วัน/เวลา
              </div>
              <div class="flex flex-1">
                <div
                  v-for="(time, index) in timeSlots"
                  :key="index"
                  class="flex-1 min-w-[80px] p-2 text-center text-slate-600 border-r border-slate-200 last:border-r-0"
                >
                  <span class="block font-bold text-slate-700">คาบที่ {{ index + 1 }}</span>
                  <span class="text-xs">{{ time }}</span>
                </div>
              </div>
            </div>

            <!-- Rows -->
            <div
              v-for="(day, dayIndex) in days"
              :key="dayIndex"
              class="flex border-b border-slate-200 last:border-b-0 text-xs sm:text-sm group hover:bg-slate-100 transition-colors"
            >
              <!-- Day Header -->
              <div
                class="w-20 shrink-0 flex items-center justify-center p-2 font-bold bg-slate-100 border-r border-slate-200 text-slate-700 sticky left-0 z-40"
              >
                {{ day }}
              </div>

              <!-- Slots (แสดงแบบ Merge ตาม displaySlots) -->
              <div class="flex flex-1">
                <div
                  v-for="(slot, gIndex) in displaySlots[dayIndex]"
                  :key="`${dayIndex}-${slot.originalIndex}`"
                  class="relative border-r border-slate-200 last:border-r-0"
                  :style="{ flex: `${slot.span} 1 0%`, minWidth: `${slot.span * 80}px` }"
                >
                  <!-- พักกลางวัน (Index 4) -->
                  <div
                    v-if="slot.isLunch"
                    class="h-full min-h-[60px] p-1 flex items-center justify-center text-center bg-slate-100 text-slate-500 select-none text-xs"
                  >
                    พักกลางวัน
                  </div>

                  <!-- ช่วงเวลาปกติ -->
                  <div
                    v-else
                    class="h-full min-h-[60px] p-1 transition-colors flex flex-col items-center justify-center text-center gap-1"
                    :class="[
                      slot.value ? 'bg-blue-100' : 'bg-white',
                      isReadOnlyStudent ? 'cursor-default' : 'cursor-pointer',
                      isActiveBox(dayIndex, slot.originalIndex) ? 'ring-2 ring-inset ring-blue-500/60 bg-blue-50' : ''
                    ]"
                    @click="!isReadOnlyStudent && !isTeacherSubject(slot.value) && toggleDropdown(dayIndex, slot.originalIndex)"
                  >
                    <template v-if="slot.value">
                      <span class="font-bold text-blue-700 line-clamp-1">
                        {{ getSubjectLabel(slot.value, slot.room_id, slot.section_ids) }}
                      </span>
                    </template>
                    <span
                      v-else
                      class="text-slate-500 text-xs"
                    >ว่าง</span>
                  </div>

                  <!-- Dropdown -->
                  <div
                    v-if="!isReadOnlyStudent && !slot.isLunch && isActiveBox(dayIndex, slot.originalIndex)"
                    class="absolute z-20 w-48 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
                    :class="[
                      dayIndex >= 4 ? 'bottom-full mb-1' : 'top-full mt-1',
                      slot.originalIndex <= 1 ? 'left-0' : slot.originalIndex >= 10 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                    ]"
                  >
                    <div class="max-h-60 overflow-y-auto custom-scrollbar">
                      <button
                        class="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-700 text-xs border-b border-slate-200"
                        @click="setSlotValue(dayIndex, slot.originalIndex, null, slot.span)"
                      >
                        <span class="text-red-500">✖ ล้างข้อมูล</span>
                      </button>

                      <div
                        class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-50 uppercase tracking-wider"
                      >
                        วิชานอกสาขา
                      </div>
                      <button
                        v-for="opt in externalSubjectOptions"
                        :key="opt.value"
                        class="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-700 text-xs truncate"
                        @click="setSlotValue(dayIndex, slot.originalIndex, opt.value, slot.span)"
                      >
                        {{ opt.label }}
                      </button>

                      <template v-if="slot.value && !staticOptions.some(o => o.value === slot.value)">
                        <div
                          class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-50 uppercase tracking-wider mt-1"
                        >
                          ห้องเรียน (คาบนี้)
                        </div>
                        <button
                          v-for="room in roomOptions"
                          :key="room.value"
                          class="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-700 text-xs truncate"
                          :class="{ 'bg-blue-100 text-blue-700': slot.room_id === room.value }"
                          @click="setSlotRoom(dayIndex, slot.originalIndex, room.value, slot.span)"
                        >
                          {{ room.label }}
                        </button>
                      </template>
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
const route = useRoute()
const sectionId = route.params.id
const term = route.query.term

const { data: terms } = await useFetch('/api/terms')
const termOptions = computed(() => {
  if (!terms.value || terms.value.length === 0) return []
  return terms.value.map(t => ({
    label: `เทอม ${t.term}/${t.academic_year}`,
    value: `${t.term}/${t.academic_year}`
  }))
})

const selectedTerm = ref(term || '')

watch(selectedTerm, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal && newVal !== term) {
    navigateTo({
      path: route.path,
      query: { term: newVal }
    })
  }
})
const toast = useToast()

// Constants
const timeSlots = [
  '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
  '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
  '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00'
]
const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

const staticOptions = [
  { value: 'busy', label: 'ไม่ว่าง (ติดกิจกรรมอื่น)' },
  { value: 'lunch', label: 'พักกลางวัน' }
]


const totalSubjectsInSchedule = computed(() => {
  if (!scheduleSlots.value) return 0
  const uniqueSubjects = new Set()
  scheduleSlots.value.forEach(day => {
    day.forEach(slot => {
      if (slot.value && !staticOptions.some(o => o.value === slot.value)) {
        uniqueSubjects.add(slot.value)
      }
    })
  })
  return uniqueSubjects.size
})

const totalStudyHours = computed(() => {
  if (!scheduleSlots.value) return 0
  let hours = 0
  scheduleSlots.value.forEach(day => {
    day.forEach(slot => {
      if (slot.value && !staticOptions.some(o => o.value === slot.value)) {
        hours++
      }
    })
  })
  return hours
})

// State
const isReadOnlyStudent = false // if true: no dropdown / no edits; if false: interactive (external-only)
const activeBox = ref({ day: null, slot: null })
const saving = ref(false)
const scheduleSlots = ref(Array.from({ length: 7 }, () =>
  Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] }))
))

// Quick Add states
const quickAddOpen = ref(false)
const quickAddSubject = ref(null)
const quickAddDay = ref(null)
const quickAddStartTime = ref(null)
const quickAddDuration = ref(1)
const quickAddRoom = ref(null)
const quickAddSelectedSections = ref([])

// External (Out-of-Department) Subjects states
const extSubjectModalOpen = ref(false)
const editExtModalOpen = ref(false)
const newExtName = ref('')
const newExtInstructor = ref('')
const addingExt = ref(false)
const editingExtId = ref(null)
const editExtName = ref('')
const editExtInstructor = ref('')

const { data: rooms } = await useFetch('/api/rooms')
const roomOptions = computed(() => {
  const opts = rooms.value?.map(r => ({ value: r.id_room, label: `${r.room_name}${r.building ? ` (${r.building})` : ''}` })) || []
  return [{ value: null, label: 'ไม่ระบุห้อง' }, ...opts]
})

// Fetch Data
// 1. Get Section Info (Just filter from list for now or assume ID is valid)
// Ideally we should have a GET /api/sections/:id, but we can list all and find
const { data: sections } = await useFetch('/api/sections', { query: { term } })
const section = computed(() => sections.value?.find(s => s.id_section == sectionId))

// 2. Get Subjects for this section (To show in dropdown)
const { data: allSubjects } = await useFetch('/api/Subjects')
const sectionSubjects = computed(() =>
  allSubjects.value?.filter(s =>
    s.sections && s.sections.some(sec => sec.id_section == sectionId)
  ) || []
)

const subjectOptions = computed(() =>
  sectionSubjects.value.map(s => ({
    value: s.id_subject, // Store Subject ID
    label: s.name_subject
  }))
)

// 2.5 Get External Subjects for this section
const { data: externalSubjects, refresh: refreshExternalSubjects } = await useFetch('/api/external-subjects', { query: { id_section: sectionId, term } })
const externalSubjectOptions = computed(() =>
  externalSubjects.value?.map(ext => ({
    value: `ext:${ext.id_ext_subject}`,
    label: `${ext.name_subject} (นอกสาขา)`
  })) || []
)

const allSubjectOptions = computed(() => {
  return [
    { label: '--- วิชาในสาขา ---', disabled: true },
    ...subjectOptions.value,
    ...(externalSubjectOptions.value.length ? [{ label: '--- วิชานอกสาขา ---', disabled: true }] : []),
    ...externalSubjectOptions.value
  ]
})

// Options for Quick Add
const dayOptions = computed(() => days.map((day, index) => ({ value: index, label: day })))
const timeSlotIndexOptions = computed(() => {
  if (quickAddDay.value === null || !quickAddDuration.value) {
    return timeSlots.map((time, index) => ({
      value: index,
      label: `เริ่ม ${time.split(' - ')[0]}`
    })).filter(opt => opt.value !== 4)
  }

  const daySlots = scheduleSlots.value[quickAddDay.value]
  const duration = quickAddDuration.value
  const availableOptions = []

  for (let startIdx = 0; startIdx < 13; startIdx++) {
    if (startIdx === 4) continue // ข้ามการเริ่มที่พักเที่ยง

    let canFit = true
    let slotsNeeded = 0
    let checkIdx = startIdx

    while (slotsNeeded < duration) {
      if (checkIdx >= 13) {
        canFit = false // เลยเวลา
        break
      }
      if (checkIdx === 4) {
        checkIdx++ // ข้ามพักเที่ยง
        continue
      }
      if (daySlots[checkIdx].value !== null) {
        canFit = false // ชนวิชาอื่น
        break
      }
      slotsNeeded++
      checkIdx++
    }

    if (canFit) {
      availableOptions.push({
        value: startIdx,
        label: `เริ่ม ${timeSlots[startIdx].split(' - ')[0]}`
      })
    }
  }

  return availableOptions
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
  if (!quickAddSubject.value || quickAddDay.value === null || quickAddStartTime.value === null || !quickAddDuration.value) return null
  const allOpts = [...externalSubjectOptions.value]
  const subjectLabel = allOpts.find(s => s.value === quickAddSubject.value)?.label || '-'
  const dayLabel = dayOptions.value.find(d => d.value === quickAddDay.value)?.label || '-'
  const startTimeLabel = timeSlotIndexOptions.value.find(t => t.value === quickAddStartTime.value)?.label || '-'
  const roomLabel = quickAddRoom.value ? roomOptions.value.find(r => r.value === quickAddRoom.value)?.label : 'ไม่ระบุ'
  return `${subjectLabel} | ${dayLabel} | ${startTimeLabel} | ${quickAddDuration.value} ชั่วโมง | ห้อง: ${roomLabel}`
})

// Watch subject change in Quick Add
watch(quickAddSubject, (newVal) => {
  if (newVal && typeof newVal === 'string' && newVal.startsWith('ext:')) {
    quickAddSelectedSections.value = [Number(sectionId)]
  } else {
    quickAddSelectedSections.value = []
  }
})

// 3. Load existing schedule
const { data: existingSchedule, refresh: refreshSchedule } = await useFetch('/api/section-schedules', {
  query: { id_section: sectionId, term }
})

watch(existingSchedule, (data) => {
  if (data && data.scheduleData) {
    // Normalize existing data
    const raw = data.scheduleData
    scheduleSlots.value = raw.map((day) => {
      if (!Array.isArray(day)) return Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] }))
      return day.map((slot) => {
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
}, { immediate: true })

// Logic สำหรับการ Merge ช่องที่วิชาเหมือนกันและติดกัน
const displaySlots = computed(() => {
  if (!scheduleSlots.value) return []
  return scheduleSlots.value.map((daySlots) => {
    const grouped = []
    for (let i = 0; i < daySlots.length; i++) {
      const current = daySlots[i]
      if (i === 4) { // พักกลางวัน ไม่ Merge
        grouped.push({ ...current, span: 1, isLunch: true, originalIndex: i })
        continue
      }
      let span = 1
      while (
        i + span < daySlots.length
        && i + span !== 4 // ไม่ Merge ข้ามพักเที่ยง
        && daySlots[i + span].value === current.value
        && current.value !== null
      ) {
        span++
      }
      grouped.push({ ...current, span, originalIndex: i })
      i += span - 1
    }
    return grouped
  })
})

// --- External Subjects CRUD ---
const addExtSubject = async () => {
  if (!newExtName.value.trim()) return
  addingExt.value = true
  try {
    await $fetch('/api/external-subjects', {
      method: 'POST',
      body: {
        id_section: sectionId,
        term,
        name_subject: newExtName.value,
        instructor_name: newExtInstructor.value
      }
    })
    newExtName.value = ''
    newExtInstructor.value = ''
    toast.add({ title: 'สำเร็จ', description: 'เพิ่มวิชานอกสาขาแล้ว', color: 'green' })
    refreshExternalSubjects()
  } catch (e) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: e.message, color: 'red' })
  } finally {
    addingExt.value = false
  }
}

const startEditExtSubject = (ext) => {
  editingExtId.value = ext.id_ext_subject
  editExtName.value = ext.name_subject
  editExtInstructor.value = ext.instructor_name || ''
  editExtModalOpen.value = true
}

const saveEditExtSubject = async () => {
  if (!editExtName.value.trim() || !editingExtId.value) return
  try {
    await $fetch(`/api/external-subjects/${editingExtId.value}`, {
      method: 'PUT',
      body: {
        name_subject: editExtName.value,
        instructor_name: editExtInstructor.value
      }
    })
    editingExtId.value = null
    editExtModalOpen.value = false
    toast.add({ title: 'สำเร็จ', description: 'บันทึกวิชานอกสาขาแล้ว', color: 'green' })
    refreshExternalSubjects()
  } catch (e) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: e.message, color: 'red' })
  }
}

const deleteExtSubject = async (id) => {
  if (!confirm('ยืนยันลบวิชานอกสาขา? (หากมีในตารางจะกลายเป็นสถานะ Unknown)')) return
  try {
    await $fetch(`/api/external-subjects/${id}`, { method: 'DELETE' })
    toast.add({ title: 'สำเร็จ', description: 'ลบวิชานอกสาขาแล้ว', color: 'green' })
    refreshExternalSubjects()
  } catch (e) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: e.message, color: 'red' })
  }
}

// Methods
const isTeacherSubject = (val) => {
  if (!val) return false
  if (typeof val === 'string' && val.startsWith('ext:')) return false
  if (staticOptions.some(o => o.value === val)) return false
  
  const subj = allSubjects.value?.find(sub => sub.id_subject == val)
  return subj && subj.id_teacher != null
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
  const isExternal = typeof val === 'string' && val.startsWith('ext:')
  const subj = !isExternal ? allSubjects.value?.find(sub => sub.id_subject == val) : null
  const defaultSections = subj ? subj.sections.map(sec => sec.id_section) : []

  for (let i = 0; i < span; i++) {
    scheduleSlots.value[d][s + i].value = val
    if (!val || isExternal) {
      scheduleSlots.value[d][s + i].room_id = null
      scheduleSlots.value[d][s + i].section_ids = isExternal ? [Number(sectionId)] : []
    } else {
      scheduleSlots.value[d][s + i].section_ids = [...defaultSections]
    }
  }
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

const addToSchedule = async () => {
  if (!quickAddSubject.value || quickAddDay.value === null || quickAddStartTime.value === null || !quickAddDuration.value) return

  const dayIdx = quickAddDay.value
  const startIdx = quickAddStartTime.value
  const duration = quickAddDuration.value
  const subjectId = quickAddSubject.value
  const roomId = quickAddRoom.value

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

    const isExternal = typeof subjectId === 'string' && subjectId.startsWith('ext:')
    scheduleSlots.value[dayIdx][currentIdx].section_ids = isExternal ? [Number(sectionId)] : [...quickAddSelectedSections.value]

    slotsAdded++
    currentIdx++
  }

  // Reset fields for next add
  quickAddSubject.value = null
  quickAddRoom.value = null
  // Preserve day, but advance start time
  if (currentIdx === 4) {
    quickAddStartTime.value = 5 // Skip lunch
  } else if (currentIdx >= 13) {
    quickAddStartTime.value = null // End of day
    quickAddOpen.value = false // Close if day is full
  } else {
    quickAddStartTime.value = currentIdx
  }

  toast.add({ title: 'สำเร็จ', description: 'เพิ่มวิชาในตารางแล้ว' })
  // quickAddOpen.value = false // Keep open for sequential add
}

const getSubjectLabel = (val, roomId = null, sectionIds = null) => {
  const staticOpt = staticOptions.find(o => o.value === val)
  if (staticOpt) return staticOpt.label

  if (typeof val === 'string' && val.startsWith('ext:')) {
    const extId = Number(val.split(':')[1])
    const extSubj = externalSubjects.value?.find(e => e.id_ext_subject === extId)
    const roomText = roomId ? ` [${rooms.value?.find(r => r.id_room == roomId)?.room_name || ''}]` : ''
    if (!extSubj) return `Unknown (ถูกลบ)${roomText}`
    return `${extSubj.name_subject} [นอกสาขา]${roomText}`
  }

  const subj = allSubjects.value?.find(s => s.id_subject == val)
  if (!subj) return 'Unknown'

  let sectionDisplay = ''
  if (sectionIds && Array.isArray(sectionIds) && sectionIds.length > 0) {
    const names = subj.sections
      .filter(s => sectionIds.includes(s.id_section))
      .map(s => s.section_name)
      .join(', ')
    sectionDisplay = names ? `(${names})` : '(No section)'
  } else {
    // Backwards compatibility or if sectionIds is missing
    sectionDisplay = `(${subj.section_names || '?'})`
  }

  // If we have a specific roomId for this slot, use it.
  let roomName = ''
  if (roomId) {
    const r = rooms.value?.find(rm => rm.id_room == roomId)
    if (r) roomName = r.room_name
  }

  return `${subj.name_subject} ${sectionDisplay} ${roomName ? `[${roomName}]` : ''}`
}

const clearSchedule = (noConfirm = false) => {
  if (!noConfirm && !confirm('ล้างตารางทั้งหมด?')) return
  scheduleSlots.value = Array.from({ length: 7 }, () =>
    Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] }))
  )
}

const saveSchedule = async () => {
  saving.value = true
  try {
    await $fetch('/api/section-schedules', {
      method: 'POST',
      body: {
        id_section: sectionId,
        term: term,
        schedule: scheduleSlots.value
      }
    })
    toast.add({ title: 'บันทึกสำเร็จ', color: 'green' })
    refreshSchedule()
  } catch (err) {
    toast.add({ title: 'บันทึกไม่สำเร็จ', description: err.message, color: 'red' })
  } finally {
    saving.value = false
  }
}

// Close dropdown on click outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      activeBox.value = { day: null, slot: null }
    }
  })
})
</script>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1e293b;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}
</style>
