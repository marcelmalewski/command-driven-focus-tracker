// Const's
export const Pages = {
    LOGIN: 'login',
    TIMER_HOME: 'timer',
    TIMER_FOCUS: 'timer/focus',
    TIMER_BREAK: 'timer/break',
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
    SAVE: 'save',
    START: 'start',
    RESET_FORM: 'reset form',
    SET_SECONDS: 'set seconds',
    SET_MINUTES: 'set minutes',
    SET_HOURS: 'set hours',
    SET_SHORT_BREAK: 'set short break',
    SET_LONG_BREAK: 'set long break',
    ENABLE_AUTO_BREAK: 'enable auto break',
    DISABLE_AUTO_BREAK: 'disable auto break',
    SET_INTERVAL: 'set interval',
    SET_TOPIC: 'set topic',
} as const;
export const CommandsValues = Object.values(Commands);
type CommandsKeys = keyof typeof Commands;
export type Command = (typeof Commands)[CommandsKeys];

export const CommandToAvailability: Record<Command, Page[]> = {
    [Commands.GO_TO_TIMER]: [],
    [Commands.GO_TO_FOCUS_SESSIONS]: [],
    [Commands.LOGOUT]: [],
    [Commands.SAVE]: [Pages.TIMER_HOME],
    [Commands.START]: [Pages.TIMER_HOME],
    [Commands.RESET_FORM]: [Pages.TIMER_HOME],
    [Commands.SET_SECONDS]: [Pages.TIMER_HOME],
    [Commands.SET_MINUTES]: [Pages.TIMER_HOME],
    [Commands.SET_HOURS]: [Pages.TIMER_HOME],
    [Commands.SET_SHORT_BREAK]: [Pages.TIMER_HOME],
    [Commands.SET_LONG_BREAK]: [Pages.TIMER_HOME],
    [Commands.ENABLE_AUTO_BREAK]: [Pages.TIMER_HOME],
    [Commands.DISABLE_AUTO_BREAK]: [Pages.TIMER_HOME],
    [Commands.SET_INTERVAL]: [Pages.TIMER_HOME],
    [Commands.SET_TOPIC]: [Pages.TIMER_HOME],
};
export const CommandsWithParam: Command[] = [
    Commands.SET_SECONDS,
    Commands.SET_MINUTES,
    Commands.SET_HOURS,
    Commands.SET_SHORT_BREAK,
    Commands.SET_LONG_BREAK,
    Commands.SET_INTERVAL,
    Commands.SET_TOPIC,
];

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
