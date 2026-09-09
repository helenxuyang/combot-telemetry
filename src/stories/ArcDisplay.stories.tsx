import type { Meta, StoryObj } from "@storybook/react-vite";

import { ComponentProps } from "react";
import { ArcDisplay } from "../features/live/components/ArcDisplay";

const meta = {
  title: "ArcDisplay",
  component: ArcDisplay,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof ArcDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs: ComponentProps<typeof ArcDisplay> = {
  innerName: "current",
  innerValue: 20,
  innerMin: 0,
  innerMax: 100,
  innerColorIndicators: [],
  outerName: "rpm",
  outerValue: 80,
  outerMin: 0,
  outerMax: 100,
  outerColorIndicators: [],
  maxWidth: 500,
};

export const Default: Story = {
  args: defaultArgs,
};

const width = 300;
export const Values: Story = {
  args: defaultArgs,
  render: (args) => (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(3, ${width}px)`,
          gap: "8px",
        }}
      >
        {Array(11)
          .fill(0)
          .map((_, i) => (
            <ArcDisplay
              {...args}
              outerValue={i * 10}
              innerValue={i * 10}
              maxWidth={width}
            />
          ))}
      </div>
    </div>
  ),
};

export const Colors: Story = {
  args: {
    ...defaultArgs,
    defaultColor: "blue",
    innerColorIndicators: [
      {
        threshold: 40,
        condition: "below",
        color: "green",
        playSound: false,
      },
    ],
    outerColorIndicators: [
      {
        threshold: 60,
        condition: "above",
        color: "orange",
        playSound: false,
      },
    ],
  },
  render: (args) => (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(3, ${width}px)`,
          gap: "8px",
        }}
      >
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <ArcDisplay
              {...args}
              outerValue={i * 20}
              innerValue={i * 20}
              maxWidth={width}
            />
          ))}
      </div>
    </div>
  ),
};
