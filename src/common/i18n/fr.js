/*
 * pwix:accounts-manager/src/common/i18n/fr.js
 */

AccountsManager.i18n = {
    ...AccountsManager.i18n,
    ...{
        fr: {
            buttons: {
                delete_title: 'Supprime le compte "%s"',
                edit_title: 'Edite le compte "%s"',
                info_title: 'Informations sur l\'enregistrement "%s"'
            },
            check: {
                email_exists: 'Cette adresse de messagerie est déjà utilisée',
                email_invalid: 'Cette adresse de messagerie n\'est pas valide',
                email_unset: 'Une adresse de messagerie est obligatoire',
                username_exists: 'Ce nom d\'utilisateur est déjà utilisé'
            },
            delete: {
                success: 'Le compte "%s" a été supprimé avec succès'
            },
            edit: {
                modal_title: 'Editer un compte'
            },
            list: {
                admin_notes_th: 'Notes de l\'administrateur',
                email_address_th: 'Addresse email',
                email_verified_th: 'Vérifiéee',
                last_connection_th: 'Dernière connexion',
                login_allowed_th: 'Connexion autorisée',
                more_title: 'Afficher davantage d\'adresses email...',
                user_notes_th: 'Notes de l\'utilisateur',
                username_th: 'Nom d\'utilisateur'
            },
            panel: {
                add_title: 'Ajouter une adresse de messagerie',
                email_label: 'Adresse de messagerie :',
                email_ph: 'you@example.com',
                last_login_label: 'Dernière connexion :',
                line_valid: 'Indicateur de validité de la ligne',
                login_allowed_label: 'Connexion autorisée :',
                remove_title: 'Supprimer cette adresse de messagerie',
                username_label: 'Nom d\'utilisateur :',
                username_ph: 'Un nom d\'utilisateur',
                verified_label: 'Adresse email vérifiée :'
            },
            tabs: {
                ident_title: 'Identité'
            }
        /*
            accounts: {
                manager: {
                    allowed_th: 'Login allowed',
                    api_allowed_th: 'API allowed',
                    btn_plus_label: 'New account',
                    btn_plus_title: 'Define a new account',
                    delete_btn: 'Delete the "%s" account',
                    delete_confirm: 'You are about to delete the "%s" account.<br />Are you sure ?',
                    delete_title: 'Deleting an account',
                    edit_btn: 'Edit the "%s" account',
                    email_th: 'Email address',
                    ident_title: 'Identity',
                    last_th: 'Last seen',
                    new_title: 'Defining a new account',
                    preamble: 'Register and manage here the accounts allowed to connect to the applications.',
                    roles_btn: 'Edit the roles',
                    roles_th: 'Roles',
                    roles_title: 'Roles',
                    set_allowed_false: 'The "%s" email address is no more allowed to log in',
                    set_allowed_true: 'The "%s" email address is now allowed to log in',
                    set_api_allowed_false: 'The "%s" email address is no more allowed to access the API',
                    set_api_allowed_true: 'The "%s" email address is now allowed to access the API',
                    set_verified_false: 'The "%s" email address has been reset as "not verified"',
                    set_verified_true: 'The "%s" email address has been set as "verified"',
                    settings_title: 'Settings',
                    tab_title: 'Accounts Management',
                    total_count: '%s registered account(s)',
                    username_th: 'Username',
                    verified_th: 'Verified',
                    verify_resend: 'Resend an email verification link',
                    verify_sent: 'Email verification link has been sent'
                },
                panel: {
                    add_title: 'Add a role',
                    allowed_label: 'Is login allowed',
                    api_allowed_label: 'Is API allowed',
                    email_label: 'Email:',
                    email_ph: 'you@example.com',
                    line_valid: 'Whether this line is valid',
                    no_role: 'No selected role',
                    remove_title: 'Remove this role',
                    role_option: 'Choose a role',
                    role_th: 'Role',
                    scope_th: 'Scope',
                    select_title: 'Select desired accounts',
                    settings_preamble: 'A placeholder for various settings available to the user',
                    username_label: 'Username:',
                    username_ph: 'An optional username',
                    verified_label: 'Is email verified',
                    with_scope: 'Select a scope',
                    without_scope: 'Role is not scoped'
                }
            }
            */
        }
    }
};
