import type { Meta, StoryObj } from '@storybook/vue3';
import InfoDialog from './InfoDialog.vue';

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

const meta: Meta<typeof InfoDialog> = {
    title: 'Molecules/Medications/InfoDialog',
    component: InfoDialog,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InfoDialog>;

export const Default: Story = {
    args: {
        close: () => { },
        isPersistent: false,
        scrim: true,
        data: baseMedication,
    },
};

export const NoPrice: Story = {
    args: {
        close: () => { },
        isPersistent: false,
        scrim: true,
        data: {
            ...baseMedication,
            name: 'Générique sans prix',
            details: {
                ...baseMedication.details,
                presentations: [],
            },
        },
    },
};
