const colors = {
    fg: {
        black: '\x1b[30m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m',
        magenta: '\x1b[35m', cyan: '\x1b[36m', white: '\x1b[37m', brightBlack: '\x1b[90m',
        brightRed: '\x1b[91m', brightGreen: '\x1b[92m', brightYellow: '\x1b[93m', brightBlue: '\x1b[94m',
        brightMagenta: '\x1b[95m', brightCyan: '\x1b[96m', brightWhite: '\x1b[97m', darkGray: '\x1b[38;5;239m',
        lightGray: '\x1b[38;5;245m', orange: '\x1b[38;5;208m', pink: '\x1b[38;5;213m', lightBlue: '\x1b[38;5;75m',
        purple: '\x1b[38;5;55m', darkGreen: '\x1b[38;5;28m'
    },
    reset: '\x1b[0m'
};

const levels = {
    error: 'red', success: 'green', warning: 'yellow', verbose: 'blue',
    debug: 'brightYellow', info: 'cyan', notify: 'orange', fatal: 'brightRed'
};

let replacements = {};

const applyReplacements = (line, colorReset) =>
    Object.entries(replacements).reduce((text, [search, replace]) =>
        text.replace(search, replace + colors.fg[colorReset]), line);

const log = (level, msg, customFg = null) => {
    const fgColor = customFg && colors.fg[customFg] ? customFg : levels[level] || 'white';
    if (!colors.fg[fgColor]) throw new Error(`Invalid color: fg=${fgColor}`);
    console.log(`${colors.fg.red}  |> ${colors.reset}(${colors.fg[fgColor]}${level.toUpperCase()}${colors.reset}) > ${applyReplacements(msg, fgColor)}${colors.reset}`);
};

Object.keys(levels).forEach(level => exports[level] = msg => log(level, msg));
exports.custom = (name, customFg, msg) => log(name, msg, customFg);

exports.startup = async (project, color) => {
    try {
        const response = await fetch("https://cdn.stratostech.xyz/json/projects.json");
        const data = await response.json();
        const lines = data[project];
        if (!lines) return exports.error("Startup project not found");
        lines.forEach(line =>
            console.log(`${colors.fg.red}  |> ${colors.reset}(${colors.fg.darkGreen}STARTUP${colors.reset}) ${colors.fg[color]}${applyReplacements(line, color)}`));
    } catch (error) {
        exports.error(`Error fetching startup project data: ${error.message}`);
    }
};

exports.loadReplacements = async () => {
    try {
        const response = await fetch("https://cdn.stratostech.xyz/json/replacements.json");
        const data = await response.json();
        replacements = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, parseColors(value)])
        );
    } catch (error) {
        exports.error(`Error fetching replacements data: ${error.message}`);
    }
};

const parseColors = text => text.replace(/{colors\.fg\.(\w+)}/g, (_, color) => colors.fg[color] || '');

// Automatically load replacements on startup
exports.loadReplacements();
