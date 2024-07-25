# Stratos Logger

**Stratos Logger** is a simple and colorful logger for terminal applications, designed to make your logs more readable and visually appealing.

## Installation

To install Stratos Logger, use npm:

```bash
npm install stratos-logger
```

## Usage

Here's a basic example of how to use Stratos Logger in your application:

```javascript
const logger = require('stratos-logger');

// Log an error message
logger.error('This is an error message');

// Log a success message
logger.success('This is a success message');

// Log a warning message
logger.warning('This is a warning message');

// Log a verbose message
logger.verbose('This is a verbose message');

// Log a debug message
logger.debug('This is a debug message');

// Log a startup message
logger.startup();
```

## Features

- **Colorful Output:** Different log levels are represented with distinct colors for clarity.
- **Simple API:** Easy-to-use methods for logging various types of messages.

