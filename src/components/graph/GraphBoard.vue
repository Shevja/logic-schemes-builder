<script setup>
import { computed, ref } from "vue";
import GraphTools from "./tools/GraphTools.vue";
import GraphNode from "./GraphNode.vue";
import GraphEdge from "./GraphEdge.vue";
import GraphMouseHint from "./tools/GraphMouseHint.vue";
import GraphHint from "./tools/GraphHint.vue";

const rootSvg = ref(null);

const defaultNode = {
    width: 200,
    height: 150,
    output: {
        x: 200,
        y: 45,
        connected: false,
    },
    outputSecondary: {
        x: 200,
        y: 95,
        connected: false,
    },
    input: {
        x: 0,
        y: 45,
        connected: false,
    },
    variant: {
        x: 0,
        y: 95,
        connected: false,
    }
}

const nodeList = ref([
    // моковые
    {
        id: 0,
        x: 0,
        y: 0,
        type: 'if',
        ...defaultNode
    },
]);

const edgeList = ref([])

const nodeIdCounter = ref(1);
const edgeIdCounter = ref(0);

const hoveredNode = ref(null)
const hoveredConnectPointType = ref(null)
const hoveredEntity = ref(null)
const clickedEntity = ref(null)
const currentDrawingEdge = ref(null)
const disableSelect = ref(null)
const showHelp = ref(true)

const svgRootClass = computed(() => {
    return [
        'grid',
        'w-screen',
        'h-screen',
        'bg-neutral-500',
        disableSelect.value ? 'select-none' : ''
    ]
})

// моковые
function createNode(type) {
    nodeList.value.push({
        id: nodeIdCounter.value++,
        x: document.body.clientWidth / 2,
        y: document.body.clientHeight / 2,
        type: type,
        ...defaultNode
    })
}

function captureHoveredEntity(entity) {
    hoveredEntity.value = entity
}

function captureClickedEntity(entity) {
    clickedEntity.value = entity
}

// DnD, перетаскивание
function startMoveNodeHandler() {
    disableSelect.value = true;
    showHelp.value = false;
}

function moveNodeHandler({ id, x, y }) {
    const node = nodeList.value.find(node => node.id === id);
    const outputEdges = edgeList.value.filter(edge => edge.fromNodeId === id)
    const inputEdges = edgeList.value.filter(edge => edge.toNodeId === id)

    if (node) {
        node.x = x;
        node.y = y;

        outputEdges.forEach(edge => {
            edge.fromX = x + node[edge.fromPointType].x;
            edge.fromY = y + node[edge.fromPointType].y;
        })
        inputEdges.forEach(edge => {
            edge.toX = x + node[edge.toPointType].x;
            edge.toY = y + node[edge.toPointType].y;
        })
    }
}

function endMoveNodeHandler() {
    disableSelect.value = false;
    showHelp.value = true;
}

// Создание ребра
function drawEdgeHandler({ fromNodeId, toX, toY }) {
    disableSelect.value = true;

    if (currentDrawingEdge.value) {
        currentDrawingEdge.value.toX = toX;
        currentDrawingEdge.value.toY = toY;
    }
}

