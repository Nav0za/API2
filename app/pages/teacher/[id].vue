<template>
  <div class="bg-slate-50 text-slate-900 min-h-screen">
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
      <div class="flex flex-col md:flex-row gap-6 mb-8">
        <!-- Profile Card -->
        <div class="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
          <div
            class="w-20 h-20 rounded-full bg-amber-100 text-slate-800 font-bold flex items-center justify-center text-3xl shadow-sm border border-amber-200"
          >
            {{ (teacherData?.first_name?.[0] || '') + (teacherData?.last_name?.[0] || '') }}
          </div>
          <div>
            <h1 class="text-3xl font-bold text-slate-900">
              {{ teacherName }}
            </h1>
            <p class="text-slate-500 mt-1">
              อาจารย์ผู้สอน
            </p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="flex-[2] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-slate-500 text-sm font-medium">
              วิชาที่สอน
            </p>
            <p class="text-2xl font-bold text-blue-600 mt-1">
              {{ subjects?.length || 0 }} วิชา
            </p>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-slate-500 text-sm font-medium">
              ชั่วโมงสอน/สัปดาห์
            </p>
            <p class="text-2xl font-bold text-green-600 mt-1">
              {{ hoursPerWeek }} ชม.
            </p>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-slate-500 text-sm font-medium">
              เทอมที่แสดง
            </p>
            <p class="text-xl font-bold text-amber-500 mt-1">
              {{ selectedTerm || 'ยังไม่เลือก' }}
            </p>
          </div>
        </div>
      </div>

      <!-- แสดงรายวิชาที่สอนโดยอาจารย์ท่านนี้ -->
      <div class="w-full mt-6">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex justify-between items-center text-slate-900 bg-slate-50/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <UIcon
                  name="i-heroicons-book-open"
                  class="text-xl text-blue-600"
                />
              </div>
              <h1 class="text-xl font-bold text-slate-900">
                รายวิชาที่สอน
              </h1>
            </div>

            <div class="flex gap-3">
              <!-- Quick Add Subject to Schedule (Simplified Button) -->
              <UModal
                v-model:open="quickAddOpen"
                :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }"
              >
                <template #content>
                  <div class="flex flex-col max-h-[90vh]">
                    <!-- Header -->
                    <div class="p-8 pb-4">
                      <div
                        class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100"
                      >
                        <UIcon
                          name="i-heroicons-calendar-days"
                          class="text-3xl text-blue-600"
                        />
                      </div>
                      <h3 class="text-2xl font-bold text-slate-900 text-center mb-4">
                        เพิ่มรายวิชาในตารางสอน
                      </h3>
                    </div>

                    <!-- Scrollable Form Content -->
                    <div class="flex-1 overflow-y-auto custom-scrollbar px-8 space-y-6 pb-4 text-slate-900">
                      <div>
                        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          เลือกวิชา
                        </h3>
                        <USelect
                          v-model="quickAddSubject"
                          placeholder="เลือกรายวิชา"
                          :items="subjectOptions"
                          size="xl"
                          class="w-full"
                          :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xs' }"
                        />
                      </div>

                      <div v-if="quickAddSubject">
                        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          กลุ่มเรียน
                          (เลือกเฉพาะที่เรียนคาบนี้)
                        </h3>
                        <div
                          class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar border border-slate-200 rounded-2xl p-4 bg-slate-50 shadow-inner"
                        >
                          <div
                            v-for="sec in subjects.find(s => s.id_subject == quickAddSubject)?.sections"
                            :key="sec.id_section"
                            class="flex items-center gap-3 p-2 hover:bg-slate-100/50 rounded-xl cursor-pointer text-slate-700 transition-colors"
                            @click="() => {
                              if (quickAddSelectedSections.includes(sec.id_section)) {
                                quickAddSelectedSections = quickAddSelectedSections.filter(id => id !== sec.id_section)
                              }
                              else {
                                quickAddSelectedSections = [...quickAddSelectedSections, sec.id_section]
                              }
                            }"
                          >
                            <UCheckbox
                              :model-value="quickAddSelectedSections.includes(sec.id_section)"
                              @update:model-value="(val) => {
                                if (val) quickAddSelectedSections = [...quickAddSelectedSections, sec.id_section]
                                else quickAddSelectedSections = quickAddSelectedSections.filter(id => id !== sec.id_section)
                              }"
                            />
                            <span class="text-sm font-medium">{{ sec.section_name }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            วัน
                          </h3>
                          <USelect
                            v-model="quickAddDay"
                            placeholder="เลือกวัน"
                            :items="dayOptions"
                            size="xl"
                            class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xs' }"
                          />
                        </div>
                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            ห้องเรียน
                          </h3>
                          <USelect
                            v-model="quickAddRoom"
                            placeholder="ไม่ระบุ"
                            :items="roomOptions"
                            size="xl"
                            class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xs' }"
                          />
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            เวลาเริ่ม
                          </h3>
                          <USelect
                            v-model="quickAddStartTime"
                            placeholder="เลือกเวลา"
                            :items="timeSlotIndexOptions"
                            size="xl"
                            class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xs' }"
                          />
                        </div>
                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            จำนวนชั่วโมง
                          </h3>
                          <USelect
                            v-model="quickAddDuration"
                            :items="durationOptions"
                            size="xl"
                            class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xs' }"
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
                        <p class="text-blue-700 font-bold leading-tight">
                          {{ quickAddPreview }}
                        </p>
                      </div>
                    </div>

                    <!-- Sticky Footer Buttons -->
                    <div class="p-6 pt-4 border-t border-slate-100 bg-white flex gap-3">
                      <UButton
                        label="ยกเลิก"
                        color="neutral"
                        variant="soft"
                        size="xl"
                        block
                        class="rounded-2xl py-4 flex-1 font-bold"
                        @click="quickAddOpen = false"
                      />
                      <UButton
                        label="เพิ่มลงตาราง"
                        color="primary"
                        size="xl"
                        block
                        class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/10 font-bold"
                        @click="async () => {
                          await addToSchedule()
                          quickAddOpen = false
                        }"
                      />
                    </div>
                  </div>
                </template>
              </UModal>

              <!-- เพิ่มรายวิชา -->
              <UModal
                v-model:open="open"
                :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }"
              >
                <UButton
                  label="เพิ่มรายวิชาที่สอน"
                  size="xl"
                  icon="i-heroicons-plus-circle"
                  class="cursor-pointer rounded-xl font-bold"
                />
                <template #content>
                  <div class="flex flex-col max-h-[85vh]">
                    <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
                      <div
                        class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100"
                      >
                        <UIcon
                          name="i-heroicons-plus-circle"
                          class="text-3xl text-blue-600"
                        />
                      </div>
                      <h3 class="text-2xl font-bold text-slate-900 text-center mb-6">
                        เพิ่มรายวิชาที่สอน
                      </h3>

                      <div class="space-y-6">
                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            ชื่อวิชา
                          </h3>
                          <UInput
                            v-model="subjectName"
                            placeholder="กรอกชื่อวิชา"
                            size="xl"
                            class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 focus:ring-blue-500 rounded-2xl shadow-xs' }"
                          />
                        </div>

                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            กลุ่มเรียน
                            (Sections)
                          </h3>
                          <div
                            class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar border border-slate-200 rounded-2xl p-4 bg-slate-50 shadow-inner"
                          >
                            <!-- Loading state -->
                            <div
                              v-if="sectionsStatus === 'pending'"
                              class="flex items-center justify-center gap-2 py-4 text-slate-400 text-sm"
                            >
                              <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
                              กำลังโหลดกลุ่มเรียน...
                            </div>
                            <!-- Empty state -->
                            <div
                              v-else-if="!sections || sections.length === 0"
                              class="text-center py-4"
                            >
                              <p class="text-slate-400 text-sm italic">ไม่มีกลุ่มเรียนในระบบ</p>
                              <p class="text-xs text-slate-300 mt-1">กรุณาเพิ่มกลุ่มเรียนในหน้าจัดการกลุ่มเรียนก่อน</p>
                            </div>
                            <!-- Section list -->
                            <template v-else>
                              <div
                                v-for="section in sections"
                                :key="section.id_section"
                                class="flex items-center gap-3 p-2.5 hover:bg-slate-100/50 rounded-xl cursor-pointer text-slate-700 transition-colors"
                                @click="toggleSection(section.id_section)"
                              >
                                <UCheckbox
                                  :model-value="selectedSections.includes(section.id_section)"
                                  @update:model-value="toggleSection(section.id_section)"
                                />
                                <span class="text-sm font-medium">{{ section.section_name }}</span>
                              </div>
                            </template>
                          </div>
                        </div>

                        <div
                          v-if="selectedSections.length > 0"
                          class="bg-blue-50 border border-blue-100 p-3 rounded-xl text-center"
                        >
                          <p class="text-sm text-blue-600 font-medium">
                            เลือกแล้ว {{ selectedSections?.length || 0 }}
                            กลุ่มเรียน
                          </p>
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
                          @click="open = false"
                        />
                        <UButton
                          label="บันทึกรายวิชา"
                          color="primary"
                          size="xl"
                          block
                          class="rounded-2xl py-4 flex-1 shadow-lg shadow-blue-500/10 font-bold"
                          @click="async () => {
                            await addSubject()
                            open = false
                          }"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </UModal>

              <!-- แก้ไขรายวิชา -->
              <UModal
                v-model:open="editOpen"
                :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }"
              >
                <template #content>
                  <div class="flex flex-col max-h-[85vh]">
                    <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
                      <div
                        class="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100"
                      >
                        <UIcon
                          name="i-lucide-edit"
                          class="text-3xl text-amber-600"
                        />
                      </div>
                      <h3 class="text-2xl font-bold text-slate-900 text-center mb-6">
                        แก้ไขรายวิชา
                      </h3>

                      <div class="space-y-6">
                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            ชื่อวิชา
                          </h3>
                          <UInput
                            v-model="editSubjectName"
                            size="xl"
                            class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 focus:ring-amber-500 rounded-2xl shadow-xs' }"
                          />
                        </div>

                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            กลุ่มเรียน
                            (Sections)
                          </h3>
                          <div
                            class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar border border-slate-200 rounded-2xl p-4 bg-slate-50 shadow-inner"
                          >
                            <!-- Loading state -->
                            <div
                              v-if="sectionsStatus === 'pending'"
                              class="flex items-center justify-center gap-2 py-4 text-slate-400 text-sm"
                            >
                              <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
                              กำลังโหลดกลุ่มเรียน...
                            </div>
                            <!-- Empty state -->
                            <p
                              v-else-if="!sections || sections.length === 0"
                              class="text-slate-400 text-sm text-center py-4 italic"
                            >
                              ไม่มีกลุ่มเรียนในระบบ
                            </p>
                            <!-- Section list -->
                            <template v-else>
                              <div
                                v-for="section in sections"
                                :key="section.id_section"
                                class="flex items-center gap-3 p-2.5 hover:bg-slate-100/50 rounded-xl cursor-pointer text-slate-700 transition-colors"
                                @click="toggleEditSection(section.id_section)"
                              >
                                <UCheckbox
                                  :model-value="editSelectedSections.includes(section.id_section)"
                                  @update:model-value="toggleEditSection(section.id_section)"
                                />
                                <span class="text-sm font-medium">{{ section.section_name }}</span>
                              </div>
                            </template>
                          </div>
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
                          @click="editOpen = false"
                        />
                        <UButton
                          label="บันทึกการแก้ไข"
                          color="warning"
                          size="xl"
                          block
                          class="rounded-2xl py-4 flex-1 shadow-lg shadow-amber-500/10 font-bold"
                          @click="async () => {
                            await updateSubject()
                            editOpen = false
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
            <div v-if="pending">
              <div class="flex items-center justify-center py-10 text-slate-400">
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="animate-spin mr-2"
                />
                กำลังโหลดวิชา...
              </div>
            </div>
            <div v-else>
              <p
                v-if="!subjects || subjects.length === 0"
                class="py-10 text-center text-slate-400 font-medium italic"
              >
                ยังไม่มีรายวิชาที่สอน
              </p>

              <!-- แสดงรายวิชาที่สอนเป็น Grid -->
              <div
                v-else
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                <div
                  v-for="subject in subjects"
                  :key="subject.id_subject"
                  class="group p-4 rounded-2xl bg-slate-100/50 hover:bg-white border border-blue-200 shadow-md shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div class="mb-3">
                    <h3
                      class="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {{ subject.name_subject }}
                    </h3>
                    <p class="text-xs text-slate-500 mt-1 line-clamp-1">
                      {{ subject.section_names || 'ไม่ระบุกลุ่ม' }}
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
                      @click="editSubject(subject)"
                    />
                    <UButton
                      label="ลบ"
                      icon="i-lucide-trash"
                      color="error"
                      variant="ghost"
                      size="xs"
                      class="cursor-pointer rounded-lg hover:bg-red-50"
                      @click="deleteSubject(subject.id_subject)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ตารางสอน Section Header -->
    <div
      class="container mx-auto flex flex-col md:flex-row justify-between items-center mt-12 mb-6 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
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
          จัดการคาบสอนหลักของอาจารย์ในแต่ละเทอม
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <!-- ปุ่มบันทึกตารางสอน -->
        <div class="flex gap-2">
          <UButton
            label="ลงวิชาทีละหลายชั่วโมง"
            icon="i-heroicons-calendar-days"
            color="primary"
            variant="solid"
            size="xl"
            class="cursor-pointer rounded-xl font-bold"
            @click="quickAddOpen = true"
          />
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
          <label
            class="block text-lg font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
          >เทอมที่แสดง</label>
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

    <div class="container mx-auto">
      <div
        v-if="!selectedTerm"
        class="text-center text-slate-400 py-10 font-medium italic"
      >
        กรุณาเลือกภาคการศึกษาเพื่อแสดง/จัดการตารางสอน
      </div>

      <!-- ตารางสอน -->
      <div
        v-else
        class="mt-4 overflow-x-auto pb-6 custom-scrollbar"
      >
        <div class="min-w-fit md:min-w-full p-1">
          <div
            class="grid grid-cols-[80px_repeat(13,minmax(85px,1fr))] text-center border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white"
          >
            <!-- แสดงเวลา Header -->
            <div
              class="bg-slate-50 font-bold border-r border-b border-slate-200 flex items-center justify-center text-slate-700 sticky left-0 z-40 p-2 text-sm uppercase tracking-wider"
            >
              วัน / เวลา
            </div>
            <div
              v-for="time in timeSlots"
              :key="time"
              class="bg-slate-50 p-2 text-center text-xs font-bold border-b border-r border-slate-200 last:border-r-0 text-slate-500 uppercase tracking-tighter"
            >
              {{ time }}
            </div>

            <!-- ลูปทุกวัน -->
            <template
              v-for="(day, dayIndex) in days"
              :key="dayIndex"
            >
              <div
                class="border-r border-b border-slate-200 p-2 text-center bg-slate-50 text-slate-700 flex items-center justify-center font-bold sticky left-0 z-40 text-lg min-h-[90px]"
              >
                {{ day }}
              </div>

              <!-- ช่วงเวลาทั้งหมด 13 ช่อง (แสดงแบบ Merge ตาม displaySlots) -->
              <template
                v-for="(slot, gIndex) in displaySlots[dayIndex]"
                :key="`${dayIndex}-${slot.originalIndex}`"
              >
                <!-- ช่วงปกติ (ข้ามคาบที่ 5/index 4 พักเที่ยง) -->
                <div
                  v-if="!slot.isLunch"
                  class="relative border-r border-b border-slate-200 last:border-r-0 min-h-[90px]"
                  :style="{ gridColumn: `span ${slot.span}`, minWidth: `${slot.span * 85}px` }"
                >
                  <div
                    class="absolute inset-0 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5"
                    :class="[
                      slot.value ? 'bg-blue-50 hover:bg-blue-100 font-bold text-blue-700 border border-blue-100/50 m-1 rounded-xl shadow-xs' : 'bg-transparent hover:bg-slate-50 text-slate-300',
                      isActiveBox(dayIndex, slot.originalIndex) ? 'ring-2 ring-inset ring-blue-500 bg-blue-50' : ''
                    ]"
                    @click="toggleDropdown(dayIndex, slot.originalIndex)"
                  >
                    <template v-if="slot.value">
                      <span class="text-xs line-clamp-2 leading-tight">
                        {{ getSubjectLabel(slot.value, slot.room_id, slot.section_ids) }}
                      </span>
                    </template>
                    <span
                      v-else
                      class="text-md"
                    >ว่าง</span>
                  </div>

                  <!-- Dropdown -->
                  <div
                    v-if="isActiveBox(dayIndex, slot.originalIndex)"
                    class="absolute z-50 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in duration-200"
                    :class="[
                      dayIndex >= 4 ? 'bottom-full mb-2' : 'top-full mt-2',
                      slot.originalIndex <= 1 ? 'left-0' : slot.originalIndex >= 10 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                    ]"
                  >
                    <div class="max-h-80 overflow-y-auto custom-scrollbar">
                      <button
                        class="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 text-[11px] font-bold border-b border-slate-50 flex items-center gap-2 transition-colors"
                        @click="setSlotValue(dayIndex, slot.originalIndex, null, slot.span)"
                      >
                        <UIcon
                          name="i-lucide-trash"
                          class="text-red-500 text-sm"
                        />
                        <span>ล้างข้อมูลคาบนี้</span>
                      </button>

                      <div
                        class="px-4 py-1.5 text-[9px] font-bold text-slate-400 bg-slate-50/80 uppercase tracking-widest mt-1"
                      >
                        เลือกรายวิชา
                      </div>
                      <button
                        v-for="opt in subjectOptions"
                        :key="opt.value"
                        class="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-700 text-[11px] truncate transition-colors font-medium border-l-4 border-transparent"
                        :class="{ 'bg-blue-50 border-blue-500 text-blue-700': slot.value === opt.value }"
                        @click="setSlotValue(dayIndex, slot.originalIndex, opt.value, slot.span)"
                      >
                        {{ opt.label }}
                      </button>

                      <template v-if="slot.value">
                        <div
                          class="px-4 py-1.5 text-[9px] font-bold text-slate-400 bg-slate-50/80 uppercase tracking-widest mt-2"
                        >
                          กลุ่มเรียน (Sections)
                        </div>
                        <div
                          v-for="sec in subjects.find(s => s.id_subject == slot.value)?.sections"
                          :key="sec.id_section"
                          class="w-full text-left px-4 py-2 hover:bg-amber-50 text-slate-700 text-[11px] flex items-center gap-2 cursor-pointer transition-colors font-medium"
                          @click="toggleSlotSection(dayIndex, slot.originalIndex, sec.id_section, slot.span)"
                        >
                          <UCheckbox
                            :model-value="(scheduleSlots[dayIndex][slot.originalIndex].section_ids || []).includes(sec.id_section)"
                            @update:model-value="toggleSlotSection(dayIndex, slot.originalIndex, sec.id_section, slot.span)"
                          />
                          <span class="truncate">{{ sec.section_name }}</span>
                        </div>

                        <div
                          class="px-4 py-1.5 text-[9px] font-bold text-slate-400 bg-slate-50/80 uppercase tracking-widest mt-2"
                        >
                          ห้องเรียน (คาบนี้)
                        </div>
                        <button
                          v-for="room in roomOptions"
                          :key="room.value"
                          class="w-full text-left px-4 py-2 hover:bg-indigo-50 text-slate-600 text-[11px] truncate transition-colors font-medium"
                          :class="{ 'bg-indigo-50 text-indigo-700': slot.room_id === room.value }"
                          @click="setSlotRoom(dayIndex, slot.originalIndex, room.value, slot.span)"
                        >
                          {{ room.label || 'ไม่ระบุห้อง' }}
                        </button>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- ช่อง พักกลางวัน -->
                <div
                  v-else
                  class="border-r border-b border-slate-200 p-1 text-center bg-slate-50 text-slate-400 font-bold flex items-center justify-center text-md select-none uppercase tracking-tighter min-h-[90px]"
                >
                  พักกลางวัน
                </div>
              </template>
            </template>
          </div>
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
  query: computed(() => ({ id_teacher: id, term: selectedTerm.value })),
  watch: [selectedTerm]
})
const { data: teachers, pending } = await useFetch('/api/teachers')
const { data: terms } = await useFetch('/api/terms')
// sections เป็น master table ไม่ขึ้นกับ term — fetch ครั้งเดียวพอ
const { data: sections, refresh: refreshSections, status: sectionsStatus } = await useFetch('/api/sections')

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
const teacherData = computed(() =>
  teachers.value?.find(t => t.id_teacher == id)
)

