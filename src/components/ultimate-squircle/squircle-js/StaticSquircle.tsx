import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";
//import * as React from "react";
import { useMemo } from "react";
import { Slot } from "@radix-ui/react-slot";
import { getSvgPath } from "../figma-squircle";

interface StaticSquircleProps {
  asChild?: boolean;

  width: number;
  height: number;
  cornerRadius: number;

  topLeftCornerRadius?: number;
  topRightCornerRadius?: number;
  bottomLeftCornerRadius?: number;
  bottomRightCornerRadius?: number;

  cornerSmoothing: number;
}

export const StaticSquircle = ({
  asChild,
  width,
  height,
  cornerRadius,

  topLeftCornerRadius,
  topRightCornerRadius,
  bottomLeftCornerRadius,
  bottomRightCornerRadius,

  cornerSmoothing,
  style,
  ...props
}: PropsWithChildren<
  StaticSquircleProps & ComponentPropsWithoutRef<"div">
>) => {
  const Component = asChild ? Slot : "div";

  const path = useMemo(() => {
    return getSvgPath({
      width,
      height,
      cornerRadius,

      topLeftCornerRadius,
      topRightCornerRadius,
      bottomLeftCornerRadius,
      bottomRightCornerRadius,
      
      cornerSmoothing,
    });
  }, [width, height, cornerRadius, cornerSmoothing]);

  return (
    <Component style={{ clipPath: `path('${path}')`, ...style }} {...props} />
  );
};
