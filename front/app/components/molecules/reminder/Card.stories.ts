import type { Meta, StoryObj } from '@storybook/vue3';
import Card from './Card.vue';

const meta: Meta<typeof Card> = {
    title: 'Molecules/Reminder/Card',
    component: Card,
    tags: ['autodocs'],
    argTypes: {
        onDelete: { action: 'delete' },
        onEdit: { action: 'edit' },
        onFinishTreatment: { action: 'finish-treatment' },
    },
};

export default meta;
type Story = StoryObj<typeof Card>;

const statusConfig = {
    pending: { color: 'warning' },
    done: { color: 'success' },
    failed: { color: 'error' },
};

export const Pending: Story = {
    args: {
        statusConfig,
        item: {
            sicknessName: 'Flu Treatment',
            medNames: ['Paracetamol'],
            medications: [
                {
                    name: 'Paracetamol',
                    doses: [
                        { time: '08:00', quantity: 1 },
                        { time: '20:00', quantity: 1 },
                    ],
                },
            ],
            startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),   // 5 days from now
            ids: ['1'],
            status: 'pending',
        } as any,
    },
};

export const Done: Story = {
    args: {
        statusConfig,
        item: {
            sicknessName: 'Vitamin C Course',
            medNames: ['Vitamin C'],
            medications: [
                {
                    name: 'Vitamin C',
                    doses: [
                        { time: '09:00', quantity: 1 },
                    ],
                },
            ],
            startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),    // 1 day ago
            ids: ['2'],
            status: 'done',
        } as any,
    },
};