function startDrawEdgeHandler({ fromNodeId, fromPointType, fromX, fromY, toX, toY }) {
    const newEdge = {
        id: edgeIdCounter.value++,
        fromNodeId: fromNodeId,
        toNodeId: null,
        fromPointType: fromPointType,
        toPointType: null,
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

    // Если в момент отпускания кнопки мыши под ней нет узла
    // удаляем ребро
    if (!hoveredNode.value) {
        edgeList.value = edgeList.value.filter(edge => edge.id !== currentDrawingEdge.value.id)
        edgeIdCounter.value--
        return
    }

    // Проверка что тип начальной точки 
    // не совпадает с типом конечной точки
    let sameTypePoint = null;
    const fromPointTypeIsOutput = currentDrawingEdge.value.fromPointType === 'output' || currentDrawingEdge.value.fromPointType === 'outputSecondary'
    const fromPointTypeIsInput = currentDrawingEdge.value.fromPointType === 'input' || currentDrawingEdge.value.fromPointType === 'variant'

    if (fromPointTypeIsOutput) {
        sameTypePoint = hoveredConnectPointType.value === 'output' || hoveredConnectPointType.value === 'outputSecondary'
    } else if (fromPointTypeIsInput) {
        sameTypePoint = hoveredConnectPointType.value === 'input' || hoveredConnectPointType.value === 'variant'
    }

    if (sameTypePoint) {
        edgeList.value = edgeList.value.filter(edge => edge.id !== currentDrawingEdge.value.id)
        edgeIdCounter.value--
        return
    }

    // Проверка, если ребро соединяется с узлом у которого 
    // хотя бы одно из ребер соединено с узлом начальной точки
    // (зашита от циклов)
    const hoveredNodeEdges = edgeList.value.filter(edge => edge.fromNodeId === hoveredNode.value.id)
    const isLoop = hoveredNodeEdges.some(edge => edge.toNodeId === currentDrawingEdge.value.fromNodeId)

    // Проверка что все ребра, исходящие из того же узла что и текущее ребро
    // не выходят из одной точки и не входят в одну точку одновременно (защита от дубликатов)
    const sameNodeEdges = edgeList.value.filter(edge => edge.fromNodeId === fromNodeId && edge.id !== currentDrawingEdge.value.id);
    const alreadyAttached = sameNodeEdges.some(sameNodeEdge => {
        const sameId = sameNodeEdge.toNodeId === hoveredNode.value.id;
        const sameFromPointType = sameNodeEdge.fromPointType === currentDrawingEdge.value.fromPointType;
        const sameToPointType = sameNodeEdge.toPointType === hoveredConnectPointType.value;

        return sameId && sameFromPointType && sameToPointType
    })

    // если есть ребро с такой же начальной точкой,
    // но с другой конечной точкой, то заменить конечную точку
    // существующего ребра
    const edgeForSwitchToPoint = sameNodeEdges.find(sameNodeEdge => {
        const sameId = sameNodeEdge.toNodeId === hoveredNode.value.id;
        const sameFromPointType = sameNodeEdge.fromPointType === currentDrawingEdge.value.fromPointType;
        const sameToPointType = sameNodeEdge.toPointType === hoveredConnectPointType.value;

        return sameId && sameFromPointType && !sameToPointType
    })


    if (edgeForSwitchToPoint) {
        edgeList.value = edgeList.value.filter(edge => edge.id !== currentDrawingEdge.value.id)
        edgeIdCounter.value--

        currentDrawingEdge.value = edgeForSwitchToPoint;
    }

    // Если в момент отпускания кнопки мыши под ней есть какой-то узел,
    // то прикрепляем ребро к нему
    if (hoveredNode.value && hoveredNode.value.id !== fromNodeId && !alreadyAttached && !sameTypePoint && !isLoop) {
        // Прикрепляем ребро
        currentDrawingEdge.value.toNodeId = hoveredNode.value.id

        const pointType = hoveredConnectPointType.value
        currentDrawingEdge.value.toPointType = pointType

        // Координаты конечной точки
        // Левая верхняя точка узла + позиция точки коннекта (input или output)
        currentDrawingEdge.value.toX = hoveredNode.value.x + hoveredNode.value[pointType].x
        currentDrawingEdge.value.toY = hoveredNode.value.y + hoveredNode.value[pointType].y

        // 
        // hoveredNode.value[pointType].connected = true;
        // console.log(hoveredNode.value.id)
        const fromNode = nodeList.value.find(node => node.id === currentDrawingEdge.value.fromNodeId)
        const fromPointType = currentDrawingEdge.value.fromPointType
        fromNode[fromPointType].connected = true;

        const toNode = nodeList.value.find(node => node.id === currentDrawingEdge.value.toNodeId)
        const toPointType = currentDrawingEdge.value.toPointType
        toNode[toPointType].connected = true;
        console.log(toNode)
    } else {
        edgeList.value = edgeList.value.filter(edge => edge.id !== currentDrawingEdge.value.id)
        edgeIdCounter.value--
    }
}

// 
function handleMouseMove(e) {
    const svgRect = rootSvg.value.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    const node = nodeList.value.find(node => {
        if (
            mouseX >= node.x &&
            mouseY >= node.y &&
            mouseX <= node.x + node.width &&
            mouseY <= node.y + node.height
        ) {
            return true
        }
    })

    if (e.target.closest('g') && e.target.closest('g').dataset.nodeConnectPoint) {
        const connectPointType = e.target.closest('g').dataset.nodeConnectPoint
        hoveredConnectPointType.value = connectPointType
    }

    hoveredNode.value = node || null;
}
</script>

<template>
    <svg ref="rootSvg" :class="svgRootClass" @mousemove="handleMouseMove">
        <GraphEdge v-for="edge in edgeList" :key="edge.id" :edge="edge" @mouseover="() => captureHoveredEntity(edge)"
            @mouseleave="() => captureHoveredEntity(null)" @click="() => captureClickedEntity(edge)" />

        <GraphNode v-for="node in nodeList" :key="node.id" :node="node" @onStartMove="startMoveNodeHandler"
            @onMove="moveNodeHandler" @onEndMove="endMoveNodeHandler" @onStartDrawEdge="startDrawEdgeHandler"
            @onDrawEdge="drawEdgeHandler" @onEndDrawEdge="endDrawEdgeHandler"
            @mouseover="() => captureHoveredEntity(node)" @mouseleave="() => captureHoveredEntity(null)"
            @click="() => captureClickedEntity(node)" />
    </svg>

    <GraphTools @onCreate="createNode" />
    <GraphMouseHint v-show="showHelp" :info="hoveredEntity" />
    <GraphHint :entityInfo="clickedEntity" />
</template>

<style scoped>
.grid {
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 100px 100px;
}
</style>