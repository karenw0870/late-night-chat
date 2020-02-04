import { browser, by, element } from 'protractor';
import { BrowserStack } from 'protractor/built/driverProviders';

export class DashboardPage {

  navigateTo() {
    return browser.get('dashboard');
  }

  getSiteHeading() {
    return element(by.css('a .navbar-brand')).getText() as Promise<string>;
  }

  clickSiteHeading(){
    element(by.css('a .navbar-brand')).click();
  }

  getPageHeading() {
    return element(by.tagName('h1')).getText() as Promise<string>;
  }

  buttonMyAccount(){
    element(by.name('my-account-btn')).click();
  }

  buttonAddGroup(){
    element(by.name('add-group-btn')).click();
  }
  buttonAddUser(){
    element(by.name('add-user-btn')).click();
  }
  buttonManageUsers(){
    element(by.name('manage-users-btn')).click();
  }

}
