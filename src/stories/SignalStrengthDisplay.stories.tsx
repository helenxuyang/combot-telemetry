import type { Meta, StoryObj } from "@storybook/react-vite";

import { SignalStrengthDisplay } from "../features/live/components/SignalStrengthDisplay";

const meta = {
  title: "SignalStrengthDisplay",
  component: SignalStrengthDisplay,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof SignalStrengthDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    signalStrength: 0,
  },
};

export const Values: Story = {
  args: {
    signalStrength: 0,
  },
  render: (_) => (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(3, 100px)`,
          gap: "8px",
        }}
      >
        {Array(7)
          .fill(0)
          .map((_, i) => (
            <SignalStrengthDisplay signalStrength={-20 + i * 5} />
          ))}
      </div>
    </div>
  ),
};
