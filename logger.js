const colors = Object.freeze({
    fg: Object.freeze({
        black: '\x1b[30m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m',
        magenta: '\x1b[35m', cyan: '\x1b[36m', white: '\x1b[37m', brightBlack: '\x1b[90m',
        brightRed: '\x1b[91m', brightGreen: '\x1b[92m', brightYellow: '\x1b[93m', brightBlue: '\x1b[94m',
        brightMagenta: '\x1b[95m', brightCyan: '\x1b[96m', brightWhite: '\x1b[97m',
        darkGray: '\x1b[38;5;239m', lightGray: '\x1b[38;5;245m', orange: '\x1b[38;5;208m',
        pink: '\x1b[38;5;213m', lightBlue: '\x1b[38;5;75m', purple: '\x1b[38;5;55m', darkGreen: '\x1b[38;5;28m',
    }),
    reset: '\x1b[0m',
});

const levels = Object.freeze({
    error: 'red',
    success: 'green',
    warning: 'yellow',
    verbose: 'blue',
    debug: 'brightYellow',
    info: 'cyan',
    notify: 'orange',
    fatal: 'brightRed',
    lvs: 'brightMagenta',
});

/** @type {Array<{regex: RegExp, replacement: string}>} */
let replacements = [];

const parseColors = (text) =>
    text.replace(/{colors\.fg\.(\w+)}/g, (_, name) => colors.fg[name] ?? '');
const toRegex = (search) => {
    if (typeof search !== 'string') return new RegExp(String(search), 'g');
    if (search.startsWith('/') && search.lastIndexOf('/') > 0) {
        const last = search.lastIndexOf('/');
        const body = search.slice(1, last);
        const flags = search.slice(last + 1) || 'g';
        return new RegExp(body, flags.includes('g') ? flags : flags + 'g');
    }
    // Escape literal
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'g');
};

const validateFg = (fg) => {
    if (!colors.fg[fg]) throw new Error(`Invalid color: fg=${fg}`);
    return fg;
};

const applyReplacements = (line, colorResetKey) => {
    const resetSeq = colors.fg[colorResetKey] ?? '';
    let out = line;
    for (const { regex, replacement } of replacements) {
        out = out.replace(regex, `${replacement}${resetSeq}`);
    }
    return out;
};

// --- Core logging ------------------------------------------------------------

const prefix = `${colors.fg.red}  |> ${colors.reset}`;

const log = (level, msg, customFg = null) => {
    const fgKey = customFg && colors.fg[customFg] ? customFg : levels[level] || 'white';
    validateFg(fgKey);
    const levelTag = `${colors.fg[fgKey]}${String(level).toUpperCase()}${colors.reset}`;
    const body = applyReplacements(String(msg), fgKey);
    console.log(`${prefix}(${levelTag}) > ${body}${colors.reset}`);
};

const levelFns = Object.fromEntries(
    Object.keys(levels).map((lvl) => [lvl, (msg) => log(lvl, msg)])
);

// --- Public API --------------------------------------------------------------

export const info = levelFns.info;
export const error = levelFns.error;
export const success = levelFns.success;
export const warning = levelFns.warning;
export const verbose = levelFns.verbose;
export const debug = levelFns.debug;
export const notify = levelFns.notify;
export const fatal = levelFns.fatal;
export const lvs = levelFns.lvs;

export const custom = (name, customFg, msg) => log(name, msg, customFg);

export async function loadReplacements(url = 'https://cdn.ordanistudio.com/json/replacements.json') {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        replacements = Object.entries(data).map(([search, value]) => ({
            regex: toRegex(search),
            replacement: parseColors(String(value)),
        }));
    } catch (e) {
        try { error?.(`Error fetching replacements data: ${e.message}`); }
        catch { console.error(`Error fetching replacements data: ${e.message}`); }
    }
}

/**
 * Manually set replacements (useful for tests or offline).
 * @param {Record<string,string>} map
 */
export function setReplacements(map) {
    replacements = Object.entries(map).map(([search, value]) => ({
        regex: toRegex(search),
        replacement: parseColors(String(value)),
    }));
}

export async function startup(project, color = 'darkGreen', url = 'https://cdn.ordanistudio.com/json/projects.json') {
    try {
        await loadReplacements();

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const lines = data?.[project];
        if (!Array.isArray(lines) || lines.length === 0) {
            error('Startup project not found');
            return;
        }
        validateFg(color);

        for (const line of lines) {
            const body = applyReplacements(String(line), color);
            console.log(`${prefix}(${colors.fg.darkGreen}STARTUP${colors.reset}) ${colors.fg[color]}${body}${colors.reset}`);
        }
    } catch (e) {
        error(`Error fetching startup project data: ${e.message}`);
    }
}

const logger = {
    colors, levels,
    ...levelFns,
    custom,
    loadReplacements,
    setReplacements,
    startup,
};

export default logger;

loadReplacements().catch(() => { });