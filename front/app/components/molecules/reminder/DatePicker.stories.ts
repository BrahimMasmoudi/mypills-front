import type { Meta, StoryObj } from '@storybook/vue3';
import DatePicker from './DatePicker.vue';

const meta: Meta<typeof DatePicker> = {
    title: 'Molecules/Reminder/DatePicker',
    component: DatePicker,
    tags: ['autodocs'],
    argTypes: {
        'onUpdate:startDate': { action: 'update:startDate' },
        'onUpdate:endDate': { action: 'update:endDate' },
    },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
    args: {
        startDate: new Date(),
        endDate: new Date(),
    },
};

export const WithRange: Story = {
    args: {
        startDate: new Date(2025, 0, 5),
        endDate: new Date(2025, 0, 10),
    },
};
