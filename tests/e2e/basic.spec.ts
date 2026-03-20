// tests/e2e/basic.spec.ts
import { test, expect } from '@playwright/test';

// 在全局级别禁用 strict 模式
test.use({ strict: false });

test.describe('初始加载', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // 确保加载简单查天气场景
    await page.locator('select').first().selectOption('simple-weather');
    await page.waitForLoadState('networkidle');
  });

  test('TC-001: 默认加载第一个场景', async ({ page }) => {
    // 验证第一步内容可见
    await expect(page.getByText('分析用户请求')).toBeVisible();
  });

  test('TC-005: AgentStatusBar 默认不可见', async ({ page }) => {
    await expect(page.getByText('思考中')).not.toBeVisible();
  });

  test('TC-006: Header 显示演示按钮', async ({ page }) => {
    await expect(page.getByText('开始演示')).toBeVisible();
  });

  test('TC-007: 场景描述文本显示', async ({ page }) => {
    await expect(page.getByText('展示基础的 ReAct 循环')).toBeVisible();
  });
});

test.describe('边界情况', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.locator('select').first().selectOption('simple-weather');
    await page.waitForLoadState('networkidle');
  });

  test('TC-032: 第一步上一步按钮禁用', async ({ page }) => {
    const prevButton = page.getByText('上一步').first();
    await expect(prevButton).toBeDisabled();
  });

  test('TC-033: 最后一步下一步按钮禁用', async ({ page }) => {
    await page.getByText('#4').click();
    await page.waitForTimeout(100);
    const nextButton = page.getByText('下一步').first();
    await expect(nextButton).toBeDisabled();
  });
});

test.describe('播放功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.locator('select').first().selectOption('simple-weather');
    await page.waitForLoadState('networkidle');
  });

  test('TC-040: 点击播放按钮开始播放', async ({ page }) => {
    await page.getByText('开始演示').click();
    await expect(page.getByText('思考中')).toBeVisible();
  });

  test('TC-041: 播放中点击暂停', async ({ page }) => {
    await page.getByText('开始演示').click();
    await page.waitForTimeout(200);
    await page.getByText('暂停').click();
    await expect(page.getByText('思考中')).not.toBeVisible();
  });
});

test.describe('步骤类型样式', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.locator('select').first().selectOption('simple-weather');
    await page.waitForLoadState('networkidle');
  });

  test('TC-110: THOUGHT 类型紫色', async ({ page }) => {
    // 检查步骤卡片中的类型标签颜色
    const badge = page.locator('.step-type-badge').first();
    await expect(badge).toHaveClass(/bg-purple/);
  });

  test('TC-111: ACTION 类型蓝色', async ({ page }) => {
    await page.getByText('#2').click();
    const badge = page.locator('.step-type-badge').first();
    await expect(badge).toHaveClass(/bg-blue/);
  });

  test('TC-112: OBSERVATION 类型绿色', async ({ page }) => {
    await page.getByText('#3').click();
    const badge = page.locator('.step-type-badge').first();
    await expect(badge).toHaveClass(/bg-green/);
  });

  test('TC-113: ANSWER 类型琥珀色', async ({ page }) => {
    await page.getByText('#4').click();
    const badge = page.locator('.step-type-badge').first();
    await expect(badge).toHaveClass(/bg-amber/);
  });
});
