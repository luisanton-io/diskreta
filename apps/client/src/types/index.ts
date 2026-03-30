import { Themes } from "constants/themes";
import { reactions } from "constants/reactions";

declare global {
    type Theme = typeof Themes[keyof typeof Themes];
    type Reaction = typeof reactions[number]
}