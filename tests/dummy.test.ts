import { expect, test } from '@playwright/test';
import { dummypage } from '../pages/dummy.page';
// import { LOGIN } from '../data/dummy.test';

const USER_EMAIL = process.env.USER_EMAIL ?? '';
const USER_PASSWORD = process.env.USER_PASSWORD ?? '';

test.describe('Login', () => {
  let dummyPage: dummypage;

  test.beforeEach(async ({ page }) => {
    dummyPage = new dummypage(page);
    await dummyPage.goto();
  });

  test('TC - 001 Opening the Application ', async () => {
    // await dummyPage.checkHeader();
    await expect(dummyPage.headerTitle).toHaveText('PRODUCT STORE');
  })

  test('TC - 002 Click on LapTops Category', async() => {
    await dummyPage.clickCategory('Laptops');
    const laptopNames = await dummyPage.allLaptopNames();
    await dummyPage.totalCost(laptopNames);
    await dummyPage.averageCost(laptopNames);
    await dummyPage.minAndMax(laptopNames);
    await dummyPage.top2Expensive(laptopNames);
  })

  test.only('TC - 003 Select the second most expensive laptop', async() => {
    await dummyPage.clickCategory('Laptops');
    const laptopNames = await dummyPage.allLaptopNames();
    const actual =await dummyPage.selectSecondMostExpensive(laptopNames);
    await dummyPage.addToCart();
    await dummyPage.openCart();
    await dummyPage.clickHome();
    await dummyPage.addPhoneToCart();
    await dummyPage.openCart();
    await dummyPage.calcost()
    await dummyPage.clickPlaceOrder();
    await dummyPage.fillOrder();
    await dummyPage.assertSuccessMessage();
  }) 
  
});
