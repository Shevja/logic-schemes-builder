import { ref } from "vue";
import { useGraphStore } from "../store/graphStore";

export const useEdgeDrawing = () => {
    const graph = useGraphStore()
    const currentDrawingEdge = ref(null)

    function deleteEdge() {
        graph.edgeList = graph.edgeList.filter(edge => edge.id !== currentDrawingEdge.value.id)
        graph.edgeIdCounter--
    }

    function isEdgeWithSamePointType() {
        const from = currentDrawingEdge.value.fromPointType
        const to = graph.hoveredConnectPointType

        const fromPointTypeIsOutput = from === 'output' || from === 'outputSecondary'
        const fromPointTypeIsInput = from === 'input' || from === 'variant'

        let sameTypePoint = null;

        if (fromPointTypeIsOutput) {
            sameTypePoint = to === 'output' || to === 'outputSecondary'
        } else if (fromPointTypeIsInput) {
            sameTypePoint = to === 'input' || to === 'variant'
        }

        return sameTypePoint
    }

    function isLoopEdge() {
        const hoveredNodeEdges = graph.edgeList.filter(edge => edge.fromNodeId === graph.hoveredNode.id)
        const isLoop = hoveredNodeEdges.some(edge => edge.toNodeId === currentDrawingEdge.value.fromNodeId)

        return isLoop
    }

    function isDublicateEdge(sameNodeEdges) {
        return sameNodeEdges.some(sameNodeEdge => {
            const sameId = sameNodeEdge.toNodeId === graph.hoveredNode.id;
            const sameFromPointType = sameNodeEdge.fromPointType === currentDrawingEdge.value.fromPointType;
            const sameToPointType = sameNodeEdge.toPointType === graph.hoveredConnectPointType;

            return sameId && sameFromPointType && sameToPointType
        })
    }

    function isEdgeSwitchToPoint(sameNodeEdges) {
        return sameNodeEdges.find(sameNodeEdge => {
            const sameId = sameNodeEdge.toNodeId === graph.hoveredNode.id;
            const sameFromPointType = sameNodeEdge.fromPointType === currentDrawingEdge.value.fromPointType;
            const sameToPointType = sameNodeEdge.toPointType === graph.hoveredConnectPointType;

            return sameId && sameFromPointType && !sameToPointType
        })
    }

    // Создание ребра
    function edgeDrawing({ fromNodeId, toX, toY }) {
        graph.disableSelect = true;

        if (currentDrawingEdge.value) {
            currentDrawingEdge.value.toX = toX;
            currentDrawingEdge.value.toY = toY;
        }
    }

    function startEdgeDrawing({ fromNodeId, fromPointType, fromX, fromY, toX, toY }) {
        let fromNode = null;

        if (fromNodeId === -1) {
            fromNode = graph.startNode
        } else {
            fromNode = graph.nodeList.find(node => node.id === fromNodeId)
        }

        const newEdge = {
            id: graph.edgeIdCounter++,
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
        graph.edgeList.push(newEdge)

        currentDrawingEdge.value = newEdge
    }

    function endEdgeDrawing({ fromNodeId, toX, toY }) {
        if (!currentDrawingEdge.value) return

        // Если в момент отпускания кнопки мыши под ней нет узла
        // удаляем ребро
        if (!graph.hoveredNode) {
            deleteEdge()
            return
        }

        // Проверка что тип начальной точки 
        // не совпадает с типом конечной точки

        if (isEdgeWithSamePointType()) {
            deleteEdge()
            return
        }

        // Проверка, если ребро соединяется с узлом у которого 
        // хотя бы одно из ребер соединено с узлом начальной точки
        // (зашита от циклов)
        if (isLoopEdge()) {
            deleteEdge()
            return
        }

        // для последних двух проверок
        const sameNodeEdges = graph.edgeList.filter(edge => edge.fromNodeId === fromNodeId && edge.id !== currentDrawingEdge.value.id);

        // Проверка что все ребра, исходящие из того же узла что и текущее ребро
        // не выходят из одной точки и не входят в одну точку одновременно (защита от дубликатов)
        if (isDublicateEdge(sameNodeEdges)) {
            deleteEdge()
            return
        }

        // если есть ребро с такой же начальной точкой,
        // но с другой конечной точкой (и тем же конечным узлом id), 
        // то заменить конечную точку существующего ребра
        const edgeForSwitchToPoint = isEdgeSwitchToPoint(sameNodeEdges)
        if (edgeForSwitchToPoint) {
            deleteEdge()

            currentDrawingEdge.value = edgeForSwitchToPoint;
            graph.hoveredNode.connected[edgeForSwitchToPoint.toPointType] = false;
        }

        // Если в момент отпускания кнопки мыши под ней есть какой-то узел,
        // то прикрепляем ребро к нему
        if (graph.hoveredNode && graph.hoveredNode.id !== fromNodeId) {
            // Прикрепляем ребро
            currentDrawingEdge.value.toNodeId = graph.hoveredNode.id

            const toPointType = graph.hoveredConnectPointType
            currentDrawingEdge.value.toPointType = toPointType

            // Координаты конечной точки
            // Левая верхняя точка узла + позиция точки коннекта (input или output)
            currentDrawingEdge.value.toX = graph.hoveredNode.x + graph.hoveredNode[toPointType].x
            currentDrawingEdge.value.toY = graph.hoveredNode.y + graph.hoveredNode[toPointType].y

            // Подсветка input/output
            graph.hoveredNode.connected[toPointType] = true;

            const toNode = graph.nodeList.find(node => node.id === currentDrawingEdge.value.toNodeId)

            let fromNode = null;

            if (currentDrawingEdge.value.fromNodeId === -1) {
                fromNode = graph.startNode
            } else {
                fromNode = graph.nodeList.find(node => node.id === currentDrawingEdge.value.fromNodeId)
            }

            const fromPointType = currentDrawingEdge.value.fromPointType
            fromNode.connected[fromPointType] = true;

            currentDrawingEdge.value.toNode = toNode;
        } else {
            graph.edgeList = graph.edgeList.filter(edge => edge.id !== currentDrawingEdge.value.id)
            graph.edgeIdCounter--
        }
    }

    return {
        startEdgeDrawing,
        edgeDrawing,
        endEdgeDrawing
    }
}