import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Common/Sidebar',
  component: Sidebar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
  },
};


