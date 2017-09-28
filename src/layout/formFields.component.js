import React from 'react';
import PropTypes from 'prop-types';
import log from 'loglevel';

// Material UI
import { Card, CardText } from 'material-ui/Card';

// D2 UI
import { wordToValidatorMap } from 'd2-ui/lib/forms/Validators';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';
import SelectField from 'd2-ui/lib/form-fields/DropDown.component';
import TextField from 'd2-ui/lib/form-fields/TextField';
import DatePicker from 'd2-ui/lib/form-fields/DatePicker.component';
import Checkbox from 'd2-ui/lib/form-fields/CheckBox.component';
import AppTheme from './theme';

import userSettingsActions from '../app.actions';
import userSettingsStore from '../userSettings/userSettings.store';
import optionValueStore from '../optionValue.store';
import userSettingsKeyMapping from '../settingsKeyMapping';
import AccountEditor from '../accountSettings/accountSettingsEditor.component';

const styles = {
    header: {
        fontSize: 24,
        fontWeight: 300,
        color: AppTheme.rawTheme.palette.textColor,
        padding: '24px 0 12px 16px',
    },
    card: {
        marginTop: 8,
        marginRight: '1rem',
        padding: '0 1rem',
    },
    cardTitle: {
        background: AppTheme.rawTheme.palette.primary2Color,
        height: 62,
    },
    cardTitleText: {
        fontSize: 28,
        fontWeight: 100,
        color: AppTheme.rawTheme.palette.alternateTextColor,
    },
    noHits: {
        padding: '1rem',
        marginTop: '1rem',
        fontWeight: 300,
    },
    userSettingsOverride: {
        color: AppTheme.rawTheme.palette.primary1Color,
        marginTop: -6,
        fontSize: '0.8rem',
        fontWeight: 400,
    },
    menuIcon: {
        color: '#757575',
    },
    menuLabel: {
        position: 'relative',
        top: -6,
        marginLeft: 16,
    },
};

function wrapWithLabel(WrappedComponent, label) {
    return (props) => {
        const labelStyle = styles.userSettingsOverride;

        return (
            <div>
                <WrappedComponent {...props} />
                <div style={labelStyle}>{label}</div>
            </div>
        );
    };
}


