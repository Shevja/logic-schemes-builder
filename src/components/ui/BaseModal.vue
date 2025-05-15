<script setup>
import { Teleport } from 'vue';

const props = defineProps({

})

const visible = defineModel('visible')
</script>

<template>
    <Teleport to="body">
        <transition name="fade">
            <div v-if="visible" class="fixed bg-slate-950/50 inset-0 flex justify-center items-center">
                <div class="relative bg-slate-950 min-w-120 max-w-full text-white">
                    <div class="flex border-b border-slate-700 h-full">
                        <h3 class="w-full text-lg py-1 px-4">
                            <slot name="header"></slot>
                        </h3>

                        <button
                            class="bg-red-500 text-white hover:bg-red-600 w-10 flex justify-center items-center hover:cursor-pointer"
                            @click="visible = false">🞩</button>
                    </div>
                    <div class="px-4 py-3">
                        <slot></slot>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
}
</style>