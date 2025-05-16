<script setup>
import { ref } from 'vue';
import BaseButtonSelect from '../../ui/BaseButtonSelect.vue';
import BaseButton from '../../ui/BaseButton.vue';

const emit = defineEmits(['onCreate'])

const createModalVisible = ref(false);
const createSelectOptions = ref([
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
])

function handleCreate(type) {
    emit('onCreate', type);
}
</script>

<template>
    <div class="fixed left-10 bottom-4 flex border border-stone-400 bg-neutral-900 text-white">
        <BaseButtonSelect value="Создать" :options="createSelectOptions" class="border-r border-stone-600"
            @onSelect="handleCreate" />
        <BaseButton value="Удалить" class="border-r border-stone-600" />
        <BaseButton value="Редактировать" />
    </div>
</template>