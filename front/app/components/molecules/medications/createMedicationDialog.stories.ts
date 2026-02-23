import type { Meta, StoryObj } from '@storybook/vue3';
import CreateMedicationDialog from './CreateMedicationDialog.vue';

const meta: Meta<typeof CreateMedicationDialog> = {
    title: 'Molecules/Medications/CreateMedicationDialog',
    component: CreateMedicationDialog,
    tags: ['autodocs'],
    argTypes: {
        close: { action: 'close' },
        createMedication: { action: 'createMedication' },
    },
};

export default meta;
type Story = StoryObj<typeof CreateMedicationDialog>;

export const Default: Story = {
    args: {
        isPersistent: true,
        scrim: true,
        userUid: 'user-123',
        email: 'user@example.com',
        medications: [],
        selectedCountry: 'FR',
        // Mocking the injected $device and $open since they are used in the component
        // In a real Storybook setup, these would be provided via a decorator or global config
    } as any,
    parameters: {
        // Ensuring the dialog is visible in Storybook
        layout: 'centered',
    },
};
