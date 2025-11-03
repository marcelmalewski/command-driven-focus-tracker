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

export const Commands = {
    GO_TO_TIMER: 'go to home',
    GO_TO_FOCUS_SESSIONS: 'go to sessions',
    LOGOUT: 'logout',
    RESET_FORM: 'reset form',
    SET_AUTO_BREAK: 'set auto break',
} as const;
export const CommandsValues = Object.values(Commands);
type CommandsKeys = keyof typeof Commands;
export type Command = (typeof Commands)[CommandsKeys];

export const CommandToAvailability: Record<Command, Page[]> = {
    [Commands.GO_TO_TIMER]: [],
    [Commands.GO_TO_FOCUS_SESSIONS]: [],
    [Commands.LOGOUT]: [],
    [Commands.RESET_FORM]: [Pages.TIMER_HOME],
    [Commands.SET_AUTO_BREAK]: [Pages.TIMER_HOME],
};

export type UnknownMap = Record<string, unknown>;

// Interfaces
export interface AuthInterface {
    loginOrEmail: string;
    password: string;
}

export interface Paginated<T> {
    content: T[];
    totalElements: number;
    numberOfElements: number;
    empty: boolean;
}
