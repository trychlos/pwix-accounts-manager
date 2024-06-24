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
                email_address_th: 'Addresse(s) email',
                email_verified_th: 'Vérifiéee',
                last_connection_th: 'Dernière connexion',
                login_allowed_th: 'Connexion autorisée',
                more_title: 'Afficher davantage d\'adresses email...',
                not_allowed: '<p>Vous n\'êtes malheureusement pas autorisé à consulter la liste des comptes.</p>'
                    +'<p>Merci de vous rapprocher de l\'administrateur de l\'application.<p>',
                user_notes_th: 'Notes de l\'utilisateur',
                username_th: 'Nom d\'utilisateur'
            },
            new: {
                btn_plus_label: 'Nouveau compte',
                btn_plus_title: 'Définit un nouveau compte',
                modal_title: 'Définir un nouveau compte'
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
                ident_title: 'Identité',
                roles_title: 'Rôles',
                admin_notes_title: 'Notes de l\'administrateur',
                user_notes_title: 'Notes de l\'utilisateur'
            }
        }
    }
};
