<script setup>
import { onMounted, onUpdated, ref, computed } from 'vue';

const props = defineProps({
    node: {
        type: Object,
        default: () => ({
            is: 'start',
            x: 0,
            y: 0,
            output: {
                x: 0,
                y: 45
            },
        })
    },
    active: {
        type: Boolean,
        default: false,
    }
})

const emit = defineEmits(['onStartMove', 'onMove', 'onEndMove', 'onStartDrawEdge', 'onDrawEdge', 'onEndDrawEdge'])

const nodeEl = ref(null);
const isOutputHovered = ref(false);
const hoveredPointType = ref(null);

const dragMouseOffset = {
    x: 0,
    y: 0
};
const drawLineFrom = {
    x: 0,
    y: 0
}

function startDrag(e) {
    dragMouseOffset.x = e.clientX - props.node.x;
    dragMouseOffset.y = e.clientY - props.node.y;

    emit('onStartMove')

    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', drop);
}

function drag(e) {
    emit('onMove', {
        id: props.node.id,
        x: e.clientX - dragMouseOffset.x,
        y: e.clientY - dragMouseOffset.y,
    })
}

function drop() {
    emit('onEndMove')
    window.removeEventListener('mousemove', drag);
}

function startDrawLine(e) {
    const startPoint = e.target.getBoundingClientRect()

    drawLineFrom.x = startPoint.x + (startPoint.width / 2);
    drawLineFrom.y = startPoint.y + (startPoint.height / 2);

    emit('onStartDrawEdge', {
        fromNodeId: props.node.id,
        fromPointType: hoveredPointType.value,
        fromX: drawLineFrom.x,
        fromY: drawLineFrom.y,
        toX: e.clientX,
        toY: e.clientY
    })

    window.addEventListener('mousemove', drawLine)
    window.addEventListener('mouseup', endDrawLine)
}

function drawLine(e) {
    emit('onDrawEdge', {
        fromNodeId: props.node.id,
        toX: e.clientX,
        toY: e.clientY,
    })
}

function endDrawLine(e) {
    window.removeEventListener('mousemove', drawLine);
    window.removeEventListener('mouseup', endDrawLine)

    emit('onEndDrawEdge', {
        fromNodeId: props.node.id,
        toX: e.clientX,
        toY: e.clientY,
    })
}

</script>

<template>
    <g ref="nodeEl" :transform="`translate(${node.x}, ${node.y})`" class="active:cursor-grab" @mousedown="startDrag">

        <rect :width="node.width" :height="node.height"
            :class="['transition-[fill,stroke]', 'fill-neutral-900', 'hover:fill-neutral-700', 'stroke-2', active ? 'stroke-white' : 'stroke-white/20']"
            rx="6" />

        <text x="10" y="25" class="fill-white">Начало</text>

        <!-- Точки вывода -->
        <g data-node-connect-point="output" :transform="`translate(${node.output.x}, ${node.output.y})`"
            @mouseover="hoveredPointType = 'output'" @mouseleave="hoveredPointType = null">
            <rect x="-75" y="-45" width="75" height="75" class="fill-transparent" />

            <rect :x="hoveredPointType === 'output' ? -10 : -5" y="-15" :width="hoveredPointType === 'output' ? 10 : 5"
                height="30" rx="2" class="fill-green-600 transition-all hover:cursor-pointer"
                @mouseenter="isOutputHovered = true" @mouseleave="isOutputHovered = false"
                @mousedown.stop="startDrawLine">
            </rect>

            <text x="-60" y="4" :class="[node.connected.output ? 'fill-white' : 'fill-neutral-500', 'text-sm']">
                output
            </text>
        </g>
    </g>
</template>