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
                email_max: 'Un maximum de %s adresse(s) de messagerie est configuré, mais %s ont été trouvée(s)',
                email_min: 'Un minimum de %s adresse(s) de messagerie est configuré mais %s ont été trouvée(s)',
                email_preferred: 'Plus d\'une adresse de messagerie est marquée comme \'préférée\'',
                login_disallow_himself: 'Vous êtes sur le point de désactiver votre propre autorisation de connexion',
                username_exists: 'Ce nom d\'utilisateur est déjà utilisé',
                username_max: 'Un maximum de %s username(s) est configuré, mais %s ont été trouvée(s)',
                username_min: 'Un minimum de %s username(s) est configuré mais %s ont été trouvée(s)',
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
            dialogs: {
                accounts_select_dialog_title: 'Choisissez un ou plusieurs comptes utilisateur',
                accounts_select_ph: 'Selectionnez les comptes souhaités'
            },
            list: {
                admin_notes_th: 'Notes de l\'administrateur',
                email_address_th: 'Addresse(s) email',
                email_label_th: 'Intitulé',
                email_verified_th: 'Vérifiéee',
                last_connection_th: 'Dernière connexion',
                login_allowed_th: 'Connexion autorisée',
                more_title: 'Afficher davantage d\'adresses email...',
                not_allowed: '<p>Vous n\'êtes malheureusement pas autorisé à consulter la liste des comptes.</p>'
                    +'<p>Vous pouvez vous rapprocher de votre administrateur pour demander les habilitations nécessaires.<p>',
                role_global: 'Global',
                role_global_tooltip: 'Rôles directement assignés à l\'utilisateur \'%s\' au niveau global',
                role_scoped: 'Périmètre',
                role_scoped_tooltip: 'Ce sont les rôles directement assignés à l\'utilisateur \'%s\' sur le périmètre \'%s\'',
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
                reset_error: 'Il m\'est malheureusement impossible d\'envoyer le lien pour le moment. Merci de réessayer ultérieurement',
                reset_success: 'Le lien a été envoyé à "%s" avec succès',
                reset_title: 'Envoi un lien à \'%s\'  pour permettre à l\'utilisateur de réinitialiser son mot de passe',
                username_label: 'Nom d\'utilisateur :',
                username_ph: 'Un nom d\'utilisateur',
                verified_label: 'Adresse email vérifiée :',
                verify_error: 'Il m\'est malheureusement impossible d\'envoyer le lien pour le moment. Merci de réessayer ultérieurement',
                verify_success: 'Le lien a été envoyé à "%s" avec succès',
                verify_title: 'Envoi un lien à \'%s\' pour permettre à l\'utilisateur de vérifier son adresse de messagerie'
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
