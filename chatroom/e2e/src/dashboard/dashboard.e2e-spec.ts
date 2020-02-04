import { DashboardPage } from './dashboard.po';
import { browser, logging, protractor, Ptor } from 'protractor';
import { GroupsPage } from '../groups/groups.po';

describe('>> Dashboard Page', () => {
  let page: DashboardPage;
  let pageGroups: GroupsPage;

  beforeEach(() => {
    page = new DashboardPage();
    page.navigateTo();
    browser.waitForAngularEnabled(false);
  });

  it('Click site heading goes back to dashboard', () => {
    page.clickSiteHeading();
    var text = page.getPageHeading();
    expect(text).toEqual('Dashboard');
  });

  it('Click MyAccount goes to current user account', () => {
    page.buttonMyAccount();
    var text = page.getPageHeading();
    expect(text).toEqual('User Details');
  });
  
  it('Click AddGroup goes to blank group edit page - group security', () => {
    //Test with each security
    page.buttonAddGroup();
    var text = pageGroups.getPageHeading();
    expect(text).toEqual('h1');
  });
  
  it('Click AddUser goes to new user screen - group security', () => {
    //Test with each security
    page.buttonAddUser();
    var text = page.getPageHeading();
    expect(text).toEqual('Add New User');
  });
  
  it('Click manage users goes to UsersIndex - group security', () => {
    page.buttonManageUsers();
    var text = page.getPageHeading();
    expect(text).toEqual('Registered Users');
  });

  it('Open group goes to group detail page', () => {

    
  });

});
