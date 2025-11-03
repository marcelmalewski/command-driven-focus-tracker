// Const's
export const Pages = {
    LOGIN: 'login',
    TIMER_HOME: 'timer',
    TIMER_FOCUS: 'timer/focus',
    TIMER_BREAK: 'timer/break',
    TIMER_EDIT: 'timer/edit',
    FOCUS_SESSIONS: 'focus-sessions',
    UNKNOWN_ERROR: 'unknown-error',
} as const;
type PagesKeys = keyof typeof Pages;
export type Page = (typeof Pages)[PagesKeys];

export const PageLinks = {
    TIMER_HOME: '/timer',
} as const;

export const Stages = {
    HOME: 'HOME',
    FOCUS: 'FOCUS',
    PAUSE: 'PAUSE',
    SHORT_BREAK: 'SHORT_BREAK',
    LONG_BREAK: 'LONG_BREAK',
} as const;
type StagesKeys = keyof typeof Stages;
export type Stage = (typeof Stages)[StagesKeys];

export const StageToPage: Record<Stage, Page> = {
    HOME: Pages.TIMER_HOME,
    FOCUS: Pages.TIMER_FOCUS,
    PAUSE: Pages.TIMER_FOCUS,
    SHORT_BREAK: Pages.TIMER_BREAK,
    LONG_BREAK: Pages.TIMER_BREAK,
};

export const GeneralCommands = {
    GO_TO_TIMER: 'go to home',
    GO_TO_FOCUS_SESSIONS: 'go to sessions',
    LOGOUT: 'logout',
    RESET_FORM: 'reset form',
} as const;
export const GeneralCommandsValues = Object.values(GeneralCommands);
type GeneralCommandsKeys = keyof typeof GeneralCommands;
export type GeneralCommand = (typeof GeneralCommands)[GeneralCommandsKeys];

// Interfaces
export interface AuthInterface {
    loginOrEmail: string;
    password: string;
}

export interface Paginated<T> {
    content: T[];
    totalElements: number;
    numberOfElements: number;
    empty: boolean; // TODO obsłużmy to
}

export interface UnknownMap {
    [key: string]: unknown;
}
