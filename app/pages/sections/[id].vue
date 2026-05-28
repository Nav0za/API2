<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Navbar -->
    <nav class="bg-white border-b border-slate-200 shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" to="/sections" />
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
            class="w-20 h-20 rounded-full bg-blue-100 text-slate-800 font-bold flex items-center justify-center text-3xl shadow-sm border border-blue-200">
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

      <!-- Subjects in Schedule Grid View -->
      <div class="w-full mt-6 mb-8">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between text-slate-900 bg-slate-50/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                <UIcon name="i-heroicons-academic-cap" class="text-xl text-indigo-600" />
              </div>
              <div>
                <h1 class="text-xl font-bold text-slate-900">
                  รายวิชาเรียน (จากแผนการเรียน)
                </h1>
                <p class="text-xs text-slate-500">วิชาทั้งหมดที่กลุ่มนี้จะเรียนในเทอมนี้</p>
              </div>
            </div>

            <div class="flex gap-3">
              <UModal v-model:open="internalSubjectModalOpen"
                :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }">
                <UButton label="เพิ่มวิชาเรียน" size="xl" icon="i-heroicons-plus-circle" color="primary"
                  class="cursor-pointer rounded-xl font-bold" @click="() => {
                    if (!section?.id_plan) {
                       toast.add({ title: 'คำเตือน', description: 'กรุณาระบุแผนการเรียนให้กลุ่มเรียนนี้ก่อนที่หน้าแรก', color: 'orange' })
                       return
                    }
                    internalAddPlanId.value = Number(section.id_plan)
                    internalAddTeacherIds.value = []
                    internalAddExternalName.value = ''
                    internalSubjectModalOpen = true
                  }" />
                <template #content>
                  <div class="flex flex-col max-h-[85vh]">
                    <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
                      <div
                        class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-100">
                        <UIcon name="i-heroicons-plus-circle" class="text-3xl text-indigo-600" />
                      </div>
                      <h3 class="text-2xl font-bold text-slate-900 text-center mb-6">
                        เพิ่มวิชาเรียน
                      </h3>

                      <div class="space-y-6">
                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            แผนการเรียน <span class="text-red-500">*</span>
                          </h3>
                          <UInput
                            :model-value="selectedInternalPlanLabel"
                            readonly
                            size="xl"
                            class="w-full"
                            placeholder="ไม่พบข้อมูลแผนการเรียน"
                            :ui="{ base: 'bg-slate-50 border-slate-200 text-slate-700 rounded-2xl shadow-xs' }"
                          />
                        </div>

                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            รายวิชา <span class="text-red-500">*</span>
                          </h3>
                          <USelectMenu v-model="internalAddSubjectId" :items="availableAddSubjectOptions"
                            value-attribute="value" option-attribute="label" placeholder="เลือกวิชา" size="xl"
                            :disabled="!selectedInternalPlanId" class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500 rounded-2xl shadow-xs break-words whitespace-normal text-left h-auto py-2' }">
                            <template #item="{ item }">
                              <span class="whitespace-normal break-words text-left w-full block py-0.5">
                                {{ item.label }}
                              </span>
                            </template>
                          </USelectMenu>
                          <p v-if="selectedInternalPlanId && loadingPlanSubjects" class="text-xs text-slate-400 mt-1">
                            กำลังโหลดรายวิชาจากแผนการเรียน...
                          </p>
                          <p v-else-if="selectedInternalPlanId && !loadingPlanSubjects && availableAddSubjectOptions.length === 0"
                            class="text-xs text-amber-600 mt-1">
                            ไม่พบรายวิชาในแผนนี้ (ตรวจสอบว่ามีการเพิ่มรายวิชาในแผนการเรียนแล้ว)
                          </p>
                        </div>

                        <div>
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            อาจารย์ผู้สอน (เลือกได้หลายคน) <span class="text-red-500">*</span>
                          </h3>
                          <USelectMenu
                            v-model="internalAddTeacherMenuValue"
                            :items="teacherOptionsWithExternal"
                            multiple
                            value-attribute="value"
                            option-attribute="label"
                            placeholder="เลือกอาจารย์ผู้สอน"
                            size="xl"
                            class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500 rounded-2xl shadow-xs break-words whitespace-normal text-left h-auto py-2' }"
                          >
                            <template #label>
                              <span class="block w-full min-w-0 truncate">
                                {{ internalAddTeacherIds?.length ? internalAddTeacherIds.map(id => teacherOptionsWithExternal.find(opt => String(opt.value) === String(getRawValue(id)))?.label).filter(Boolean).join(' / ') : 'เลือกอาจารย์ผู้สอน' }}
                              </span>
                            </template>
                            <template #item="{ item }">
                              <div class="flex items-start gap-2 w-full py-0.5">
                                <UIcon
                                  :name="internalAddTeacherIds?.map(id => String(getRawValue(id))).includes(String(item.value)) ? 'i-heroicons-check-circle-solid' : 'i-heroicons-plus-circle'"
                                  class="mt-0.5 shrink-0"
                                  :class="internalAddTeacherIds?.map(id => String(getRawValue(id))).includes(String(item.value)) ? 'text-emerald-500' : 'text-slate-300'"
                                />
                                <span class="whitespace-normal break-words text-left w-full block">
                                  {{ item.label }}
                                </span>
                              </div>
                            </template>
                          </USelectMenu>
                        </div>

                        <div v-if="isExternalTeacherSelected"
                          class="animate-in fade-in slide-in-from-top-4 duration-300">
                          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            ระบุชื่ออาจารย์นอกสาขา <span class="text-red-500">*</span>
                          </h3>
                          <UInput v-model="internalAddExternalName" placeholder="เช่น อ.สมชาย ใจดี" size="xl"
                            class="w-full"
                            :ui="{ base: 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500 rounded-2xl shadow-xs' }" />
                        </div>
                      </div>
                    </div>

                    <div class="p-6 border-t border-slate-100 bg-white/95 backdrop-blur-sm sticky bottom-0 z-10 w-full">
                      <div class="flex gap-3">
                        <UButton label="ยกเลิก" color="neutral" variant="soft" size="xl" block
                          class="rounded-2xl py-4 flex-1 font-bold" @click="internalSubjectModalOpen = false" />
                        <UButton label="บันทึกรายวิชา" color="primary" size="xl" block
                          class="rounded-2xl py-4 flex-1 shadow-lg shadow-indigo-500/10 font-bold cursor-pointer"
                          :loading="addingInternal" :disabled="!isValidInternalSubject" @click="async () => {
                            await addInternalSubject()
                            internalSubjectModalOpen = false
                          }" />
                      </div>
                    </div>
                  </div>
                </template>
              </UModal>
            </div>
          </div>

          <div class="px-5 py-4 border-t border-slate-50 max-h-80 overflow-y-auto custom-scrollbar">
            <p v-if="!groupedSectionSubjects?.length" class="py-10 text-center text-slate-400 font-medium italic">
              ยังไม่มีรายวิชาเรียน (กรุณาเพิ่มวิชาจากแผน)
            </p>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div v-for="subj in groupedSectionSubjects" :key="subj.group_key"
                class="group p-4 rounded-2xl bg-indigo-50/20 hover:bg-white border border-indigo-100 shadow-md shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
                <div class="mb-3">
                  <h3
                    class="text-base font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {{ subj.name_subject }}
                  </h3>
                  <p class="text-sm text-slate-500 mt-1 line-clamp-2">
                    อาจารย์: {{ subj.teacher_names.join(', ') || 'ไม่ระบุ' }}
                    <span v-if="subj.has_external_teacher"
                      class="text-[10px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded ml-1">นอกสาขา</span>
                  </p>
                </div>
                <div class="flex gap-2">
                  <UButton
                    label="แก้ไข"
                    color="warning"
                    variant="outline"
                    size="md"
                    icon="i-lucide-pencil"
                    class="flex-1 cursor-pointer"
                    @click="openEditSubjectModal(subj)"
                  />
                  <UButton
                    label="ลบ"
                    color="error"
                    variant="soft"
                    size="md"
                    icon="i-lucide-trash"
                    class="flex-1 cursor-pointer"
                    :loading="deletingGroupKey === subj.group_key"
                    @click="deleteInternalSubjectGroup(subj)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UModal v-model:open="editSubjectModalOpen"
        :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }">
        <template #content>
          <div class="flex flex-col max-h-[85vh]">
            <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
              <h3 class="text-2xl font-bold text-slate-900 text-center mb-6">
                แก้ไขรายวิชา
              </h3>

              <div class="space-y-6">
                <div>
                  <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">รายวิชา</h3>
                  <UInput :model-value="editSubjectName" readonly size="xl" class="w-full"
                    :ui="{ base: 'bg-slate-50 border-slate-200 text-slate-700 rounded-2xl shadow-xs' }" />
                </div>

                <div>
                  <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    อาจารย์ผู้สอน <span class="text-red-500">*</span>
                  </h3>
                  <USelectMenu
                    v-model="editSubjectTeacherMenuValue"
                    :items="teacherOptionsWithExternal"
                    multiple
                    value-attribute="value"
                    option-attribute="label"
                    placeholder="เลือกอาจารย์ผู้สอน"
                    size="xl"
                    class="w-full"
                    :ui="{ base: 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500 rounded-2xl shadow-xs break-words whitespace-normal text-left h-auto py-2' }"
                  >
                    <template #label>
                      <span class="block w-full min-w-0 truncate">
                        {{ editSubjectTeacherIds?.length ? editSubjectTeacherIds.map(id => teacherOptionsWithExternal.find(opt => String(opt.value) === String(getRawValue(id)))?.label).filter(Boolean).join(' / ') : 'เลือกอาจารย์ผู้สอน' }}
                      </span>
                    </template>
                    <template #item="{ item }">
                      <div class="flex items-start gap-2 w-full py-0.5">
                        <UIcon
                          :name="editSubjectTeacherIds?.map(id => String(getRawValue(id))).includes(String(item.value)) ? 'i-heroicons-check-circle-solid' : 'i-heroicons-plus-circle'"
                          class="mt-0.5 shrink-0"
                          :class="editSubjectTeacherIds?.map(id => String(getRawValue(id))).includes(String(item.value)) ? 'text-emerald-500' : 'text-slate-300'"
                        />
                        <span class="whitespace-normal break-words text-left w-full block">
                          {{ item.label }}
                        </span>
                      </div>
                    </template>
                  </USelectMenu>
                </div>

                <div v-if="editIsExternalTeacher" class="animate-in fade-in slide-in-from-top-4 duration-300">
                  <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    ระบุชื่ออาจารย์นอกสาขา <span class="text-red-500">*</span>
                  </h3>
                  <UInput v-model="editSubjectExternalName" placeholder="เช่น อ.สมชาย ใจดี" size="xl" class="w-full"
                    :ui="{ base: 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500 rounded-2xl shadow-xs' }" />
                </div>
              </div>
            </div>

            <div class="p-6 border-t border-slate-100 bg-white/95 backdrop-blur-sm sticky bottom-0 z-10 w-full">
              <div class="flex gap-3">
                <UButton label="ยกเลิก" color="neutral" variant="soft" size="xl" block
                  class="rounded-2xl py-4 flex-1 font-bold" @click="editSubjectModalOpen = false" />
                <UButton label="บันทึกการแก้ไข" color="indigo" size="xl" block
                  class="rounded-2xl py-4 flex-1 shadow-lg shadow-indigo-500/10 font-bold"
                  :loading="updatingSubject"
                  :disabled="!isValidEditSubject"
                  @click="saveEditSubject" />
              </div>
            </div>
          </div>
        </template>
      </UModal>



      <!-- ตารางสอน Section Header -->
      <div
        class="flex flex-col md:flex-row justify-between items-stretch md:items-center mt-12 mb-4 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-3 uppercase">
            <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
              <UIcon name="i-heroicons-calendar-days" class="text-xl text-indigo-600" />
            </div>
            ตารางเรียน
          </h2>
          <p class="text-slate-500 text-md mt-1 ml-13">
            จัดการคาบเรียนของกลุ่มเรียนในแต่ละเทอม
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4 w-full md:w-auto min-w-0">
          <!-- ปุ่มจัดการตารางสอน -->
          <div class="flex gap-2">
            <!-- Quick Add Subject to Schedule -->
            <UModal v-model:open="quickAddOpen"
              :ui="{ content: 'bg-white border border-slate-200 rounded-3xl overflow-hidden' }">
              <UButton label="ลงวิชาทีละหลายชั่วโมง" icon="i-heroicons-calendar-days" color="primary" size="xl"
                variant="solid" class="cursor-pointer rounded-xl font-bold" />
              <template #content>
                <div class="flex flex-col max-h-[90vh]">
                  <!-- Header -->
                  <div class="p-8 pb-4">
                    <div
                      class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200">
                      <UIcon name="i-heroicons-calendar-days" class="text-3xl text-blue-500" />
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
                      <USelect v-model="quickAddSubject" placeholder="เลือกรายวิชา" :items="subjectOptions" size="xl"
                        class="w-full"
                        :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl', placeholder: 'text-slate-900' }" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                          วัน
                        </h3>
                        <USelect v-model="quickAddDay" placeholder="เลือกวัน" :items="dayOptions" size="xl"
                          class="w-full"
                          :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl', placeholder: 'text-slate-900' }" />
                      </div>
                      <div>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                          ห้องเรียน
                        </h3>
                        <USelect v-model="quickAddRoom" placeholder="ไม่ระบุ" :items="roomOptions" size="xl"
                          class="w-full"
                          :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl', placeholder: 'text-slate-900' }" />
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                          เวลาเริ่ม
                        </h3>
                        <USelect v-model="quickAddStartTime" placeholder="เลือกเวลา" :items="timeSlotIndexOptions"
                          size="xl" class="w-full"
                          :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl', placeholder: 'text-slate-900' }" />
                      </div>
                      <div>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                          จำนวนชั่วโมง
                        </h3>
                        <USelect v-model="quickAddDuration" :items="durationOptions" size="xl" class="w-full"
                          :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl', placeholder: 'text-slate-900' }" />
                      </div>
                    </div>

                    <div v-if="quickAddPreview"
                      class="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl text-center">
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
            <UButton label="บันทึกตาราง" color="primary" icon="i-heroicons-check-circle" size="xl"
              class="cursor-pointer px-6 rounded-xl font-bold shadow-lg shadow-blue-500/20" :loading="saving"
              @click="saveSchedule" />
            <UButton label="ล้างตาราง" color="error" variant="soft" icon="i-heroicons-trash" size="xl"
              class="cursor-pointer px-4 rounded-xl font-bold" @click="clearSchedule" />
          </div>

          <div class="h-8 w-px bg-slate-200 mx-2 hidden md:block" />

          <div class="w-full sm:w-auto sm:min-w-[200px] min-w-0">
            <label
              class="block text-lg font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">เทอมที่แสดง</label>
            <USelect v-model="selectedTerm" placeholder="เลือกภาคการศึกษา" color="primary" variant="outline" size="xl"
              :items="termOptions" class="w-full" icon="i-heroicons-academic-cap"
              :ui="{ base: 'bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xs' }" />
          </div>
        </div>
      </div>

      <!-- Paint Mode Toolbar (แยกบล็อค) -->
      <div
        class="bg-indigo-50/50 border border-indigo-200 p-4 rounded-2xl mb-4 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center shadow-inner transition-all overflow-hidden"
        :class="isPaintMode ? 'bg-indigo-50 ring-2 ring-indigo-500/20' : ''">
        <div class="flex items-center gap-3 w-full xl:w-auto min-w-0">
          <USwitch v-model="isPaintMode" color="primary" size="lg" @update:model-value="togglePaintMode" />
          <div class="min-w-0">
            <span class="font-bold text-indigo-900 text-lg flex items-center gap-2 min-w-0">
              <UIcon name="i-lucide-paint-brush" /> โหมดวาดตาราง (Paint)
            </span>
            <p class="text-xs text-indigo-600/80 font-medium mt-0.5">ลากเมาส์ผ่านช่องเวลาเพื่อลงวิชาอัตโนมัติ</p>
          </div>
        </div>

        <div v-if="isPaintMode"
          class="flex-1 flex flex-col w-full gap-3 min-w-0 animate-in fade-in slide-in-from-left-4 duration-300">

          <div class="flex flex-col md:flex-row w-full gap-3 min-w-0">
            <USelectMenu v-model="paintSubjectId"
              :items="[{ label: '🧹 ลบวิชา (ยางลบ)', value: null }, ...paintSubjectOptions]" value-attribute="value"
              option-attribute="label" placeholder="-- เลือกวิชาที่จะระบาย --" size="xl" class="flex-1 min-w-0 shadow-sm"
              :ui="{ base: 'w-full min-w-0 bg-white border-indigo-300 text-slate-900 focus:ring-indigo-500 rounded-xl font-bold truncate' }" />

            <USelectMenu v-model="paintType"
              :items="[{ label: 'ทฤษฎี (ท.)', value: 'theory' }, { label: 'ปฏิบัติ (ป.)', value: 'practical' }]"
              value-attribute="value" option-attribute="label" placeholder="-- เลือกประเภท --" size="xl"
              class="w-full md:w-48 md:shrink-0 shadow-sm" :disabled="paintSubjectId === null"
              :ui="{ base: 'w-full min-w-0 bg-white border-indigo-300 text-slate-900 focus:ring-indigo-500 rounded-xl truncate' }" />

            <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-indigo-200 bg-white/80 shadow-sm w-full md:w-auto md:shrink-0">
              <span class="text-sm font-bold" :class="paintScheduleKind === 'lesson' ? 'text-indigo-700' : 'text-slate-400'">วิชาเรียน</span>
              <USwitch
                v-model="paintScheduleKindChecked"
                color="primary"
                size="md"
                :disabled="paintSubjectId === null"
              />
              <span class="text-sm font-bold" :class="paintScheduleKind === 'internship' ? 'text-amber-700' : 'text-slate-400'">ฝึกงาน</span>
            </div>

            <USelectMenu v-model="paintRoomId" :items="roomOptions" value-attribute="value" option-attribute="label"
              placeholder="ห้องเรียน (ไม่บังคับ)" size="xl" class="w-full md:w-56 md:shrink-0 shadow-sm"
              :disabled="paintSubjectId === null"
              :ui="{ base: 'w-full min-w-0 bg-white border-indigo-300 text-slate-900 focus:ring-indigo-500 rounded-xl truncate' }" />

            <div v-if="isDragging"
              class="hidden md:flex items-center px-4 bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-md animate-pulse">
              กำลังวาด...
            </div>
          </div>

          <div v-if="paintSubjectId && paintTeacherOptions.length"
            class="bg-white/70 border border-indigo-200/60 rounded-xl p-3 max-w-full min-w-0 overflow-hidden">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 w-full">
              <p class="text-xs font-bold uppercase tracking-widest text-indigo-700 min-w-0">
                เลือกผู้สอนในคาบนี้
              </p>
              <div class="flex flex-wrap gap-2 shrink-0">
                <UButton size="xs" color="neutral" variant="soft" label="เลือกทั้งหมด"
                  class="rounded-lg whitespace-nowrap shrink-0" @click="selectAllPaintTeachers" />
                <UButton size="xs" color="neutral" variant="soft" label="ล้างทั้งหมด"
                  class="rounded-lg whitespace-nowrap shrink-0" @click="clearPaintTeachers" />
              </div>
            </div>
            <UCheckboxGroup
              v-model="paintTeacherIds"
              :items="paintTeacherOptions"
              value-key="value"
              label-key="label"
              variant="list"
              class="w-full max-w-full min-w-0 max-h-56 overflow-y-auto overflow-x-hidden custom-scrollbar rounded-xl border border-slate-200 bg-white p-3"
              :ui="{
                root: 'w-full max-w-full min-w-0',
                fieldset: 'w-full max-w-full min-w-0 space-y-2',
                item: 'w-full max-w-full min-w-0',
                container: 'shrink-0',
                wrapper: 'min-w-0 flex-1 break-words',
                label: 'w-full min-w-0 break-words'
              }"
            >
              <template #label="{ item }">
                <span class="block w-full min-w-0 text-sm text-slate-800 leading-6 whitespace-normal break-words">
                  {{ item.label }}
                </span>
              </template>
            </UCheckboxGroup>
          </div>

          <div v-if="paintSubjectId"
            class="flex flex-wrap items-center gap-2 bg-white/60 p-2.5 rounded-xl border border-indigo-200/50">
            <span class="text-sm font-bold" :class="theoryHoursRemaining > 0 ? 'text-amber-700' : 'text-red-500'">
              ทฤษฎี (ท.): {{ theoryHoursUsed }}/{{ theoryHoursLimit }} ชม. (เหลือ {{ theoryHoursRemaining }} ชม.)
            </span>
            <span class="text-sm font-bold" :class="practicalHoursRemaining > 0 ? 'text-green-700' : 'text-red-500'">
              ปฏิบัติ (ป.): {{ practicalHoursUsed }}/{{ practicalHoursLimit }} ชม. (เหลือ {{ practicalHoursRemaining }} ชม.)
            </span>
          </div>
          <div v-if="paintSubjectId && !normalizedPaintType"
            class="flex items-center gap-2 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/50">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-amber-500" />
            <span class="text-sm font-bold text-amber-700">กรุณาเลือกประเภท (ทฤษฎี หรือ ปฏิบัติ) ก่อนระบาย</span>
          </div>
        </div>
      </div>

      <!-- Schedule Table -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto pb-6 custom-scrollbar">
          <div class="inline-block min-w-fit md:min-w-full p-1">
            <!-- Header -->
            <div class="flex border-b border-slate-200 bg-slate-100 text-xs">
              <div
                class="w-20 shrink-0 p-2 font-bold text-center text-slate-700 border-r border-slate-200 sticky left-0 z-40 bg-slate-50 text-sm uppercase tracking-wider">
                วัน / เวลา
              </div>
              <div class="flex flex-1">
                <div v-for="(time, index) in timeSlots" :key="index"
                  class="flex-1 min-w-[85px] p-2 text-center text-slate-500 border-r border-slate-200 last:border-r-0 font-bold uppercase tracking-tighter">
                  <span class="block text-slate-700">คาบที่ {{ index + 1 }}</span>
                  <span class="text-xs font-bold">{{ time }}</span>
                </div>
              </div>
            </div>

            <!-- Rows -->
            <div v-for="(day, dayIndex) in days" :key="dayIndex"
              class="flex border-b border-slate-200 last:border-b-0 text-xs group hover:bg-slate-100 transition-colors">
              <!-- Day Header -->
              <div
                class="w-20 shrink-0 flex items-center justify-center p-2 font-bold bg-slate-50 border-r border-slate-200 text-slate-700 sticky left-0 z-40 text-lg min-h-[96px]">
                {{ day }}
              </div>

              <!-- Slots (แสดงแบบ Merge ตาม displaySlots) -->
              <div class="flex flex-1">
                <div v-for="(slot, gIndex) in displaySlots[dayIndex]" :key="`${dayIndex}-${slot.originalIndex}`"
                  class="relative border-r border-slate-200 last:border-r-0"
                  :style="{ flex: `${slot.span} 1 0%`, minWidth: `${slot.span * 85}px` }">
                  <!-- พักกลางวัน (Index 4) -->
                  <div v-if="slot.isLunch"
                    class="h-full min-h-[96px] p-1 flex items-center justify-center text-center bg-slate-50 text-slate-400 select-none text-lg uppercase tracking-tighter">
                    พักกลางวัน
                  </div>

                  <div v-else
                    class="relative h-full min-h-[96px] p-1 transition-colors select-none"
                    :class="[
                      slot.value ? '' : (isActiveBox(dayIndex, slot.originalIndex) ? 'bg-blue-50' : 'bg-transparent hover:bg-indigo-50/80'),
                      (!isPaintMode && slot.value && !staticOptions.some(o => o.value === slot.value) && !isReadOnlyStudent) ? 'cursor-pointer' : 'cursor-default',
                      isActiveBox(dayIndex, slot.originalIndex) ? 'ring-2 ring-inset ring-blue-500/60' : '',
                      isPaintMode ? 'cursor-crosshair hover:bg-indigo-50 border border-dashed hover:border-indigo-300' : ''
                    ]"
                    @click="!isReadOnlyStudent && !isPaintMode && slot.value && !staticOptions.some(o => o.value === slot.value) && toggleDropdown(dayIndex, slot.originalIndex)"
                    @mousedown="startDrag(dayIndex, slot.originalIndex)"
                    @mouseenter="onDragOver(dayIndex, slot.originalIndex)">
                    <template v-if="slot.value">
                      <div
                        class="relative h-full w-full rounded-xl border border-blue-100/50 bg-blue-50 text-blue-700 shadow-xs"
                      >
                        <span
                          v-if="slot.type === 'theory'"
                          class="absolute top-1 right-1 z-10 text-[10px] leading-none bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded shadow-sm pointer-events-none"
                        >ทฤษฎี</span>
                        <span
                          v-if="slot.schedule_kind === 'internship'"
                          class="absolute top-1 left-1 z-10 text-[10px] leading-none bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded shadow-sm pointer-events-none"
                        >ฝึกงาน</span>
                        <span
                          v-else-if="slot.type === 'practical'"
                          class="absolute top-1 right-1 z-10 text-[10px] leading-none bg-green-100 text-green-700 px-1.5 py-0.5 rounded shadow-sm pointer-events-none"
                        >ปฏิบัติ</span>
                        <div class="absolute inset-0 flex items-center justify-center px-2 pt-4 pb-2 text-center">
                          <p
                            class="text-[15px] leading-snug line-clamp-3 break-words w-full overflow-hidden"
                            :title="getSubjectLabelWithTeachers(slot.value, slot.room_id, slot.section_ids, slot.teacher_ids)"
                          >
                            {{ getSubjectLabelWithTeachers(slot.value, slot.room_id, slot.section_ids, slot.teacher_ids) }}
                          </p>
                        </div>
                      </div>
                    </template>
                    <span v-else class="flex h-full min-h-[96px] items-center justify-center text-[15px] text-slate-400">ว่าง</span>
                  </div>

                  <!-- Dropdown -->
                  <div v-if="!isReadOnlyStudent && !isPaintMode && !slot.isLunch && isActiveBox(dayIndex, slot.originalIndex)"
                    class="absolute z-20 w-72 sm:w-80 max-w-[calc(100vw-1rem)] bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
                    :class="[
                      dayIndex >= 4 ? 'bottom-full mb-1' : 'top-full mt-1',
                      slot.originalIndex <= 1 ? 'left-0' : slot.originalIndex >= 10 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                    ]">
                    <div class="max-h-60 overflow-y-auto custom-scrollbar">
                      <button
                        class="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-700 text-xs border-b border-slate-200"
                        @click="setSlotValue(dayIndex, slot.originalIndex, null, slot.span)">
                        <span class="text-red-500">✖ ล้างข้อมูล</span>
                      </button>

                      <template v-if="slot.value && subjectIdToGroupComputed[slot.value]">
                        <div class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-50 uppercase tracking-wider mt-1">
                          เลือกอาจารย์ผู้สอน
                        </div>
                        <div class="px-3 py-2 space-y-2">
                          <div class="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              class="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                              @click="setSlotTeachersForSlot(dayIndex, slot.originalIndex, getSlotTeacherOptions(slot.value).map(opt => opt.value), slot.span)"
                            >
                              เลือกทั้งหมด
                            </button>
                            <button
                              type="button"
                              class="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                              @click="setSlotTeachersForSlot(dayIndex, slot.originalIndex, [], slot.span)"
                            >
                              ล้างทั้งหมด
                            </button>
                          </div>
                          <UCheckboxGroup
                            :model-value="normalizeTeacherRefs(slot.teacher_ids)"
                            :items="getSlotTeacherOptions(slot.value, slot.teacher_ids)"
                            value-key="value"
                            label-key="label"
                            variant="list"
                            class="w-full max-w-full min-w-0 max-h-48 overflow-y-auto overflow-x-hidden custom-scrollbar rounded-xl border border-slate-200 bg-white p-2"
                            :ui="{
                              root: 'w-full max-w-full min-w-0',
                              fieldset: 'w-full max-w-full min-w-0 space-y-1',
                              item: 'w-full max-w-full min-w-0',
                              container: 'shrink-0',
                              wrapper: 'min-w-0 flex-1 break-words',
                              label: 'w-full min-w-0 break-words'
                            }"
                            @update:model-value="val => setSlotTeachersForSlot(dayIndex, slot.originalIndex, val, slot.span)"
                          >
                            <template #label="{ item }">
                              <span class="block w-full min-w-0 text-xs text-slate-800 leading-5 whitespace-normal break-words">
                                {{ item.label }}
                              </span>
                            </template>
                          </UCheckboxGroup>
                        </div>
                      </template>

                      <template v-if="slot.value && !staticOptions.some(o => o.value === slot.value)">
                        <div
                          class="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-50 uppercase tracking-wider mt-1">
                          ห้องเรียน (คาบนี้)
                        </div>
                        <button v-for="room in roomOptions" :key="room.value"
                          class="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-700 text-xs truncate"
                          :class="{ 'bg-blue-100 text-blue-700': getNormalizedRoomId(slot.room_id) === room.value }"
                          @click="setSlotRoom(dayIndex, slot.originalIndex, room.value, slot.span)">
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
const toast = useToast()

