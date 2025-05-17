<script setup>
import { onMounted, onUpdated, ref, computed } from 'vue';

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
            class="transition-colors fill-neutral-900 hover:fill-neutral-700 stroke-gray-600" rx="6" />

        <text x="10" y="25" class="fill-white">{{ node.type }}</text>

        <text x="8" y="140" class="fill-white text-xs">id:{{ node.id }}</text>

        <!-- Точки вывода -->

        <!-- Блок if -->
        <template v-if="node.type === 'if' || node.type === 'elseif'">
            <g data-node-connect-point="output" :transform="`translate(${node.output.x}, ${node.output.y})`"
                @mouseover="hoveredPointType = 'output'" @mouseleave="hoveredPointType = null">
                <rect x="-75" y="-45" width="75" height="75" class="fill-transparent" />

                <rect :x="hoveredPointType === 'output' ? -10 : -5" y="-15"
                    :width="hoveredPointType === 'output' ? 10 : 5" height="30" rx="2"
                    class="fill-green-600 transition-all hover:cursor-pointer" @mouseenter="isOutputHovered = true"
                    @mouseleave="isOutputHovered = false" @mousedown.stop="startDrawLine">
                </rect>
                <text v-if="node.output.connected" x="-45" y="4" class="fill-white text-sm">
                    true
                </text>
                <text v-else x="-45" y="4" class="fill-neutral-500 text-sm">
                    true
                </text>
            </g>
            <g data-node-connect-point="outputSecondary"
                :transform="`translate(${node.outputSecondary.x}, ${node.outputSecondary.y})`"
                @mouseover="hoveredPointType = 'outputSecondary'" @mouseleave="hoveredPointType = null">
                <rect x="-75" y="-20" width="75" height="75" class="fill-transparent" />

                <rect :x="hoveredPointType === 'outputSecondary' ? -10 : -5" y="-15"
                    :width="hoveredPointType === 'outputSecondary' ? 10 : 5" height="30" rx="2"
                    class="fill-red-500 transition-all hover:cursor-pointer" @mouseenter="isOutputHovered = true"
                    @mouseleave="isOutputHovered = false" @mousedown.stop="startDrawLine">
                </rect>
                <text x="-54" y="3" class="fill-neutral-500 text-sm">
                    false
                </text>
            </g>
        </template>

        <g v-else data-node-connect-point="output" :transform="`translate(${node.output.x}, ${node.output.y})`"
            @mouseover="hoveredPointType = 'output'" @mouseleave="hoveredPointType = null">
            <rect x="-75" y="-45" width="75" height="75" class="fill-transparent" />

            <rect :x="hoveredPointType === 'output' ? -10 : -5" y="-15" :width="hoveredPointType === 'output' ? 10 : 5"
                height="30" rx="2" class="fill-green-600 transition-all hover:cursor-pointer"
                @mouseenter="isOutputHovered = true" @mouseleave="isOutputHovered = false"
                @mousedown.stop="startDrawLine">
            </rect>

            <text x="-60" y="4" class="fill-neutral-500 text-sm">
                output
            </text>
        </g>

        <!-- Точки ввода -->

        <!-- Блок and, or -->
        <template v-if="node.type === 'and' || node.type === 'or'">
            <g data-node-connect-point="input" :transform="`translate(${node.input.x}, ${node.input.y})`"
                @mouseover="hoveredPointType = 'input'" @mouseleave="hoveredPointType = null">

                <rect x="0" y="-45" width="75" height="75" class="fill-transparent" />

                <rect x="0" y="-12.5" width="5" height="25" rx="2"
                    class="fill-sky-700 transition-all hover:cursor-pointer" @mouseenter="isInputHovered = true"
                    @mouseleave="isInputHovered = false" @mousedown.stop="">
                </rect>
                <text :x="10" :y="4" class="fill-neutral-500 text-sm">value</text>
            </g>
            <g data-node-connect-point="variant" :transform="`translate(${node.variant.x}, ${node.variant.y})`"
                @mouseover="hoveredPointType = 'variant'" @mouseleave="hoveredPointType = null">

                <rect x="0" y="-20" width="75" height="75" class="fill-transparent" />

                <rect x="0" y="-12.5" width="5" height="25" rx="2"
                    class="fill-sky-700 transition-all hover:cursor-pointer" @mouseenter="isInputHovered = true"
                    @mouseleave="isInputHovered = false" @mousedown.stop="">
                </rect>
                <text :x="10" :y="4" class="fill-neutral-500 text-sm">variant</text>
            </g>
        </template>

        <g v-else data-node-connect-point="input" :transform="`translate(${node.input.x}, ${node.input.y})`"
            @mouseover="hoveredPointType = 'input'" @mouseleave="hoveredPointType = null">

            <rect x="0" y="-45" width="75" height="75" class="fill-transparent" />

            <rect x="0" y="-15" width="5" height="30" rx="2" class="fill-sky-700 transition-all hover:cursor-pointer"
                @mouseenter="isInputHovered = true" @mouseleave="isInputHovered = false" @mousedown.stop="">
            </rect>
            <text v-if="node.input.connected" :x="10" :y="4" class="fill-neutral-500 text-sm">input</text>
        </g>
    </g>
</template>

<style lang="scss" scoped>
.highlight {
    & text {
        fill: white;
    }
}
</style>