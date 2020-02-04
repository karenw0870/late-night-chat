import { LoginPage } from './login.po';
import { DashboardPage } from '../dashboard/dashboard.po';
import { UsersPage } from '../users/users.po';
import { browser, logging, protractor, Ptor } from 'protractor';

describe('>> Login Page', () => {
  let page: LoginPage;
  let dashboard: DashboardPage;
  let userspage: UsersPage;

  const wrongname = {username:'George', password:'wrong'};
  const wrongpassword = {username:'Karen', password:'wrong'};
  const superlogin = {username:'Super', password:'super'};
  const generallogin = {username:'Jake', password:'123'};

  beforeEach(() => {
    page = new LoginPage();
    page.navigateTo();
    browser.waitForAngularEnabled(false);
  });

  it('Display site heading', () => {
    expect(page.getMainCardText()).toEqual('Login to catch up');
  });

  it('User login name does not exist - validation displayed', () => {
    page.processContent(wrongname);
    expect(page.getPopupText()).toEqual('User does not exist');
  });

  it('User login name exists but password wrong - validation displayed', () => {
    page.processContent(wrongpassword);
    expect(page.getPopupText()).toEqual('The password is invalid');
  });

  it('General login user directed to dashboard', () => {
    dashboard = new DashboardPage();
    page.processContent(generallogin);
    var text = dashboard.getPageHeading();

    expect(text).toEqual('Dashboard');
  });
  
  it('Super login directed to User Index', () => {
    userspage = new UsersPage();
    page.processContent(superlogin);
    
    var text = userspage.getPageHeading();

    expect(text).toEqual('Registered Users');

    // browser.driver.sleep(1000); PAUSE
  });
});
