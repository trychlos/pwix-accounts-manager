/*
 * pwix:accounts-manager/src/common/i18n/en.js
 */

AccountsManager.i18n = {
    ...AccountsManager.i18n,
    ...{
        en: {
            buttons: {
                delete_title: 'Delete the "%s" account',
                edit_title: 'Edit the "%s" account',
                info_title: 'Informations about the "%s" account'
            },
            check: {
                email_exists: 'This email address already exists',
                email_invalid: 'This email address is not valid',
                email_unset: 'An email address is mandatory',
                login_disallow_himself: 'You are about to disallow your own login authorization',
                username_exists: 'This username already exists'
            },
            delete: {
                success: 'The "%s" account has been successfully deleted'
            },
            edit: {
                edit_success: 'The account "%s" has been successfully updated',
                modal_title: 'Editing an account',
                new_success: 'The account "%s" has been successfully created'
            },
            list: {
                admin_notes_th: 'Admin Notes',
                email_address_th: 'Email address(es)',
                email_verified_th: 'Is verified',
                last_connection_th: 'Last connection',
                login_allowed_th: 'Is connection allowed',
                more_title: 'Display more email addresses...',
                not_allowed: '<p>You are unfortunately not allowed to list the accounts.</p>'
                    +'<p>Please contact the application administrator.</p>',
                user_notes_th: 'User Notes',
                username_th: 'Username'
            },
            new: {
                btn_plus_label: 'New account',
                btn_plus_title: 'Define a new account',
                modal_title: 'Defining a new account'
            },
            panel: {
                add_title: 'Add an email address',
                email_label: 'Email :',
                email_ph: 'you@example.com',
                last_login_label: 'Last connection :',
                line_valid: 'Whether this line is valid',
                login_allowed_label: 'Is connection allowed :',
                remove_title: 'Remove this email address',
                username_label: 'Username :',
                username_ph: 'John42',
                verified_label: 'Is email verified :'
            },
            tabs: {
                ident_title: 'Identity',
                roles_title: 'Roles',
                admin_notes_title: 'Admin notes',
                user_notes_title: 'User notes'
            }
        }
    }
};
