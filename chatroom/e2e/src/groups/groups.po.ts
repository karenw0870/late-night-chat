import { browser, by, element } from 'protractor';
import { BrowserStack } from 'protractor/built/driverProviders';

export class GroupsPage {

  navigateTo() {
    return browser.get('group');
  }

  getPageHeading() {
    return element(by.name('group-header')).getTagName() as Promise<string>;
  }


  //======= DETAILS =====================



}
