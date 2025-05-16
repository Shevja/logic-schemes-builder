<script setup>
import { onMounted, onUpdated, ref } from 'vue';

const props = defineProps({
    node: {
        type: Object,
        default: () => ({
            id: 0,
            type: 'if',
            x: 0,
            y: 0,
            output: {
                x: 0,
                y: 45
            },
            input: {
                x: 200,
                y: 45
            },
        })
    },
})

const emit = defineEmits(['onStartMove', 'onMove', 'onEndMove', 'onStartDrawEdge', 'onDrawEdge', 'onEndDrawEdge'])

const nodeEl = ref(null);
const isInputHovered = ref(false);
const isOutputHovered = ref(false);

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

function starDrawLine(e) {
    const startPoint = e.target.getBoundingClientRect()

    drawLineFrom.x = startPoint.x + (startPoint.width / 2);
    drawLineFrom.y = startPoint.y + (startPoint.height / 2);

    emit('onStartDrawEdge', {
        fromNodeId: props.node.id,
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
            class="transition-colors fill-neutral-900 hover:fill-neutral-700 stroke-gray-600" rx="6" />

        <text x="10" y="25" class="fill-white">{{ node.type }}</text>
        <text :x="node.input.x+10" :y="node.input.y+4" class="fill-neutral-500 text-sm">input</text>
        <text :x="node.output.x-60" :y="node.output.y+4" class="fill-neutral-500 text-sm">output</text>

        <text x="8" y="140" class="fill-white text-xs">id:{{ node.id }}</text>

        <circle :r="isOutputHovered ? 9 : 6" :cx="node.output.x" :cy="node.output.y"
            class="fill-sky-700 transition-all hover:cursor-pointer" @mouseenter="isOutputHovered = true"
            @mouseleave="isOutputHovered = false" @mousedown.stop="starDrawLine">
        </circle>

        <circle :r="isInputHovered ? 9 : 6" :cx="node.input.x" :cy="node.input.y"
            class="fill-rose-700 transition-all hover:cursor-pointer" @mouseenter="isInputHovered = true"
            @mouseleave="isInputHovered = false" @mousedown.stop="">
        </circle>
    </g>
</template>