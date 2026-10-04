import type { Meta, StoryObj } from "@storybook/react-vite";
import { DirectionalCanvasBar } from "../features/live/components/DirectionalCanvasBar";

const meta = {
  title: "DirectionalCanvasBar",
  component: DirectionalCanvasBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof DirectionalCanvasBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ZeroVertical: Story = {
  args: {
    percent: 0,
    color: "blue",
    orientation: "vertical",
  },
};

export const FullPositiveVertical: Story = {
  args: {
    percent: 100,
    color: "blue",
    orientation: "vertical",
  },
};

export const FullNegativeVertical: Story = {
  args: {
    percent: -100,
    color: "blue",
    orientation: "vertical",
  },
};

export const HalfPositiveVertical: Story = {
  args: {
    percent: 50,
    color: "blue",
    orientation: "vertical",
  },
};

export const HalfNegativeVertical: Story = {
  args: {
    percent: -50,
    color: "blue",
    orientation: "vertical",
  },
};

export const ZeroHorizontal: Story = {
  args: {
    percent: 0,
    color: "blue",
    orientation: "horizontal",
  },
};

export const FullPositiveHorizontal: Story = {
  args: {
    percent: 100,
    color: "blue",
    orientation: "horizontal",
  },
};

export const FullNegativeHorizontal: Story = {
  args: {
    percent: -100,
    color: "blue",
    orientation: "horizontal",
  },
};

export const HalfPositiveHorizontal: Story = {
  args: {
    percent: 50,
    color: "blue",
    orientation: "horizontal",
  },
};

export const HalfNegativeHorizontal: Story = {
  args: {
    percent: -50,
    color: "blue",
    orientation: "horizontal",
  },
};
