<script setup>
const props = defineProps({
    entityInfo: {
        type: Object,
        default: ''
    }
})
</script>

<template>
    <div v-if="entityInfo" class="fixed bottom-4 right-4 py-1 px-2 bg-slate-950 text-white rounded">
        <ul>
            <li>id: {{ entityInfo.id }}</li>
            <li>type: {{ entityInfo.type }}</li>
            <li>input: {{ !!entityInfo.connected }}</li>
            <li>output: {{ !!entityInfo.connected }}</li>
            <li v-if="entityInfo.type === 'if'">output secondary: {{ !!entityInfo.connected }}</li>
            <li v-if="entityInfo.type === 'and' || entityInfo.type === 'or'">input secondary: {{ !!entityInfo.connected }}</li>
        </ul>
    </div>
</template>