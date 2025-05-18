<script setup>
import BaseButtonSelect from '../../ui/BaseButtonSelect.vue';
import BaseButton from '../../ui/BaseButton.vue';
import { computed } from 'vue';

const props = defineProps({
    activeEntity: {
        type: Object,
        default: () => { }
    }
})
const emit = defineEmits(['onCreate', 'onDeleteEntity', 'onEditEntity', 'onStartSimulation', 'onSaveScheme', 'onLoadScheme'])

const createSelectOptions = [
    {
        id: 0,
        text: 'Блок if',
        value: 'if'
    },
    {
        id: 1,
        text: 'Блок or',
        value: 'or'
    },
    {
        id: 2,
        text: 'Блок and',
        value: 'and'
    },
    {
        id: 3,
        text: 'Блок not',
        value: 'not'
    },
    {
        id: 4,
        text: 'Блок elseif',
        value: 'elseif'
    },
]

const notEditableEntity = computed(() => {
    return !props.activeEntity || props.activeEntity.is === 'edge' || (props.activeEntity.type !== 'if' && props.activeEntity.type !== 'elseif')
})

function handleCreate(type) {
    emit('onCreate', type);
}

function handleDeleteEntity(entity) {
    emit('onDeleteEntity', entity)
}

function handlerEditEntity(entity) {
    emit('onEditEntity', entity)
}

function handleStart() {
    emit('onStartSimulation')
}

function handleSaveScheme() {
    emit('onSaveScheme')
}

function handleLoadScheme() {
    emit('onLoadScheme')
}

</script>

<template>
    <div class="fixed flex-wrap left-4 bottom-4 flex gap-10 gap-y-1 text-white">
        <div class="flex flex-wrap rounded bg-neutral-900">
            <BaseButtonSelect value="Создать" :options="createSelectOptions" class="border-r border-stone-600"
                @onSelect="handleCreate" />

            <BaseButton value="Изменить" class="border-r border-stone-600" :disabled="notEditableEntity"
                @click="() => handlerEditEntity(activeEntity)" />

            <BaseButton value="Удалить" @click="() => handleDeleteEntity(activeEntity)"
                :disabled="!activeEntity || activeEntity.is === 'start'" />
        </div>

        <div class="flex flex-wrap rounded bg-neutral-900">
            <BaseButton value="Запуск" variant="success" @click="handleStart" />
        </div>

        <div class="flex flex-wrap">
            <BaseButton value="Загрузить схему" @click="handleLoadScheme" />
            <BaseButton value="Сохранить схему" @click="handleSaveScheme" />
        </div>
    </div>
</template>