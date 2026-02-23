import type { Meta, StoryObj } from '@storybook/vue3';
import DuplicateConfirmDialog from './DuplicateConfirmDialog.vue';

const meta: Meta<typeof DuplicateConfirmDialog> = {
    title: 'Molecules/DuplicateConfirmDialog',
    component: DuplicateConfirmDialog,
    tags: ['autodocs'],
    argTypes: {
        close: { action: 'close' },
    },
};

export default meta;
type Story = StoryObj<typeof DuplicateConfirmDialog>;

export const Default: Story = {
    args: {
        isPersistent: true,
        scrim: true,
        medicationName: 'Doliprane 1000mg',
        expiryDate: new Date(2027, 10, 1),
        close: () => { },
    },
};
