import type { Meta, StoryObj } from '@storybook/vue3';
import SearchInput from './SearchInput.vue';

const meta: Meta<typeof SearchInput> = {
    title: 'Atoms/SearchInput',
    component: SearchInput,
    tags: ['autodocs'],
    argTypes: {
        'onUpdate:modelValue': { action: 'update:modelValue' },
    },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Empty: Story = {
    args: {
        modelValue: '',
        label: 'Rechercher',
        placeholder: 'Nom du médicament...',
    },
};

export const WithValue: Story = {
    args: {
        modelValue: 'Doliprane',
        label: 'Rechercher',
        placeholder: 'Nom du médicament...',
    },
};

export const WithoutLabel: Story = {
    args: {
        modelValue: '',
        placeholder: 'Rechercher...',
    },
};
