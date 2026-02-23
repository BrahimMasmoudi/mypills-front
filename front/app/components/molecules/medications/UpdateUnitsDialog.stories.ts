import type { Meta, StoryObj } from '@storybook/vue3';
import UpdateUnitsDialog from './UpdateUnitsDialog.vue';

const medication = {
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
    details: null,
} as any;

const meta: Meta<typeof UpdateUnitsDialog> = {
    title: 'Molecules/Medications/UpdateUnitsDialog',
    component: UpdateUnitsDialog,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UpdateUnitsDialog>;

export const Default: Story = {
    args: {
        close: () => { },
        isPersistent: false,
        scrim: true,
        medication,
    },
};
