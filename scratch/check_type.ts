import type { PopoverProps } from "react-aria-components";

// This will fail at compile time if "top right" is not a valid Placement.
const testPlacement: PopoverProps["placement"] = "top right";
console.log("testPlacement:", testPlacement);
