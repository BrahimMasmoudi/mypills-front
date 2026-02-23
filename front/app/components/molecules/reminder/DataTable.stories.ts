import type { Meta, StoryObj } from '@storybook/vue3';
import DataTable from './DataTable.vue';

const statusConfig = {
    pending: { color: 'warning', icon: 'mdi-clock-outline' },
    done: { color: 'success', icon: 'mdi-check-circle-outline' },
};

const headers = [
    { key: 'sicknessName', title: 'Illness' },
    { key: 'medName', title: 'Medications' },
    { key: 'dateRange', title: 'Dates' },
    { key: 'doses', title: 'Doses' },
    { key: 'status', title: 'Status' },
    { key: 'actions', title: '' },
];

const items = [
    {
        ids: ['r1'],
        sicknessName: 'Grippe',
        medNames: ['Doliprane 1000mg', 'Ibuprofène'],
        startDate: new Date(2025, 0, 5),
        endDate: new Date(2025, 0, 10),
        doses: [{ time: '08:00', quantity: 1 }, { time: '20:00', quantity: 1 }],
        status: 'pending',
    },
    {
        ids: ['r2'],
        sicknessName: 'Angine',
        medNames: ['Amoxicilline 500mg'],
        startDate: new Date(2024, 11, 1),
        endDate: new Date(2024, 11, 10),
        doses: [{ time: '07:00', quantity: 2 }],
        status: 'done',
    },
];

const meta: Meta<typeof DataTable> = {
    title: 'Molecules/Reminder/DataTable',
    component: DataTable,
    tags: ['autodocs'],
    argTypes: {
        onDelete: { action: 'delete' },
        onEdit: { action: 'edit' },
        'onFinish-treatment': { action: 'finish-treatment' },
    },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

export const Loaded: Story = {
    args: {
        items,
        headers,
        loading: false,
        statusConfig,
    },
};

export const Loading: Story = {
    args: {
        items: [],
        headers,
        loading: true,
        statusConfig,
    },
};

export const Empty: Story = {
    args: {
        items: [],
        headers,
        loading: false,
        statusConfig,
    },
};
