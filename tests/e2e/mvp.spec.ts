import { expect, test } from "@playwright/test";

test("demo family can move through the trial MVP screens", async ({ page }) => {
  await page.goto("/f/demo");
  await expect(page.getByRole("heading", { name: "提醒中心" })).toBeVisible();
  const reminderSummary = page.getByText("今日处理建议").locator("..");
  await expect(reminderSummary.getByText("今天到期")).toBeVisible();
  await expect(reminderSummary.getByText("7 天内")).toBeVisible();
  await expect(page.getByRole("link", { name: "全部" })).toBeVisible();
  await expect(page.getByRole("link", { name: "妈妈零食柜" })).toBeVisible();

  await page.getByRole("link", { name: /位置/ }).click();
  await expect(page.getByRole("heading", { name: "位置地图" })).toBeVisible();
  await page.getByRole("link", { name: /妈妈零食柜/ }).click();
  await expect(page.getByRole("heading", { name: "妈妈零食柜" })).toBeVisible();
  await page.getByRole("link", { name: "添加到这里" }).click();
  await expect(page.getByRole("heading", { name: "添加食物" })).toBeVisible();
  await expect(page.getByLabel("存放位置").last()).toHaveValue(/.+/);

  await page.getByRole("link", { name: /记录/ }).click();
  await expect(page.getByRole("heading", { name: "操作记录" })).toBeVisible();

  await page.getByRole("link", { name: /家庭/ }).click();
  await expect(page.getByRole("heading", { name: "我们家" })).toBeVisible();
  await expect(page.getByText("妈妈")).toBeVisible();
  await expect(page.getByText("WOJIA")).toBeVisible();

  await page.getByRole("link", { name: "打开邀请链接" }).click();
  await expect(page.getByRole("heading", { name: "加入家庭" })).toBeVisible();
  await expect(page.getByLabel("邀请码")).toHaveValue("WOJIA");
  await page.getByLabel("我的称呼").fill("测试成员");
  await page.getByRole("button", { name: "加入家庭" }).click();
  await expect(page.getByText("加入成功")).toBeVisible();

  await page.getByRole("link", { name: "进入我们家" }).click();
  await expect(page.getByRole("heading", { name: "我们家" })).toBeVisible();
  await expect(page.getByText("测试成员")).toBeVisible();
});
