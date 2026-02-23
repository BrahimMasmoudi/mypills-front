import type { Meta, StoryObj } from '@storybook/vue3';
import SortBottomSheet from './SortBottomSheet.vue';

const sortOptions = [
    { value: 'name', label: 'sort.name', icon: 'mdi-sort-alphabetical-ascending' },
    { value: 'expiryDate', label: 'sort.expiryDate', icon: 'mdi-calendar' },
    { value: 'quantity', label: 'sort.quantity', icon: 'mdi-counter' },
];

const meta: Meta<typeof SortBottomSheet> = {
    title: 'Molecules/SortBottomSheet',
    component: SortBottomSheet,
    tags: ['autodocs'],
    argTypes: {
        'onUpdate:modelValue': { action: 'update:modelValue' },
        'onUpdate:sortBy': { action: 'update:sortBy' },
        onToggleOrder: { action: 'toggleOrder' },
        onClear: { action: 'clear' },
    },
};

export default meta;
type Story = StoryObj<typeof SortBottomSheet>;

export const Open: Story = {
    args: {
        modelValue: true,
        sortBy: null,
        sortOrder: 'asc',
        sortOptions,
    },
};

export const OpenWithSortSelected: Story = {
    args: {
        modelValue: true,
        sortBy: 'name',
        sortOrder: 'asc',
        sortOptions,
    },
};

export const Closed: Story = {
    args: {
        modelValue: false,
        sortBy: null,
        sortOrder: 'asc',
        sortOptions,
    },
};
