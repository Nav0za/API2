<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { CalendarDate } from '@internationalized/date'

// Date picker
const inputDate = useTemplateRef('inputDate')

// Model value for date range
const modelValue = ref({
  start: new CalendarDate(2022, 1, 10),
  end: new CalendarDate(2022, 1, 20)
})

// Form
const state = reactive({
  term: null,
  academic_year: null,
  start_date: modelValue.value.start,
  end_date: modelValue.value.end
})

watch(modelValue, (val) => {
  state.start_date = val.start
  state.end_date = val.end
}, { deep: true })

type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.term) errors.push({ name: 'term', message: 'ต้องกรอก' })
  if (!state.academic_year) errors.push({ name: 'academicYear', message: 'ต้องกรอก' })
  if (!state.start_date) errors.push({ name: 'startDate', message: 'ต้องกรอก' })
  if (!state.end_date) errors.push({ name: 'endDate', message: 'ต้องกรอก' })
  return errors
}

// เพิ่มเทอม
const addTerm = async (
  term: number,
  academic_year: number,
  start_date: string,
  end_date: string
) => {
  try {
    const result = await $fetch('/api/terms', {
      method: 'POST',
      body: {
        term: term,
        academic_year: academic_year,
        start_date: start_date,
        end_date: end_date
      }
    })
    console.log(result)
  } catch (err) {
    return err
  }
}

const toast = useToast()
async function onSubmit(_event: FormSubmitEvent<Schema>) {
  // ดัก error
  try {
    await addTerm(
      state.term,
      state.academic_year,
      state.start_date.toString(),
      state.end_date.toString()
    )

    toast.add({ title: 'สำเร็จ', description: 'เพิ่มเทอมเรียบร้อยแล้ว', color: 'success' })
    console.log(state)
    console.log(modelValue.value)
  } catch (err: any) {
    toast.add({ title: 'ล้มเหลว', description: 'ไม่สามารถเพิ่มเทอมได้', color: 'error' })
  }
}
</script>

<template>
  <UForm
    :validate="validate"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <!-- เทอมการศึกษา -->
    <UFormField
      label="เทอมที่ (1, 2, 3)"
      name="term"
    >
      <UInput
        v-model="state.term"
        placeholder="1"
      />
    </UFormField>

    <!-- ปีการศึกษา -->
    <UFormField
      label="ปีการศึกษา"
      name="academicYear"
    >
      <UInput
        v-model="state.academic_year"
        min="4"
        max="4"
        placeholder="2566"
      />
    </UFormField>

    <!-- วันที่เริ่มต้น - สิ้นสุด -->
    <UFormField
      label="วันที่เริ่มต้น - สิ้นสุดเทอม"
      name="startDate"
    >
      <UInputDate
        ref="inputDate"
        v-model="modelValue"
        range
      >
        <template #trailing>
          <UPopover :reference="inputDate?.inputsRef[0]?.$el">
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-calendar"
              aria-label="Select a date range"
              class="px-0"
            />

            <template #content>
              <UCalendar
                v-model="modelValue"
                class="p-2"
                :number-of-months="2"
                range
              />
            </template>
          </UPopover>
        </template>
      </UInputDate>
    </UFormField>
    <UButton
      label="เพิ่ม"
      type="submit"
    />
    <hr>
  </UForm>
</template>
