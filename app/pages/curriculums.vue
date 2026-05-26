<template>
  <nav class="sticky top-16 z-50 bg-white border-b border-slate-200 p-3 shadow-sm no-print">
    <div class="container mx-auto flex items-center">
      <UButton icon="i-lucide-arrow-left" label="ย้อนกลับ" color="gray" variant="ghost" size="lg" to="/"
        class="font-bold text-md cursor-pointer hover:bg-slate-100" />
    </div>
  </nav>
  <div class="min-h-screen bg-slate-50">
    <nav class="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div class="container mx-auto px-4 py-8">
        <div class="flex items-center h-16 gap-4">
          <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
            <UIcon name="i-heroicons-academic-cap" class="text-3xl text-indigo-600" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-slate-900">หลักสูตรและแผนการเรียน</h1>
            <p class="text-slate-600">จัดการโครงสร้างหลักสูตรและจัดแผนการเรียน</p>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
      <!-- Curriculum Selection Header -->
      <div
        class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="flex-1 w-full relative">
          <label
            class="block text-lg font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">เลือกหลักสูตรที่ต้องการจัดการ</label>
          <div class="flex gap-2">
            <USelect v-model="selectedCurriculumId" :items="curriculumOptions" placeholder="-- เลือกหลักสูตร --"
              size="xl" class="w-full flex-1" />
            <UButton icon="i-heroicons-plus" color="primary" variant="solid" @click="manageCurriculumModal = true"
              label="จัดการหลักสูตร" class="rounded-xl px-4 font-bold cursor-pointer" />
          </div>
        </div>
      </div>

      <div v-if="selectedCurriculum" class="space-y-6">
        <!-- Tabs -->
        <div class="flex border-b border-slate-200">
          <button class="px-6 py-3 font-bold text-lg border-b-2 transition-colors flex items-center gap-2"
            :class="activeTab === 'structure' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
            @click="activeTab = 'structure'">
            <UIcon name="i-heroicons-list-bullet" />
            โครงสร้างหลักสูตร (หมวดวิชาและรายวิชา)
          </button>
          <button class="px-6 py-3 font-bold text-lg border-b-2 transition-colors flex items-center gap-2"
            :class="activeTab === 'plans' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
            @click="activeTab = 'plans'">
            <UIcon name="i-heroicons-map" />
            แผนการเรียน
          </button>
        </div>

        <!-- 1. Structure Tab -->
        <div v-if="activeTab === 'structure'"
          class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 class="font-bold text-lg text-slate-800">หมวดวิชาในหลักสูตร</h2>
            <UButton icon="i-heroicons-folder-plus" label="เพิ่มหมวดวิชา" color="primary" size="lg"
              @click="openAddCategoryModal" class="rounded-xl cursor-pointer" />
          </div>

          <div class="p-6 space-y-6">
            <div v-if="!topCategories.length" class="text-center py-10 text-slate-400 italic">ยังไม่มีหมวดวิชา</div>

            <!-- หมวดวิชา (Top Level) -->
            <div v-for="(cat, index) in topCategories" :key="cat.id_category"
              class="border border-slate-200 rounded-xl overflow-hidden">
              <div class="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
                <h3 class="font-bold text-lg text-indigo-900">{{ index + 1 }}. {{ cat.name_category }}</h3>
                <div class="flex gap-2">
                  <UButton size="lg" color="primary" variant="subtle" icon="i-heroicons-plus" label="เพิ่มวิชา"
                    class="cursor-pointer" @click="openAddSubjectModal(cat.id_category)" />
                  <UButton size="lg" color="primary" variant="subtle" icon="i-heroicons-folder-plus"
                    label="เพิ่มกลุ่มวิชา" class="cursor-pointer" @click="openAddSubCategoryModal(cat.id_category)" />
                  <UButton size="lg" color="warning" variant="subtle" icon="i-heroicons-pencil" class="cursor-pointer"
                    @click="openEditCategoryModal(cat)" />
                  <UButton size="lg" color="error" variant="subtle" icon="i-heroicons-trash" class="cursor-pointer"
                    @click="deleteCategory(cat.id_category)" />
                </div>
              </div>

              <div class="p-4 space-y-4">
                <div v-if="!getSubCategories(cat.id_category).length && !getSubjectsForCategory(cat.id_category).length"
                  class="text-center py-6 text-slate-400 italic text-sm">ยังไม่มีข้อมูลในหมวดนี้</div>

                <!-- วิชาในหมวดหลัก -->
                <div v-if="getSubjectsForCategory(cat.id_category).length"
                  class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm mb-4">
                  <div class="bg-slate-50 p-2 border-b border-slate-200">
                    <span class="text-md font-semibold text-slate-600 pl-2">วิชาในหมวดหลัก</span>
                  </div>
                  <div class="p-2">
                    <table class="w-full text-left text-slate-600">
                      <thead class="text-md uppercase bg-slate-50 text-slate-500">
                        <tr>
                          <th class="px-3 py-2 font-bold">รหัสวิชา</th>
                          <th class="px-3 py-2 font-bold">ชื่อวิชา</th>
                          <th class="px-3 py-2 text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="sub in getSubjectsForCategory(cat.id_category)" :key="sub.id_subject_curr"
                          class="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td class="px-3 py-2 font-medium">{{ sub.subject_code || '-' }}</td>
                          <td class="px-3 py-2">{{ sub.name_subject }}</td>
                          <td class="px-3 py-2 text-right whitespace-nowrap">
                            <UButton size="lg" class="mr-1 cursor-pointer" color="warning" variant="subtle"
                              icon="i-heroicons-pencil" @click="openEditSubjectModal(sub)" />
                            <UButton size="lg" class="cursor-pointer" color="error" variant="subtle"
                              icon="i-heroicons-trash" @click="deleteSubject(sub.id_subject_curr)" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- กลุ่มวิชา (Sub Level) -->
                <div v-for="(sub_cat, sub_index) in getSubCategories(cat.id_category)" :key="sub_cat.id_category"
                  class="border border-slate-200 rounded-lg overflow-hidden">
                  <div class="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                    <h4 class="font-bold text-md text-slate-700">{{ index + 1 }}.{{ sub_index + 1 }} {{
                      sub_cat.name_category }}</h4>
                    <div class="flex gap-2">
                      <UButton size="lg" color="primary" variant="subtle" icon="i-heroicons-folder-plus"
                        label="เพิ่มย่อย" @click="openAddSubCategoryModal(sub_cat.id_category)" />
                      <UButton size="lg" color="primary" variant="subtle" icon="i-heroicons-plus" label="เพิ่มวิชา"
                        @click="openAddSubjectModal(sub_cat.id_category)" />
                      <UButton size="lg" color="warning" variant="subtle" icon="i-heroicons-pencil"
                        @click="openEditSubCategoryModal(sub_cat)" />
                      <UButton size="lg" color="error" variant="subtle" icon="i-heroicons-trash"
                        @click="deleteCategory(sub_cat.id_category)" />
                    </div>
                  </div>

                  <div class="p-3 space-y-3 bg-white">
                    <!-- กลุ่มวิชาย่อย (Sub-Sub Level) -->
                    <div v-for="(sub_sub_cat, sub_sub_index) in getSubCategories(sub_cat.id_category)"
                      :key="sub_sub_cat.id_category" class="border border-slate-100 rounded-lg overflow-hidden ml-4">
                      <div class="bg-slate-50/50 p-2 border-b border-slate-100 flex justify-between items-center">
                        <h5 class="font-semibold text-md text-slate-600">{{ index + 1 }}.{{ sub_index + 1 }}.{{
                          sub_sub_index + 1 }} {{ sub_sub_cat.name_category }}</h5>
                        <div class="flex gap-2">
                          <UButton size="lg" color="primary" variant="subtle" icon="i-heroicons-plus" label="เพิ่มวิชา"
                            @click="openAddSubjectModal(sub_sub_cat.id_category)" class="cursor-pointer" />
                          <UButton size="lg" color="warning" variant="subtle" icon="i-heroicons-pencil"
                            @click="openEditSubCategoryModal(sub_sub_cat)" class="cursor-pointer" />
                          <UButton size="lg" color="error" variant="subtle" icon="i-heroicons-trash"
                            @click="deleteCategory(sub_sub_cat.id_category)" class="cursor-pointer" />
                        </div>
                      </div>
                      <div class="p-2">
                        <table class="w-full text-md text-left text-slate-500">
                          <thead class="uppercase bg-slate-50 text-slate-400">
                            <tr>
                              <th class="px-2 py-1 font-bold">รหัสวิชา</th>
                              <th class="px-2 py-1 font-bold">ชื่อวิชา</th>
                              <th class="px-2 py-1 text-right">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="sub in getSubjectsForCategory(sub_sub_cat.id_category)"
                              :key="sub.id_subject_curr"
                              class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td class="px-2 py-1 font-medium">{{ sub.subject_code || '-' }}</td>
                              <td class="px-2 py-1">{{ sub.name_subject }}</td>
                              <td class="px-2 py-1 text-right whitespace-nowrap">
                                <UButton size="lg" class="mr-1 cursor-pointer" color="warning" variant="subtle"
                                  icon="i-heroicons-pencil" @click="openEditSubjectModal(sub)" />
                                <UButton size="lg" class="cursor-pointer" color="error" variant="subtle"
                                  icon="i-heroicons-trash" @click="deleteSubject(sub.id_subject_curr)" />
                              </td>
                            </tr>
                            <tr v-if="!getSubjectsForCategory(sub_sub_cat.id_category).length">
                              <td colspan="3" class="px-2 py-2 text-center text-slate-300 italic">
                                ไม่มีรายวิชาในกลุ่มย่อยนี้</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- วิชาในกลุ่มหลัก -->
                    <table class="w-full text-md text-left text-slate-600 mt-2">
                      <thead class="text-md uppercase bg-slate-50 text-slate-500">
                        <tr>
                          <th class="px-3 py-2 font-bold">รหัสวิชา</th>
                          <th class="px-3 py-2 font-bold">ชื่อวิชา</th>
                          <th class="px-3 py-2 text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="sub in getSubjectsForCategory(sub_cat.id_category)" :key="sub.id_subject_curr"
                          class="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td class="px-3 py-2 font-medium">{{ sub.subject_code || '-' }}</td>
                          <td class="px-3 py-2">{{ sub.name_subject }}</td>
                          <td class="px-3 py-2 text-right whitespace-nowrap">
                            <UButton size="lg" class="mr-1" color="warning" variant="soft" icon="i-heroicons-pencil"
                              @click="openEditSubjectModal(sub)" />
                            <UButton size="lg" color="error" variant="soft" icon="i-heroicons-trash"
                              @click="deleteSubject(sub.id_subject_curr)" />
                          </td>
                        </tr>
                        <tr v-if="!getSubjectsForCategory(sub_cat.id_category).length">
                          <td colspan="3" class="px-3 py-3 text-center text-slate-400 italic text-xs">
                            ไม่มีรายวิชาในกลุ่มนี้</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Plans Tab -->
        <div v-if="activeTab === 'plans'" class="grid grid-cols-1 lg:grid-cols-4 gap-6">

          <div
            class="col-span-1 border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)] sticky top-24">
            <div class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 class="font-bold text-slate-800">รายการแผนการเรียน</h3>
              <UButton icon="i-heroicons-plus" color="primary" variant="ghost" @click="openPlanModal" />
            </div>
            <div class="overflow-y-auto flex-1 p-2 custom-scrollbar">
              <div v-if="!studyPlans.length" class="text-center p-4 text-slate-400 text-sm">ยังไม่มีแผนการเรียน</div>
              <div v-for="plan in studyPlans" :key="plan.id_plan"
                class="p-3 mb-2 rounded-xl transition-colors cursor-pointer border relative group"
                :class="selectedPlanId === plan.id_plan ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-inner' : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'"
                @click="selectedPlanId = plan.id_plan">
                <div class="font-bold text-sm flex justify-between items-center">
                  <span>{{ plan.name_plan }}</span>
                  <UButton size="sm" color="warning" variant="ghost" icon="i-heroicons-pencil"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @click.stop="openEditPlanModal(plan)" />
                </div>
                <div class="text-xs text-slate-500 mt-1">
                  <span>{{ plan.level }}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            class="col-span-1 lg:col-span-3 border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div v-if="!selectedPlan"
              class="h-full flex flex-col items-center justify-center text-slate-400 p-8 flex-1">
              <UIcon name="i-heroicons-map" class="text-6xl text-slate-200 mb-4" />
              <p>เลือกแผนการเรียนด้านซ้ายเพื่อจัดการรายวิชา</p>
            </div>

            <div v-else class="flex flex-col h-full flex-1">
              <!-- Header: Plan name + Year/Semester selectors -->
              <div class="p-5 border-b border-slate-100 bg-slate-50/50">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h2 class="text-xl font-bold text-indigo-900">{{ selectedPlan.name_plan }}</h2>
                    <p class="text-sm text-slate-500 mt-0.5">ระดับ {{ selectedPlan.level }}</p>
                  </div>
                  <UButton color="error" variant="ghost" icon="i-heroicons-trash" size="sm"
                    @click="deletePlan(selectedPlan.id_plan)" />
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2 flex-1">
                    <label class="text-xs font-bold text-slate-500 whitespace-nowrap">ปีที่</label>
                    <USelect v-model="viewYear" :items="viewYearOptions" class="w-28" />
                  </div>
                  <div class="flex items-center gap-2 flex-1">
                    <label class="text-xs font-bold text-slate-500 whitespace-nowrap">ภาคเรียน</label>
                    <USelect v-model="viewSemester"
                      :items="[{ value: 1, label: 'เทอม 1' }, { value: 2, label: 'เทอม 2' }, { value: 3, label: 'เทอม 3 (ฤดูร้อน)' }]"
                      class="w-40" />
                  </div>
                  <UButton color="primary" icon="i-heroicons-plus-circle" label="เพิ่มวิชา"
                    class="font-bold shadow-md shadow-blue-500/20 ml-auto" @click="openAddPlanSubjectModal" />
                </div>
              </div>

              <!-- Filtered subject table -->
              <div class="p-6 flex-1 overflow-y-auto">
                <table class="w-full text-sm text-left text-slate-600">
                  <thead class="text-xs uppercase bg-slate-100 text-slate-500">
                    <tr>
                      <th class="px-4 py-3 font-bold">หมวดวิชา</th>
                      <th class="px-4 py-3 font-bold">รหัสวิชา</th>
                      <th class="px-4 py-3 font-bold">ชื่อวิชา</th>
                      <th class="px-4 py-3 text-right">ลบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ps in filteredPlanSubjectsByTerm" :key="ps.id_plan_subject"
                      class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-3 text-xs text-slate-400">{{ ps.name_category || '-' }}</td>
                      <td class="px-4 py-3 font-medium">{{ ps.subject_code || '-' }}</td>
                      <td class="px-4 py-3 font-bold text-slate-800">{{ ps.name_subject }}</td>
                      <td class="px-4 py-3 text-right">
                        <UButton size="sm" color="error" variant="ghost" icon="i-heroicons-x-mark"
                          @click="removePlanSubject(ps.id_plan_subject)" />
                      </td>
                    </tr>
                    <tr v-if="!filteredPlanSubjectsByTerm.length">
                      <td colspan="4" class="px-4 py-12 text-center text-slate-400 italic">ยังไม่มีวิชาในปีที่ {{
                        viewYear }} ภาคเรียนที่ {{ viewSemester }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div v-else
          class="bg-white rounded-2xl py-20 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <UIcon name="i-heroicons-academic-cap" class="text-6xl text-slate-200 mb-4" />
          <p class="text-slate-500 font-medium text-lg">กรุณาเลือกหรือสร้างหลักสูตรเพื่อเริ่มต้นจัดการ</p>
        </div>
      </div>

      <!-- Modals -->

      <!-- Curriculum Modal -->
      <UModal v-model:open="manageCurriculumModal" :ui="{ content: 'bg-white rounded-2xl' }">
        <template #content>
          <div class="p-6">
            <h3 class="text-2xl font-bold mb-4">จัดการรายชื่อหลักสูตร</h3>
            <div class="flex gap-2 mb-6">
              <UInput v-model="newCurriculumName" placeholder="ชื่อหลักสูตรใหม่..." class="flex-1" />
              <UButton :label="editingCurriculumId ? 'บันทึก' : 'เพิ่ม'" color="primary" @click="addCurriculum"
                :disabled="!newCurriculumName.trim()" />
              <UButton v-if="editingCurriculumId" label="ยกเลิก" color="gray" variant="soft"
                @click="() => { editingCurriculumId = null; newCurriculumName = '' }" />
            </div>
            <div class="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
              <div v-for="c in curriculums" :key="c.id_curriculum"
                class="flex justify-between items-center p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <span class="font-medium text-sm">{{ c.name_curriculum }}</span>
                <div class="flex gap-1">
                  <UButton class="cursor-pointer" icon="i-heroicons-pencil" color="warning" variant="outline" size="lg"
                    @click="openEditCurriculumModal(c)" />
                  <UButton class="cursor-pointer" icon="i-heroicons-trash" color="error" variant="outline" size="lg"
                    @click="deleteCurriculum(c.id_curriculum)" />
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <UButton class="cursor-pointer" label="ปิด" color="neutral" variant="soft" size="lg"
                @click="manageCurriculumModal = false" />
            </div>
          </div>
        </template>
      </UModal>

      <!-- Category Modal -->
      <UModal v-model:open="categoryModal" :ui="{ content: 'bg-white rounded-2xl' }">
        <template #content>
          <div class="p-6">
            <h3
              class="text-xl font-bold mb-4 bg-indigo-50 text-indigo-900 border border-indigo-100 p-4 rounded-xl text-center">
              {{ editingCategoryId ? 'แก้ไขหมวดวิชา' : 'เพิ่มหมวดวิชา' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-500 mb-1">ชื่อหมวดวิชา</label>
                <UInput v-model="newCategoryName" placeholder="เช่น หมวดวิชาการศึกษาทั่วไป" />
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-2">
              <UButton label="ยกเลิก" color="neutral" variant="soft" @click="categoryModal = false" />
              <UButton label="บันทึก" color="primary" @click="saveCategory" :disabled="!newCategoryName.trim()" />
            </div>
          </div>
        </template>
      </UModal>

      <!-- Sub-Category (กลุ่มวิชา) Modal -->
      <UModal v-model:open="subCategoryModal" :ui="{ content: 'bg-white rounded-2xl' }">
        <template #content>
          <div class="p-6">
            <h3
              class="text-xl font-bold mb-4 bg-blue-50 text-blue-900 border border-blue-100 p-4 rounded-xl text-center">
              {{ editingSubCategoryId ? 'แก้ไขกลุ่มวิชา' : 'เพิ่มกลุ่มวิชา' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-500 mb-1">ชื่อกลุ่มวิชา</label>
                <UInput v-model="newSubCategoryName" placeholder="เช่น กลุ่มวิชาทักษะการสื่อสาร" />
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-2">
              <UButton label="ยกเลิก" color="neutral" variant="soft" @click="subCategoryModal = false" />
              <UButton label="บันทึก" color="primary" @click="saveSubCategory" :disabled="!newSubCategoryName.trim()" />
            </div>
          </div>
        </template>
      </UModal>
      <UModal v-model:open="subjectModal" :ui="{ content: 'bg-white rounded-2xl' }">
        <template #content>
          <div class="p-6">
            <h3
              class="text-xl font-bold mb-4 bg-slate-50 text-slate-900 border border-slate-200 p-4 rounded-xl text-center">
              {{ editingSubjectId ? 'แก้ไขรายวิชา' : 'เพิ่มวิชาลงหมวด' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-500 mb-1">รหัสวิชา</label>
                <UInput v-model="newSubjectCode" placeholder="รหัสวิชา (ถ้ามี)" />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-500 mb-1">ชื่อวิชา <span
                    class="text-red-500">*</span></label>
                <UInput v-model="newSubjectName" placeholder="ชื่อรายวิชา" />
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-2">
              <UButton label="ยกเลิก" color="neutral" variant="soft" @click="subjectModal = false" />
              <UButton label="บันทึก" color="primary" @click="saveSubject" :disabled="!newSubjectName.trim()" />
            </div>
          </div>
        </template>
      </UModal>

      <!-- Plan Modal -->
      <UModal v-model:open="planModal" :ui="{ content: 'bg-white rounded-2xl' }">
        <template #content>
          <div class="p-6">
            <h3
              class="text-xl font-bold mb-4 bg-indigo-50 text-indigo-900 border border-indigo-100 p-4 rounded-xl text-center">
              {{ editingPlanId ? 'แก้ไขแผนการเรียน' : 'สร้างแผนการเรียน' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-500 mb-1">ชื่อแผน <span
                    class="text-red-500">*</span></label>
                <UInput v-model="newPlan.name" placeholder="เช่น แผน ป.ตรี ปกติ 4 ปี" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-slate-500 mb-1">ระดับ</label>
                  <USelect v-model="newPlan.level"
                    :items="[{ value: 'ป.ตรี', label: 'ปริญญาตรี' }, { value: 'ปวส.', label: 'ปวส.' }]" />
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-500 mb-1">ปีที่</label>
                  <USelect v-model="newPlan.year" :items="[1, 2, 3, 4, 5].map(v => ({ value: v, label: `ปี ${v}` }))" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-500 mb-1">ภาคเรียน</label>
                <USelect v-model="newPlan.semester" :items="[1, 2, 3].map(v => ({ value: v, label: `เทอม ${v}` }))" />
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-2">
              <UButton label="ยกเลิก" color="neutral" variant="soft" @click="planModal = false" />
              <UButton label="บันทึก" color="primary" @click="savePlan" :disabled="!newPlan.name.trim()" />
            </div>
          </div>
        </template>
      </UModal>

      <!-- Add Subject to Plan Modal -->
      <UModal v-model:open="planSubjectModal" :ui="{ content: 'bg-white rounded-2xl w-full max-w-2xl' }">
        <template #content>
          <div class="p-6">
            <h3 class="text-xl font-bold mb-1">เพิ่มวิชาลงแผน</h3>
            <p class="text-sm text-slate-500 mb-4">จัดเข้า <span class="font-bold text-indigo-600">ปีที่ {{ viewYear }}
                ภาคเรียนที่ {{ viewSemester }}</span></p>

            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-500 mb-1">กรองหมวดวิชา</label>
              <USelect class="w-full" v-model="filterCategoryId" :items="formattedCategoryOptions" />
            </div>

            <div class="max-h-80 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl p-2 bg-slate-50">
              <div v-for="sub in filteredSubjectsForPlan" :key="sub.id_subject_curr"
                class="flex items-center gap-3 p-3 hover:bg-white rounded-lg cursor-pointer border border-transparent hover:border-blue-200 transition-colors"
                @click="togglePlanSubjectSel(sub.id_subject_curr)">
                <UCheckbox :model-value="selectedSubjectsToAdd.includes(sub.id_subject_curr)"
                  @update:model-value="togglePlanSubjectSel(sub.id_subject_curr)" />
                <div>
                  <div class="font-bold text-slate-800 text-sm">{{ sub.subject_code ? sub.subject_code + ' ' : '' }}{{
                    sub.name_subject }}</div>
                  <div class="text-xs text-slate-400 mt-0.5">{{ sub.categoryName }}</div>
                </div>
              </div>
              <div v-if="!filteredSubjectsForPlan.length" class="text-center py-8 text-slate-400">ไม่พบวิชาในหมวดนี้
              </div>
            </div>

            <div class="mt-6 flex justify-between items-center">
              <div class="text-sm font-medium text-slate-600">เลือกแล้ว: {{ selectedSubjectsToAdd.length }} วิชา</div>
              <div class="flex gap-2">
                <UButton label="ยกเลิก" color="neutral" variant="soft" @click="planSubjectModal = false" />
                <UButton label="บันทึกเข้าแผน" color="primary" @click="savePlanSubjects"
                  :disabled="!selectedSubjectsToAdd.length" :loading="savingPlanSubs" />
              </div>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Plan Modal -->
      <UModal v-model:open="planModal" :ui="{ content: 'bg-white rounded-2xl' }">
        <template #content>
          <div class="p-6">
            <h3 class="text-xl font-bold mb-4">{{ editingPlanId ? 'แก้ไขแผนการเรียน' : 'เพิ่มแผนการเรียน' }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-500 mb-1">ชื่อแผนการเรียน</label>
                <UInput v-model="newPlan.name" placeholder="เช่น แผนการเรียน 66..." />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-500 mb-1">ระดับ</label>
                <USelect v-model="newPlan.level"
                  :items="[{ value: 'ปวช.', label: 'ปวช. (3 ปี)' }, { value: 'ปวส.', label: 'ปวส. (2 ปี)' }, { value: 'ป.ตรี', label: 'ป.ตรี (4 ปี)' }]" />
              </div>
            </div>
            <div class="flex justify-end gap-2 mt-6">
              <UButton label="ยกเลิก" color="gray" variant="soft" @click="planModal = false" />
              <UButton :label="editingPlanId ? 'บันทึก' : 'เพิ่ม'" color="primary" @click="savePlan"
                :disabled="!newPlan.name.trim()" />
            </div>
          </div>
        </template>
      </UModal>

    </div>
  </div>
</template>

<script setup>
const toast = useToast()

// Curriculums logic
const { data: curriculumsRef, refresh: refreshCurriculum } = await useFetch('/api/curriculums')
const curriculums = computed(() => curriculumsRef.value || [])
const curriculumOptions = computed(() => curriculums.value.map(c => ({ value: c.id_curriculum, label: c.name_curriculum })))
const selectedCurriculumId = ref(null)
const selectedCurriculum = computed(() => curriculums.value.find(c => c.id_curriculum === selectedCurriculumId.value))

const manageCurriculumModal = ref(false)
const newCurriculumName = ref('')
const editingCurriculumId = ref(null)

const openEditCurriculumModal = (c) => {
  editingCurriculumId.value = c.id_curriculum
  newCurriculumName.value = c.name_curriculum
}

const addCurriculum = async () => {
  try {
    if (editingCurriculumId.value) {
      await $fetch(`/api/curriculums/${editingCurriculumId.value}`, { method: 'PUT', body: { name_curriculum: newCurriculumName.value } })
    } else {
      await $fetch('/api/curriculums', { method: 'POST', body: { name_curriculum: newCurriculumName.value } })
    }

    newCurriculumName.value = ''
    editingCurriculumId.value = null
    refreshCurriculum()
    toast.add({ title: 'สำเร็จ', color: 'green' })
  } catch (e) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: e.statusMessage || e.message, color: 'red' })
  }
}

const deleteCurriculum = async (id) => {
  if (!confirm('ยืนยันลบหลักสูตร? หากลบ ข้อมูลหมวดหมู่ แผน และวิชาที่เกี่ยวข้องจะหายทั้งหมด')) return
  try {
    await $fetch(`/api/curriculums/${id}`, { method: 'DELETE' })
    if (selectedCurriculumId.value === id) selectedCurriculumId.value = null
    refreshCurriculum()
  } catch (e) { }
}

const activeTab = ref('structure')

// Categories and Subjects logic
const { data: categoriesRef, refresh: refreshCat } = await useFetch('/api/curriculum-categories', { query: computed(() => ({ id_curriculum: selectedCurriculumId.value })) })
const allCategories = computed(() => categoriesRef.value || [])
const topCategories = computed(() => allCategories.value.filter(c => !c.parent_id))
const getSubCategories = (parentId) => allCategories.value.filter(c => c.parent_id === parentId)

// Keep `categories` for backward compat (used in plan subject filter)
const categories = computed(() => allCategories.value || [])

const formattedCategoryOptions = computed(() => {
  const options = [{ value: null, label: 'ทุกหมวดวิชา' }]
  const topList = allCategories.value.filter(c => !c.parent_id)

  topList.forEach((topIter, i) => {
    const topNum = `${i + 1}.`
    options.push({ value: topIter.id_category, label: `${topNum} ${topIter.name_category}` })

    const subList = allCategories.value.filter(c => c.parent_id === topIter.id_category)
    subList.forEach((subIter, j) => {
      const subNum = `${i + 1}.${j + 1}`
      options.push({ value: subIter.id_category, label: `  ${subNum} ${subIter.name_category}` })

      const subSubList = allCategories.value.filter(c => c.parent_id === subIter.id_category)
      subSubList.forEach((subSubIter, k) => {
        const subSubNum = `${i + 1}.${j + 1}.${k + 1}`
        options.push({ value: subSubIter.id_category, label: `    ${subSubNum} ${subSubIter.name_category}` })
      })
    })
  })

  return options
})

const { data: subjectsRef, refresh: refreshSubj } = await useFetch('/api/curriculum-subjects', { query: computed(() => ({ id_curriculum: selectedCurriculumId.value })) })
const subjects = computed(() => subjectsRef.value || [])

// Plans logic (must be declared before the watch that calls refreshPlans)
const { data: plansRef, refresh: refreshPlans } = await useFetch('/api/study-plans', { query: computed(() => ({ id_curriculum: selectedCurriculumId.value })) })
const studyPlans = computed(() => plansRef.value || [])

const selectedPlanId = ref(null)
const selectedPlan = computed(() => studyPlans.value.find(p => p.id_plan === selectedPlanId.value))

watch(selectedCurriculumId, () => {
  if (selectedCurriculumId.value) {
    refreshCat()
    refreshSubj()
    refreshPlans()
    selectedPlanId.value = null
  }
}, { immediate: true })

const getSubjectsForCategory = (catId) => subjects.value.filter(s => s.id_category === catId)

// หมวดวิชา (Top Level) Modal
const categoryModal = ref(false)
const newCategoryName = ref('')
const editingCategoryId = ref(null)

const openAddCategoryModal = () => {
  editingCategoryId.value = null
  newCategoryName.value = ''
  categoryModal.value = true
}

const openEditCategoryModal = (cat) => {
  editingCategoryId.value = cat.id_category
  newCategoryName.value = cat.name_category
  categoryModal.value = true
}

const saveCategory = async () => {
  try {
    if (editingCategoryId.value) {
      await $fetch(`/api/curriculum-categories/${editingCategoryId.value}`, { method: 'PUT', body: { name_category: newCategoryName.value } })
    } else {
      await $fetch('/api/curriculum-categories', { method: 'POST', body: { id_curriculum: selectedCurriculumId.value, name_category: newCategoryName.value } })
    }
    categoryModal.value = false
    refreshCat()
    toast.add({ title: 'สำเร็จ', color: 'green' })
  } catch (e) { toast.add({ title: 'Error', color: 'red' }) }
}

// กลุ่มวิชา (Sub Level) Modal
const subCategoryModal = ref(false)
const newSubCategoryName = ref('')
const subCategoryParentId = ref(null)
const editingSubCategoryId = ref(null)

const openAddSubCategoryModal = (parentId) => {
  editingSubCategoryId.value = null
  subCategoryParentId.value = parentId
  newSubCategoryName.value = ''
  subCategoryModal.value = true
}

const openEditSubCategoryModal = (cat) => {
  editingSubCategoryId.value = cat.id_category
  subCategoryParentId.value = cat.parent_id
  newSubCategoryName.value = cat.name_category
  subCategoryModal.value = true
}

const saveSubCategory = async () => {
  try {
    if (editingSubCategoryId.value) {
      await $fetch(`/api/curriculum-categories/${editingSubCategoryId.value}`, { method: 'PUT', body: { parent_id: subCategoryParentId.value, name_category: newSubCategoryName.value } })
    } else {
      await $fetch('/api/curriculum-categories', { method: 'POST', body: { id_curriculum: selectedCurriculumId.value, parent_id: subCategoryParentId.value, name_category: newSubCategoryName.value } })
    }
    subCategoryModal.value = false
    refreshCat()
    toast.add({ title: 'สำเร็จ', color: 'green' })
  } catch (e) { toast.add({ title: 'Error', color: 'red' }) }
}

const deleteCategory = async (id) => {
  if (!confirm('ยืนยันลบ?')) return
  await $fetch(`/api/curriculum-categories/${id}`, { method: 'DELETE' })
  refreshCat()
  refreshSubj()
}

const subjectModal = ref(false)
const newSubjectCode = ref('')
const newSubjectName = ref('')
const selectedCategoryIdForNewSubject = ref(null)
const editingSubjectId = ref(null)

const openAddSubjectModal = (catId) => {
  editingSubjectId.value = null
  selectedCategoryIdForNewSubject.value = catId
  newSubjectCode.value = ''
  newSubjectName.value = ''
  subjectModal.value = true
}

const openEditSubjectModal = (sub) => {
  editingSubjectId.value = sub.id_subject_curr
  selectedCategoryIdForNewSubject.value = sub.id_category
  newSubjectCode.value = sub.subject_code || ''
  newSubjectName.value = sub.name_subject
  subjectModal.value = true
}

const saveSubject = async () => {
  try {
    if (editingSubjectId.value) {
      await $fetch(`/api/curriculum-subjects/${editingSubjectId.value}`, {
        method: 'PUT',
        body: { id_category: selectedCategoryIdForNewSubject.value, subject_code: newSubjectCode.value.trim(), name_subject: newSubjectName.value.trim() }
      })
    } else {
      await $fetch('/api/curriculum-subjects', {
        method: 'POST',
        body: { id_category: selectedCategoryIdForNewSubject.value, subject_code: newSubjectCode.value.trim(), name_subject: newSubjectName.value.trim() }
      })
    }
    subjectModal.value = false
    refreshSubj()
    toast.add({ title: 'สำเร็จ', color: 'green' })
  } catch (e) { toast.add({ title: 'Error', color: 'red' }) }
}

const deleteSubject = async (id) => {
  if (!confirm('ลบวิชานี้?')) return
  await $fetch(`/api/curriculum-subjects/${id}`, { method: 'DELETE' })
  refreshSubj()
}

const deletePlan = async (id) => {
  if (!confirm('ยืนยันลบแผนการเรียน?')) return
  await $fetch(`/api/study-plans/${id}`, { method: 'DELETE' })
  selectedPlanId.value = null
  await refreshPlans()
}

// Plans modal logic
const planModal = ref(false)
const newPlan = ref({ name: '', level: 'ป.ตรี' })
const editingPlanId = ref(null)

const openPlanModal = () => {
  editingPlanId.value = null
  newPlan.value = { name: '', level: 'ป.ตรี' }
  planModal.value = true
}

const openEditPlanModal = (plan) => {
  editingPlanId.value = plan.id_plan
  newPlan.value = { name: plan.name_plan, level: plan.level }
  planModal.value = true
}

const savePlan = async () => {
  try {
    const bodyArgs = {
      id_curriculum: selectedCurriculumId.value,
      name_plan: newPlan.value.name,
      level: newPlan.value.level
    }

    let res;
    if (editingPlanId.value) {
      res = await $fetch(`/api/study-plans/${editingPlanId.value}`, { method: 'PUT', body: bodyArgs })
      selectedPlanId.value = editingPlanId.value
    } else {
      res = await $fetch('/api/study-plans', { method: 'POST', body: bodyArgs })
      selectedPlanId.value = res.id_plan
    }

    planModal.value = false
    await refreshPlans()
    toast.add({ title: 'สำเร็จ', color: 'green' })
  } catch (e) { toast.add({ title: 'Error', color: 'red' }) }
}

// Plan Subjects mapping logic
const { data: planSubsRef, refresh: refreshPlanSubs } = await useFetch('/api/study-plan-subjects', { query: computed(() => ({ id_plan: selectedPlanId.value })) })
const planSubjects = computed(() => planSubsRef.value || [])

watch(selectedPlanId, () => {
  if (selectedPlanId.value) refreshPlanSubs()
})

const planSubjectsList = computed(() => {
  if (!selectedPlanId.value) return []
  return planSubjects.value
})

// View filters for year/semester (live in the card header)
const viewYear = ref(1)
const viewSemester = ref(1)

// Dynamic max year based on plan level
const maxPlanYear = computed(() => {
  if (!selectedPlan.value) return 5
  if (selectedPlan.value.level === 'ปวช.') return 3
  if (selectedPlan.value.level === 'ปวส.') return 2
  return 5
})

const viewYearOptions = computed(() => {
  return Array.from({ length: maxPlanYear.value }, (_, i) => ({ value: i + 1, label: `ปีที่ ${i + 1}` }))
})

// Reset viewYear when switching plans
watch(selectedPlanId, () => {
  viewYear.value = 1
  viewSemester.value = 1
})

// Filter subjects by selected year+semester
const filteredPlanSubjectsByTerm = computed(() => {
  return planSubjectsList.value.filter(ps => (ps.year || 1) === viewYear.value && (ps.semester || 1) === viewSemester.value)
})

const planSubjectModal = ref(false)
const filterCategoryId = ref(null)
const selectedSubjectsToAdd = ref([])
const savingPlanSubs = ref(false)

const filteredSubjectsForPlan = computed(() => {
  let list = subjects.value.map(s => {
    const formatLabel = formattedCategoryOptions.value.find(o => o.value === s.id_category)?.label
    const cName = formatLabel ? formatLabel.trim() : '-'
    return { ...s, categoryName: cName }
  })

  // Exclude subjects already in plan (any year/semester)
  const existingIds = planSubjectsList.value.map(ps => ps.id_subject_curr)
  list = list.filter(s => !existingIds.includes(s.id_subject_curr))

  if (filterCategoryId.value) {
    const getAllChildIds = (parentId, categoriesList) => {
      let ids = [parentId]
      const children = categoriesList.filter(c => c.parent_id === parentId)
      children.forEach(child => {
        ids = ids.concat(getAllChildIds(child.id_category, categoriesList))
      })
      return ids
    }
    const targetIds = getAllChildIds(filterCategoryId.value, allCategories.value)
    list = list.filter(s => targetIds.includes(s.id_category))
  }
  return list
})

const openAddPlanSubjectModal = () => {
  filterCategoryId.value = null
  selectedSubjectsToAdd.value = []
  planSubjectModal.value = true
}

const togglePlanSubjectSel = (id) => {
  if (selectedSubjectsToAdd.value.includes(id)) selectedSubjectsToAdd.value = selectedSubjectsToAdd.value.filter(i => i !== id)
  else selectedSubjectsToAdd.value.push(id)
}

const savePlanSubjects = async () => {
  savingPlanSubs.value = true
  try {
    for (const sid of selectedSubjectsToAdd.value) {
      await $fetch('/api/study-plan-subjects', {
        method: 'POST', body: {
          id_plan: selectedPlanId.value,
          id_subject_curr: sid,
          year: viewYear.value,
          semester: viewSemester.value
        }
      })
    }
    planSubjectModal.value = false
    refreshPlanSubs()
    toast.add({ title: 'สำเร็จ', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Error', description: e.message, color: 'error' })
  } finally {
    savingPlanSubs.value = false
  }
}

const removePlanSubject = async (psId) => {
  await $fetch(`/api/study-plan-subjects/${psId}`, { method: 'DELETE' })
  refreshPlanSubs()
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>
