# Discord Bot Card Details Checker

## Overview
Welcome to the Discord Bot Card Details Checker! This bot helps in verifying card details within your Discord server efficiently.

## Features
- **Real-time Card Verification**: Instantly checks the validity of card details.
- **User-friendly Commands**: Easy to use and integrate with your Discord server.
- **Secure and Reliable**: Ensuring the highest security while checking card details.

## Installation

1. **Clone the repository:**
    git clone https://github.com/arkabhai/CDC-1.x.git

   cd CDC-1.x

3. **Install dependencies:**
    npm install

4. **Configure your bot:**
    - Navigate to `.env.ecample(change it to .env)` and add your bot token.
    - Add other configurations as needed.

5. **Run the bot:**
    node index.js

## Usage

**Here are the available commands**:
- **!cc** <CC-NUM|EX-DATE|EX-YEAR|CVV>
Fetches and displays data from the API. Example usage: !cc 53635000073xxxxx|0x|20xx|28x
- **!allow** <user> only for admin.
Allows a specified user to use the !cc command.
- **block <user>**
Blocks a specified user from using the !cc command.
- **!help**
Displays this help message.

## Use commands in allowed channels only.

**Note**: Ensure you comply with legal and ethical guidelines while using this bot.
