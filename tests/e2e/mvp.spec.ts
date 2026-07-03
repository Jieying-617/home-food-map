import { expect, test } from "@playwright/test";

test("demo family can move through the trial MVP screens", async ({ page }) => {
  await page.goto("/f/demo");
  await expect(page.getByRole("heading", { name: "快到期" })).toBeVisible();
  await expect(page.getByRole("link", { name: "全部" })).toBeVisible();
  await expect(page.getByRole("link", { name: "妈妈零食柜" })).toBeVisible();

  await page.getByRole("link", { name: /位置/ }).click();
  await expect(page.getByRole("heading", { name: "位置地图" })).toBeVisible();
  await expect(page.getByText("妈妈零食柜")).toBeVisible();

  await page.getByRole("link", { name: /记录/ }).click();
  await expect(page.getByRole("heading", { name: "操作记录" })).toBeVisible();

  await page.getByRole("link", { name: /家庭/ }).click();
  await expect(page.getByRole("heading", { name: "我们家" })).toBeVisible();
  await expect(page.getByText("妈妈")).toBeVisible();
});
