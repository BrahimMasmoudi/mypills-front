import type { Meta, StoryObj } from '@storybook/vue3';
import Pills from './Pills.vue';

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
        ingredients: [{ substance: 'Paracétamol', dosage: '1000mg' }],
        presentations: [{ price: 2.50, refundRate: '65%' }],
    },
} as any;

const meta: Meta<typeof Pills> = {
    title: 'Molecules/Pills',
    component: Pills,
    tags: ['autodocs'],
    argTypes: {
        onIncrementPills: { action: 'increment-pills' },
        onDecrementPills: { action: 'decrement-pills' },
        onDeletePills: { action: 'delete-pills' },
        onUpdateMedicationName: { action: 'update-medication-name' },
    },
};

export default meta;
type Story = StoryObj<typeof Pills>;

export const SingleMedication: Story = {
    args: {
        medications: [baseMedication],
    },
};

export const MultipleMedications: Story = {
    args: {
        medications: [
            { ...baseMedication, medicationId: 'med-1', name: 'Doliprane 1000mg', quantity: 24 },
            { ...baseMedication, medicationId: 'med-2', name: 'Ibuprofène 400mg', quantity: 12, expired: false, expiryDate: new Date(2026, 8, 1) },
            { ...baseMedication, medicationId: 'med-3', name: 'Amoxicilline 500mg', quantity: 6 },
            { ...baseMedication, medicationId: 'med-4', name: 'Aspirine', quantity: 0, expired: true, expiryDate: new Date(2023, 0, 1) },
        ],
    },
};

export const EmptyList: Story = {
    args: {
        medications: [],
    },
};
