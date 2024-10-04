import { test } from '@playwright/test';

test.describe('example test suite 1', () => {
    test('example test', async () => {
        await new Promise((res) => setTimeout(res, 500));
    });
});

