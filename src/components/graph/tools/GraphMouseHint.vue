<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
    info: {
        type: Object,
        default: () => { }
    }
})

const mouseX = ref(0);
const mouseY = ref(0);
let animationFrameId = null;

function updatePosition(e) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    animationFrameId = requestAnimationFrame(() => {
        mouseX.value = e.clientX + 19 + 'px';
        mouseY.value = e.clientY + 18 + 'px';
    });
}

onMounted(() => {
    document.addEventListener('mousemove', updatePosition)
})

onBeforeUnmount(() => {
    document.removeEventListener('mousemove', updatePosition)
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
})
</script>

<template>
    <div v-if="info"
        class="absolute bg-slate-950 text-white px-2 py-0.5 text-sm transition-[top,left] duration-75 ease-linear rounded-sm"
        :style="`top: ${mouseY}; left: ${mouseX};`">
        <ul>
            <li>
                id: {{ info.id }}
            </li>
            <li v-if="info.type">
                Тип: {{ info.type }}
            </li>
        </ul>

        <div v-if="info.is === 'start'">
            <div>
                <span>Значение: </span>
                <span :class="[info.innerValue ? '' : 'text-red-400']">
                    {{ info.innerValue ? info.innerValue : 'Нет' }}
                </span>
            </div>
        </div>

        <div v-if="info.is === 'node'" class="mt-4">
            <div class="mb-4">
                <span>Внутренняя логика:</span><br>
                <p :class="[info.innerLogic ? '' : 'text-red-400']">
                    {{ info.innerLogic ? info.innerLogic : 'Нет' }}
                </p>
            </div>

            <ul>
                <li>
                    Ввод:
                    <span :class="[info.connected.input ? 'text-green-400' : 'text-red-400']">
                        {{ info.connected.input ? 'Подключен' : 'Не подключен' }}
                    </span>
                </li>
                <li>
                    Вывод:
                    <span :class="[info.connected.output ? 'text-green-400' : 'text-red-400']">
                        {{ info.connected.output ? 'Подключен' : 'Не подключен' }}
                    </span>
                </li>
                <li v-if="info.type === 'if'">
                    Ввод 2:
                    <span :class="[info.connected.outputSecondary ? 'text-green-400' : 'text-red-400']">
                        {{ info.connected.outputSecondary ? 'Подключен' : 'Не подключен' }}
                    </span>
                </li>
                <li v-if="info.type === 'and' || info.type === 'or'">
                    Вывод 2:
                    <span :class="[info.connected.variant ? 'text-green-400' : 'text-red-400']">
                        {{ info.connected.variant ? 'Подключен' : 'Не подключен' }}
                    </span>
                </li>
            </ul>
        </div>

        <div v-if="info.is === 'edge'" class="mt-4">
            <span>Узел -> Узел:</span>
            <ul class="mb-2">
                <li v-if="info.hasOwnProperty('fromNodeId')">
                    из id: {{ info.fromNodeId }}
                </li>
                <li v-if="info.hasOwnProperty('toNodeId')">
                    в id: {{ info.toNodeId }}
                </li>
            </ul>

            <span>Тип точки:</span>
            <ul>
                <li v-if="info.hasOwnProperty('fromPointType')">
                    Из: {{ info.fromPointType }}
                </li>
                <li v-if="info.hasOwnProperty('toPointType')">
                    в: {{ info.toPointType }}
                </li>
            </ul>
        </div>
    </div>
</template>