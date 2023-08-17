/**
 * jQuery cookieWall plugin 1.3.0
 * Copyright (c) jagullo.fr
 * Licensed under the MIT license
 *
 * jQuery plugin to display a consent modal for cookies and to add the Google Analytics tag.
 *
 * @author	jagullo.fr
 * @website	https://open-source.jagullo.fr/cookie-wall/
 * @docs	https://github.com/julienagullo/cookies-consent
 */
(function($){

    "use strict";

    $.fn.cookieWall = function(options) {

        const params = $.extend({
            id: '',
            cookie: {
                name: 'cookie-wall',
                days: 10,
                path: '/'
            },
            website: {
                name: '',
                url: ''
            },
            logo: {
                url: '',
                width: '',
                align: 'left',
                margin: '0'
            },
            modal: {
                hrColor: '#b3b3b3',
                fontColor: '#3c3c3c',
                backgroundColor: '#fafafa'
            },
            button: {
                acceptColor: '#0a9919',
                acceptColorHover: '#076212',
                refuseColor: '#a40606',
                refuseColorHover: '#7b0505',
            },
            tag: {
                cookiePrefix: '',
                cookieDomain: '',
                cookieExpires: '',
                cookieUpdate: ''
            },
            lang: 'fr'
        }, options);

        const content = {
            title: {
                fr: `Politique de collecte des données`,
                en: `Data collection policy`
            },
            message: {
                fr: `<b>Des fichiers cookies sont utilisés pour analyser le trafic du site ${params.website.url} par le service Google Analytics.</b><br><br>Des informations concernant votre navigation et votre utilisation du site sont transmises ${params.website.name.length > 0 ? ' à ' + params.website.name : ''} et seront analysées <b>de façon anonyme</b> pour améliorer nos services. Les données seront transmises aux États-Unis et sont soumises à <a href="https://policies.google.com/privacy?hl=fr-FR" target="_blank" title="Politique de confidentialité de Google" style="color:inherit;font-weight:bold;">la politique de confidentialité de Google</a>.`,
                en: `<b>Cookie files are used to analyze ${params.website.url} website traffic by Google Analytics service.</b><br><br>Information about your browsing and use of the website is transmitted ${params.website.name.length > 0 ? ' to ' + params.website.name : ''} and will be analyzed <b>anonymously</b> to improve services. The data will be transmitted to the United States and are subject to <a href="https://policies.google.com/privacy?hl=en-US" target="_blank" title="Google privacy policy" style="color:inherit;font-weight:bold;">the Google privacy policy</a>.`
            },
            titleList: {
                fr: `Liste des cookies`,
                en: `List of cookies`
            },
            list: {
                fr: `<ul><li><b>_ga</b> : Utilisé pour distinguer les utilisateurs (expire au bout de 2 ans)</li><li><b>_gid</b> : Utilisé pour distinguer les utilisateurs (expire au bout de 24 heures)</li><li><b>_gat</b> : Utilisé pour limiter le taux de demande (expire au bout de 1 minute)</li></ul>`,
                en: `<ul><li><b>_ga</b>: Used to distinguish users (expires after 2 years)</li><li><b>_gid</b>: Used to distinguish users (expires after 24 hours)</li><li><b>_gat</b>: Used to limit request rate (expires after 1 minute)</li></ul>`
            },
            conservation: {
                fr: `Votre consentement est conservé pendant <b>${params.cookie.days}</b> jour${params.cookie.days > 1 ? 's' : ''}. Vous pouvez réinitialiser votre consentement en supprimant le cookie <b>${params.cookie.name}</b> des données de votre navigateur.`,
                en: `Your consent is kept for <b>${params.cookie.days}</b> day${params.cookie.days > 1 ? 's' : ''}. You can reset your consent by deleting the <b>${params.cookie.name}</b> cookie from your browser data.`
            },
            accepted: {
                fr: `Accepter`,
                en: `Accept all cookies`
            },
            refused: {
                fr: `Non merci`,
                en: `No thanks`
            }
        };

        const tag_params = {}
        for (const property in params.tag) {
            if (params.tag[property] !== '') {
                tag_params[property.replace( /([A-Z])/g, "-$1" ).toLowerCase()] = params.tag[property];
            }
        }

        const tag = '<script async src="https://www.googletagmanager.com/gtag/js?id=' + params.id + '"></script>' +
            '<script>' +
            'window.dataLayer = window.dataLayer || [];' +
            'function gtag(){dataLayer.push(arguments);}' +
            'gtag(\'js\', new Date());' +
            'gtag(\'config\', \'' + params.id + '\', ' + JSON.stringify(tag_params).replace(/"/g, '\'') + ');' +
            '</script>';

        const logo = params.logo.url != '' ? `<div class="logo"><img src="${params.logo.url}" alt="Logo"></div>` : '';

        const modal = '' +
            '<div class="ck-modal">' +
            '<div class="ck-window">' +
            '<div class="ck-content">' +
            '<div class="pop_details">' +
            '<h2><strong>Protecting your data</strong> is everything to us</h2>' +
            '<p>We and our advertising, analytics, and social media partners use cookies and other technologies to optimise your experience, show relevant content, and analyse our traffic. Click “Accept” to, well, accept. You can change your preferences in “Cookie Settings”.</p>' +
            '<div class="ck-choise">' +
            '<a class="btn-accept button" style="margin: 0 auto;" href="#">' + content.accepted[params.lang] + '</a>' +
            '<a href="privacy-policy.html" style="text-align: center; display: block; width: 100%;">Cookies settings</a>' +
            '</div> ' +
            '</div> ' +
            '</div> ' +
            '</div>';

        let h;

        function init() {
            if (params.id != '') {
                let c = getCookie();
                if (c == null || (c != 0 && c != 1)) {
                    displayModal();
                } else if (c == 1) {
                    addTag();
                }
            } else {
                console.log('No ID defined in the cookieWall params.');
            }
        }

        function displayModal() {
            $('body').prepend(modal);
            h = $('.ck-modal .panel ul').outerHeight(true);
            $('body').on('mousedown', '.ck-modal .ck-choise a', setChoise);
            $('body').on('click', '.accordion', function() {
                this.classList.toggle('active');
                let panel = $(this).parent().find('.panel');
                if (panel.css('visibility') === 'visible') {
                    $(panel).animate({height:0},200, function() {
                        panel.css('visibility', 'hidden');
                    });
                } else {
                    panel.css('visibility', 'visible');
                    $(panel).animate({height:h},200);
                }
            });
            $(window).on('resize', function(e) {
                h = $('.ck-modal .panel ul').outerHeight(true);
                let panel = $('.ck-modal .panel');
                if (panel.css('visibility') === 'visible') {
                    panel.css('height', h);
                }
            });
        }

        function setChoise(e) {
            e.preventDefault();
            let r = $(this).attr('class').substring(4, $(this).attr('class').length);
            if (r == 'accept') {
                setCookie(1);
                addTag();
            } else {
                setCookie(0);
            }
            $('body .ck-modal').remove();
            $('body').off('mousedown', '.ck-modal .ck-choise a');
            $('body').off('click', '.accordion');
            $(window).off('resize');
        }

        function addTag() {
            $('body').append(tag);
        }

        function getCookie() {
            let t = document.cookie.split('; ');
            let f = t.find(row => row.startsWith(params.cookie.name + '='));
            if (typeof f != 'undefined') {
                return f.split('=')[1];
            }
            return null;
        }

        function setCookie(value) {
            let a = params.cookie.days * 86400;
            document.cookie = params.cookie.name + '=' + value + ';max-age=' + a + ';path=' + params.cookie.path + ';SameSite=None;Secure';
        }

        function removeCookie() {
            document.cookie = params.cookie.name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=None;Secure'
        }

        init();

        return this;

    };

})(jQuery);