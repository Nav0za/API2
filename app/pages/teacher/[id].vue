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
        <!-- ตารางสอน -->
        <div class="grid grid-cols-14 mt-5 text-center m-3">
            <!-- แสดงเวลา -->
            <div class="flex-shrink-0 px-4 py-3 bg-slate-700 font-bold border-r border-slate-600 flex items-center justify-center text-white">วัน/เวลา</div>
            <div v-for="time in timeSlots" class="flex-1 min-w-[80px] px-1 py-3 bg-slate-700 text-center border-r border-slate-600 last:border-r-0 text-white">
                {{ time }}
            </div>

            <!-- วันจันทร์ -->
            <div class="border p-1 text-center">จันทร์</div>
            <div v-for="slot in scheduleSlots[0].slice(0, 4)" class="border p-1 text-center">
                <span v-if="slot.value === ''">ว่าง</span>
                <span v-else>{{ slot }}</span>
            </div>
            <div class="border p-1 text-center">พักกลางวัน</div>
            <div v-for="slot in scheduleSlots[0].slice(4)" class="border p-1 text-center">
                <span v-if="slot.value === ''">ว่าง</span>
                <span v-else>{{ slot }}</span>
            </div>

            <!-- วันอังคาร -->
            <div class="border p-1 text-center">อังคาร</div>
            <div v-for="slot in scheduleSlots[1].slice(0, 4)" class="border p-1 text-center">
                <span v-if="slot.value === ''">ว่าง</span>
                <span v-else>{{ slot }}</span>
            </div>
            <div class="border p-1 text-center">พักกลางวัน</div>
            <div v-for="slot in scheduleSlots[1].slice(4)" class="border p-1 text-center">
                <span v-if="slot.value === ''">ว่าง</span>
                <span v-else>{{ slot }}</span>
            </div>

            <!-- วันพุธ -->
            <div class="border p-1 text-center">พุธ</div>
            <div v-for="slot in scheduleSlots[2].slice(0, 4)" class="border p-1 text-center">
                <span v-if="slot.value === ''">ว่าง</span>
                <span v-else>{{ slot }}</span>
            </div>
            <div class="border p-1 text-center">พักกลางวัน</div>
            <div v-for="slot in scheduleSlots[2].slice(4)" class="border p-1 text-center">
                <span v-if="slot.value === ''">ว่าง</span>
                <span v-else>{{ slot }}</span>
            </div>

            <!-- วันพฤหัสบดี -->
            <div class="border p-1 text-center">พฤหัสบดี</div>
            <div v-for="slot in scheduleSlots[3].slice(0, 4)" class="border p-1 text-center">
                <span v-if="slot.value === ''">ว่าง</span>
                <span v-else>{{ slot }}</span>
            </div>
            <div class="border p-1 text-center">พักกลางวัน</div>
            <div v-for="slot in scheduleSlots[3].slice(4)" class="border p-1 text-center">
                <span v-if="slot.value === ''">ว่าง</span>
                <span v-else>{{ slot }}</span>
            </div>

            <!-- วันศุกร์ -->
            <div class="border p-1 text-center">ศุกร์</div>
            <div v-for="slot in scheduleSlots[4].slice(0, 4)" class="border p-1 text-center">
                <span v-if="slot.value === ''">ว่าง</span>
                <span v-else>{{ slot }}</span>
            </div>
            <div class="border p-1 text-center">พักกลางวัน</div>
            <div v-for="slot in scheduleSlots[4].slice(4)" class="border p-1 text-center">
                <span v-if="slot.value === ''">ว่าง</span>
                <span v-else>{{ slot }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
// ดึง id จากพารามิเตอร์
const route = useRoute()
const id = route.params.id
// get API
const { data: subjects } = await useFetch('/api/Subjects')
const { data: teachers, pending } = await useFetch('/api/teachers')

const timeSlots = [
    '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
    '18:00-19:00', '19:00-20:00', '20:00-21:00'
]

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
        subjects.value.push(newSubject)
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
        subjects.value = subjects.value.filter(subject => subject.id_subject !== id)
    } catch (err) {
        console.log(err)
    }
}
// ข้อมูลในตารางแบบ array 2d
const scheduleSlots = Array.from({ length: 5 }, () =>
  Array.from({ length: 12 }, () => ({ value: "" }))
);

</script>
