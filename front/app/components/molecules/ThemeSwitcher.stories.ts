import type { Meta, StoryObj } from '@storybook/vue3';
import ThemeSwitcher from './ThemeSwitcher.vue';

const meta: Meta<typeof ThemeSwitcher> = {
    title: 'Molecules/ThemeSwitcher',
    component: ThemeSwitcher,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ThemeSwitcher>;

export const Default: Story = {};