// Fetch all terms to find default if missing
const { data: allTerms } = await useFetch('/api/terms')
const termOptions = computed(() => allTerms.value?.map(t => ({
  value: `${t.term}/${t.academic_year}`,
  label: `เทอม ${t.term}/${t.academic_year}`
})) || [])

// Handle missing term: default to latest term
const term = ref(route.query.term)
const selectedTerm = ref(route.query.term) // Add missing selectedTerm variable

if (!term.value && termOptions.value.length > 0) {
  const defaultTerm = termOptions.value[0].value
  navigateTo(`/sections/${sectionId}?term=${defaultTerm}`, { replace: true })
}

// Watch for selectedTerm changes and update term
watch(selectedTerm, (newVal) => {
  if (newVal) {
    term.value = newVal
  }
}, { immediate: true })

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
const createEmptySlot = () => ({ value: null, room_id: null, type: null, schedule_kind: 'lesson', section_ids: [], teacher_ids: [] })
const scheduleSlots = ref(Array.from({ length: 7 }, () =>
  Array.from({ length: 13 }, () => createEmptySlot())
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
const deleteExtModalOpen = ref(false)
// Paint Mode States
const isPaintMode = ref(false)
const paintSubjectId = ref(null)
const paintRoomId = ref(null)
const paintType = ref(null) // force user to select
const paintScheduleKind = ref('lesson')
const paintTeacherIds = ref([])
const isDragging = ref(false)
const hoursUsageData = ref(null)
const dragCurrentDay = ref(null)

function getRawValue(val) {
  return val && typeof val === 'object' && 'value' in val ? val.value : val
}

const getNormalizedSubjectId = (val) => {
  const raw = getRawValue(val)
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'string' && raw.startsWith('ext:')) return raw
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

const getNormalizedRoomId = (val) => {
  const raw = getRawValue(val)
  if (raw === null || raw === undefined || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

const isInternshipSchedule = (slot) => slot?.schedule_kind === 'internship'

const getSubjectQuotaKey = (subjectId) => {
  const subj = allSubjects.value?.find(sub => Number(sub.id_subject) === Number(subjectId))
  if (!subj) return `subject:${subjectId}`
  const baseKey = subj.id_plan_subject || subj.curriculum_subject_id || subj.name_subject || subjectId
  return `plan:${baseKey}`
}

const getSubjectPlanKey = (subjectId) => {
  const subj = allSubjects.value?.find(sub => Number(sub.id_subject) === Number(subjectId))
  if (!subj) return null
  return subj.id_plan_subject || subj.curriculum_subject_id || subj.name_subject || null
}

const togglePaintMode = (val = null) => {
  if (!isPaintMode.value) {
    isDragging.value = false
    activeBox.value = { day: null, slot: null }
  }
}

// Check api when subject or term or section changes to find limit
const fetchHoursUsage = async () => {
  const subjectId = getNormalizedSubjectId(paintSubjectId.value)
  if (!subjectId) {
    hoursUsageData.value = null
    return
  }
  if (typeof subjectId === 'string' && subjectId.startsWith('ext:')) {
    hoursUsageData.value = null
    return
  }
  try {
    const subjectKey = getSubjectPlanKey(subjectId)
    const data = await $fetch('/api/Subjects/hours-usage', {
      query: {
        id_subject: subjectId,
        subject_key: subjectKey,
        id_section: sectionId,
        term: term.value
      }
    })
    hoursUsageData.value = data
  } catch (e) {
    hoursUsageData.value = null
    console.error('Failed to get hours', e)
  }
}
watch(paintSubjectId, fetchHoursUsage)
watch([scheduleSlots, paintType], fetchHoursUsage, { deep: true }) // re-check limit on schedule draw

const selectedPaintSubjectId = computed(() => getNormalizedSubjectId(paintSubjectId.value))
const paintScheduleKindChecked = computed({
  get: () => paintScheduleKind.value === 'internship',
  set: (val) => {
    paintScheduleKind.value = val ? 'internship' : 'lesson'
  }
})
const normalizedPaintType = computed(() => {
  const raw = getRawValue(paintType.value)
  if (raw === 'theory' || raw === 'practical') return raw
  return null
})
const theoryHoursLimit = computed(() => Number(hoursUsageData.value?.theory_hours_limit || 0))
const practicalHoursLimit = computed(() => Number(hoursUsageData.value?.practical_hours_limit || 0))

const countLocalUsedHours = (subjectId, type) => {
  if (!subjectId || !scheduleSlots.value) return 0
  const quotaKey = getSubjectQuotaKey(subjectId)
  let count = 0
  for (const day of scheduleSlots.value) {
    for (const slot of day) {
      if (slot?.type !== type || !slot?.value) continue
      if (getSubjectQuotaKey(slot.value) === quotaKey) count++
    }
  }
  return count
}

const theoryHoursUsed = computed(() => countLocalUsedHours(selectedPaintSubjectId.value, 'theory'))
const practicalHoursUsed = computed(() => countLocalUsedHours(selectedPaintSubjectId.value, 'practical'))
const theoryHoursRemaining = computed(() => Math.max(0, theoryHoursLimit.value - theoryHoursUsed.value))
const practicalHoursRemaining = computed(() => Math.max(0, practicalHoursLimit.value - practicalHoursUsed.value))

const remainingHours = computed(() => {
  if (!normalizedPaintType.value) return 0
  if (normalizedPaintType.value === 'theory') return theoryHoursRemaining.value
  return practicalHoursRemaining.value
})
const limitHours = computed(() => {
  if (!normalizedPaintType.value) return 0
  if (normalizedPaintType.value === 'theory') return theoryHoursLimit.value
  return practicalHoursLimit.value
})

const applyPaint = (d, s) => {
  const slot = scheduleSlots.value[d][s]
  const selectedSubjectId = getNormalizedSubjectId(paintSubjectId.value)

  if (selectedSubjectId === null) {
    slot.value = null
    slot.room_id = null
    slot.type = null
    slot.schedule_kind = 'lesson'
    slot.section_ids = []
    slot.teacher_ids = []
    return
  }

  // Must select a type before painting
  if (!normalizedPaintType.value) {
    toast.add({ title: 'กรุณาเลือกประเภท', description: 'เลือกว่าจะระบายเป็นทฤษฎีหรือปฏิบัติ', color: 'warning' })
    isDragging.value = false
    return
  }

  const selectedTeacherRefs = normalizeTeacherRefs(paintTeacherIds.value)
  if (!selectedTeacherRefs.length) {
    toast.add({ title: 'กรุณาเลือกผู้สอน', description: 'เลือกผู้สอนอย่างน้อย 1 คนก่อนระบายลงตาราง', color: 'warning' })
    isDragging.value = false
    return
  }

  // Enforce limit immediately from local schedule state (works while drag painting)
  if (slot.value !== selectedSubjectId || slot.type !== normalizedPaintType.value || slot.schedule_kind !== paintScheduleKind.value) {
    if (remainingHours.value <= 0) {
      toast.add({ title: 'โควตาชั่วโมงเต็มวิชานี้', description: 'ไม่สามารถระบายสีเพิ่มได้', color: 'red' })
      isDragging.value = false
      return
    }
  }

  const subj = allSubjects.value?.find(sub => sub.id_subject == selectedSubjectId)
  const isExternal = subj && !subj.id_teacher && subj.external_teacher_name
  const defaultSections = subj?.sections ? subj.sections.map(sec => sec.id_section) : []

  slot.value = selectedSubjectId
  slot.room_id = getNormalizedRoomId(paintRoomId.value)
  slot.type = normalizedPaintType.value
  slot.schedule_kind = paintScheduleKind.value
  slot.teacher_ids = [...selectedTeacherRefs]

  if (isExternal) {
    slot.section_ids = [Number(sectionId)]
  } else {
    slot.section_ids = [...defaultSections]
  }
}

const startDrag = (d, s) => {
  if (!isPaintMode.value || isReadOnlyStudent) return
  isDragging.value = true
  dragCurrentDay.value = d

  // Also clear active dropdowns
  activeBox.value = { day: null, slot: null }
  applyPaint(d, s)
}

const onDragOver = (d, s) => {
  if (!isDragging.value || !isPaintMode.value || isReadOnlyStudent) return
  if (dragCurrentDay.value !== null && d !== dragCurrentDay.value) return
  applyPaint(d, s)
}

onMounted(() => {
  document.addEventListener('mouseup', () => {
    isDragging.value = false
    dragCurrentDay.value = null
  })
})

const extSubjectToDelete = ref(null)

const { data: rooms } = await useFetch('/api/rooms')
const roomOptions = computed(() => {
  const opts = rooms.value?.map(r => ({ value: r.id_room, label: r.room_name })) || []
  return [{ value: null, label: 'ไม่ระบุห้อง' }, ...opts]
})

// Fetch Data
// 1. Get Section Info (Just filter from list for now or assume ID is valid)
// Ideally we should have a GET /api/sections/:id, but we can list all and find
const { data: sections } = await useFetch('/api/sections', { query: { term: term.value } })
const section = computed(() => sections.value?.find(s => s.id_section == sectionId))

// 2. Get Subjects for this section (To show in dropdown)
const { data: allSubjects } = await useFetch('/api/Subjects')
const sectionSubjects = computed(() =>
  allSubjects.value?.filter(s =>
    s.sections && s.sections.some(sec => sec.id_section == sectionId)
  ) || []
)

const getDefaultTeacherRefsForSubject = (subjectId) => {
  const raw = getRawValue(subjectId)
  if (raw === null || raw === undefined || raw === '') return []
  if (typeof raw === 'string' && raw.startsWith('ext:')) return [raw]

  const subj = allSubjects.value?.find(s => Number(s.id_subject) === Number(raw))
  if (!subj) return []

  if (subj.id_teacher != null) return [String(subj.id_teacher)]
  if (subj.external_teacher_name) return [`ext:${subj.id_subject}`]
  return []
}

const getTeacherDisplayName = (subject) => {
  if (subject.external_teacher_name) return subject.external_teacher_name
  const fullName = [subject.prefix, subject.first_name, subject.last_name].filter(Boolean).join(' ').trim()
  return fullName || 'ไม่ระบุ'
}

const getSubjectOptionLabel = (subject) => {
  const teacherLabel = getTeacherDisplayName(subject)
  const sectionNames = subject.section_names ? ` - ${subject.section_names}` : ''
  return `${subject.name_subject}${sectionNames} (${teacherLabel})`
}

const groupedSectionSubjects = computed(() => {
  const groups = new Map()
  for (const subj of sectionSubjects.value) {
    const baseKey = subj.id_plan_subject || subj.curriculum_subject_id || subj.name_subject
    const key = String(baseKey)
    if (!groups.has(key)) {
      groups.set(key, {
        group_key: key,
        name_subject: subj.name_subject,
        subjects: [],
        teacher_names: [],
        has_external_teacher: false
      })
    }
    const g = groups.get(key)
    g.subjects.push(subj)
    const teacherName = getTeacherDisplayName(subj)
    if (!g.teacher_names.includes(teacherName)) g.teacher_names.push(teacherName)
    if (!subj.id_teacher && subj.external_teacher_name) g.has_external_teacher = true
  }
  return Array.from(groups.values())
})

const getCanonicalSubjectForGroup = (group) => {
  if (!group?.subjects?.length) return null
  return group.subjects.find(s => s.id_plan_subject != null || s.curriculum_subject_id != null) || group.subjects[0]
}

const subjectIdToGroupComputed = computed(() => {
  const map = {}
  for (const g of groupedSectionSubjects.value) {
    for (const s of g.subjects) {
      map[s.id_subject] = g
    }
  }
  return map
})

const paintSubjectOptions = computed(() =>
  groupedSectionSubjects.value.map(group => {
    const representative = getCanonicalSubjectForGroup(group)
    const teacherLabel = group.teacher_names.length > 0
      ? ` (${group.teacher_names.join(' / ')}${group.has_external_teacher ? ' [นอกสาขา]' : ''})`
      : ''
    return {
      value: representative?.id_subject,
      label: `${group.name_subject}${teacherLabel}`
    }
  }).filter(opt => opt.value != null)
)

const selectedPaintGroup = computed(() => {
  const subjectId = Number(selectedPaintSubjectId.value)
  if (!Number.isFinite(subjectId)) return null
  return subjectIdToGroupComputed.value[subjectId] || null
})

const paintTeacherOptions = computed(() => {
  const group = selectedPaintGroup.value
  if (!group?.subjects?.length) return []

  const opts = []
  const seen = new Set()
  for (const subj of group.subjects) {
    let value = null
    let label = ''
    if (subj.id_teacher != null) {
      value = String(subj.id_teacher)
      label = getTeacherDisplayName(subj)
    } else if (subj.external_teacher_name) {
      value = `ext:${subj.id_subject}`
      label = `${subj.external_teacher_name} [นอกสาขา]`
    }
    if (!value || seen.has(value)) continue
    seen.add(value)
    opts.push({ value, label })
  }
  return opts
})

watch(selectedPaintSubjectId, () => {
  if (!selectedPaintSubjectId.value) {
    paintTeacherIds.value = []
    return
  }
  paintTeacherIds.value = paintTeacherOptions.value.map(opt => opt.value)
}, { immediate: true })

const selectAllPaintTeachers = () => {
  paintTeacherIds.value = paintTeacherOptions.value.map(opt => opt.value)
}

const clearPaintTeachers = () => {
  paintTeacherIds.value = []
}

const canonicalSubjectIdByPlanKey = computed(() => {
  const map = new Map()
  for (const group of groupedSectionSubjects.value) {
    const representative = getCanonicalSubjectForGroup(group)
    if (!representative) continue
    const baseKey = representative.id_plan_subject || representative.curriculum_subject_id || representative.name_subject
    if (baseKey != null && !map.has(String(baseKey))) {
      map.set(String(baseKey), Number(representative.id_subject))
    }
    for (const subj of group.subjects || []) {
      const subjKey = subj.id_plan_subject || subj.curriculum_subject_id || subj.name_subject
      if (subjKey != null && !map.has(String(subjKey))) {
        map.set(String(subjKey), Number(representative.id_subject))
      }
    }
  }
  return map
})

const normalizeSubjectIdForSave = (subjectId) => {
  const subj = allSubjects.value?.find(s => Number(s.id_subject) === Number(subjectId))
  if (!subj) return subjectId
  const baseKey = subj.id_plan_subject || subj.curriculum_subject_id || subj.name_subject
  return canonicalSubjectIdByPlanKey.value.get(String(baseKey)) || Number(subjectId)
}

const subjectOptions = computed(() =>
  sectionSubjects.value.map((subject) => {
    const teacherLabel = getTeacherDisplayName(subject)
    const externalSuffix = subject.external_teacher_name ? ' [นอกสาขา]' : ''
    const sectionNames = subject.section_names ? ` - ${subject.section_names}` : ''
    return {
      value: subject.id_subject,
      label: `${subject.name_subject}${sectionNames} (${teacherLabel}${externalSuffix})`
    }
  }).filter(opt => opt.value != null)
)

// 2.5 Get External Subjects for this section
const { data: externalSubjects, refresh: refreshExternalSubjects } = await useFetch('/api/external-subjects', {
  query: computed(() => ({ id_section: sectionId, term: term.value }))
})

// === Internal Subjects Modal Logic ===
const internalSubjectModalOpen = ref(false)
const internalAddPlanId = ref(null)
const internalAddSubjectId = ref(null)
const internalAddTeacherIds = ref([])
const internalAddExternalName = ref('')
const addingInternal = ref(false)

const { data: studyPlans } = await useFetch('/api/study-plans')
const studyPlanOptions = computed(() => studyPlans.value?.map(p => ({
  value: p.id_plan,
  label: `${p.name_curriculum ? `${p.name_curriculum} - ` : ''}${p.name_plan}`
})) || [])

const normalizeTeacherRefs = (refs = []) => {
  const normalized = []
  for (const ref of refs || []) {
    const raw = getRawValue(ref)
    if (raw === null || raw === undefined || raw === '') continue
    normalized.push(String(raw))
  }
  return [...new Set(normalized)]
}

const areSameTeacherRefs = (a = [], b = []) => {
  const left = normalizeTeacherRefs(a).sort()
  const right = normalizeTeacherRefs(b).sort()
  if (left.length !== right.length) return false
  return left.every((val, idx) => val === right[idx])
}

const selectedInternalPlanId = computed(() => {
  // Prefer plan id coming from the current section (more reliable for this page)
  const sectionRaw = getRawValue(section.value?.id_plan)
  const sectionId = Number(sectionRaw)
  const hasSectionId = sectionRaw != null && Number.isFinite(sectionId) && sectionId > 0

  if (hasSectionId) return sectionId

  const raw = getRawValue(internalAddPlanId.value)
  const id = Number(raw)
  return raw != null && Number.isFinite(id) && id > 0 ? id : null
})

const selectedInternalPlanLabel = computed(() => {
  // Prefer label from current section (always available on this page)
  const sec = section.value
  if (sec?.name_plan) {
    const prefix = sec.curriculum_name ? `${sec.curriculum_name} - ` : ''
    return `${prefix}${sec.name_plan}`
  }
  if (!selectedInternalPlanId.value) return ''
  return studyPlanOptions.value.find(opt => Number(opt.value) === selectedInternalPlanId.value)?.label || ''
})

const curriculumSubjects = ref([])
const availableAddSubjectOptions = ref([])
const loadingPlanSubjects = ref(false)
const getPlanSemester = (termValue) => {
  const termNumber = Number(String(termValue || '').split('/')[0])
  if (!Number.isFinite(termNumber) || termNumber <= 0) return 1
  return termNumber % 2 === 0 ? 2 : 1
}
const currentPlanTermScope = computed(() => ({
  year: Number(section.value?.year) || 1,
  semester: getPlanSemester(term.value)
}))
const existingPlanSubjectIds = computed(() => {
  const ids = sectionSubjects.value
    .map(s => Number(s.id_plan_subject))
    .filter(n => Number.isFinite(n) && n > 0)
  return new Set(ids)
})

const buildAvailableAddSubjectOptions = () => {
  const scopeYear = Number(currentPlanTermScope.value.year) || 1
  const scopeSemester = Number(currentPlanTermScope.value.semester) || 1

  availableAddSubjectOptions.value = curriculumSubjects.value
    .filter((s) => {
      if (existingPlanSubjectIds.value.has(Number(s.id_plan_subject))) return false
      const subjectYear = Number(s.year || 1)
      const subjectSemester = Number(s.semester || 1)
      return subjectYear === scopeYear
        && subjectSemester === scopeSemester
    })
    .map(s => ({
      value: s.id_plan_subject,
      label: `${s.subject_code || ''} ${s.name_subject || '-'} (${s.credit || 0} นก.)`
    }))
}

watch(selectedInternalPlanId, async (newPlanId) => {
  internalAddSubjectId.value = null

  if (!newPlanId) {
    curriculumSubjects.value = []
    availableAddSubjectOptions.value = []
    return
  }

  try {
    loadingPlanSubjects.value = true
    const subjects = await $fetch('/api/study-plan-subjects', {
      query: { id_plan: newPlanId }
    })
    curriculumSubjects.value = Array.isArray(subjects) ? subjects : []
    buildAvailableAddSubjectOptions()
  } catch (error) {
    curriculumSubjects.value = []
    availableAddSubjectOptions.value = []
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: error?.data?.statusMessage || error?.message || 'ไม่สามารถดึงรายวิชาจากแผนการเรียนได้',
      color: 'red'
    })
  } finally {
    loadingPlanSubjects.value = false
  }
}, { immediate: true })

watch(
  () => [
    section.value?.year,
    term.value,
    curriculumSubjects.value.map(s => `${s.id_plan_subject}:${s.year}:${s.semester}`).join('|'),
    [...existingPlanSubjectIds.value].join('|')
  ],
  () => {
    if (!curriculumSubjects.value.length) return
    buildAvailableAddSubjectOptions()
  },
  { immediate: true }
)

watch(currentPlanTermScope, () => {
  if (!curriculumSubjects.value.length) return
  buildAvailableAddSubjectOptions()
}, { deep: true })

const { data: teachers } = await useFetch('/api/teachers')
// Use string values in selects to avoid type-mismatch (Nuxt UI may stringify internally)
const teacherOptions = computed(() => teachers.value?.map(t => ({
  value: t.id_teacher != null ? String(t.id_teacher) : '',
  label: `${t.prefix}${t.first_name} ${t.last_name}`
})) || [])
const teacherOptionsWithExternal = computed(() => [
  ...teacherOptions.value,
  { value: 'external', label: 'อาจารย์นอกสาขา' }
])
const isExternalTeacherSelected = computed(() => {
  const selections = internalAddTeacherIds.value || []
  return selections.map(getRawValue).some(v => String(v) === 'external')
})

const isValidInternalSubject = computed(() => {
  const teacherSelections = (internalAddTeacherIds.value || []).map(getRawValue)
  const externalSelected = teacherSelections.some(v => String(v) === 'external')
  const internalTeacherIds = teacherSelections
    .filter(t => t !== 'external' && t !== null && t !== undefined && t !== '')
    .map(t => Number(t))
    .filter(n => Number.isFinite(n))

  return !!selectedInternalPlanId.value
    && !!getRawValue(internalAddSubjectId.value)
    && (
      (externalSelected && !!internalAddExternalName.value.trim()) ||
      (internalTeacherIds.length > 0)
    )
})

const editSubjectModalOpen = ref(false)
const updatingSubject = ref(false)
const deletingSubjectId = ref(null)
const deletingGroupKey = ref(null)
const editingSubjectGroup = ref(null)
const editSubjectTeacherIds = ref([]) // array of values or option objects
const editSubjectExternalName = ref('')
const resolveTeacherOption = (val) => teacherOptionsWithExternal.value.find(opt => String(opt.value) === String(getRawValue(val))) || null
const editSubjectTeacherMenuValue = computed({
  get: () => (editSubjectTeacherIds.value || []).map(resolveTeacherOption).filter(Boolean),
  set: (val) => {
    editSubjectTeacherIds.value = (val || []).map(getRawValue).filter(v => v !== null && v !== undefined && v !== '')
  }
})
const internalAddTeacherMenuValue = computed({
  get: () => (internalAddTeacherIds.value || []).map(resolveTeacherOption).filter(Boolean),
  set: (val) => {
    internalAddTeacherIds.value = (val || []).map(getRawValue).filter(v => v !== null && v !== undefined && v !== '')
  }
})

const editSubjectName = computed(() => editingSubjectGroup.value?.name_subject || '')
const editIsExternalTeacher = computed(() => {
  const selections = editSubjectTeacherIds.value || []
  return selections.map(getRawValue).some(v => String(v) === 'external')
})
const isValidEditSubject = computed(() => {
  const selections = (editSubjectTeacherIds.value || []).map(getRawValue)
  const externalSelected = selections.some(v => String(v) === 'external')
  const internalIds = selections
    .filter(v => v !== 'external' && v !== null && v !== undefined && v !== '')
    .map(v => Number(v))
    .filter(n => Number.isFinite(n))

  return !!editingSubjectGroup.value
    && ((internalIds.length > 0) || (externalSelected && !!editSubjectExternalName.value.trim()))
})

const openEditSubjectModal = (subjectGroup) => {
  editingSubjectGroup.value = subjectGroup
  const selections = []
  let externalName = ''

  for (const subj of subjectGroup.subjects || []) {
    if (subj.id_teacher != null) {
      selections.push(String(subj.id_teacher))
    } else if (subj.external_teacher_name) {
      selections.push('external')
      if (!externalName) externalName = subj.external_teacher_name
    }
  }

  editSubjectTeacherIds.value = [...new Set(selections)]
  editSubjectExternalName.value = externalName
  editSubjectModalOpen.value = true
}

const saveEditSubject = async () => {
  if (!isValidEditSubject.value || !editingSubjectGroup.value) return

  updatingSubject.value = true
  try {
    const group = editingSubjectGroup.value
    const base = group.subjects?.[0]
    if (!base) throw new Error('Subject group not found')

    const selections = (editSubjectTeacherIds.value || []).map(getRawValue)
    const selectedInternalIds = selections
      .filter(v => v !== 'external' && v !== null && v !== undefined && v !== '')
      .map(v => Number(v))
      .filter(n => Number.isFinite(n))
    const selectedInternalSet = new Set(selectedInternalIds)
    const externalSelected = selections.some(v => String(v) === 'external')

    const existingInternal = (group.subjects || []).filter(s => s.id_teacher != null)
    const existingExternal = (group.subjects || []).filter(s => !s.id_teacher && s.external_teacher_name)
    const existingInternalMap = new Map(existingInternal.map(s => [Number(s.id_teacher), s]))
    const sectionIds = base.sections?.map(sec => sec.id_section) || [Number(sectionId)]

    // Keep/update selected internal teachers, create missing ones
    for (const teacherId of selectedInternalIds) {
      const row = existingInternalMap.get(teacherId)
      if (row) {
        await $fetch(`/api/Subjects/${row.id_subject}`, {
          method: 'PUT',
          body: {
            curriculum_subject_id: row.curriculum_subject_id,
            id_plan_subject: row.id_plan_subject,
            id_teacher: teacherId,
            external_teacher_name: null,
            id_sections: row.sections?.map(sec => sec.id_section) || sectionIds
          }
        })
      } else {
        await $fetch('/api/Subjects', {
          method: 'POST',
          body: {
            curriculum_subject_id: base.curriculum_subject_id,
            id_plan_subject: base.id_plan_subject,
            id_teacher: teacherId,
            external_teacher_name: null,
            id_sections: sectionIds,
            term: term.value,
            type: 'internal'
          }
        })
      }
    }

    // Remove internal teachers no longer selected
    for (const row of existingInternal) {
      if (!selectedInternalSet.has(Number(row.id_teacher))) {
        await $fetch(`/api/Subjects/${row.id_subject}`, { method: 'DELETE' })
      }
    }

    // External teacher sync
    if (externalSelected) {
      if (existingExternal.length > 0) {
        // Keep first external row and update name, remove duplicates if any
        const [keep, ...duplicates] = existingExternal
        await $fetch(`/api/Subjects/${keep.id_subject}`, {
          method: 'PUT',
          body: {
            curriculum_subject_id: keep.curriculum_subject_id,
            id_plan_subject: keep.id_plan_subject,
            id_teacher: null,
            external_teacher_name: editSubjectExternalName.value.trim(),
            id_sections: keep.sections?.map(sec => sec.id_section) || sectionIds
          }
        })
        for (const dup of duplicates) {
          await $fetch(`/api/Subjects/${dup.id_subject}`, { method: 'DELETE' })
        }
      } else {
        await $fetch('/api/Subjects', {
          method: 'POST',
          body: {
            curriculum_subject_id: base.curriculum_subject_id,
            id_plan_subject: base.id_plan_subject,
            id_teacher: null,
            external_teacher_name: editSubjectExternalName.value.trim(),
            id_sections: sectionIds,
            term: term.value,
            type: 'internal'
          }
        })
      }
    } else {
      for (const row of existingExternal) {
        await $fetch(`/api/Subjects/${row.id_subject}`, { method: 'DELETE' })
      }
    }

    toast.add({ title: 'สำเร็จ', description: 'แก้ไขรายวิชาเรียบร้อยแล้ว', color: 'green' })
    editSubjectModalOpen.value = false
    await refreshNuxtData()
  } catch (e) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: e.data?.message || e.message, color: 'red' })
  } finally {
    updatingSubject.value = false
  }
}

