import { Page, Locator, expect } from '@playwright/test';

export class dummypage {
  readonly page: Page;
  readonly headerTitle: Locator;
  readonly category: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly nextBtn: Locator;
  readonly addToCartBtn: Locator;
  readonly navlink: Locator;
  readonly cartheader: Locator;
  readonly totalCartCost: Locator;
  readonly phone: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerTitle = page.locator('.navbar-brand')
    this.category = page.locator('.list-group-item')
    this.name = page.locator('.hrefch')
    this.price = page.locator('.card-block h5')
    this.nextBtn = page.locator('#next2')
    this.addToCartBtn = page.locator('.btn-success')
    this.navlink = page.locator('.nav-link')
    this.cartheader = page.locator('.row .col-lg-8 h2')
    this.totalCartCost = page.locator('.panel-title')
    this.phone = page.locator('.card-title')

  }

  async goto() {
    await this.page.goto(process.env.BASE_URL!);
  }

  async clickCategory(categoryName: string) {
    await this.category.filter({ hasText: categoryName }).click();
    await this.name.nth(0).filter({ hasText: 'Sony vaio i5' }).waitFor({ state: 'visible', timeout: 5000 });
  }

  async allLaptopNames(): Promise<{ name: string; price: string }[]> {
    const results: { name: string; price: string }[] = [];

    while (true) {
      await this.page.waitForSelector('.hrefch', { timeout: 2000 });

      const names = await this.name.allInnerTexts();
      const prices = await this.price.allInnerTexts();
      for (let i = 0; i < names.length; i++) {
        results.push({ name: names[i].trim(), price: prices[i]?.trim()});
      }

      if (!(await this.nextBtn.isVisible())) break;

      await this.page.getByRole('button', { name: 'Next' }).nth(1).click();
      await this.page.waitForTimeout(2000);

    }

    console.log('All Laptop Names and Prices:');
    results.forEach((item, i) => {
      console.log(`${i + 1}. ${item.name} - ${item.price}`);
    });

    return results;
  }

  private parsePrice(price: string) {
    if (!price) return 0;
    return parseFloat(price.replace(/[^0-9.-]+/g, '')) || 0;
  }

  async totalCost(laptopNames: { name: string; price: string }[]) {
    const total = laptopNames.reduce((sum, item) => sum + this.parsePrice(item.price), 0);
    console.log(total);
  }

  async averageCost(laptopNames: { name: string; price: string }[]) {
    const total = laptopNames.reduce((sum, item) => sum + this.parsePrice(item.price), 0);
    console.log(total / laptopNames.length);
  }

  async minAndMax(laptopNames: { name: string; price: string }[]) {
    const prices = laptopNames.map(item => this.parsePrice(item.price));
    console.log(Math.min(...prices));
    console.log(Math.max(...prices));
  }

  async top2Expensive(laptopNames: { name: string; price: string }[]) {
    const top2 = [...laptopNames]
      .sort((a, b) => this.parsePrice(b.price) - this.parsePrice(a.price))
      .slice(0, 2);
    top2.forEach((item, i) => console.log(`${i + 1}. ${item.name} - ${item.price}`));
  }

  async selectSecondMostExpensive(laptopNames: { name: string; price: string }[]) {
    const secondMost = [...laptopNames]
      .sort((a, b) => this.parsePrice(b.price) - this.parsePrice(a.price))[1];

    await this.name.filter({ hasText: secondMost.name }).click();
    return this.parsePrice(secondMost.price);
  }

  async addToCart() {
    // await expect(this.addToCartBtn).toBeVisible();
    await this.addToCartBtn.click();
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
  }

  async openCart(){
    await this.navlink.filter({ hasText: 'Cart' }).click();
    await expect(this.cartheader).toHaveText('Products');
  }

  async getTotalCartCost() {
    const text = await this.totalCartCost.textContent();
    console.log(text)
  }

  async clickHome(){
    await this.navlink.filter({ hasText: 'Home ' }).click();
  }

  async addPhoneToCart() {
    await this.phone.filter({ hasText: 'Samsung galaxy s6' }).click();
    await this.addToCart();
  }

  async calcost(){
      const one = await this.page.locator('.success td').nth(2).textContent();
      const two = await this.page.locator('.success td').nth(6).textContent();

      const phonePrice = this.parsePrice(one ?? '');
      const laptopPrice = this.parsePrice(two ?? '');
      const sum = phonePrice + laptopPrice;

      const totalText = await this.totalCartCost.textContent();
      const total = this.parsePrice(totalText ?? '');

      expect(sum).toBe(total);
  }

  async clickPlaceOrder(){
    await this.page.locator('.btn-success').filter({ hasText: 'Place Order' }).click();
  }

   randomData() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random()));
    }
    return result;
  }

  async fillOrder(){
    await expect(this.page.locator('.modal-title').nth(2)).toHaveText('Place order');
    await this.page.locator('#name').fill(this.randomData());
    await this.page.locator('#country').fill(this.randomData());
    await this.page.locator('#city').fill(this.randomData());
    await this.page.locator('#card').fill('1234 5678 9012 3456');
    await this.page.locator('#month').fill('12');
    await this.page.locator('#year').fill('2025');
    await this.page.locator('.btn-primary').filter({ hasText: 'Purchase' }).click();
  }

  async assertSuccessMessage() {
    await expect(this.page.locator('.sweet-alert  h2')).toHaveText('Thank you for your purchase!');
  }
 
}
