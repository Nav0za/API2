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
      end: today(getLocalTimeZone()).add({ days: 120 }) // ปรับเป็นประมาณ 4 เดือน
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
      label="ช่วงวันเรียน (เริ่มต้น - สิ้นสุด)"
      name="start_date"
      required
      help="กำหนดวันแรกและวันสุดท้ายของเทอมเพื่อใช้คำนวณวันหยุด"
    >
      <UInputDate
        ref="inputDate"
        v-model="modelValue"
        range
        :disabled="isSubmitting"
        class="rounded-xl overflow-hidden shadow-inner"
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

    <div
      v-if="state.term || state.academic_year"
      class="p-4 bg-slate-800 border border-slate-700 rounded-2xl relative overflow-hidden group/preview shadow-inner"
    >
      <div class="absolute inset-0 bg-blue-500/10 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-500"></div>
      <div class="relative z-10">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">แสดงตัวอย่าง (Preview)</p>
        <div class="space-y-1">
          <p class="text-xl font-black text-amber-400">
            <span v-if="state.term" class="text-white">เทอม {{ state.term }}</span>
            <span v-if="state.term && state.academic_year" class="text-slate-500"> / </span>
            <span v-if="state.academic_year">{{ state.academic_year }}</span>
            <span v-if="!state.term && !state.academic_year" class="text-slate-500 font-normal italic text-sm">รอกรอกข้อมูล...</span>
          </p>
          <div class="flex items-center gap-2 text-xs font-medium text-slate-300">
            <UIcon name="i-heroicons-calendar-days" class="text-slate-400" />
            {{ formatDateToISO(state.start_date) }} <UIcon name="i-heroicons-arrow-right" class="text-slate-500" /> {{ formatDateToISO(state.end_date) }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-3 pt-4">
      <UButton
        label="สร้างเทอมการศึกษาใหม่"
        type="submit"
        color="primary"
        size="xl"
        block
        icon="i-heroicons-rocket-launch"
        class="rounded-2xl py-4 shadow-lg shadow-blue-500/20 font-bold"
        :loading="isSubmitting"
        :disabled="!state.term || !state.academic_year"
      />

      <UButton
        v-if="state.term || state.academic_year"
        label="รีเซ็ตฟอร์ม"
        type="button"
        color="neutral"
        variant="ghost"
        block
        size="sm"
        class="rounded-xl text-slate-500 hover:text-white"
        :disabled="isSubmitting"
        @click="clearForm"
      />
    </div>
  </UForm>
</template>
