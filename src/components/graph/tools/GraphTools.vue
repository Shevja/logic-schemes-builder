<script setup>
import GraphToolsButton from './ui/GraphToolsButton.vue';

const emit = defineEmits(['onCreate'])
</script>

<template>
    <div class="fixed left-10 bottom-4 flex border border-gray-700 rounded-lg bg-gray-800 text-white">
        <GraphToolsButton value="Создать" class="border-r border-gray-700 rounded-l-lg" @click="emit('onCreate')" />
        <GraphToolsButton value="Удалить" class="border-r border-gray-700"  />
        <GraphToolsButton value="Редактировать" class="rounded-r-lg" />
    </div>
</template>