import type { Meta, StoryObj } from "@storybook/react-vite";
import { JoystickDisplay } from "../JoystickDisplay";

const meta = {
  title: "JoystickDisplay",
  component: JoystickDisplay,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof JoystickDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Zero: Story = {
  args: {
    xInput: 0,
    yInput: 0,
  },
};

export const Right: Story = {
  args: {
    xInput: 100,
    yInput: 0,
  },
};

export const Up: Story = {
  args: {
    xInput: 0,
    yInput: 100,
  },
};

export const Left: Story = {
  args: {
    xInput: -100,
    yInput: 0,
  },
};

export const Down: Story = {
  args: {
    xInput: 0,
    yInput: -100,
  },
};

export const ForwardsRightFull: Story = {
  args: {
    xInput: 100,
    yInput: 100,
  },
};

export const ForwardsRightHalf: Story = {
  args: {
    xInput: 50,
    yInput: 50,
  },
};

export const CustomMaxForwardRight: Story = {
  args: {
    xInput: 44,
    yInput: 33,
    xMax: 44,
    yMax: 33,
  },
};
