// import { chromium } from '@playwright/test'
// import path from 'path'
//
// 
// (async () => {
//     const extensionPath = path.resolve(__dirname, '../../../build');
//     const userDataDir = path.resolve('/tmp/test-user-data-dir');
//     const browserContext = await chromium.launchPersistentContext(userDataDir, {
//         channel: 'chromium',
//         headless: false,
//         args: [
//             `-disable-extensions-except=${extensionPath}`,
//             `-load-extension=${extensionPath}`,
//         ]
//     });
//     let [serviceWorker] = browserContext.serviceWorkers();
//     if (!serviceWorker)
//         serviceWorker = await browserContext.waitForEvent('serviceworker');

//     // Test the service worker as you would any other worker.
//     await browserContext.close();
// });

import { test as base, chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

export const test = base.extend({
    context: async ({ }, use) => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const pathToExtension = path.resolve(__dirname, '../../build');
        console.log('Extension path:', pathToExtension);
        const context = await chromium.launchPersistentContext('', {
            channel: 'chromium',
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`,
                '--disable-save-password-bubble',
                '--disable-features=AutofillServerCommunication,PasswordManagerEnableAccountStorage',
                '--password-store=basic',
                '--no-default-browser-check',
            ],
        });
        await use(context);
        await context.close();
    },
    extensionId: async ({ context }, use) => {
        // for manifest v3:
        let [serviceWorker] = context.serviceWorkers();
        if (!serviceWorker)
            serviceWorker = await context.waitForEvent('serviceworker');

        const extensionId = serviceWorker.url().split('/')[2];
        await use(extensionId);
    },
});
export const expect = test.expect;