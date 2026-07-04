import { expect, test } from "@playwright/test";

test("demo family can move through the trial MVP screens", async ({ page }) => {
  const foodName = `测试饼干${Date.now()}`;
  const locationName = `测试柜子${Date.now()}`;
  const cabinetPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    "base64",
  );
  const replacementPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAC0lEQVR42mP8z8AABQMBgJ9nGkQAAAAASUVORK5CYII=",
    "base64",
  );

  await page.goto("/f/demo");
  await expect(page.getByRole("heading", { name: "今天先处理什么" })).toBeVisible();
  await expect(page.getByText("当前使用者", { exact: true })).toBeVisible();
  await expect(page.getByText("全部位置")).toBeVisible();
  await expect(page.getByRole("link", { name: "全部" })).toBeVisible();
  await expect(page.getByRole("link", { name: "妈妈零食柜" })).toBeVisible();

  await page.getByRole("link", { name: "位置" }).click();
  await expect(page.getByRole("heading", { name: "按位置管理库存" })).toBeVisible();
  await page.getByRole("link", { name: "添加位置" }).click();
  await expect(page.getByRole("heading", { name: "给真实位置取个好记的名字" })).toBeVisible();
  await page.getByLabel("位置名称").fill(locationName);
  await page.getByLabel("标签").fill("常温 测试");
  await page.locator('input[type="file"]').setInputFiles({
    name: "cabinet.png",
    mimeType: "image/png",
    buffer: cabinetPng,
  });
  await expect(page.getByText("卡通封面预览")).toBeVisible();
  await expect(page.getByRole("img", { name: "卡通位置封面预览" })).toBeVisible();
  await page.getByRole("button", { name: "保存位置" }).click();
  await expect(page.getByText("位置已保存。")).toBeVisible();
  await page.getByRole("link", { name: "位置" }).click();
  await expect(page.getByRole("link", { name: new RegExp(locationName) })).toBeVisible();
  await page.getByRole("link", { name: new RegExp(locationName) }).click();
  await expect(page.getByRole("heading", { name: locationName })).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: "replacement-cabinet.png",
    mimeType: "image/png",
    buffer: replacementPng,
  });
  await expect(page.getByText("新封面预览已生成。")).toBeVisible();
  await expect(page.getByRole("img", { name: "新的卡通位置封面预览" })).toBeVisible();
  await page.getByRole("button", { name: "保存新图片" }).click();
  await expect(page.getByText("位置图片已更换，封面已重新生成。")).toBeVisible();
  await page.getByRole("link", { name: "位置" }).click();
  await page.getByRole("link", { name: /妈妈零食柜/ }).click();
  await expect(page.getByRole("heading", { name: "妈妈零食柜" })).toBeVisible();
  await page.getByRole("link", { name: "添加到这里" }).click();
  await expect(page.getByRole("heading", { name: "把食物放进地图" })).toBeVisible();
  await expect(page.getByText("当前使用者", { exact: true })).toBeVisible();
  await expect(page.getByLabel("存放位置")).toHaveValue(/.+/);

  await page.getByPlaceholder("例如：鸡蛋、牛奶、吐司").fill(foodName);
  await page.locator('input[type="number"]').fill("2");
  await page.getByPlaceholder("盒、袋、瓶").fill("包");
  await page.getByLabel("到期日").fill("2026-12-31");
  await page.getByRole("button", { name: "确认保存" }).click();
  await expect(page.getByText("已保存到库存。")).toBeVisible();
  await page.getByRole("link", { name: "查看这个位置" }).click();
  await expect(page.getByRole("heading", { name: "妈妈零食柜" })).toBeVisible();
  const createdFood = page.locator("article").filter({ hasText: foodName });
  await expect(createdFood).toContainText("2包");
  await createdFood.getByRole("button", { name: "更多消耗数量" }).click();
  await createdFood.getByRole("button", { name: "0.5包" }).click();
  await expect(createdFood).toContainText("1.5包");

  await page.getByRole("link", { name: "记录" }).click();
  await expect(page.getByRole("heading", { name: "操作记录" })).toBeVisible();
  await expect(page.getByText(foodName).first()).toBeVisible();
  await expect(page.getByText("数量 2包 -> 1.5包").first()).toBeVisible();
  await expect(page.getByText("操作人：").first()).toBeVisible();

  await page.getByRole("link", { name: "家庭" }).click();
  await expect(page.getByRole("heading", { name: "我们家" })).toBeVisible();
  await expect(page.getByText("当前使用者", { exact: true })).toBeVisible();
  await expect(page.getByText("WOJIA")).toBeVisible();

  await page.getByRole("link", { name: "打开邀请链接" }).click();
  await expect(page.getByRole("heading", { name: "用邀请码进入库存地图" })).toBeVisible();
  await expect(page.getByLabel("邀请码")).toHaveValue("WOJIA");
  await page.getByLabel("我的称呼").fill("测试成员");
  await page.getByRole("button", { name: "加入家庭" }).click();
  await expect(page.getByText("加入成功。")).toBeVisible();

  await page.getByRole("link", { name: "进入我们家" }).click();
  await expect(page.getByRole("heading", { name: "我们家" })).toBeVisible();
  await expect(page.getByText("测试成员").first()).toBeVisible();
});
