<template>
    <div>
        <h1>show schedule</h1>
        <div class="flex border-2 border-amber-950 p-3 rounded-2xl w-1/3 mx-auto gap-3">
            <div v-if="pending">
                Loading...
            </div>
            <div v-else v-for="(schedule, index) in schedules" :key="index" class="bg-blue-300 p-3"
                @click="selectedSchedule = schedule">
                ตารางที่ {{ index + 1 }}
            </div>

            
        </div>
        <!-- แสดงรายละเอียด schedule -->
        <div v-if="arraySchedules.length" class="p-4">
            <div class="grid grid-cols-13 text-center">
                <div v-for="(time, i) in timeSlots" :key="i" class="border">
                    {{ time }}
                </div>
                <div v-for="value in 13" class="border p-4 bg-amber-200">
                    ชั่วโมงที่ {{ value }}
                </div>
            </div>
            <div v-for="(row, rowIndex) in arraySchedules" :key="rowIndex" class="grid grid-cols-13">
                <div v-for="(slot, slotIndex) in row" :key="slotIndex"
                    class="w-full h-20 border flex items-center justify-center p-1">
                    {{ slot.value }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const { data: schedules, pending } = await useFetch('/api/schedule')
const selectedSchedule = ref(null)
const arraySchedules = ref([])

// เมื่อเลือก schedule
watch(selectedSchedule, (newVal) => {
    if (newVal && newVal.schedule) {
        try {
            arraySchedules.value = JSON.parse(newVal.schedule)
            console.log('Parsed schedule:', arraySchedules.value)
        } catch (err) {
            console.error('Failed to parse schedule:', err)
        }
    }
})

const timeSlots = [
    '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
    '18:00-19:00', '19:00-20:00', '20:00-21:00'
]
</script>

<style scoped></style>