<template>
  <UButton
    icon="i-lucide-arrow-left"
    color="gray"
    variant="ghost"
    class="fixed top-20 left-4 z-50"
    :to="to"
    @click="onClick"
  />
</template>

<script setup>
const props = defineProps({
  to: {
    type: String,
    default: null
  }
})

const router = useRouter()

const onClick = () => {
  if (props.to) {
    router.push(props.to)
  } else {
    router.back()
  }
}
</script>
