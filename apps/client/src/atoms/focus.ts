import { atom } from "recoil";

export const focusState = atom({
    key: 'focus',
    default: true,
    effects: [
        ({ onSet }) => {
            // onSet(newValue => {
            // console.debug("Window focus changed:", newValue);
            // });
        },
    ],

})