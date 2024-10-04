import { test } from '@playwright/test';

test.describe('example test suite 4', () => {
    test('example test', async () => {
        await new Promise((res) => setTimeout(res, 1000));
    });

    for(const t of [1, 2, 3]) {
        test(`example test inside for loop #${t}`, () => {
            test.expect(true).toBeDefined();  
        });
    }
})