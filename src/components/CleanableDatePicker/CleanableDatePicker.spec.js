import React from 'react';
import chai from 'chai';
import {mount} from 'enzyme';
import CleanableDatePicker from './CleanableDatePicker';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {IntlProvider} from 'react-intl';


describe('<CleanableDatePicker />', () => {
  chai.should();
  const muiTheme = getMuiTheme();

  const mountWithContext = (node) => {
    return mount(
      <MuiThemeProvider muiTheme={muiTheme}>
        <IntlProvider locale="en">
          {node}
        </IntlProvider>
      </MuiThemeProvider>,
      {
        context: {
          muiTheme: getMuiTheme()
        },
        childContextTypes: {
          muiTheme: React.PropTypes.object.isRequired
        }
      });
  };

  it('should render text field and button', () => {
    const data = {
      hintText: 'dateFrom',
      value: new Date('2017-01-01T00:00:00.000Z')
    };
    const wrapper = mountWithContext(
      <CleanableDatePicker hintText={data.hintText} value={data.value}/>
    );
    const inputs = wrapper.find('input');
    inputs.should.be.lengthOf(1);
    inputs.first().props().value.should.be.equal('1/1/2017');
    const buttons = wrapper.find('IconButton');
    buttons.should.be.lengthOf(1);
    const icons = buttons.first().find('SvgIcon');
    icons.should.be.lengthOf(1);
    icons.first().props().color.should.be.equal(muiTheme.flatButton.primaryTextColor);
    const dialogs = wrapper.find('DatePickerDialog');
    dialogs.should.be.lengthOf(1);
  });
});
