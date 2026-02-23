import type { Meta, StoryObj } from '@storybook/vue3';
import DocumentCard from './DocumentCard.vue';

const meta: Meta<typeof DocumentCard> = {
    title: 'Molecules/Prescriptions/DocumentCard',
    component: DocumentCard,
    tags: ['autodocs'],
    argTypes: {
        onView: { action: 'view' },
        onDelete: { action: 'delete' },
        onRename: { action: 'rename' },
        onShare: { action: 'share' },
    },
};

export default meta;
type Story = StoryObj<typeof DocumentCard>;

export const Default: Story = {
    args: {
        doc: {
            name: 'Prescription_2024.pdf',
            fileUrl: 'https://example.com/file.pdf',
        },
        formattedDate: 'June 15, 2024',
    },
};

export const LongName: Story = {
    args: {
        doc: {
            name: 'Very_Long_Prescription_Name_From_Hospital_Visit_Specialist.pdf',
            fileUrl: 'https://example.com/file.pdf',
        },
        formattedDate: 'Yesterday',
    },
};
