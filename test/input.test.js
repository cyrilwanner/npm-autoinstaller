import { expect } from 'chai';
import proxyquire from 'proxyquire';

let readlineResponse;
let secondReadlineResponse;

const packages = {
  'readline-sync': {
    question: () => readlineResponse
  },
  './log': {
    info: () => {
      if (secondReadlineResponse) {
        readlineResponse = secondReadlineResponse;
      }
    }
  }
};

const { askForInstall } = proxyquire('../dist/input', packages);

describe('input', () => {
  it('accepts y as an answer', () => {
    readlineResponse = 'y';
    expect(askForInstall(false)).to.equal(true);

    readlineResponse = 'Y';
    expect(askForInstall(false)).to.equal(true);
  });

  it('accepts yes as an answer', () => {
    readlineResponse = 'yes';
    expect(askForInstall(false)).to.equal(true);

    readlineResponse = 'Yes';
    expect(askForInstall(false)).to.equal(true);

    readlineResponse = 'yES';
    expect(askForInstall(false)).to.equal(true);
  });

  it('accepts n as an answer', () => {
    readlineResponse = 'n';
    expect(askForInstall(false)).to.equal(false);

    readlineResponse = 'N';
    expect(askForInstall(false)).to.equal(false);
  });

  it('accepts no as an answer', () => {
    readlineResponse = 'no';
    expect(askForInstall(false)).to.equal(false);

    readlineResponse = 'No';
    expect(askForInstall(false)).to.equal(false);

    readlineResponse = 'nO';
    expect(askForInstall(false)).to.equal(false);
  });

  it('has a default answer', () => {
    readlineResponse = '';
    expect(askForInstall(false)).to.equal(true);
  });

  it('does not accept invalid answers', () => {
    readlineResponse = 'a';
    expect(() => askForInstall(false)).to.throw('invalid answer');
    expect()

    readlineResponse = '.';
    expect(() => askForInstall(false)).to.throw('invalid answer');

    readlineResponse = ' ';
    expect(() => askForInstall(false)).to.throw('invalid answer');

    readlineResponse = 'invalid answer?';
    expect(() => askForInstall(false)).to.throw('invalid answer');
  });

  it('asks until a valid answer is provided', () => {
    readlineResponse = 'asdf';
    secondReadlineResponse = 'y';

    expect(askForInstall()).to.equal(true);

    readlineResponse = 'asdf';
    secondReadlineResponse = 'n';

    expect(askForInstall()).to.equal(false);
  });
});
