import type { Meta, StoryObj } from '@storybook/vue3';
import SortToggleButton from './SortToggleButton.vue';

const meta: Meta<typeof SortToggleButton> = {
    title: 'Atoms/SortToggleButton',
    component: SortToggleButton,
    tags: ['autodocs'],
    argTypes: {
        onToggle: { action: 'toggle' },
        variant: {
            control: 'select',
            options: ['text', 'flat', 'elevated', 'outlined', 'plain', 'tonal'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof SortToggleButton>;

export const Ascending: Story = {
    args: {
        sortOrder: 'asc',
        title: 'Trier',
    },
};

export const Descending: Story = {
    args: {
        sortOrder: 'desc',
        title: 'Trier',
    },
};

export const CustomStyle: Story = {
    args: {
        sortOrder: 'asc',
        title: 'Trier',
        variant: 'tonal',
        color: 'secondary',
        size: 'small',
    },
};
