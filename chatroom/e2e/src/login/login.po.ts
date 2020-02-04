import { browser, by, element } from 'protractor';
import { BrowserStack } from 'protractor/built/driverProviders';

export class LoginPage {
  private userlogin = {
    username:'Penny',
    password:'123'
  };

  navigateTo() {
    // return browser.get('browser.baseUrl') as Promise<any>;
    return browser.get('');
  }

  getPageHeading() {
    return element(by.tagName('h1')).getText() as Promise<string>;
  }

  getMainCardText() {
    return element(by.css('.card-header')).getText() as Promise<string>;
  }

  getValidation() {
    return element(by.css('.alert-danger')).getText() as Promise<string>;
  }

  processContent(userlogin:any = this.userlogin){
    element(by.css('[name="username"]')).sendKeys(userlogin.username);
    element(by.css('[name="password"]')).sendKeys(userlogin.password);
    element(by.name('login-btn')).click();
  }

  getPopupText(){
    var popup = browser.switchTo().alert();
    var text = popup.getText();
    popup.dismiss();
    return text;
  }
}
