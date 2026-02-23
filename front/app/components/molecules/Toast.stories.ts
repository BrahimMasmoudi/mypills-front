import type { Meta, StoryObj } from '@storybook/vue3';
import Toast from './Toast.vue';

const meta: Meta<typeof Toast> = {
    title: 'Molecules/Toast',
    component: Toast,
    tags: ['autodocs'],
    argTypes: {
        close: { action: 'close' },
    },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Success: Story = {
    args: {
        scrim: false,
        isPersistent: false,
        toastType: 'success',
        message: 'Medication added successfully!',
        close: () => { },
    },
};

export const Error: Story = {
    args: {
        scrim: false,
        isPersistent: false,
        toastType: 'error',
        message: 'An error occurred while saving.',
        close: () => { },
    },
};
