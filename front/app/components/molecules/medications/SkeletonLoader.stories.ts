import type { Meta, StoryObj } from '@storybook/vue3';

// SkeletonLoader has no props – it is a pure loading placeholder
// We use a plain component reference
const meta: Meta = {
    title: 'Molecules/Medications/SkeletonLoader',
    component: () => import('./SkeletonLoader.vue'),
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
