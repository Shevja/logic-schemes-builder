<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
    value: {
        type: String,
        default: ''
    },
    options: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['onSelect'])

const menu = ref(null)
const menuVisible = ref(false)
const menuPositionTop = ref(false)
const selectWrapper = ref(null)

const menuClass = computed(() => {
    return [
        'absolute',
        '-left-px',
        'w-max',
        'bg-neutral-900',
        'border',
        'border-stone-400',
        menuPositionTop.value ? '-top-1' : 'bottom-1',
        menuPositionTop.value ? '-translate-y-full' : 'translate-y-full',
    ]
})

function toggleMenu() {
    menuVisible.value = !menuVisible.value;

    if (menuVisible.value) {
        nextTick(updatePosition)
        document.addEventListener('click', handleClickOutside)
    }
}

function updatePosition() {
    const menuRect = menu.value.getBoundingClientRect();

    if (menuRect.bottom + 100 > window.innerHeight) {
        menuPositionTop.value = true;
    } else {
        menuPositionTop.value = false;
    }
}

function handleClickOutside(e) {
    if (menuVisible.value && !selectWrapper.value.contains(e.target)) {
        menuVisible.value = false
    }
}

function handleOptionSelect(option) {
    emit('onSelect', option)
}

onBeforeUnmount(() => {
    if (menuVisible.value) {
        document.removeEventListener('click', handleClickOutside)
    }
})

</script>

<template>
    <div ref="selectWrapper" class="relative">
        <BaseButton :value="value" :class="['w-full', menuVisible ? 'bg-stone-950' : 'bg-neutral-900']"
            @click="toggleMenu" />

        <transition name="fade">
            <div v-if="menuVisible" ref="menu" :class="menuClass">
                <template v-for="option in options" :key="option.id">
                    <BaseButton :value="option.text" class="w-full border-b border-stone-800"
                        @click="() => handleOptionSelect(option.value)" />
                </template>
            </div>
        </transition>
    </div>
</template>