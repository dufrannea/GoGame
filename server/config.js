'use strict';

var getConfig = module.exports = function() {
    var ambientConfig = {
        port: process.env.PORT || 8080,

        // Secret is used by sessions to encrypt the cookie.
        secret: process.env.SESSION_SECRET,

        // dataBackend can be 'datastore', 'cloudsql', or 'mongodb'. Be sure to
        // configure the appropriate settings for each storage engine below.
        // If you are unsure, use datastore as it requires no additional
        // configuration.
        dataBackend: process.env.BACKEND || 'datastore',

        // This is the id of your project in the Google Developers Console.
        gcloud: {
            projectId: process.env.GCLOUD_PROJECT
        },

        // The client ID and secret can be obtained by generating a new web
        // application client ID on Google Developers Console.
        oauth2: {
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            redirectUrl: process.env.OAUTH2_CALLBACK ||
            'http://localhost:8080/oauth2callback',
            scopes: ['email', 'profile']
        }
    };
    return Object.assign(
                    {}, 
                    ambientConfig, 
                    require('./local.config'));
};

var config = getConfig();
var projectId = config.gcloud.projectId;
var clientId = config.oauth2.clientId;
var clientSecret = config.oauth2.clientSecret;