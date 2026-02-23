import type { Meta, StoryObj } from '@storybook/vue3';
import SortButton from './SortButton.vue';

const meta: Meta<typeof SortButton> = {
    title: 'Atoms/SortButton',
    component: SortButton,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SortButton>;

export const Inactive: Story = {
    args: {
        sortLabel: 'Nom',
        sortIcon: 'mdi-sort-alphabetical-ascending',
        isActive: false,
    },
};

export const ActiveAscending: Story = {
    args: {
        sortLabel: 'Nom',
        sortIcon: 'mdi-sort-alphabetical-ascending',
        isActive: true,
        sortOrder: 'asc',
    },
};

export const ActiveDescending: Story = {
    args: {
        sortLabel: 'Date d\'expiration',
        sortIcon: 'mdi-calendar',
        isActive: true,
        sortOrder: 'desc',
    },
};
