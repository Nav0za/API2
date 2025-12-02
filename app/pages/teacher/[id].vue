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
                    <UButton
                        label="เพิ่มรายวิชา"
                    />
                    <template #body>
                        <h3 class="text-xl">ชื่อวิชา</h3>
                        <UInput />
                    </template>
                    <template #footer="{ close }">
                        <UButton label="ยกเลิก" color="error" @click="close" />
                        <UButton label="บันทึก" color="primary" />
                    </template>
                </UModal>
            </div>
            <hr>

        </div>
    </div>
</template>

<script setup>
const route = useRoute()
const id = route.params.id
const {data: subjects} = await useFetch('/api/Subjects')
const { data: teachers, pending } = await useFetch('/api/teachers')
// หาอาจารย์ตาม id จากพารามิเตอร์q
const teacherName = teachers.value.find(t => t.id_teacher == id)?.name || 'ไม่พบชื่ออาจารย์'
// โมดัลเพิ่มรายวิชา
const open = ref(false)
</script>
