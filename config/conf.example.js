
module.exports = {
    development: {
      root: require('path').normalize(__dirname + '/..'),
      app: {
        name: 'Development'
      },
      db: 'mongodb://localhost/db_dev',

      s3: {
        key: '_KEY_',
        secret: '_SECRET_',
        bucket: 'dev.bucket'
      },

      sessionSecret: 'this_is_a_secret_key'
    }
  , test: {
      root: require('path').normalize(__dirname + '/..'),
      app: {
        name: 'Test'
      },
      db: 'mongodb://localhost/db_test',

      s3: {
        key: '_KEY_',
        secret: '_SECRET_',
        bucket: 'test.bucket'
      },

      sessionSecret: 'this_is_a_secret_key'
    }
  , production: {
      root: require('path').normalize(__dirname + '/..'),
      app: {
        name: 'Prod'
      },
      db: 'mongodb://localhost/db_prod',

      s3: {
        key: '_KEY_',
        secret: '_SECRET_',
        bucket: 'prod.bucket'
      },

      sessionSecret: 'this_is_a_secret_key'
    }
}
