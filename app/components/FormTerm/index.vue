<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { CalendarDate } from '@internationalized/date'

// Date picker
const inputDate = useTemplateRef('inputDate')

const modelValue = shallowRef({
  start: new CalendarDate(2022, 1, 10),
  end: new CalendarDate(2022, 1, 20)
})

// Form
const state = reactive({
  term: undefined,
  academicYear: undefined,
  startDate: modelValue.value.start,
  endDate: modelValue.value.end
})

type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.term) errors.push({ name: 'term', message: 'ต้องกรอก' })
  if (!state.academicYear) errors.push({ name: 'academicYear', message: 'ต้องกรอก' })
  if (!state.startDate) errors.push({ name: 'startDate', message: 'ต้องกรอก' })
  if (!state.endDate) errors.push({ name: 'endDate', message: 'ต้องกรอก' })
  return errors
}

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({ title: 'สำเร็จ', description: 'เพิ่มเทอมเรียบร้อยแล้ว', color: 'success' })
  console.log(event.data)
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
        v-model="state.academicYear"
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
  </UForm>
</template>
