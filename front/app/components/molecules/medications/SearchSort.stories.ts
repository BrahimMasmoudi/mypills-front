import type { Meta, StoryObj } from '@storybook/vue3';
import SearchSort from './SearchSort.vue';

const sortOptions = [
    { value: 'name', label: 'sort.name', icon: 'mdi-sort-alphabetical-ascending' },
    { value: 'expiryDate', label: 'sort.expiryDate', icon: 'mdi-calendar' },
    { value: 'quantity', label: 'sort.quantity', icon: 'mdi-counter' },
];

const meta: Meta<typeof SearchSort> = {
    title: 'Molecules/Medications/SearchSort',
    component: SearchSort,
    tags: ['autodocs'],
    argTypes: {
        'onUpdate:searchQuery': { action: 'update:searchQuery' },
        'onUpdate:sortBy': { action: 'update:sortBy' },
        'onUpdate:viewType': { action: 'update:viewType' },
        onToggleSortOrder: { action: 'toggleSortOrder' },
    },
};

export default meta;
type Story = StoryObj<typeof SearchSort>;

export const Desktop: Story = {
    args: {
        searchQuery: '',
        sortBy: null,
        sortOrder: 'asc',
        sortOptions,
        isMobile: false,
        viewType: 'grid',
    },
};

export const DesktopWithSort: Story = {
    args: {
        searchQuery: 'Dolip',
        sortBy: 'name',
        sortOrder: 'asc',
        sortOptions,
        isMobile: false,
        viewType: 'table',
    },
};

export const Mobile: Story = {
    args: {
        searchQuery: '',
        sortBy: null,
        sortOrder: 'asc',
        sortOptions,
        isMobile: true,
        viewType: 'grid',
    },
};
