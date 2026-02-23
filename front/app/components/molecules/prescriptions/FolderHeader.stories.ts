import type { Meta, StoryObj } from '@storybook/vue3';
import FolderHeader from './FolderHeader.vue';

const meta: Meta<typeof FolderHeader> = {
    title: 'Molecules/Prescriptions/FolderHeader',
    component: FolderHeader,
    tags: ['autodocs'],
    argTypes: {
        onRename: { action: 'rename' },
        onDelete: { action: 'delete' },
    },
};

export default meta;
type Story = StoryObj<typeof FolderHeader>;

export const Default: Story = {
    args: {
        folderName: 'Mon dossier médical',
        docCountLabel: '3 documents',
    },
};

export const SingleDocument: Story = {
    args: {
        folderName: 'Analyses sanguines',
        docCountLabel: '1 document',
    },
};

export const LongName: Story = {
    args: {
        folderName: 'Ordonnances et prescriptions médicales 2024',
        docCountLabel: '12 documents',
    },
};
