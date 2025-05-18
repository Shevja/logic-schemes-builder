<script setup>
import { computed } from 'vue';

const props = defineProps({
    value: {
        type: String,
        default: '',
    },
    variant: {
        type: String,
        default: 'primary'
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const buttonClass = computed(() => {
    const defaultClass = ['flex', 'gap-4', 'items-center', 'py-1.5', 'px-5', 'transition-colors', 'disabled:cursor-default', 'hover:cursor-pointer', 'rounded'];
    let variantClass = []

    if (props.variant === 'primary') {
        variantClass = ['bg-neutral-900', 'hover:bg-zinc-700', 'active:bg-stone-950', 'disabled:bg-zinc-500']
    } else if (props.variant === 'secondary') {
        variantClass = ['bg-sky-800', 'hover:bg-sky-700', 'active:bg-sky-950', 'disabled:bg-sky-500']
    } else if (props.variant === 'danger') {
        variantClass = ['bg-red-800', 'hover:bg-red-700', 'active:bg-red-950', 'disabled:bg-red-500']
    } else if (props.variant === 'success') {
        variantClass = ['bg-green-800', 'hover:bg-green-700', 'active:bg-green-950', 'disabled:bg-green-500']
    }

    return [...defaultClass, ...variantClass]
})
</script>

<template>
    <button :class="buttonClass" :disabled="disabled">
        {{ value }}
    </button>
</template>