<script setup>
import { computed, ref, watch } from 'vue';
import BaseModal from '../../ui/BaseModal.vue';
import BaseButton from '../../ui/BaseButton.vue';

const props = defineProps({
    entity: {
        type: Object,
        default: () => { }
    }
})

const emit = defineEmits(['onSaveLogic', 'onSaveValue'])
const visible = defineModel('visible')

const logic = ref('');
const value = ref('')

watch(
    visible,
    (newValue) => {
        if (newValue) {
            props.entity.is === 'start'
                ? value.value = props.entity.innerValue
                : logic.value = props.entity.innerLogic
        }
    }
)

function saveLogic() {
    emit('onSaveLogic', props.entity.id, logic.value)
    visible.value = false
}

function saveValue() {
    emit('onSaveValue', props.entity.id, value.value)
    visible.value = false
}
</script>

<template>
    <BaseModal v-model:visible="visible">
        <template #header>
            <template v-if="entity.is === 'start'">
                Начальное значение
            </template>

            <template v-else>
                Внутренняя логика узла #{{ entity.id }}
            </template>
        </template>

        <div v-if="entity.is === 'start'">
            <label>
                <div class="mb-1">Значение стартового узла:</div>
                <input class="bg-gray-200 outline-none text-black px-2 py-1 w-full mb-2 rounded" type="text"
                    placeholder="20" v-model="value">
            </label>

            <div class="mb-4 text-sm text-green-300">
                Задайте значение, которому будет равен output узла
            </div>

            <div class="flex gap-2 justify-end">
                <BaseButton value="Отмена" variant="danger" @click="visible = false" />
                <BaseButton value="Сохранить" variant="secondary" @click="saveValue" />
            </div>
        </div>
        <div v-else>
            <label>
                <div class="mb-1">Логическое выражение:</div>
                <input class="bg-gray-200 outline-none text-black px-2 py-1 w-full mb-2 rounded" type="text"
                    placeholder="input > 2" v-model="logic">
            </label>

            <div class="mb-4 text-sm text-green-300">
                input - входное значение
            </div>

            <div class="flex gap-2 justify-end">
                <BaseButton value="Отмена" variant="danger" @click="visible = false" />
                <BaseButton value="Сохранить" variant="secondary" @click="saveLogic" />
            </div>
        </div>
    </BaseModal>
</template>