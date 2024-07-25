// index.d.ts

declare module 'stratos-logger' {
    export const colors: {
        fg: {
            black: string;
            red: string;
            green: string;
            yellow: string;
            blue: string;
            magenta: string;
            cyan: string;
            white: string;
            brightBlack: string;
            brightRed: string;
            brightGreen: string;
            brightYellow: string;
            brightBlue: string;
            brightMagenta: string;
            brightCyan: string;
            brightWhite: string;
            darkGray: string;
            lightGray: string;
            orange: string;
            pink: string;
            lightBlue: string;
            purple: string;
        };
        reset: string;
    };


    export const startup: (project: string, color: keyof typeof colors.fg) => Promise<void>;
    export const error: (text: string) => Promise<void>;
    export const success: (text: string) => Promise<void>;
    export const warning: (text: string) => Promise<void>;
    export const verbose: (text: string) => Promise<void>;
    export const debug: (text: string) => Promise<void>;
    export const info: (text: string) => Promise<void>;
    export const notify: (text: string) => Promise<void>;
    export const fatal: (text: string) => Promise<void>;
    export const custom: (title: string, color: keyof typeof colors.fg, text: string) => Promise<void>;
}
