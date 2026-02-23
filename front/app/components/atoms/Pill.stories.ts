import type { Meta, StoryObj } from '@storybook/vue3';
import Pill from './Pill.vue';

const meta: Meta<typeof Pill> = {
    title: 'Atoms/Pill',
    component: Pill,
    tags: ['autodocs'],
    argTypes: {
        onIncrementPills: { action: 'increment-pills' },
        onDecrementPills: { action: 'decrement-pills' },
        onDeletePills: { action: 'delete-pills' },
        onUpdateMedicationName: { action: 'update-medication-name' },
    },
};

export default meta;
type Story = StoryObj<typeof Pill>;

const baseMedication = {
    expiryDate: new Date(2027, 4, 1),
    uid: 'user-123',
    expired: false,
    quantity: 24,
    unitsPerBox: 30,
    numberOfBoxes: 1,
    name: 'Doliprane 1000mg',
    medicationId: 'med-1',
    image: 'pill-1',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    details: {
        form: 'Comprimé',
        administrationRoutes: ['Orale'],
        company: 'Generic Lab',
        ingredients: [
            { substance: 'Paracétamol', dosage: '1000mg' }
        ],
        presentations: [
            { price: 2.50, refundRate: '65%' }
        ]
    }
} as any;

export const Default: Story = {
    args: {
        medication: { ...baseMedication },
    },
};

export const Expired: Story = {
    args: {
        medication: {
            ...baseMedication,
            expired: true,
            name: 'Old Medication',
            expiryDate: new Date(2023, 0, 1),
        },
    },
};

export const Scanned: Story = {
    args: {
        medication: {
            ...baseMedication,
            bareCode: '1234567890123',
            name: 'Old Medication',
            expiryDate: new Date(2023, 0, 1),
        },
    },
}