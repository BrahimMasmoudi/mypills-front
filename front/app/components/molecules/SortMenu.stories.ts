import type { Meta, StoryObj } from '@storybook/vue3';
import SortMenu from './SortMenu.vue';

const sortOptions = [
    { value: 'name', label: 'sort.name', icon: 'mdi-sort-alphabetical-ascending' },
    { value: 'expiryDate', label: 'sort.expiryDate', icon: 'mdi-calendar' },
    { value: 'quantity', label: 'sort.quantity', icon: 'mdi-counter' },
];

const meta: Meta<typeof SortMenu> = {
    title: 'Molecules/SortMenu',
    component: SortMenu,
    tags: ['autodocs'],
    argTypes: {
        'onUpdate:sortBy': { action: 'update:sortBy' },
        onClear: { action: 'clear' },
    },
};

export default meta;
type Story = StoryObj<typeof SortMenu>;

export const NoSort: Story = {
    args: {
        sortBy: null,
        sortOrder: 'asc',
        sortOptions,
    },
};

export const SortedByName: Story = {
    args: {
        sortBy: 'name',
        sortOrder: 'asc',
        sortOptions,
    },
};

export const SortedByDateDesc: Story = {
    args: {
        sortBy: 'expiryDate',
        sortOrder: 'desc',
        sortOptions,
    },
};
