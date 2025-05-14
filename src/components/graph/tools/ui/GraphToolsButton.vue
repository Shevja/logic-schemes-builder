<script setup>
const props = defineProps({
    value: {
        type: String,
        default: '',
    }
})
</script>

<template>
    <button class="flex gap-4 items-center py-1.5 px-4 transition-colors hover:bg-slate-700 hover:cursor-pointer active:bg-slate-900">
        {{ value }}
    </button>
</template>