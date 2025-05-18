import { useGraphStore } from "../store/graphStore";


// DnD, перетаскивание
export const useNodeDrag = () => {
    const graph = useGraphStore()
    
    function starMoveNode() {
        graph.disableSelect = true;
        graph.showHelp = false;
    }

    function moveNode({ id, x, y }) {
        let node = null;

        if (id === -1) {
            node = graph.startNode;
        } else {
            node = graph.nodeList.find(node => node.id === id);
        }

        const outputEdges = graph.edgeList.filter(edge => edge.fromNodeId === id)
        const inputEdges = graph.edgeList.filter(edge => edge.toNodeId === id)

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

    function endMoveNode() {
        graph.disableSelect = false;
        graph.showHelp = true;
    }

    return {
        starMoveNode,
        moveNode,
        endMoveNode
    }
}
