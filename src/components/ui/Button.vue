<script setup>
const props = defineProps({
    value: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <button class="">{{ value }}</button>
</template>