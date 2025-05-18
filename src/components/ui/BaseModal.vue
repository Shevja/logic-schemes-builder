<script setup>
import { Teleport } from 'vue';

const visible = defineModel('visible')
</script>

<template>
    <Teleport to="body">
        <transition name="fade">
            <div v-if="visible" class="fixed bg-slate-950/50 inset-0 flex justify-center items-center"
                @click.self="visible = false">
                <div class="relative border border-gray-500 bg-slate-950 min-w-120 max-w-full text-white rounded">
                    <div class="flex h-full">
                        <h3 class="w-full text-xl py-1 px-4 border-b border-slate-700">
                            <slot name="header"></slot>
                        </h3>

                        <button
                            class="bg-red-500 text-white hover:bg-red-600 w-10 flex justify-center items-center hover:cursor-pointer rounded"
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