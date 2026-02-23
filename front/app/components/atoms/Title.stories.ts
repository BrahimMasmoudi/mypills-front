import type { Meta, StoryObj } from '@storybook/vue3';
import Title from './Title.vue';

const meta: Meta<typeof Title> = {
    title: 'Atoms/Title',
    component: Title,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Title>;

export const Default: Story = {
    args: {
        title: 'Mes médicaments',
    },
};

export const LongTitle: Story = {
    args: {
        title: 'Liste complète de mes médicaments et traitements en cours',
    },
};
