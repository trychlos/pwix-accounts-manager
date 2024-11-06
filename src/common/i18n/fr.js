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
                info_title: 'Informations sur le compte "%s"'
            },
            check: {
                email_exists: 'Cette adresse de messagerie est déjà utilisée',
                email_invalid: 'Cette adresse de messagerie n\'est pas valide',
                email_unset: 'Une adresse de messagerie est obligatoire',
                login_disallow_himself: 'Vous êtes sur le point de désactiver votre propre autorisation de connexion',
                username_exists: 'Ce nom d\'utilisateur est déjà utilisé',
                username_unset: 'Un nom d\'utilisateur est obligatoire'
            },
            delete: {
                confirmation_text: 'Vous êtes sur le point de supprimer le compte "%s".<br />Etes-vous sûr ?',
                confirmation_title: 'Supprimer un compte',
                success: 'Le compte "%s" a été supprimé avec succès'
            },
            edit: {
                edit_error: 'Nous sommes malheureusement dans l\'impossibilité de mettre à jour le compte "%s". Merci de réessayer ultérieurement',
                edit_success: 'Le compte "%s" a été mis à jour avec succès',
                modal_title: 'Editer le compte "%s"',
                new_error: 'Nous sommes malheureusement dans l\'impossibilité de créer le compte "%s". Merci de réessayer ultérieurement',
                new_label: '(nouveau)',
                new_success: 'Le compte "%s" a été créé avec succès'
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
                roles_th: 'Rôles',
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
