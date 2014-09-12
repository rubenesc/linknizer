
var config =  {

    development: {

      root: require('path').normalize(__dirname + '/..'),

      app: {
        name: 'Linknizer: Development'
      },

      db: 'mongodb://localhost/linknizer_dev',
      //db: 'mongodb://nodejitsu:a0ddc7b3021984412c051889870a6086@dharma.mongohq.com:10049/nodejitsudb4302112003',
      
      s3: {
        key: 'AKIAJJUPTTB6X46U5XFA',
        secret: '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',
        bucket: 'linknizer-dev-local'
      },

      sessionSecret: 'this_is_a_secret_key'

    }, 

    test: {

      root: require('path').normalize(__dirname + '/..'),
      
      app: {
        name: 'Linknizer: Testing'
      },

      db: 'mongodb://localhost/linknizer_test',

      s3: {
        key: 'AKIAJJUPTTB6X46U5XFA',
        secret: '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',
        bucket: 'linknizer-test'
      },
      
      sessionSecret: 'this_is_a_secret_key',

      twitter: {
          clientID: 'CONSUMER_KEY'
        , clientSecret: 'CONSUMER_SECRET'
        , callbackURL: 'http://localhost:3000/auth/twitter/callback'
      }
      
    }, 

    production: {

      root: require('path').normalize(__dirname + '/..'),

      app: {
        name: 'Linknizer'
      },

      // db: 'mongodb://localhost/linknizer_dev',
      db: 'mongodb://nodejitsu:a0ddc7b3021984412c051889870a6086@dharma.mongohq.com:10049/nodejitsudb4302112003',
      
      s3: {
        key: 'AKIAJJUPTTB6X46U5XFA',
        secret: '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',
        bucket: 'linknizer-prd'
      },
      
      sessionSecret: 'this_is_a_secret_key'
      
    }
}

module.exports = config;

