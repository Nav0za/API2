<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { today, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

// Date picker
const inputDate = useTemplateRef('inputDate')

// วันที่เริ่มต้น - สิ้นสุด
const modelValue = shallowRef<{ start: DateValue, end: DateValue }>({
  start: today(getLocalTimeZone()),
  end: today(getLocalTimeZone()).add({ days: 90 })
})

// Form state
interface FormState {
  term: number | undefined
  academic_year: number | undefined
  start_date: DateValue | undefined
  end_date: DateValue | undefined
}

const state = reactive<FormState>({
  term: undefined,
  academic_year: undefined,
  start_date: modelValue.value.start,
  end_date: modelValue.value.end
})

watch(modelValue, (val) => {
  state.start_date = val.start
  state.end_date = val.end
}, { deep: true })

// ตรวจสอบความถูกต้องของฟอร์ม
function validate(stateToValidate: Partial<FormState>): FormError[] {
  const errors: FormError[] = []

  if (!stateToValidate.term) {
    errors.push({ name: 'term', message: 'กรุณาระบุเทอม' })
  } else if (stateToValidate.term < 1 || stateToValidate.term > 3) {
    errors.push({ name: 'term', message: 'เทอมต้องอยู่ระหว่าง 1-3' })
  }

  if (!stateToValidate.academic_year) {
    errors.push({ name: 'academic_year', message: 'กรุณาระบุปีการศึกษา' })
  } else {
    const yearLength = String(stateToValidate.academic_year).length
    if (yearLength !== 2 && yearLength !== 4) {
      errors.push({ name: 'academic_year', message: 'ปีการศึกษาต้องเป็น 2 หรือ 4 หลัก' })
    }
  }

  if (!stateToValidate.start_date) {
    errors.push({ name: 'start_date', message: 'กรุณาเลือกวันที่เริ่มต้น' })
  }

  if (!stateToValidate.end_date) {
    errors.push({ name: 'end_date', message: 'กรุณาเลือกวันที่สิ้นสุด' })
  }

  // เช็ควันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น
  if (stateToValidate.start_date && stateToValidate.end_date) {
    if (stateToValidate.end_date.compare(stateToValidate.start_date) <= 0) {
      errors.push({ name: 'end_date', message: 'วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น' })
    }
  }

  return errors
}

// แปลง CalendarDate เป็น ISO string (YYYY-MM-DD)
function formatDateToISO(calendarDate: DateValue | undefined | { year: number, month: number, day: number }): string {
  if (!calendarDate) {
    return ''
  }
  const year = calendarDate.year
  const month = String(calendarDate.month).padStart(2, '0')
  const day = String(calendarDate.day).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// เพิ่มเทอม
const emit = defineEmits<{
  addedTerm: [term: unknown]
}>()

const isSubmitting = ref(false)

async function addTerm(
  term: number,
  academicYear: number,
  startDate: string,
  endDate: string
) {
  const newTerm = await $fetch('/api/terms', {
    method: 'POST',
    body: {
      term,
      academic_year: academicYear,
      start_date: startDate,
      end_date: endDate
    }
  })

  if (newTerm) {
    emit('addedTerm', newTerm)
  }

  return newTerm
}

// การแจ้งเตือน
const toast = useToast()

async function onSubmit(_event: FormSubmitEvent<FormState>) {
  if (isSubmitting.value) {
    return
  }

  if (
    state.term === undefined
    || state.academic_year === undefined
    || !state.start_date
    || !state.end_date
  ) {
    toast.add({
      title: 'ข้อมูลไม่ครบถ้วน',
      description: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
      color: 'error'
    })
    return
  }

  isSubmitting.value = true

  try {
    // แปลง CalendarDate เป็น ISO string
    const startDateISO = formatDateToISO(state.start_date)
    const endDateISO = formatDateToISO(state.end_date)

    await addTerm(
      state.term,
      state.academic_year,
      startDateISO,
      endDateISO
    )

    toast.add({
      title: 'สำเร็จ',
      description: `เพิ่มเทอม ${state.term}/${state.academic_year} เรียบร้อยแล้ว`,
      color: 'primary'
    })

    // รีเซ็ตฟอร์ม
    state.term = undefined
    state.academic_year = undefined
    modelValue.value = {
      start: today(getLocalTimeZone()),
      end: today(getLocalTimeZone()).add({ days: 90 })
    }
  } catch (error) {
    console.error('Error adding term:', error)

    let errorMessage = 'ไม่สามารถเพิ่มเทอมได้'

    if (error && typeof error === 'object') {
      // Handle Nuxt $fetch error
      // @ts-ignore
      if (error.response) {
        // @ts-ignore
        const { status, _data } = error.response
        if (status === 400 || status === 409) {
          errorMessage = _data?.statusMessage || _data?.message || 'ข้อมูลไม่ถูกต้อง'
        }
      }
      // Handle standard error object with statusCode
      // @ts-ignore
      else if ('statusCode' in error) {
        // @ts-ignore
        errorMessage = error.statusMessage || error.message || errorMessage
      }
    }

    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: errorMessage,
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

function clearForm() {
  state.term = undefined
  state.academic_year = undefined
  modelValue.value = {
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ days: 90 })
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
    <div class="grid grid-cols-2 gap-4">
      <!-- เทอมการศึกษา -->
      <UFormField
        label="เทอมที่"
        name="term"
        required
      >
        <UInput
          v-model.number="state.term"
          type="number"
          min="1"
          max="3"
          placeholder="1, 2, หรือ 3"
          :disabled="isSubmitting"
        />
      </UFormField>

      <!-- ปีการศึกษา -->
      <UFormField
        label="ปีการศึกษา"
        name="academic_year"
        required
      >
        <UInput
          v-model.number="state.academic_year"
          type="number"
          placeholder="68 หรือ 2568"
          :disabled="isSubmitting"
        />
      </UFormField>
    </div>

    <!-- วันที่เริ่มต้น - สิ้นสุด -->
    <UFormField
      label="วันที่เริ่มต้น - สิ้นสุดเทอม"
      name="start_date"
      required
    >
      <UInputDate
        ref="inputDate"
        v-model="modelValue"
        range
        :disabled="isSubmitting"
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
              :disabled="isSubmitting"
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

    <!-- แสดงข้อมูลที่จะบันทึก -->
    <div
      v-if="state.term && state.academic_year"
      class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm"
    >
      <p class="font-medium text-blue-900 mb-1">
        ข้อมูลที่จะบันทึก:
      </p>
      <p class="text-blue-700">
        เทอม {{ state.term }}/{{ state.academic_year }}
      </p>
      <p class="text-blue-600 text-xs mt-1">
        {{ formatDateToISO(state.start_date) }} ถึง {{ formatDateToISO(state.end_date) }}
      </p>
    </div>

    <div class="flex gap-2">
      <UButton
        label="เพิ่มเทอม"
        type="submit"
        color="primary"
        icon="i-lucide-plus"
        :loading="isSubmitting"
        :disabled="!state.term || !state.academic_year"
      />

      <UButton
        v-if="state.term || state.academic_year"
        label="ล้างฟอร์ม"
        type="button"
        color="neutral"
        variant="outline"
        icon="i-lucide-x"
        :disabled="isSubmitting"
        @click="clearForm"
      />
    </div>
  </UForm>
</template>
