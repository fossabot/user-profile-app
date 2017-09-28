import React from 'react';
import PropTypes from 'prop-types';

import FormFields from '../layout/formFields.component';
import userProfileActions from './profileSettings.actions';
import userProfileStore from './profileSettings.store';


function ProfileSettings(props, context) {
    const fieldKeys = [
        'firstName',
        'surname',
        'email',
        'phoneNumber',
        'introduction',
        'jobTitle',
        'gender',
        'birthday',
        'nationality',
        'employer',
        'education',
        'interests',
        'languages',
    ];

    const pageLabel = context.d2.i18n.getTranslation('user_profile');

    return (
        <FormFields
            pageLabel={pageLabel}
            fieldKeys={fieldKeys}
            valueStore={userProfileStore}
            onUpdateField={userProfileActions.save}
        />
    );
}

ProfileSettings.contextTypes = { d2: PropTypes.object.isRequired };

export default ProfileSettings;
