<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
    info: {
        type: Object,
        default: {
            type: '',
            text: ''
        }
    }
})

const notificationClass = computed(() => {
    const defaultClass = 'fixed top-0 left-[50%] -translate-x-[50%] rounded-b pt-2 px-3 py-1 text-white'
    let additionalClass = ''

    if (props.info.type === 'info') {
        additionalClass = 'bg-sky-950'
    } else if (props.info.type === 'error') {
        additionalClass = 'bg-red-950'
    } else if (props.info.type === 'warn') {
        additionalClass = 'bg-yellow-600'
    }

    return defaultClass + ' ' + additionalClass
})

</script>

<template>
    <div v-if="info" :class="notificationClass">
        {{ info.text }}
    </div>
</template>