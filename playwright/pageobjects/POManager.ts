
import { LoginPage } from './LoginPage';
import { HomePage } from './HomePage';
import { CLP } from './CLP';
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { AddProductToCart } from './AddProductToCart';
// import {VisualBasePage}
import { UiAssertionsPage } from '../utilities/UiAssertionsPage';
import { PLP } from './PLP';
import { PDP } from './PDP';
import { AboutUs } from './AboutUs';
import { GlobalFooter } from './GlobalFooter';
import { CartPage } from './CartPage';
import { storeDetails } from './storeDetails';
import { CarouselValidator } from '../utilities/CarouselValidator';
import { GlobalHeader } from './GlobalHeader';
import { CheckoutPage } from './CheckoutPage';

export class POManager {
    basePage: BasePage;
    loginPage: LoginPage;
    homePage: HomePage;
    clp: CLP;
    pdp: PDP;
    // visualbasePage: VisualBasePage;
    uiAssertionsPage: UiAssertionsPage;
    carouselValidator: CarouselValidator;
    plp: PLP; 
    aboutUs: AboutUs;
    globalFooter: GlobalFooter;
    addProductToCart: AddProductToCart;
    cartPage: CartPage;
    storedetails: storeDetails;
    globalHeader: GlobalHeader;
    checkoutPage: CheckoutPage;
    page: Page;
    

    constructor(page: Page) {
        this.page = page;
        // Initialize base page objects first
        this.basePage = new BasePage(this.page);
        this.loginPage = new LoginPage(this.page);
        this.homePage = new HomePage(this.page);
        this.clp = new CLP(this.page, this.uiAssertionsPage);
        this.plp = new PLP(this.page);
        this.pdp = new PDP(this.page);
        this.aboutUs = new AboutUs(this.page);
        this.globalFooter = new GlobalFooter(this.page);
        this.addProductToCart = new AddProductToCart(this.page);
        this.cartPage = new CartPage(this.page);
        this.storedetails = new storeDetails(this.page);
        this.globalHeader = new GlobalHeader(this.page);
        this.checkoutPage = new CheckoutPage(this.page);
        // this.carouselValidator = new CarouselValidator(this.page,this.carouselValidator.locators());
        
        // Initialize UiAssertionsPage last since it depends on other page objects
        this.uiAssertionsPage = new UiAssertionsPage(this.page);
        // this.carouselValidator = new CarouselValidator(this.page);
         this.clp = new CLP(this.page, this.uiAssertionsPage);
        
    }

    getBasePage() {
        return this.basePage;
    }
    getLoginPage() {
        return this.loginPage;
    }
    getHomePage(){
        return this.homePage;
    }
    getCLPPage(){
        return this.clp;
    }
    getPLPPage(){
        return this.plp;
    }
    getPDPPage(){
        return this.pdp;
    }
    getAboutUsPage(){
        return this.aboutUs;
    }
    getGlobalFooter(){
        return this.globalFooter;
    }
    getUiAssertionsPage(){
        return this.uiAssertionsPage;
    }
    getCartPage(){
        return this.cartPage;
    }
    getStoreDetails(){
        return this.storedetails;
    }
    getAddProductToCart(){
        return this.addProductToCart;
    }
    getCarouselValidator(){
        return this.carouselValidator;   
    }
    getGlobalHeader(){
        return this.globalHeader;
    }
    getCheckoutPage(){
        return this.checkoutPage;
    }
}
module.exports = { POManager };