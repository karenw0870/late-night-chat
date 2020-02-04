import { browser, by, element } from 'protractor';
import { BrowserStack } from 'protractor/built/driverProviders';

export class UsersPage {

  navigateTo() {
    return browser.get('user');
  }

  getPageHeading() {
    /**
     * user-detail: 'User Details'
     * user-edit: ngIf no userid = 'Edit User'
     * user-edit: ngIf userid = 'Add New User'
     * user-delete: 'Delete User'
     * index: 'Registered Users'
     */
    return element(by.tagName('h1')).getText() as Promise<string>;
  }


  //======= DETAILS =====================



}
