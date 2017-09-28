import React from 'react';
import PropTypes from 'prop-types';

import FormFields from '../layout/formFields.component';
import profileSettingsActions from '../profileSettings/profileSettings.actions';
import profileSettingsStore from '../profileSettings/profileSettings.store';


function AccountSettings(props, context) {
    const fieldKeys = [
        'accountSettingsEditor',
    ];

    const pageLabel = context.d2.i18n.getTranslation('account_settings');

    return (
        <FormFields
            pageLabel={pageLabel}
            fieldKeys={fieldKeys}
            valueStore={profileSettingsStore}
            onUpdateField={profileSettingsActions.save}
        />
    );
}

AccountSettings.contextTypes = { d2: PropTypes.object.isRequired };

export default AccountSettings;