const deleteInternalSubject = async (subject) => {
  if (!confirm(`ลบรายวิชา "${subject.name_subject}" ใช่หรือไม่?`)) return
  deletingSubjectId.value = subject.id_subject
  try {
    await $fetch(`/api/Subjects/${subject.id_subject}`, { method: 'DELETE' })
    toast.add({ title: 'สำเร็จ', description: 'ลบรายวิชาแล้ว', color: 'green' })
    await refreshNuxtData()
  } catch (e) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: e.data?.message || e.message, color: 'red' })
  } finally {
    deletingSubjectId.value = null
  }
}

const deleteInternalSubjectGroup = async (subjectGroup) => {
  if (!subjectGroup?.subjects?.length) return
  if (!confirm(`ลบรายวิชา "${subjectGroup.name_subject}" พร้อมผู้สอนทั้งหมด ใช่หรือไม่?`)) return

  deletingGroupKey.value = subjectGroup.group_key
  try {
    for (const subj of subjectGroup.subjects) {
      await $fetch(`/api/Subjects/${subj.id_subject}`, { method: 'DELETE' })
    }
    toast.add({ title: 'สำเร็จ', description: 'ลบรายวิชาแล้ว', color: 'green' })
    await refreshNuxtData()
  } catch (e) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: e.data?.message || e.message, color: 'red' })
  } finally {
    deletingGroupKey.value = null
  }
}

