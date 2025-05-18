<script setup>
const props = defineProps({
    entityInfo: {
        type: Object,
        default: ''
    }
})
</script>

<template>
    <div v-if="entityInfo" class="fixed top-4 right-4 py-1 px-2 bg-slate-950 text-white rounded">
        <ul>
            <li>
                id: {{ entityInfo.id }}
            </li>
            <li v-if="entityInfo.type">
                Тип: {{ entityInfo.type }}
            </li>
        </ul>

        <div v-if="entityInfo.is === 'start'">
            <div>
                <span>Значение: </span>
                <span :class="[entityInfo.innerValue ? '' : 'text-red-400']">
                    {{ entityInfo.innerValue ? entityInfo.innerValue : 'Нет' }}
                </span>
            </div>
        </div>

        <div v-if="entityInfo.is === 'node'" class="mt-4">
            <div class="mb-4">
                <span>Внутренняя логика:</span><br>
                <p :class="[entityInfo.innerLogic ? '' : 'text-red-400']">
                    {{ entityInfo.innerLogic ? entityInfo.innerLogic : 'Нет' }}
                </p>
            </div>

            <ul>
                <li>
                    Ввод:
                    <span :class="[entityInfo.connected.input ? 'text-green-400' : 'text-red-400']">
                        {{ entityInfo.connected.input ? 'Подключен' : 'Не подключен' }}
                    </span>
                </li>
                <li>
                    Вывод:
                    <span :class="[entityInfo.connected.output ? 'text-green-400' : 'text-red-400']">
                        {{ entityInfo.connected.output ? 'Подключен' : 'Не подключен' }}
                    </span>
                </li>
                <li v-if="entityInfo.type === 'if'">
                    Ввод 2:
                    <span :class="[entityInfo.connected.outputSecondary ? 'text-green-400' : 'text-red-400']">
                        {{ entityInfo.connected.outputSecondary ? 'Подключен' : 'Не подключен' }}
                    </span>
                </li>
                <li v-if="entityInfo.type === 'and' || entityInfo.type === 'or'">
                    Вывод 2:
                    <span :class="[entityInfo.connected.variant ? 'text-green-400' : 'text-red-400']">
                        {{ entityInfo.connected.variant ? 'Подключен' : 'Не подключен' }}
                    </span>
                </li>
            </ul>
        </div>
    </div>
</template>