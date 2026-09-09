import type { Meta, StoryObj } from "@storybook/react-vite";

import { BarDisplay } from "../features/live/components/BarDisplay";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "BarDisplay",
  component: BarDisplay,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/arg-types
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
  args: {},
} satisfies Meta<typeof BarDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    name: "Voltage",
    value: 50,
    unit: "V",
    min: 0,
    max: 100,
  },
  render: (args) => (
    <div style={{ height: "300px" }}>
      <BarDisplay {...args} />
    </div>
  ),
};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    name: "Voltage",
    value: 50,
    unit: "V",
    min: 0,
    max: 100,
  },
  render: (args) => (
    <div style={{ width: "300px" }}>
      <BarDisplay {...args} />
    </div>
  ),
};

export const WideCharacters: Story = {
  args: {
    name: "Voltage",
    value: 50,
    unit: "V",
    min: 0,
    max: 100,
    valueMinCharacters: 10,
  },
  render: (args) => (
    <div style={{ height: "300px" }}>
      <BarDisplay {...args} />
    </div>
  ),
};

export const Values: Story = {
  args: {
    name: "Voltage",
    unit: "V",
    value: 0,
    min: 0,
    max: 100,
  },
  render: (args) => (
    <div>
      <div style={{ display: "flex", gap: "8px", height: "300px" }}>
        {Array(11)
          .fill(0)
          .map((_, i) => (
            <BarDisplay {...args} value={i * 10} />
          ))}
      </div>
      <div
        style={{
          marginTop: "8px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 400px)",
          gap: "8px",
        }}
      >
        {Array(11)
          .fill(0)
          .map((_, i) => (
            <BarDisplay {...args} orientation="horizontal" value={i * 10} />
          ))}
      </div>
    </div>
  ),
};

export const Colors: Story = {
  args: {
    name: "Voltage",
    unit: "V",
    value: 0,
    min: 0,
    max: 100,
    defaultColor: "green",
    colorIndicators: [
      {
        threshold: 30,
        condition: "below",
        color: "purple",
        playSound: false,
      },
      {
        threshold: 70,
        condition: "above",
        color: "orange",
        playSound: false,
      },
      {
        threshold: 100,
        condition: "above",
        color: "red",
        playSound: false,
      },
    ],
  },
  render: (args) => (
    <div>
      <div style={{ display: "flex", gap: "8px", height: "300px" }}>
        {Array(11)
          .fill(0)
          .map((_, i) => (
            <BarDisplay {...args} value={i * 10} />
          ))}
      </div>
    </div>
  ),
};
