/* eslint-disable max-len */

export const scheme = process.env.SCHEME || 'http';
export const port = process.env.PORT || 3000;
export const host = `localhost:${port}`;
export const externalHost = process.env.WEBSITE_HOSTNAME || host;
export const externalBaseUrl = `${scheme}://${externalHost}`;


export const migrationsOnStart = (!!process.env.MIGRATIONS_ON_START !== false);
export const migrationsDirection = process.env.MIGRATIONS_DIRECTION || 'up';

export const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : 'debug');

export const emailNotifications = {
  from: process.env.EMAIL_FROM || 'noreply@email.com',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.mandrillapp.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER || 'Unknown',
      pass: process.env.SMTP_PASSWORD || ''
    }
  }
};


// default locale is the first one
export const locales = ['ru', 'en'];

const dbname = process.env.DB_NAME || `containers${process.env.NODE_ENV === 'development' ? '-dev' : ''}`;

export const db = {
  url: `mongodb://localhost/${dbname}`
};


const enabledDaemons = [];

export const daemons = {
  enabledDaemons,
  config: {}
};

export const analytics = {

  // https://analytics.google.com/
  google: {
    trackingId: process.env.GOOGLE_TRACKING_ID // UA-XXXXX-X
  }

};

export const storage = {
  path: process.env.STORAGE_PATH || '/opt/containers/files',
  maxFileSize: process.env.STORAGE_MAX_FILE_SIZE || 500 * 1024 * 1024,
  temp: process.env.TEMP_PATH || '/opt/containers/tmp'
};

export const auth = {

  jwt: {secret: process.env.JWT_SECRET || 'z6BJ71HZ2Ja9Fo5J426K1n108S407D5A'},

  tokenExpirationTime: 14 * 24 * 3600

};

