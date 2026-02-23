import type { Meta, StoryObj } from '@storybook/vue3';
import SkeletonLoader from './SkeletonLoader.vue';

const meta: Meta<typeof SkeletonLoader> = {
    title: 'Molecules/Reminder/SkeletonLoader',
    component: SkeletonLoader,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SkeletonLoader>;

export const Default: Story = {};
