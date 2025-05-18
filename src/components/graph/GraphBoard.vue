<script setup>
import { computed, ref } from "vue";
import GraphTools from "./tools/GraphTools.vue";
import GraphNode from "./GraphNode.vue";
import GraphEdge from "./GraphEdge.vue";
import GraphMouseHint from "./tools/GraphMouseHint.vue";
import GraphHint from "./tools/GraphHint.vue";
import GraphModalEdit from "./tools/GraphModalEdit.vue";
import GraphNodeStart from "./GraphNodeStart.vue";
import GraphBoardNotification from "./tools/GraphBoardNotification.vue";

const rootSvg = ref(null);
const modalEditVisible = ref(false)
const boardNoitification = ref({})

const startNode = ref({
    id: -1,
    x: 250,
    y: 400,
    is: 'start',
    innerValue: null,
    width: 100,
    height: 100,
    connected: {
        output: false,
    },
    output: {
        x: 100,
        y: 50
    }
})

const defaultNode = {
    is: 'node',
    width: 200,
    height: 150,
    output: {
        x: 200,
        y: 45,
    },
    outputSecondary: {
        x: 200,
        y: 95,
    },
    input: {
        x: 0,
        y: 45,
    },
    variant: {
        x: 0,
        y: 95,
    }
}

const nodeList = ref([
    // моковые
    {
        id: 0,
        x: 0,
        y: 0,
        type: 'if',
        connected: {
            output: false,
            outputSecondary: false,
            input: false,
            variant: false,
        },
        innerLogic: '',
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

function createNode(type) {
    let innerLogic = '';

    switch (type) {
        case 'and':
            innerLogic = 'input && variant'
            break;
        case 'or':
            innerLogic = 'input || variant'
            break;
        case 'not':
            innerLogic = '!input'
            break;
        default:
            break;
    }

    nodeList.value.push({
        id: nodeIdCounter.value++,
        x: rootSvg.value.clientWidth / 2,
        y: rootSvg.value.clientHeight / 2,
        type: type,
        innerLogic: innerLogic,
        connected: {
            output: false,
            outputSecondary: false,
            input: false,
            variant: false,
        },
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
    let node = null;

    if (id === -1) {
        node = startNode.value;
    } else {
        node = nodeList.value.find(node => node.id === id);
    }

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
    let fromNode = null;

    if (fromNodeId === -1) {
        fromNode = startNode
    } else {
        fromNode = nodeList.value.find(node => node.id === fromNodeId)
    }

    const newEdge = {
        id: edgeIdCounter.value++,
        is: 'edge',
        fromNodeId: fromNodeId,
        fromNode: fromNode,
        toNodeId: null,
        toNode: null,
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
        hoveredNode.value.connected[edgeForSwitchToPoint.toPointType] = false;
    }

    // Если в момент отпускания кнопки мыши под ней есть какой-то узел,
    // то прикрепляем ребро к нему
    if (hoveredNode.value && hoveredNode.value.id !== fromNodeId && !alreadyAttached && !sameTypePoint && !isLoop) {
        // Прикрепляем ребро
        currentDrawingEdge.value.toNodeId = hoveredNode.value.id

        const toPointType = hoveredConnectPointType.value
        currentDrawingEdge.value.toPointType = toPointType

        // Координаты конечной точки
        // Левая верхняя точка узла + позиция точки коннекта (input или output)
        currentDrawingEdge.value.toX = hoveredNode.value.x + hoveredNode.value[toPointType].x
        currentDrawingEdge.value.toY = hoveredNode.value.y + hoveredNode.value[toPointType].y

        // Подсветка input/output
        hoveredNode.value.connected[toPointType] = true;

        const toNode = nodeList.value.find(node => node.id === currentDrawingEdge.value.toNodeId)

        let fromNode = null;

        if (currentDrawingEdge.value.fromNodeId === -1) {
            fromNode = startNode.value
        } else {
            fromNode = nodeList.value.find(node => node.id === currentDrawingEdge.value.fromNodeId)
        }

        const fromPointType = currentDrawingEdge.value.fromPointType
        fromNode.connected[fromPointType] = true;

        currentDrawingEdge.value.toNode = toNode;
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

// tools
function handleDeleteEntity(entity) {
    if (entity.is === 'node') {
        const sameNodeEdges = edgeList.value.filter(edge => edge.toNodeId === entity.id || edge.fromNodeId === entity.id)

        sameNodeEdges.forEach(edge => {
            edge.fromNode.connected[edge.fromPointType] = false;
            edge.toNode.connected[edge.toPointType] = false;
        })

        edgeList.value = edgeList.value.filter(edge => edge.toNodeId !== entity.id && edge.fromNodeId !== entity.id)

        nodeList.value = nodeList.value.filter(node => node.id !== entity.id)
    } else {
        entity.fromNode.connected[entity.fromPointType] = false;
        entity.toNode.connected[entity.toPointType] = false;

        edgeList.value = edgeList.value.filter(edge => edge.id !== entity.id)
    }

}

function handleEditEntity(entity) {
    const hasInnerLogic = entity.is === 'node' && (entity.type === 'if' || entity.type === 'elseif')

    if (entity.is === 'start' || hasInnerLogic) {
        modalEditVisible.value = true
    }
}

function handleSaveLogic(nodeId, newInnerLogic) {
    const node = nodeList.value.find(node => node.id === nodeId);
    node.innerLogic = newInnerLogic;
}

function handleSaveValue(nodeId, newValue) {
    startNode.value.innerValue = newValue
}

// Симуляция
function startSimulation() {
    if (!startNode.value.connected.output) return

    // Инициализация для первой итерации
    let activeStreams = [{
        currentNode: startNode.value,
        inputValue: startNode.value.innerValue
    }]

    while (activeStreams.length) {
        const nextStreams = []

        for (const stream of activeStreams) {
            const { currentNode, inputValue } = stream

            // Исходящие из текущего узла ребра
            const outgoingEdges = edgeList.value.filter(edge => edge.fromNodeId === currentNode.id)

            // Если ребер нет, завершаем поток
            if (!outgoingEdges.length) {
                boardNoitification.value = { type: 'info', text: `Поток завершён в узле #${currentNode.id}, значение: ${inputValue}` }
                continue
            }

            for (const edge of outgoingEdges) {
                const nextNode = edge.toNode

                // Если у узла нет внутренней логики то выдаем ошибку
                if (!nextNode.innerLogic) {
                    boardNoitification.value = { type: 'error', text: `У узла с id:${currentNode.id} нет внутренней логики` }
                    continue
                }

                const result = runLogic(inputValue, nextNode.innerLogic)

                if (!result.successfull) {
                    boardNoitification.value = { type: 'error', text: `У узла с id:${currentNode.id} возникла ошибка во внутренней логике: ${result.error}` }
                    continue
                }

                nextStreams.push({
                    currentNode: nextNode,
                    inputValue: result.result
                })
            }
        }

        // Меняем пул потоков на новый
        activeStreams = nextStreams
    }
}

function runLogic(inputValue, logic) {
    try {
        const fn = new Function('input', `return ${logic}`)
        const result = fn(inputValue)
        return { successfull: true, result: result }
    } catch (error) {
        // console.error(error)
        return { successfull: false, result: error }
    }
}
</script>

<template>
    <div class="overflow-hidden">
        <svg ref="rootSvg" :class="svgRootClass" @mousemove="handleMouseMove" @click="() => captureClickedEntity(null)">
            <GraphEdge v-for="edge in edgeList" :key="edge.id" :edge="edge"
                :active="clickedEntity && clickedEntity.is === 'edge' && clickedEntity.id === edge.id"
                @mouseover="() => captureHoveredEntity(edge)" @mouseleave="() => captureHoveredEntity(null)"
                @click.stop="() => captureClickedEntity(edge)" />

            <GraphNode v-for="node in nodeList" :key="node.id" :node="node"
                :active="clickedEntity && clickedEntity.is === 'node' && clickedEntity.id === node.id"
                @onStartMove="startMoveNodeHandler" @onMove="moveNodeHandler" @onEndMove="endMoveNodeHandler"
                @onStartDrawEdge="startDrawEdgeHandler" @onDrawEdge="drawEdgeHandler"
                @onEndDrawEdge="endDrawEdgeHandler" @mouseover="() => captureHoveredEntity(node)"
                @mouseleave="() => captureHoveredEntity(null)" @click.stop="() => captureClickedEntity(node)"
                @dblclick="() => handleEditEntity(node)" />

            <GraphNodeStart :node="startNode" @onStartMove="startMoveNodeHandler" @onMove="moveNodeHandler"
                @onEndMove="endMoveNodeHandler" @onStartDrawEdge="startDrawEdgeHandler" @onDrawEdge="drawEdgeHandler"
                @onEndDrawEdge="endDrawEdgeHandler" @mouseover="() => captureHoveredEntity(startNode)"
                @mouseleave="() => captureHoveredEntity(null)" @click.stop="() => captureClickedEntity(startNode)"
                @dblclick="() => handleEditEntity(startNode)" />
        </svg>

        <GraphTools :activeEntity="clickedEntity" @onCreate="createNode" @onEditEntity="handleEditEntity"
            @onDeleteEntity="handleDeleteEntity" @onStartSimulation="startSimulation" />
        <GraphMouseHint v-show="showHelp" :info="hoveredEntity" />
        <GraphHint :entityInfo="clickedEntity" />
        <GraphModalEdit v-model:visible="modalEditVisible" :entity="clickedEntity" @onSaveLogic="handleSaveLogic"
            @onSaveValue="handleSaveValue" />

        <GraphBoardNotification :info="boardNoitification" />
    </div>
</template>

<style scoped>
.grid {
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
}
</style>