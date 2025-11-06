# Thadai Chrome Extension

A productivity-focused Chrome extension that blocks distracting websites and uses a smart contract as an access control engine. Users must purchase access time through the blockchain to unblock restricted sites, creating a financial incentive to stay focused.

## Overview

Thadai Chrome Extension interfaces with websites and interacts with the **ThadaiCoreV1** smart contract to determine whether a user has access to blocked websites. The extension blocks access to distracting sites by default, and users can purchase temporary access by sending ETH to the smart contract.

## How It Works

1. **Website Blocking**: The extension monitors visited websites and blocks access to configured distracting sites (e.g., Facebook, X/Twitter, Instagram, Reddit, YouTube).

2. **Access Control**: When a user visits a blocked website, the extension checks the ThadaiCoreV1 smart contract to verify if the user's wallet address has active access.

3. **Access Purchase**: If access is not available, users can purchase access time by sending ETH to the smart contract through the extension's popup interface.

4. **Automatic Unblocking**: Once access is purchased and confirmed on-chain, the extension automatically unblocks the website for the duration of the purchased access time.

## Features

- 🔒 **Automatic Website Blocking**: Blocks distracting websites to improve productivity
- 💰 **Blockchain-Based Access Control**: Uses smart contracts for decentralized access management
- ⏱️ **Time-Based Access**: Purchase access for specific durations
- 🔄 **Real-Time Access Checking**: Continuously verifies access status from the smart contract
- 💳 **In-Extension Payments**: Purchase access directly from the extension popup

## Architecture

TODO

## Smart Contract Integration

TODO

## Setup

### Prerequisites

TODO

### Installation

TODO

### Configuration

TODO

## Usage

TODO

## Security Notes

TODO

## Related Projects

- **ThadaiCoreV1 Smart Contract**: The access control engine contract
