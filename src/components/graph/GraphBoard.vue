<script setup>
import { ref } from "vue";
import GraphTools from "./tools/GraphTools.vue";
import GraphNode from "./GraphNode.vue";
import GraphEdge from "./GraphEdge.vue";
import GraphMouseHint from "./tools/GraphMouseHint.vue";
import GraphHint from "./tools/GraphHint.vue";
import GraphModalEdit from "./tools/GraphModalEdit.vue";
import GraphNodeStart from "./GraphNodeStart.vue";
import GraphBoardNotification from "./tools/GraphBoardNotification.vue";

import { useGraphStore } from "../../store/graphStore";
import { useNodeDrag } from "../../composables/useNodeDrag"
import { useEdgeDrawing } from "../../composables/useEdgeDrawing";
import { useSimulation } from "../../composables/useSimulation";

const rootSvg = ref(null);

const graph = useGraphStore();

const { moveNode, starMoveNode, endMoveNode } = useNodeDrag()
const { startEdgeDrawing, edgeDrawing, endEdgeDrawing } = useEdgeDrawing()
const { startSimulation } = useSimulation()

function handleCreateNode(type) {
    const { width, height } = rootSvg.value.getBoundingClientRect()
    graph.createNode(type, width / 2, height / 2)
}
function handleMouseMove(e) {
    const svgRect = rootSvg.value.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    const node = graph.nodeList.find(node => {
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
        graph.hoveredConnectPointType = connectPointType
    }

    graph.hoveredNode = node || null;
}

</script>

<template>
    <div class="overflow-hidden">
        <svg ref="rootSvg" :class="graph.svgRootClass" @mousemove="handleMouseMove"
            @click="() => graph.captureClickedEntity(null)">
            <GraphEdge v-for="edge in graph.edgeList" :key="edge.id" :edge="edge"
                :active="graph.clickedEntity && graph.clickedEntity.is === 'edge' && graph.clickedEntity.id === edge.id"
                @mouseover="() => graph.captureHoveredEntity(edge)" @mouseleave="() => graph.captureHoveredEntity(null)"
                @click.stop="() => graph.captureClickedEntity(edge)" />

            <GraphNode v-for="node in graph.nodeList" :key="node.id" :node="node"
                :active="graph.clickedEntity && graph.clickedEntity.is === 'node' && graph.clickedEntity.id === node.id"
                @onStartMove="starMoveNode" @onMove="moveNode" @onEndMove="endMoveNode"
                @onStartDrawEdge="startEdgeDrawing" @onDrawEdge="edgeDrawing" @onEndDrawEdge="endEdgeDrawing"
                @mouseover="() => graph.captureHoveredEntity(node)" @mouseleave="() => graph.captureHoveredEntity(null)"
                @click.stop="() => graph.captureClickedEntity(node)" @dblclick="() => graph.editEntity(node)" />

            <GraphNodeStart :node="graph.startNode" @onStartMove="starMoveNode" @onMove="moveNode"
                @onEndMove="endMoveNode" @onStartDrawEdge="startEdgeDrawing" @onDrawEdge="edgeDrawing"
                @onEndDrawEdge="endEdgeDrawing" @mouseover="() => graph.captureHoveredEntity(graph.startNode)"
                @mouseleave="() => graph.captureHoveredEntity(null)"
                @click.stop="() => graph.captureClickedEntity(graph.startNode)"
                @dblclick="() => graph.editEntity(graph.startNode)" />
        </svg>

        <GraphTools :activeEntity="graph.clickedEntity" @onCreate="handleCreateNode" @onEditEntity="graph.editEntity"
            @onDeleteEntity="graph.deleteEntity" @onStartSimulation="startSimulation" @onSaveScheme="graph.saveScheme"
            @onLoadScheme="graph.loadScheme" />

        <GraphMouseHint v-show="graph.showHelp" :info="graph.hoveredEntity" />

        <GraphHint :entityInfo="graph.clickedEntity" />

        <GraphModalEdit v-model:visible="graph.modalEditVisible" :entity="graph.clickedEntity"
            @onSaveLogic="graph.saveLogic" @onSaveValue="graph.saveValue" />

        <GraphBoardNotification :info="graph.boardNotification" />
    </div>
</template>

<style scoped>
.grid {
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
}
</style>