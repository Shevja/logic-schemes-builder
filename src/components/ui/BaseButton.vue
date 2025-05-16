<script setup>
const props = defineProps({
    value: {
        type: String,
        default: '',
    },
})
</script>

<template>
    <button
        class="flex gap-4 items-center py-1.5 px-5 transition-colors bg-neutral-900 hover:bg-zinc-700 hover:cursor-pointer active:bg-stone-950">
        {{ value }}
    </button>
</template>