const addInternalSubject = async () => {
  if (!isValidInternalSubject.value) return
  if (!term.value) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: 'กรุณาเลือกเทอมก่อน', color: 'red' })
    return
  }
  addingInternal.value = true
  try {
    const selectedPlanSubjectId = getRawValue(internalAddSubjectId.value)
    const selectedPlanSubj = curriculumSubjects.value.find(s => Number(s.id_plan_subject) === Number(selectedPlanSubjectId))
    if (!selectedPlanSubj) throw new Error("Plan subject not found")
    const subjectYear = Number(selectedPlanSubj.year || 1)
    const subjectSemester = Number(selectedPlanSubj.semester || 1)
    if (subjectYear !== currentPlanTermScope.value.year || subjectSemester !== currentPlanTermScope.value.semester) {
      toast.add({
        title: 'วิชานี้ไม่อยู่ในภาคเรียนปัจจุบัน',
        description: `ระบบแสดงเฉพาะปี ${currentPlanTermScope.value.year} ภาค ${currentPlanTermScope.value.semester}`,
        color: 'amber'
      })
      return
    }
    if (existingPlanSubjectIds.value.has(Number(selectedPlanSubjectId))) {
      toast.add({
        title: 'วิชานี้ถูกเพิ่มแล้ว',
        description: 'วิชาที่เลือกมีอยู่ในเทอมปัจจุบันแล้ว กรุณาเลือกวิชาอื่น',
        color: 'amber'
      })
      return
    }
    const teacherSelections = (internalAddTeacherIds.value || []).map(getRawValue)
    const internalTeacherIds = teacherSelections
      .filter(t => t !== 'external' && t !== null && t !== undefined && t !== '')
      .map(t => Number(t))
      .filter(n => Number.isFinite(n))
    const externalSelected = teacherSelections.some(v => String(v) === 'external')

    // Create one Subjects row per teacher (supports multiple teachers teaching same plan subject)
    for (const tId of internalTeacherIds) {
      await $fetch('/api/Subjects', {
        method: 'POST',
        body: {
          id_plan_subject: selectedPlanSubjectId,
          id_external_subject: null,
          name_subject: selectedPlanSubj.name_subject,
          description: null,
          id_teacher: tId,
          external_teacher_name: null,
          id_sections: [Number(sectionId)],
          term: term.value,
          curriculum_subject_id: selectedPlanSubj.id_subject_curr,
          type: 'internal'
        }
      })
    }

    if (externalSelected) {
      await $fetch('/api/Subjects', {
        method: 'POST',
        body: {
          id_plan_subject: selectedPlanSubjectId,
          id_external_subject: null,
          name_subject: selectedPlanSubj.name_subject,
          description: null,
          id_teacher: null,
          external_teacher_name: internalAddExternalName.value.trim(),
          id_sections: [Number(sectionId)],
          term: term.value,
          curriculum_subject_id: selectedPlanSubj.id_subject_curr,
          type: 'internal'
        }
      })
    }

    internalAddExternalName.value = ''
    internalAddTeacherIds.value = []
    toast.add({ title: 'สำเร็จ', description: 'เพิ่มวิชาในสาขาแล้ว', color: 'green' })
    // Refresh to get full subject object
    await refreshNuxtData()
  } catch (e) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: e.data?.message || e.message, color: 'red' })
  } finally {
    addingInternal.value = false
  }
}
// =====================================

