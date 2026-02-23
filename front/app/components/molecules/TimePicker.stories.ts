import type { Meta, StoryObj } from '@storybook/vue3';
import TimePicker from './TimePicker.vue';

const meta: Meta<typeof TimePicker> = {
    title: 'Molecules/TimePicker',
    component: TimePicker,
    tags: ['autodocs'],
    argTypes: {
        'onUpdate:modelValue': { action: 'update:modelValue' },
    },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Empty: Story = {
    args: {
        modelValue: '',
    },
};

export const WithValue: Story = {
    args: {
        modelValue: '08:30',
    },
};
