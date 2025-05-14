<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    edge: {
        type: Object,
        required: true,
    }
})

const edgeHovered = ref(null);

function getEdgePath(edge) {
    const dx = edge.toX - edge.fromX;
    const curve = Math.min(Math.abs(dx) * 0.5, 100); // плавность изгиба

    const controlX1 = edge.fromX + curve;
    const controlY1 = edge.fromY;

    const controlX2 = edge.toX - curve;
    const controlY2 = edge.toY;

    return `M ${edge.fromX} ${edge.fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${edge.toX} ${edge.toY}`;
}
</script>

<template>
    <g>
        <path :d="getEdgePath(edge)" :class="['transition-colors', edgeHovered ? 'stroke-sky-400' : 'stroke-sky-700']"
            stroke-width="2" fill="none" />

        <path :d="getEdgePath(edge)" stroke="transparent" stroke-width="15" fill="none" @mouseover="edgeHovered = true"
            @mouseleave="edgeHovered = false" />
    </g>
</template>