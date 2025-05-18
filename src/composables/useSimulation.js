import { useGraphStore } from "../store/graphStore"

export const useSimulation = () => {
    const graph = useGraphStore()

    graph.boardNotification = {}

    // Симуляция
    function startSimulation() {
        if (!graph.startNode.connected.output) return

        // Инициализация для первой итерации
        let activeStreams = [{
            currentNode: graph.startNode,
            inputValue: graph.startNode.innerValue
        }]

        // Для and и or
        const pending = {}

        while (activeStreams.length) {
            const nextStreams = []

            for (const stream of activeStreams) {
                const { currentNode, inputValue, variantValue } = stream

                // Исходящие из текущего узла ребра
                const outgoingEdges = graph.edgeList.filter(edge => edge.fromNodeId === currentNode.id)

                // Если ребер нет, завершаем поток
                if (!outgoingEdges.length) {
                    graph.boardNotification = {
                        type: 'info',
                        text: `Поток завершён в узле #${currentNode.id}, значение: ${inputValue}`
                    }
                    continue
                }

                // Если у узла нет внутренней логики
                if (!currentNode.innerLogic) {
                    graph.boardNotification = {
                        type: 'error',
                        text: `У узла с id:${currentNode.id} нет внутренней логики`
                    };
                    continue;
                }

                // Для if и elseif
                if (currentNode.type === 'if' || currentNode.type === 'elsif') {
                    const exec = runLogic(currentNode.innerLogic, inputValue)

                    if (!exec.successfull) {
                        graph.boardNotification = {
                            type: 'error',
                            text: `Ошибка логики в узле с id:${currentNode.id}: ${exec.error}`
                        }

                        continue
                    }

                    // Определяем ребро, по которому будем двигаться дальше
                    const port = exec.result ? 'output' : 'outputSecondary'
                    const selectedEdge = outgoingEdges.find(edge => edge.fromPointType === port)

                    if (!selectedEdge) {
                        graph.boardNotification = {
                            type: 'error',
                            text: `У узла c id:${currentNode.id} нет ребра для результата ${exec.result}`
                        }

                        continue
                    }

                    nextStreams.push({
                        currentNode: selectedEdge.toNode,
                        inputValue: exec.result
                    });

                    continue
                }

                // Для and и or
                if (currentNode.type === 'and' || currentNode.type === 'or') {
                    for (const edge of outgoingEdges) {
                        const toNodeId = edge.toNode.id

                        // Если узла нет в очереди ожидания, добавляем
                        if (!pending[toNodeId]) {
                            pending[toNodeId] = {
                                inputValue: undefined,
                                variantValue: undefined
                            }
                        }

                        const exec = runLogic(currentNode.innerLogic, inputValue, variantValue)

                        if (!exec.successfull) {
                            graph.boardNotification = {
                                type: 'error',
                                text: `Ошибка логики в узле #${currentNode.id}: ${exec.error}`
                            }
                            continue
                        }

                        // Определяем в какой порт записать результат
                        pending[toNodeId][edge.fromPointType + 'Value'] = exec.result

                        // Проверяем что оба значения готовы,
                        // если готовы - удаляем из pending
                        const { pendingInputValue, pendingVariantValue } = pending[toNodeId]

                        if (pendingInputValue !== undefined && pendingVariantValue !== undefined) {
                            const finalExec = runLogic(currentNode.innerLogic, pendingInputValue, pendingVariantValue)

                            if (finalExec.successfull) {
                                nextStreams.push({
                                    currentNode: edge.toNode,
                                    inputValue: finalExec.result
                                })
                            } else {
                                graph.boardNotification = {
                                    type: 'error',
                                    text: `Ошибка логики в узле #${currentNode.id}: ${finalExec.error}`
                                }
                            }

                            delete pending[toNodeId]
                        }
                    }
                    continue
                }

                // Для not и остальных узлов
                console.log(currentNode, currentNode.innerLogic)
                const exec = runLogic(currentNode.innerLogic, inputValue);
                
                if (!exec.successfull) {
                    graph.boardNotification = {
                        type: 'error',
                        text: `Ошибка логики в узле #${currentNode.id}: ${exec.error}`
                    }
                    continue
                }

                // пушим по всем исходящим ребрам
                for (const edge of outgoingEdges) {
                    nextStreams.push({
                        currentNode: edge.toNode,
                        inputValue: exec.result
                    })
                }
            }

            // Меняем пул потоков на новый
            activeStreams = nextStreams
        }
    }

    function runLogic(logic, inputValue, variantValue = undefined) {
        try {
            let resultFn;

            if (variantValue) {
                const fn = new Function('input', 'variant', `return ${logic}`)
                resultFn = fn(inputValue, variantValue)
            } else {
                const fn = new Function('input', `return ${logic}`)
                resultFn = fn(inputValue)
            }

            console.log(logic, inputValue)
            return { successfull: true, result: resultFn }
        } catch (error) {
            // console.error(error)
            return { successfull: false, result: error }
        }
    }

    return { startSimulation };
}