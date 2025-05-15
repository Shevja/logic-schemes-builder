<script setup>
import { ref } from 'vue';
import GraphToolsButton from './ui/GraphToolsButton.vue';
import BaseModal from '../../ui/BaseModal.vue';

const emit = defineEmits(['onCreate'])

const createModalVisible = ref(false);

function handleCreate() {
    createModalVisible.value = true
    // emit('onCreate');
}
</script>

<template>
    <div class="fixed left-10 bottom-4 flex border border-neutral-400 bg-neutral-900 text-white">
        <GraphToolsButton value="Создать" class="border-r border-neutral-600" @click="handleCreate" />
        <GraphToolsButton value="Удалить" class="border-r border-neutral-600" />
        <GraphToolsButton value="Редактировать" />
    </div>

    <BaseModal v-model:visible="createModalVisible">
        <template v-slot:header>
            Test
        </template>

        test
    </BaseModal>
</template>