class UserSettingsFields extends React.Component {
    componentDidMount() {
        this.disposable = this.props.valueStore.subscribe(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.disposable.unsubscribe();
    }

    renderFields(fieldNames) {
        const d2 = this.context.d2;
        const valueStore = this.props.valueStore;

        /* eslint-disable complexity */
        const fields = fieldNames
            .map((fieldName) => {
                const mapping = userSettingsKeyMapping[fieldName];

                // Base config, common for all component types
                const fieldBase = {
                    name: fieldName,
                    value: (
                        valueStore.state
                        && valueStore.state.hasOwnProperty(fieldName)
                        && String(valueStore.state[fieldName]).trim()
                    ) || '',
                    component: TextField,
                    props: {
                        floatingLabelText: d2.i18n.getTranslation(mapping.label),
                        style: { width: '100%' },
                        hintText: mapping.hintText && d2.i18n.getTranslation(mapping.hintText),
                    },
                    validators: (mapping.validators || []).map(name => (wordToValidatorMap.has(name) ? {
                        validator: wordToValidatorMap.get(name),
                        message: d2.i18n.getTranslation(wordToValidatorMap.get(name).message),
                    } : false))
                        .filter(v => v),
                };

                switch (mapping.type) {
                case 'textfield':
                case undefined:
                    return Object.assign({}, fieldBase, {
                        props: Object.assign({}, fieldBase.props, {
                            changeEvent: 'onBlur',
                            multiLine: !!mapping.multiLine,
                            disabled: !!mapping.disabled,
                        }),
                    });

                case 'date':
                    return Object.assign({}, fieldBase, {
                        component: DatePicker,
                        value: valueStore.state && valueStore.state[fieldName]
                            ? new Date(valueStore.state[fieldName])
                            : '',
                        props: Object.assign({}, fieldBase.props, {
                            floatingLabelText: d2.i18n.getTranslation(mapping.label),
                            dateFormat: userSettingsStore.state.keyDateFormat || '',
                            textFieldStyle: { width: '100%' },
                            allowFuture: false,
                        }),
                    });

                case 'checkbox':
                    return Object.assign({}, fieldBase, {
                        component: Checkbox,
                        props: {
                            value: '',
                            label: fieldBase.props.floatingLabelText,
                            style: fieldBase.props.style,
                            checked: fieldBase.value.toString() === 'true',
                            onChange: (e, v) => {
                                userSettingsActions.saveUserKey(fieldName, v ? 'true' : 'false');
                            },
                        },
                    });

                case 'dropdown': {
                    if (mapping.includeEmpty && fieldBase.value === '') {
                        fieldBase.value = 'null';
                    }

                    const value = valueStore.state[fieldName] || valueStore.state[fieldName] === false
                        ? valueStore.state[fieldName].toString()
                        : 'null';

                    const menuItems = (mapping.source
                        ? (optionValueStore.state && optionValueStore.state[mapping.source]) || []
                        : Object.keys(mapping.options).map((id) => {
                            const displayName = !isNaN(mapping.options[id])
                                ? mapping.options[id]
                                : d2.i18n.getTranslation(mapping.options[id]);
                            return { id, displayName };
                        })).slice();

                    const systemSettingValue = optionValueStore.state
                        && optionValueStore.state.systemDefault
                        && optionValueStore.state.systemDefault[fieldName];
                    const systemSettingLabel = optionValueStore.state[mapping.source]
                        ? optionValueStore.state[mapping.source]
                            .filter(x => x.id === systemSettingValue)
                            .map(x => x.displayName)[0] || d2.i18n.getTranslation('no_value')
                        : d2.i18n.getTranslation(systemSettingValue === 'null' ? 'no_value' : systemSettingValue);

                    return Object.assign({}, fieldBase, {
                        component: SelectField,
                        value,
                        props: Object.assign({}, fieldBase.props, {
                            includeEmpty: !!mapping.includeEmpty,
                            emptyLabel: mapping.includeEmpty
                                ? `${d2.i18n.getTranslation('use_system_default')} (${systemSettingLabel})`
                                : undefined,
                            noOptionsLabel: d2.i18n.getTranslation('no_options'),
                        }, { menuItems }),
                    });
                }

                case 'accountEditor':
                    return Object.assign({}, fieldBase, {
                        component: AccountEditor,
                        props: { d2, username: valueStore.state.username },
                    });

                default:
                    log.warn(`Unknown control type "${mapping.type}" encountered for field "${fieldName}"`);
                    return {};
                }
            })
            .filter(field => !!field.name)
            .map((field) => {
                const mapping = userSettingsKeyMapping[field.name];

                // For settings that have a system wide default value, and is overridden by the current user, display
                // the system wide default under the current user setting (which may be the same value)
                if (mapping.showSystemDefault && field.value && field.value !== null && field.value !== 'null' &&
                    optionValueStore.state.systemDefault.hasOwnProperty(field.name)) {
                    const systemValue = optionValueStore.state.systemDefault[field.name];
                    const actualSystemValue = systemValue !== undefined
                        && systemValue !== null && systemValue !== 'null';
                    let systemValueLabel = systemValue;

                    if (mapping.source && actualSystemValue) {
                        systemValueLabel = optionValueStore.state[mapping.source]
                            .filter(item => item.id === systemValue)[0].displayName;
                    } else if (field.props.menuItems && actualSystemValue) {
                        systemValueLabel = field.props.menuItems
                            .filter(item => item.id === systemValue || String(systemValue) === item.id)[0].displayName;
                    } else {
                        systemValueLabel = d2.i18n.getTranslation(systemValue);
                    }

                    const systemDefaultLabel = `${d2.i18n.getTranslation('system_default')}: ${systemValueLabel}`;
                    return Object.assign(field, { component: wrapWithLabel(field.component, systemDefaultLabel) });
                }

                return field;
            });

        /* eslint-enable complexity */

        return (
            <Card style={styles.card}>
                <CardText>
                    <FormBuilder fields={fields} onUpdateField={this.props.onUpdateField} />
                </CardText>
            </Card>
        );
    }

    render() {
        return (
            <div className="content-area">
                <div style={styles.header}>{this.props.pageLabel}</div>
                {this.renderFields(this.props.fieldKeys)}
            </div>
        );
    }
}

UserSettingsFields.propTypes = {
    pageLabel: PropTypes.string.isRequired,
    fieldKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
    valueStore: PropTypes.object.isRequired,
    onUpdateField: PropTypes.func.isRequired,
};
UserSettingsFields.contextTypes = {
    d2: PropTypes.object.isRequired,
};


export default UserSettingsFields;