const allSubjectOptions = computed(() => {
  return [
    { label: '--- วิชาในสาขา ---', disabled: true },
    ...subjectOptions.value
  ]
})

const externalSubjectOptions = computed(() => {
  const externalOpts = (externalSubjects.value || []).map((subject) => ({
    value: `ext:${subject.id_ext_subject}`,
    label: `${subject.name_subject}${subject.instructor_name ? ` (${subject.instructor_name} [นอกสาขา])` : ''}`
  }))

  return [
    { label: '--- วิชานอกสาขา ---', disabled: true },
    ...externalOpts
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
  query: computed(() => ({ id_section: sectionId, term: term.value }))
})

// Watch term เพื่อ refresh ข้อมูลเมื่อเปลี่ยนเทอม
watch(term, () => {
  refreshExternalSubjects()
  refreshSchedule()
})

// Function declarations should be hoisted or defined before they're used in the watch callback
const clearSchedule = (noConfirm = false) => {
  if (!noConfirm && !confirm('ล้างตารางทั้งหมด?')) return
  scheduleSlots.value = Array.from({ length: 7 }, () =>
    Array.from({ length: 13 }, () => createEmptySlot())
  )
}

watch(existingSchedule, (data) => {
  if (data && data.scheduleData) {
    // Normalize existing data
    const raw = data.scheduleData
    scheduleSlots.value = raw.map((day) => {
      if (!Array.isArray(day)) return Array.from({ length: 13 }, () => createEmptySlot())
      return day.map((slot) => {
        if (typeof slot === 'object' && slot !== null) {
          return {
            value: slot.value,
            room_id: getNormalizedRoomId(slot.room_id),
            type: slot.type || null,
            schedule_kind: slot.schedule_kind || 'lesson',
            section_ids: slot.section_ids || [],
            teacher_ids: slot.teacher_ids || []
          }
        }
        return { value: slot, room_id: null, type: null, schedule_kind: 'lesson', section_ids: [], teacher_ids: [] }
      })
    })
  } else {
    clearSchedule(true)
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
        && daySlots[i + span].type === current.type
        && daySlots[i + span].schedule_kind === current.schedule_kind
        && areSameTeacherRefs(daySlots[i + span].teacher_ids, current.teacher_ids)
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
  if (!term.value) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: 'กรุณาเลือกเทอมก่อน', color: 'red' })
    return
  }
  addingExt.value = true
  try {
    await $fetch('/api/external-subjects', {
      method: 'POST',
      body: {
        id_section: Number(sectionId),
        term: term.value,
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

const confirmDeleteExtSubject = (ext) => {
  extSubjectToDelete.value = ext
  deleteExtModalOpen.value = true
}

const deleteExtSubject = async () => {
  if (!extSubjectToDelete.value) return
  const id = extSubjectToDelete.value.id_ext_subject
  try {
    await $fetch(`/api/external-subjects/${id}`, { method: 'DELETE' })
    deleteExtModalOpen.value = false
    extSubjectToDelete.value = null
    toast.add({ title: 'สำเร็จ', description: 'ลบวิชานอกสาขาแล้ว', color: 'green' })
    refreshExternalSubjects()
  } catch (e) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: e.message, color: 'red' })
  }
}

// Methods
const isTeacherSubject = (val) => {
  if (!val) return false
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
  const defaultTeacherRefs = getDefaultTeacherRefsForSubject(val)

  for (let i = 0; i < span; i++) {
    scheduleSlots.value[d][s + i].value = val
    if (!val || isExternal) {
      scheduleSlots.value[d][s + i].room_id = null
      scheduleSlots.value[d][s + i].type = scheduleSlots.value[d][s + i].type || null
      scheduleSlots.value[d][s + i].section_ids = isExternal ? [Number(sectionId)] : []
      scheduleSlots.value[d][s + i].teacher_ids = isExternal ? defaultTeacherRefs : []
    } else {
      scheduleSlots.value[d][s + i].section_ids = [...defaultSections]
      scheduleSlots.value[d][s + i].teacher_ids = [...defaultTeacherRefs]
    }
  }
}

const switchTeacherForSlot = (d, s, newSubjectId, span = 1) => {
  const subj = allSubjects.value?.find(sub => sub.id_subject == newSubjectId)
  const defaultSections = subj ? subj.sections.map(sec => sec.id_section) : []
  const defaultTeacherRefs = getDefaultTeacherRefsForSubject(newSubjectId)
  for (let i = 0; i < span; i++) {
    scheduleSlots.value[d][s + i].value = newSubjectId
    scheduleSlots.value[d][s + i].section_ids = [...defaultSections]
    scheduleSlots.value[d][s + i].teacher_ids = [...defaultTeacherRefs]
  }
  activeBox.value = { day: null, slot: null }
}

const getSlotTeacherOptions = (subjectId, teacherRefs = []) => {
  const options = []
  const seen = new Set()
  const group = subjectIdToGroupComputed.value?.[Number(subjectId)]

  if (group?.subjects?.length) {
    for (const subj of group.subjects) {
      let value = null
      let label = ''
      if (subj.id_teacher != null) {
        value = String(subj.id_teacher)
        label = getTeacherDisplayName(subj)
      } else if (subj.external_teacher_name) {
        value = `ext:${subj.id_subject}`
        label = `${subj.external_teacher_name} [นอกสาขา]`
      }
      if (!value || seen.has(value)) continue
      seen.add(value)
      options.push({ value, label })
    }
  }

  for (const ref of normalizeTeacherRefs(teacherRefs)) {
    if (seen.has(ref)) continue
    seen.add(ref)
    options.push({ value: ref, label: getSlotTeacherLabel(subjectId, ref) || ref })
  }

  return options
}

const setSlotTeachersForSlot = (d, s, teacherRefs, span = 1) => {
  const normalized = normalizeTeacherRefs(teacherRefs)
  for (let i = 0; i < span; i++) {
    scheduleSlots.value[d][s + i].teacher_ids = [...normalized]
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
  const normalizedRoomId = getNormalizedRoomId(roomId)
  for (let i = 0; i < span; i++) {
    scheduleSlots.value[d][s + i].room_id = normalizedRoomId
  }
}

const addToSchedule = async () => {
  if (!quickAddSubject.value || quickAddDay.value === null || quickAddStartTime.value === null || !quickAddDuration.value) return

  const dayIdx = quickAddDay.value
  const startIdx = quickAddStartTime.value
  const duration = quickAddDuration.value
  const subjectId = quickAddSubject.value
  const roomId = getNormalizedRoomId(quickAddRoom.value)
  const defaultTeacherRefs = getDefaultTeacherRefsForSubject(subjectId)

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
    scheduleSlots.value[dayIdx][currentIdx].teacher_ids = [...defaultTeacherRefs]

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

  const subj = allSubjects.value?.find(s => s.id_subject == val)
  if (!subj) return '-'

  let sectionDisplay = ''
  if (sectionIds && Array.isArray(sectionIds) && sectionIds.length > 0) {
    const names = subj.sections
      ?.filter(s => sectionIds.includes(s.id_section))
      ?.map(s => s.section_name)
      ?.join(', ')
    sectionDisplay = names ? `(${names})` : ''
  } else {
    sectionDisplay = subj.section_names ? `(${subj.section_names})` : ''
  }

  let roomName = ''
  if (roomId) {
    const r = rooms.value?.find(rm => rm.id_room == roomId)
    if (r) roomName = r.room_name
  }

  let teacherName = ''
  if (subj.external_teacher_name) {
    teacherName = ` (${subj.external_teacher_name} [นอกสาขา])`
  } else if (subj.first_name || subj.last_name) {
    teacherName = ` (${[subj.prefix, subj.first_name, subj.last_name].filter(Boolean).join(' ').trim()})`
  }

  const subjName = subj.name_subject || 'ไม่ระบุชื่อวิชา'
  return `${subjName}${teacherName} ${sectionDisplay} ${roomName ? `[${roomName}]` : ''}`
}



const getSlotTeacherLabel = (subjectId, teacherRef) => {
  const raw = String(getRawValue(teacherRef))
  if (!raw) return ''
  if (raw.startsWith('ext:')) {
    const extId = Number(raw.slice(4))
    const extSubject = allSubjects.value?.find(s => Number(s.id_subject) === extId)
    return extSubject?.external_teacher_name ? `${extSubject.external_teacher_name} [นอกสาขา]` : 'อาจารย์นอกสาขา'
  }

  const teacherId = Number(raw)
  const group = subjectIdToGroupComputed.value?.[Number(subjectId)]
  const subj = group?.subjects?.find(s => Number(s.id_teacher) === teacherId)
  if (subj) return getTeacherDisplayName(subj)

  const fallback = allSubjects.value?.find(s => Number(s.id_teacher) === teacherId)
  return fallback ? getTeacherDisplayName(fallback) : raw
}

const getSlotTeacherLabels = (subjectId, teacherRefs = []) => {
  const refs = normalizeTeacherRefs(teacherRefs)
  if (refs.length > 0) {
    return refs.map(ref => getSlotTeacherLabel(subjectId, ref)).filter(Boolean)
  }
  return getDefaultTeacherRefsForSubject(subjectId)
    .map(ref => getSlotTeacherLabel(subjectId, ref))
    .filter(Boolean)
}

const getSubjectLabelWithTeachers = (val, roomId = null, sectionIds = null, teacherRefs = null) => {
  const staticOpt = staticOptions.find(o => o.value === val)
  if (staticOpt) return staticOpt.label

  const subj = allSubjects.value?.find(s => s.id_subject == val)
  if (!subj) return '-'

  let sectionDisplay = ''
  if (sectionIds && Array.isArray(sectionIds) && sectionIds.length > 0) {
    const names = subj.sections
      ?.filter(s => sectionIds.includes(s.id_section))
      ?.map(s => s.section_name)
      ?.join(', ')
    sectionDisplay = names ? `(${names})` : ''
  } else {
    sectionDisplay = subj.section_names ? `(${subj.section_names})` : ''
  }

  let roomName = ''
  if (roomId) {
    const r = rooms.value?.find(rm => rm.id_room == roomId)
    if (r) roomName = r.room_name
  }

  const teacherLabels = getSlotTeacherLabels(val, teacherRefs)
  let teacherName = ''
  if (teacherLabels.length > 0) {
    teacherName = ` (${teacherLabels.join(' / ')})`
  } else if (subj.external_teacher_name) {
    teacherName = ` (${subj.external_teacher_name} [นอกสาขา])`
  } else if (subj.first_name || subj.last_name) {
    teacherName = ` (${[subj.prefix, subj.first_name, subj.last_name].filter(Boolean).join(' ').trim()})`
  }

  const subjName = subj.name_subject || 'ไม่ระบุชื่อวิชา'
  return `${subjName}${teacherName} ${sectionDisplay} ${roomName ? `[${roomName}]` : ''}`
}

const saveSchedule = async () => {
  saving.value = true
  try {
    const normalizedSchedule = scheduleSlots.value.map(day =>
      day.map(slot => {
        if (!slot?.value || staticOptions.some(o => o.value === slot.value)) {
          return {
            ...slot,
            room_id: getNormalizedRoomId(slot.room_id),
            schedule_kind: slot.schedule_kind || 'lesson',
            teacher_ids: normalizeTeacherRefs(slot.teacher_ids)
          }
        }
        return {
          ...slot,
          value: normalizeSubjectIdForSave(slot.value),
          room_id: getNormalizedRoomId(slot.room_id),
          schedule_kind: slot.schedule_kind || 'lesson',
          teacher_ids: normalizeTeacherRefs(slot.teacher_ids)
        }
      })
    )

    await $fetch('/api/section-schedules', {
      method: 'POST',
      body: {
        id_section: sectionId,
        term: term.value,
        schedule: normalizedSchedule
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
