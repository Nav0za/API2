<template>
    <div>
        <!-- // แสดงรายละเอียดอาจารย์ตาม id -->
        <h1 class="text-4xl">รายละเอียดอาจารย์</h1>
        <p class="text-2xl">ชื่ออาจารย์ : <b v-if="pending">กำลังโหลดข้อมูล</b><b v-else>{{ teacherName }}</b></p>
        <!-- แสดงรายวิชาที่สอนโดยอาจารย์ท่านนี้ -->
        <div class="border-1 rounded-2xl p-4 mt-6 shadow-lg max-w-lg">
            <div class="flex justify-between items-center mb-2">
                <h1 class="text-xl">รายวิชาที่สอน</h1>
                <UModal v-model:open="open" title="เพิ่มรายวิชา">
                    <UButton label="เพิ่มรายวิชา" />
                    <template #body>
                        <h3 class="text-xl">ชื่อวิชา</h3>
                        <UInput v-model="subjectName" />
                    </template>
                    <template #footer="{ close }">
                        <UButton label="ยกเลิก" color="error" @click="close" />
                        <UButton label="บันทึก" color="primary" @click="async () => {
                            // เพิ่มรายวิชาและ ปิด modal
                            await addSubject()
                            close()
                        }" />
                    </template>
                </UModal>
            </div>
            <hr>
            <div v-if="pending">Loading...</div>
            <div v-else v-for="subject in subjects">
                <div class="flex flex-row justify-between p-2 items-center bg-gray-200 my-1 rounded-lg">
                    <span>
                        {{ subject.name_subject }}
                    </span>
                    <UButton icon="i-lucide-trash" color="error" @click="deleteSubject(subject.id_subject)" />
                </div>
            </div>
        </div>
        <p>แสดงตารางสอน</p>
        <USelect placeholder="เลือกภาคการศึกษา" variant="" :items="['เทอม 1/68', 'เทอม 2/68']" class="w-1/4 my-4" />
        <!-- ตารางสอน -->
        <div class="grid grid-cols-14 mt-5 text-center m-3">
            <!-- แสดงเวลา -->
            <div
                class="flex-shrink-0 px-4 py-3 bg-slate-700 font-bold border-r border-slate-600 flex items-center justify-center text-white">
                วัน/เวลา</div>
            <div v-for="time in timeSlots" :key="time"
                class="flex-1 min-w-[80px] px-1 py-3 bg-slate-700 text-center border-r border-slate-600 last:border-r-0 text-white">
                {{ time }}
            </div>
            <!-- ลูปทุกวัน -->
            <template v-for="(day, index) in days" :key="index">
                <div class="border border-slate-600 p-1 text-center bg-slate-800 text-white flex items-center justify-center">{{ day }}</div>

                <!-- เช้า -->
                <div v-for="(slot, i) in scheduleSlots[index].slice(0, 4)" :key="`morning-${index}-${i}`"
                    class="border border-slate-600 text-center bg-slate-800">
                    <USelect placeholder="ว่าง" v-model="slot.value" :items="subjects" value-key="id_subject" label-key="name_subject" class="w-full h-full transition-colors flex items-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-slate-400 text-sm rounded-none text-white"/>
                </div>
                <!-- พักกลางวัน -->
                <div class="border border-slate-600 p-1 text-center bg-slate-800 text-white flex items-center justify-center">พักกลางวัน</div>

                <!-- บ่าย -->
                <div v-for="(slot, i) in scheduleSlots[index].slice(4)" :key="`afternoon-${index}-${i}`"
                    class="border text-center">
                    <USelect placeholder="ว่าง" v-model="slot.value" :items="subjects" value-key="id_subject" label-key="name_subject" class="w-full h-20 transition-colors flex items-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-slate-400 text-sm rounded-none"/>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
// ดึง id จากพารามิเตอร์
const route = useRoute()
const id = route.params.id
// get API
const { data: subjects } = await useFetch('/api/Subjects', {
    query: {
        id_teacher: id
    }
})
const { data: teachers, pending } = await useFetch('/api/teachers')

// ข้อมูลวันเวลา
const timeSlots = [
    '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
    '18:00-19:00', '19:00-20:00', '20:00-21:00'
]
const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

// หาอาจารย์ตาม id จากพารามิเตอร์q
const teacherName = teachers.value.find(t => t.id_teacher == id)?.name || 'ไม่พบชื่ออาจารย์'
// โมดัลเพิ่มรายวิชา
const open = ref(false)
// function  เพิ่มวิชา
const subjectName = ref('')
const addSubject = async () => {
    if (!subjectName.value.trim()) return

    try {
        const newSubject = await $fetch('/api/Subjects', {
            method: 'POST',
            body: {
                name_subject: subjectName.value,
                id_teacher: id
            }
        })

        subjectName.value = ''
        subjects.value = [...(subjects.value || []), newSubject]
    } catch (err) {
        console.log(err)
    }
}
// function ลบรายวิชา
const deleteSubject = async (id) => {
    try {
        await $fetch(`/api/Subjects/${id}`, {
            method: 'DELETE'
        })
        // ลบข้อมูลในตัวแปร subjects
        subjects.value = subjects.value.filter(subject => subject.id_subject !== id)
        // ลบข้อมูลในตารางสอน
        scheduleSlots.value.forEach(day => {
            day.forEach(slot => {
                if (slot.value === id) {
                    slot.value = null
                }
            })
        })
    } catch (err) {
        console.log(err)
    }
}
// ข้อมูลในตารางแบบ array 2d
const scheduleSlots = ref(Array.from({ length: 7 }, () =>
    Array.from({ length: 12 }, () => ({ value: null }))
))


</script>
