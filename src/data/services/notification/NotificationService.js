import CrudService from '../crud';
import {NotFoundError} from '../../../constants/errors';
import log from '../../../helpers/log';
import UserService from '../users';
import check from 'check-types';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import {emailNotifications, externalBaseUrl} from '../../../config';
import userActivationTemplate from './templates/userActivation.hbs';

const transporter = nodemailer.createTransport(smtpTransport(emailNotifications.smtp));


const notificationTypes = {
  userActivation: {
    subject: 'Account activation',
    templateHtml: userActivationTemplate
  }
};

class NotificationService extends CrudService {
  /**
   * Constructs a new CRUD service based on Notification model
   */
  constructor(contextQuery) {
    super('Notification', contextQuery);
  }

  /**
   * Sends the notification for user to activate account
   * @param {string} userId
   * @return {Promise<void>}
   */
  async createUserActivationNotification(userId) {
    check.assert.assigned(userId, '"userId" is required');
    const service = new UserService();
    const foundUser = await service.get(userId);
    if (!foundUser) {
      throw new NotFoundError({userId});
    }
    const data = {
      link: `${externalBaseUrl}/activateUser/${foundUser.activationCode}`
    };
    await this.createNotificationForEmail(foundUser.login, 'userActivation', data);
  }

  /**
   * Creates a notification object
   * @param {string} userId
   * @param {string} type
   * @param {object} data
   * @return {Promise<Object>}
   */
  async createNotification(userId, type, data) {
    check.assert.assigned(userId, '"userId" is required');
    check.assert.assigned(type, '"type" is required');
    check.assert.assigned(data, '"data" is required');
    const userService = new UserService();
    const foundUser = await userService.get(userId);
    if (!foundUser) {
      throw new NotFoundError({userId});
    }
    const notification = await this.create({
      type,
      receiver: userId,
      email: foundUser.login,
      data
    });
    this.trySendNotification(notification);
    return notification;
  }

  /**
   * Creates a notification object
   * @param {string} email
   * @param {string} type
   * @param {object} data
   * @return {Promise<Object>}
   */
  async createNotificationForEmail(email, type, data) {
    check.assert.assigned(email, '"email" is required');
    check.assert.assigned(type, '"type" is required');
    check.assert.assigned(data, '"data" is required');
    const notification = await this.create({
      type,
      email,
      data
    });
    this.trySendNotification(notification);
    return notification;
  }


  /**
   * Tries to send email
   * @param notification
   */
  trySendNotification(notification) {
    const notificationTemplate = notificationTypes[notification.type];
    const mailOptions = {
      from: emailNotifications.from,
      to: notification.email,
      subject: notificationTemplate.subject,
      html: notificationTemplate.templateHtml(notification.data)
    };
    return new Promise((resolve, reject) => {
      log.debug('trySendNotification', notification);
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          log.error('Error send notification', error);
          return reject(error);
        }
        return resolve(this.merge({id: notification.id, delivered: true}));
      });
    });
  }
}


export default NotificationService;
