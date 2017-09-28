import React from 'react';
import { shallow } from 'enzyme';
import log from 'loglevel';

import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component.js';
import AccountSettingsEditor from '../../src/accountSettings/accountSettingsEditor.component';

describe('AccountEditor', () => {
    let accountEditorComponent;

    beforeEach(() => {
        accountEditorComponent = shallow(<AccountSettingsEditor d2={{i18n: {getTranslation: function(t) { return t;}}}} />);
    });

    it('should pass 5 fields to the Form Builder component', () => {
        const formBuilderComponent = accountEditorComponent.find(FormBuilder);

        expect(formBuilderComponent.props().fields).to.have.length(5);
    });
});