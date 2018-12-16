# Модели

## School - заполняем из справочника
* name: String, required - название школы
* inn: String, required - ИНН
* kpp: String, required - КПП
* ogrn: String, required - ОГРН
* directorName: String, required - ФИО руководителя
* directorPosition: String, required - должность руководителя
* phoneNumber: String, required - Номер телефона
* locality: ObjectId, required, ref: 'Locality' - населенный пункт
* site: String - адрес сайта
* email: String, required - e-mail школы
* contractStatus: String, required, enum: ['notSigned', 'pending', 'signed', 'rejected'], default: 'notSigned' - статус подписания контракта
* contract: ObjectId, ref: 'File' - ссылка на скан контракта. Может меняться только при School.contractStatus == 'notSigned'
* contractRejectReason: String - причина отклонения контракта
* contractSignDate: Date - дата подписания контракта
* active: Boolean - признак активированности школы

## User - пользователи
* firstName: String, required - Имя
* lastName: String, required - Фамилия
* middleName: String, required - Отчество
* login: String, required - e-mail
* password: String, required - пароль пользователя; предлагаю на этом этапе хранить в открытом виде для того, чтобы в дальнейшем иметь возможность перенести пользователей в ИБЦ.
* passwordSalt: String, required - соль пароля
* photo: ObjectId, ref: 'File' - фото
* accessRoles: [String], required, enum: ['globalAdmin', 'regionAdmin', 'schoolAdmin', 'student', 'publisher'], default: 'student' - уровени доступа пользователя:
  * globalAdmin - глобальный администратор
  * regionAdmin - администратор муниципалитета
  * schoolAdmin - школьный администратор
  * student - простой пользователь
  * publisher - правообладатель
* type: String, required, enum: ['student', 'teacher', 'other'] - тип пользователя
* school: ObjectId, ref: 'School' - привязка пользователя к школе
* publisher: ObjectId, ref: 'Publisher' - привязка пользователя к правообладателю
* region: ObjectId, ref: 'Region' - привязка пользователя к муниципалитету

## Publisher - правообладатели
* name: String, required - наименование правообладателя
* description: String - описание правообладателя
* adress: String, required - адрес правообладателя
* phone: String, required - номер телефона правообладателя
* support: String, required - контакты поддержки правообладателя

## Eor - ЭОРы
* name: String, required - название ЭОР
* cover: ObjectId, required, ref: 'File' - обложка ЭОР
* description: String, required - описание ЭОР
* publisher: ObjectId, required - правообладатель
* subject: String, required, enum: ['1'...'57'] - предмет
* grades: [Number], required - классы


## EorElement - элементы ЭОРа
* eor: ObjectId, required, ref: 'Eor' - ссылка на корневой ЭОР. Не может изменяться.
* name: String, required - название элемента ЭОР
* description: String - описание элемента ЭОР
* theme: String - тема
* themesCount: Number - число тем
* accessType: [String], required, enum: ['offline', 'online'] - доступность
* tags: [String], enum: ['огэ', 'егэ', 'впр'] - тэги
* targetRoles: [String], required, enum: ['teacher', 'student'] - роли
* targetDevices: [String], required, enum: ['pc', 'tablet', 'laptop', 'projector'] - демонстрационное оборудование
* typeOfContent: [String], required, enum: ['information', 'practical', 'control'] - вид единицы ЭОР
* multimediaLevel: Number, required, >= 1, <= 5 - уровень мультимедийности
* interactivityLevel: Number, required, >= 1, <= 4 - уровень интерактивности
* url: String, required - URL для доступа
* demoUrl: String - URL для демо-доступа
* price: Number, required, >= 0 - цена элемента ЭОР в баллах

## EorActivation
* date: Date, required, default: Date.now - дата активации
* expirationDate: Date - дата истечения активации
* eor: ObjectId, required, ref: 'eor' - ссылка на активированный eor
* eorElement: ObjectId, required, ref: 'EorElement' - ссылка на активированный eorElement
* school: ObjectId, required, ref: 'School' - ссылка на школу, которая активировала; пара eor/school должна быть уникальной
* price: Number, required, >= 0 - цена элемента ЭОР по которой он был приобретен

## Balance
* date: Date, required - дата изменения баланса
* school: ObjectId, required, ref: 'School' - школа для которой регистрируется изменение баланса
* change: Number, required - сумма изменения (положительная для прихода и отрицательная для расхода)
* previousValue Number, required, >= 0 - остаток до изменения
* value: Number, required, >= 0 - остаток после измененя
* parent: ObjectId, required, ref: 'Balance' - ссылка на предыдущий элемент баланса, пара parent/school должна быть уникальной для предотвращения двойного списания
* type: String, required, enum: ['deposit', 'change', 'order'] - тип изменения: изменение администратором или расход на приобретение
* refEorActivation: ObjectId, ref: 'EorActivation' - ссылка на объек активации ЭОР
* refActivationCode: ObjectId, ref: 'ActivationCode' - ссылка на код активации, по которому был осуществлен депозит

Для того, чтобы получить баланс школы, достаточно запросить последний документ, отсортированной по _id коллекции для определенной школы и взять value

## ActivationCode - коды активации организаций
* code: String, required - код активации
* school: ObjectId, required, ref: 'School' - школа
* deposit: Number, required, >= 0 - размер депозита для зачисления школе
* activated: Boolean, required, default: false - признак активации
* activationDate: Date - дата активации
* activationUser: ObjectId, ref: 'User' - активироваваший пользователь

## Locality - населенные пункты, заполняем из справочника
* name: String, required - наименование населенного пункта
* region: ObjectId, required, ref: 'Region' - регион

## Region - регионы, заполняем из справочника
* name: String, required - наименование региона

## File - файлы
* school: ObjectId, required, ref: 'User' - школа-владелец файла
* name: String, required - название файла
* size: Number, required, integer, >= 0 - размер файла
* readySize: Number, required, integer, >= 0 - размер загруженных данных
* ready: Boolean, required - статус готовности файла

# Разделы портала

* Коллекция - доступна пользователям с accessLevel >=0. Отображается список EorActivation с фильтром EorActivation.schppl = User.school
* Профиль - доступна пользователям с accessLevel >=0. Для пользователей с accessLevel >= 1 в этом же разделе должна быть возможность изменить данные школы или загрузить скан договора, если он к ней привязан.
* Витрина - доступна пользователями с ролью schoolAdmin. Отображается список Eor. Для каждого элемента Eor должен быть осуществлен поиск EorActivation для текущей школы для того, чтобы определить, активирован ли уже ЭОР этой школой или нет.
* Администрирование - отображается пользователем с ролью globalAdmin
  * Школы - отображается список школ с возможностью добавления, удаления, редактирования данных и изменения баланса
  * ЭОРы - отображается с возможностью добавления, удаления, редактирования данных
  * Отчеты - содержит подразделы с отчетами, описанными в ТЗ
  


