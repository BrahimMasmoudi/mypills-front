import type { Meta, StoryObj } from '@storybook/vue3';
import Table from './Table.vue';

const meta: Meta<typeof Table> = {
    title: 'Molecules/Medications/Table',
    component: Table,
    tags: ['autodocs'],
    argTypes: {
        onIncrementPills: { action: 'increment-pills' },
        onDecrementPills: { action: 'decrement-pills' },
        onDeletePills: { action: 'delete-pills' },
        onUpdateMedicationName: { action: 'update-medication-name' },
    },
};

export default meta;
type Story = StoryObj<typeof Table>;

const medications = [
    {
        medicationId: '1',
        name: 'Doliprane 1000mg',
        numberOfBoxes: 2,
        quantity: 16,
        expiryDate: new Date(2027, 4, 1),
        expired: false,
        bareCode: '12345',
        details: { form: 'Comprimé' }
    },
    {
        medicationId: '2',
        name: 'Amoxicilline',
        numberOfBoxes: 1,
        quantity: 12,
        expiryDate: new Date(2023, 10, 1),
        expired: true,
        details: { form: 'Gélule' }
    },
    {
        medicationId: '3',
        name: 'Spasfon',
        numberOfBoxes: 3,
        quantity: 30,
        expiryDate: new Date(2026, 0, 1),
        expired: false,
    }
];

export const Default: Story = {
    args: {
        medications: medications as any,
    },
};

export const Empty: Story = {
    args: {
        medications: [],
    },
};
