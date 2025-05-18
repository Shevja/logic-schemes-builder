import { defineStore } from 'pinia'
import { computed, ref } from 'vue';
import { defaultNode } from '../utils/defaultNode';

export const useGraphStore = defineStore('graph', () => {
    // variables
    const nodeList = ref([]);
    const edgeList = ref([]);
    const startNode = ref({
        id: -1,
        x: 250,
        y: 400,
        is: 'start',
        innerValue: null,
        innerLogic: 'input',
        width: 100,
        height: 100,
        connected: {
            output: false,
        },
        output: {
            x: 100,
            y: 50
        }
    });
    const nodeIdCounter = ref(1);
    const edgeIdCounter = ref(0);

    const hoveredNode = ref(null)
    const hoveredConnectPointType = ref(null)

    const hoveredEntity = ref(null);
    const clickedEntity = ref(null);
    const modalEditVisible = ref(false)
    const boardNotification = ref({})
    const disableSelect = ref(null)
    const showHelp = ref(true);

    // computed
    const svgRootClass = computed(() => {
        return [
            'grid',
            'w-screen',
            'h-screen',
            'bg-neutral-500',
            disableSelect.value ? 'select-none' : ''
        ]
    })

    // functions
    function createNode(type, x, y) {
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
            x: x,
            y: y,
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
    function deleteEntity(entity) {
        if (entity.is === 'start') return

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
    function editEntity(entity) {
        const hasInnerLogic = entity.is === 'node' && (entity.type === 'if' || entity.type === 'elseif')

        if (entity.is === 'start' || hasInnerLogic) {
            modalEditVisible.value = true
        }
    }
    function saveLogic(nodeId, newInnerLogic) {
        const node = nodeList.value.find(node => node.id === nodeId);
        node.innerLogic = newInnerLogic;
    }
    function saveValue(nodeId, newValue) {
        startNode.value.innerValue = newValue
    }
    function setDisableSelect(val) {
        disableSelect.value = val
    }
    function captureHoveredEntity(entity) {
        hoveredEntity.value = entity
    }
    function captureClickedEntity(entity) {
        clickedEntity.value = entity
    }
    function saveScheme() {
        console.log('save scheme')
    }
    function loadScheme() {
        console.log('load scheme')
    }

    return {
        // variables
        nodeList, edgeList, startNode,
        nodeIdCounter, edgeIdCounter,
        hoveredEntity, clickedEntity,
        modalEditVisible, boardNotification,
        disableSelect, showHelp, hoveredConnectPointType,

        // getters
        svgRootClass,

        // actions
        createNode, deleteEntity,
        saveLogic, saveValue, setDisableSelect,
        hoveredNode, editEntity, captureHoveredEntity,
        captureClickedEntity, saveScheme, loadScheme
    }
})