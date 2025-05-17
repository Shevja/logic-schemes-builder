<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
    info: {
        type: Object,
        default: () => { }
    }
})

const mouseX = ref(0);
const mouseY = ref(0);
let animationFrameId = null;

function updatePosition(e) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    animationFrameId = requestAnimationFrame(() => {
        mouseX.value = e.clientX + 19 + 'px';
        mouseY.value = e.clientY + 18 + 'px';
    });
}

onMounted(() => {
    document.addEventListener('mousemove', updatePosition)
})

onBeforeUnmount(() => {
    document.removeEventListener('mousemove', updatePosition)
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
})
</script>

<template>
    <div v-if="info"
        class="absolute bg-slate-950 text-white px-2 py-0.5 text-sm transition-[top,left] duration-75 ease-linear rounded-sm"
        :style="`top: ${mouseY}; left: ${mouseX};`">
        <ul>
            <li>id: {{ info.id }}</li>
            <li v-if="info.type">type: {{ info.type }}</li>
            <li v-if="info.hasOwnProperty('fromNodeId')">from: {{ info.fromNodeId }}</li>
            <li v-if="info.hasOwnProperty('toNodeId')">to: {{ info.toNodeId }}</li>
        </ul>
    </div>
</template>