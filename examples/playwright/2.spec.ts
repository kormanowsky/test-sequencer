import { test } from '@playwright/test';

test.describe('example test suite 2', () => {
    test('example test', async () => {
        await new Promise((res) => setTimeout(res, 1500));
    });
})