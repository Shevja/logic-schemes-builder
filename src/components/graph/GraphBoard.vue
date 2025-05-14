<script setup>
import { computed, ref } from "vue";
import GraphTools from "./tools/GraphTools.vue";
import GraphNode from "./GraphNode.vue";
import GraphEdge from "./GraphEdge.vue";
const root = ref(null);

const defaultNode = {
    width: 200,
    height: 150,
    output: {
        x: 200,
        y: 45
    },
    input: {
        x: 0,
        y: 45
    }
}

const nodeList = ref([
    // моковые
    {
        id: 0,
        x: 0,
        y: 0,
        ...defaultNode
    },
]);

const edgeList = ref([])

const nodeIdCounter = ref(1);
const edgeIdCounter = ref(0);

const hoveredNode = ref(null)
const currentDrawingEdge = ref(null)
const disableSelect = ref(null)

const svgRootClass = computed(() => {
    return [
        'w-screen',
        'h-screen',
        'bg-zinc-700',
        disableSelect.value ? 'select-none' : ''
    ]
})

// моковые
function createNode() {
    nodeList.value.push({
        id: nodeIdCounter.value++,
        x: document.body.clientWidth / 2,
        y: document.body.clientHeight / 2,
        ...defaultNode
    })
}

// DnD, перетаскивание
function startMoveNodeHandler() {
    disableSelect.value = true;
}

function moveNodeHandler({ id, x, y }) {
    const node = nodeList.value.find(node => node.id === id);
    const outputEdges = edgeList.value.filter(edge => edge.fromNodeId === id)
    const inputEdges = edgeList.value.filter(edge => edge.toNodeId === id)

    if (node) {
        node.x = x;
        node.y = y;

        outputEdges.forEach(edge => {
            edge.fromX = x + node.output.x;
            edge.fromY = y + node.output.y;
        })
        inputEdges.forEach(edge => {
            edge.toX = x + node.input.x;
            edge.toY = y + node.input.y;
        })
    }
}

function endMoveNodeHandler() {
    disableSelect.value = false;
}

// Создание ребра
function drawEdgeHandler({ fromNodeId, toX, toY }) {
    disableSelect.value = true;

    if (currentDrawingEdge.value) {
        currentDrawingEdge.value.toX = toX;
        currentDrawingEdge.value.toY = toY;
    }
}

function startDrawEdgeHandler({ fromNodeId, fromX, fromY, toX, toY }) {
    const newEdge = {
        id: edgeIdCounter.value++,
        fromNodeId: fromNodeId,
        toNodeId: null,
        fromX: fromX,
        fromY: fromY,
        toX: toX,
        toY: toY,
    }

    // Создаем ребро для отображения пользователю
    edgeList.value.push(newEdge)

    currentDrawingEdge.value = newEdge
}

function endDrawEdgeHandler({ fromNodeId, toX, toY }) {
    if (!currentDrawingEdge.value) return

    const sameNodeEdges = edgeList.value.filter(edge => edge.fromNodeId === fromNodeId && edge.id !== currentDrawingEdge.value.id);
    const alreadyAttached = sameNodeEdges.some(sameNodeEdge => sameNodeEdge.toNodeId === currentDrawingEdge.value.toNodeId)

    // Если в момент отпускания кнопки мыши под ней есть какой-то узел,
    // то прикрепляем ребро к нему, иначе удаляем 
    if (hoveredNode.value && hoveredNode.value.id !== fromNodeId && !alreadyAttached) {
        // Прикрепляем ребро
        currentDrawingEdge.value.toNodeId = hoveredNode.value.id
        currentDrawingEdge.value.toX = hoveredNode.value.x + hoveredNode.value.input.x
        currentDrawingEdge.value.toY = hoveredNode.value.y + hoveredNode.value.input.y
    } else {
        // удаляем ребро
        edgeList.value = edgeList.value.filter(edge => edge.id !== currentDrawingEdge.value.id)
        edgeIdCounter.value--
    }
}

// 
function handleMouseMove(e) {
    const { clientX, clientY } = e;

    const node = nodeList.value.find(node => {
        if (
            clientX >= node.x &&
            clientY >= node.y &&
            clientX <= node.x + node.width &&
            clientY <= node.y + node.height
        ) {
            return true
        }
    })

    hoveredNode.value = node || null;
}
</script>

<template>
    <svg ref="root" :class="svgRootClass" @mousemove="handleMouseMove">
        <GraphEdge v-for="edge in edgeList" :key="edge.id" :edge="edge" />

        <GraphNode v-for="node in nodeList" :key="node.id" :node="node" @onStartMove="startMoveNodeHandler"
            @onMove="moveNodeHandler" @onEndMove="endMoveNodeHandler" @onStartDrawEdge="startDrawEdgeHandler"
            @onDrawEdge="drawEdgeHandler" @onEndDrawEdge="endDrawEdgeHandler" />
    </svg>

    <GraphTools @onCreate="createNode" />
</template>