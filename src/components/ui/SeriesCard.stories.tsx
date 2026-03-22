import type { Meta, StoryObj } from '@storybook/react';
import { SeriesCard } from './SeriesCard';

const mockSeries = {
  id: '1',
  title: 'Breaking Bad',
  slug: 'breaking-bad',
  synopsis: 'Um professor de química do ensino médio se torna fabricante de metanfetamina.',
  poster_url: '',
  backdrop_url: '',
  year: 2008,
  genre: 'Drama',
  rating: 9.5,
  category: 'Drama',
  featured: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const meta: Meta<typeof SeriesCard> = {
  title: 'UI/SeriesCard',
  component: SeriesCard,
  tags: ['autodocs'],
  args: {
    series: mockSeries,
    index: 0,
  },
};

export default meta;
type Story = StoryObj<typeof SeriesCard>;

export const Default: Story = {};

export const Featured: Story = {
  args: {
    series: { ...mockSeries, featured: true },
  },
};

export const NoImage: Story = {
  args: {
    series: { ...mockSeries, poster_url: '' },
  },
};
