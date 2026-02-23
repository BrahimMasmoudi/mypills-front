import type { Meta, StoryObj } from '@storybook/vue3';
import LoadingMed from './LoadingMed.vue';

const meta: Meta<typeof LoadingMed> = {
    title: 'Atoms/LoadingMed',
    component: LoadingMed,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LoadingMed>;

export const Default: Story = {};