const teacherName = computed(() =>
  formatName(teacherData.value) || 'ไม่พบชื่ออาจารย์'
)

const formatName = (t) => {
  if (!t) return ''
  return [t.prefix, t.first_name, t.last_name].filter(Boolean).join(' ').trim()
}

const hoursPerWeek = computed(() => {
  if (!scheduleSlots.value) return 0
  let count = 0
  scheduleSlots.value.forEach((day) => {
    day.forEach((slot) => {
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
    label: s.section_name
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

// Helper: เปรียบเทียบว่าสองช่องสามารถ merge ได้หรือไม่
// เงื่อนไข: วิชา + ห้องเรียน + กลุ่มนักศึกษา ต้องตรงกันทั้งหมด
const slotsCanMerge = (a, b) => {
  if (!a.value || a.value !== b.value) return false
  if (a.room_id !== b.room_id) return false
  const aIds = [...(a.section_ids || [])].sort((x, y) => x - y)
  const bIds = [...(b.section_ids || [])].sort((x, y) => x - y)
  if (aIds.length !== bIds.length) return false
  return aIds.every((id, idx) => id === bIds[idx])
}

// Logic สำหรับการ Merge ช่องที่วิชา + ห้อง + กลุ่มนักศึกษาเหมือนกันและติดกัน
const displaySlots = computed(() => {
  if (!scheduleSlots.value) return []
  return scheduleSlots.value.map((daySlots) => {
    const grouped = []
    for (let i = 0; i < daySlots.length; i++) {
      const current = daySlots[i]
      if (i === 4) { // พักเที่ยง ไม่ Merge
        grouped.push({ ...current, span: 1, isLunch: true, originalIndex: i })
        continue
      }
      let span = 1
      while (
        i + span < daySlots.length
        && i + span !== 4 // ไม่ Merge ข้ามพักเที่ยง
        && slotsCanMerge(current, daySlots[i + span])
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
    scheduleSlots.value.forEach((day) => {
      day.forEach((slot) => {
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
  return res.map((day) => {
    const d = Array.isArray(day) ? [...day] : []
    while (d.length < 13) d.push({ value: null, room_id: null, section_ids: [] })
    return d.map((slot) => {
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

const clearSchedule = (noConfirm = false) => {
  if (!noConfirm && !confirm('ล้างตารางทั้งหมด?')) return
  scheduleSlots.value = Array.from({ length: 7 }, () =>
    Array.from({ length: 13 }, () => ({ value: null, room_id: null, section_ids: [] }))
  )
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
    clearSchedule(true)
  }
}, { immediate: true })

watch(scheduleError, (err) => {
  if (err) console.error('[Schedule] API Error:', err)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animations */
@keyframes zoom-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-in {
  animation: zoom-in 0.2s ease-out forwards;
}
</style>
