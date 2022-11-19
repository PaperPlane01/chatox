import {Labels} from "../types";

export const ru: Labels = {
    "blacklist.users": "Заблокированные пользователи",
    "blacklist.users.add": "Заблокировать пользователя",
    "blacklist.users.add.error": "Не удалось заблокировать пользователя, сервер ответил со статусом {errorStatus}",
    "blacklist.users.add.success": "Пользователь {username} был заблокирован",
    "blacklist.users.error": "Не удалось загрузить список заблокированных пользователей, сервер ответил со статусом {errorStatus}",
    "blacklist.users.remove": "Разблокировать пользователя",
    "blacklist.users.remove.error": "Не удалось разблокировать пользователя, сервер ответил со статусом {errorStatus}",
    "blacklist.users.remove.success": "Пользователь {username} был разблокирован",
    "cancel": "Отменить",
    "change-password": "Сменить пароль",
    "change-password.confirm-password": "Повторите новый парль",
    "change-password.current-password": "Текущий пароль",
    "change-password.error.email-confirmation-code-expired": "Код подтверждения истёк",
    "change-password.error.email-confirmation-code-invalid": "Неверный код подтверждения",
    "change-password.error.email-mismatch": "Данный код подтверждения принадлежит другому пользователю",
    "change-password.error.server-unreachable": "Во время попытки обновить пароль произошла ошибка: сервер недоступен",
    "change-password.error.unknown-error": "Во время попытки обновить пароль произошла ошибка, сервер ответил со статусом {errorStatus}",
    "change-password.error.wrong-password": "Неправильный пароль",
    "change-password.new-password": "Новый пароль",
    "change-password.success": "Пароль был обновлён",
    "chat-role.level.must-be-integer": "Level must be integer",
    "chat-role.level.up-to.must-be-greater-than-from": "Upper level bust be greater than lower",
    "chat-role.list": "Роли в чате {chatName}",
    "chat-role.list.no-chat": "Роли",
    "chat.avatar.upload": "Загрузить аватар",
    "chat.blocking.actions": "Действия",
    "chat.blocking.block-until": "Дата окончания блокировки",
    "chat.blocking.block-until.must-be-in-future": "Дата окончания блокировки должна быть в будущем",
    "chat.blocking.block-until.required": "Дата окончания блокировки обязательна к заполнению",
    "chat.blocking.block-user": "Заблокировать пользователя",
    "chat.blocking.blocked-by": "Кем заблокирован",
    "chat.blocking.blocked-until": "Дата окончания блокировки",
    "chat.blocking.blocked-user": "Заблокированный пользователь",
    "chat.blocking.blocked-users": "Блокировки",
    "chat.blocking.cancel": "Отменить",
    "chat.blocking.canceled-at": "Дата отмены",
    "chat.blocking.canceled-by": "Кем отменена",
    "chat.blocking.create": "Заблокировать пользователя {username} в чате {chatName}",
    "chat.blocking.create.without-username": "Заблокировать пользователя в чате {chatName}",
    "chat.blocking.created-at": "Дата блокировки",
    "chat.blocking.current-user-blocked.no-reason": "Вы были заблокированы в этом чате пользователем {blockedByUsername}. Блокировка закончится {blockedUntil}",
    "chat.blocking.current-user-blocked.with-reason": "Вы были заблокированы в этом чате пользователем {blockedByUsername} по причине: \"{reason}\". Блокировка закончится {blockedUntil}",
    "chat.blocking.delete-recent-messages": "Удалить недавние сообщения",
    "chat.blocking.description": "Причина блокировки",
    "chat.blocking.description.too-long": "Описание причины блокировки слишком длинное",
    "chat.blocking.edit": "Редактировать",
    "chat.blocking.error.forbidden": "У вас нет прав на совершение данной операции",
    "chat.blocking.error.server-unreachable": "Во время попытки заблокировать пользователя произошла ошибка, сервер недоступен",
    "chat.blocking.error.unknown": "Во время попытки заблокировать пользователя произошла ошибка. Сервер ответил со статусом {responseStatus}. Пожалуйста, попробуйте позже",
    "chat.blocking.info": "Информация о блокировке пользователя {username} в {chatName}",
    "chat.blocking.list": "Пользователи, заблокированные в {chatName}",
    "chat.blocking.messages-deletion-period": "Период удаления сообщений",
    "chat.blocking.messages-deletion-period.ALL_TIME": "За всё время",
    "chat.blocking.messages-deletion-period.FIVE_MINUTES": "5 минут",
    "chat.blocking.messages-deletion-period.ONE_DAY": "1 день",
    "chat.blocking.messages-deletion-period.ONE_HOUR": "1 час",
    "chat.blocking.messages-deletion-period.ONE_YEAR": "1 год",
    "chat.blocking.no-active-blockings": "Нет активных блокировок",
    "chat.blocking.no-blockings": "Нет блокировок",
    "chat.blocking.show-active-only": "Показывать только активные",
    "chat.blocking.success": "Пользователь был заблокирован",
    "chat.blocking.update": "Обновить блокировку пользователя {username} в чате {chatName}",
    "chat.blocking.update.blocking": "Обновить блокировку",
    "chat.blocking.update.error.forbidden": "У вас нет прав на совершение данной операции",
    "chat.blocking.update.error.server-unreachable": "Во время попытки обновить блокировку произошла ошибка: сервер недоступен",
    "chat.blocking.update.error.unknown": "Во время обновления блокировки произошла неизвестная ошибка, сервер ответил со статусом {errorStatus}",
    "chat.blocking.updated-at": "Дата обновления",
    "chat.blocking.updated-by": "Кем обновлена",
    "chat.blocking.user-id-or-slug": "ID или URL пользователя",
    "chat.blocking.user-id-or-slug.not-exist": "Не удалось найти пользователя с таким ID или URL",
    "chat.blocking.user-id-or-slug.unknown-error": "Во время проверки ID пользователя произошла ошибка, сервер ответил со статусом {errorStatus}",
    "chat.create-chat": "Создать чат",
    "chat.delete": "Удалить чат",
    "chat.delete.comment": "Комментарий",
    "chat.delete.comment-is-too-long": "Комментарий слишком длинный",
    "chat.delete.comment-required-if-reason-is-other": "Комментарий обязателен, если причиной удаления указано \"Другое\"",
    "chat.delete.error.already-deleted": "Чат уже был удалён",
    "chat.delete.error.server-unreachable": "Ошибка при удалении чата: сервер недоступен",
    "chat.delete.error.unknown": "При удалении чата произошла ошибка, сервер ответил со статусом {errorStatus}",
    "chat.delete.reason": "Причина",
    "chat.delete.reason.CHILD_ABUSE": "Жестокое обращение с детьми",
    "chat.delete.reason.ILLEGAL_CONTENT": "Незаконный контент",
    "chat.delete.reason.OTHER": "Другое",
    "chat.delete.reason.PORNOGRAPHY": "Порнография",
    "chat.delete.reason.SPAM": "Спам",
    "chat.delete.specify-reason": "Укажите причину удаления чата",
    "chat.delete.success": "Чат успешно удалён",
    "chat.delete.with-name": "Удалить чат {chatName}",
    "chat.deleted": "Этот чат был удалён",
    "chat.deleted.by-creator": "Данный чат был удалён создателем",
    "chat.deleted.with-reason": "Данный чат был удалён модераторами по следующей причине: {reason}",
    "chat.deleted.with-reason-and-comment": "Данный чат был удалён модераторами по следующей причине: {reason}. Модератор оставил следующий комментарий: {comment}",
    "chat.description": "Описание",
    "chat.description.too-long": "Описание слишком длинное",
    "chat.edit": "Редактировать чат",
    "chat.feature.additional.fromLevel": "Начиная с уровня",
    "chat.feature.additional.upToLevel": "До уровня",
    "chat.feature.assignChatRole": "Назначение ролей",
    "chat.feature.blockUsers": "Блокировка пользователей",
    "chat.feature.blockUsers.allowPermanent": "Может блокировать навсегда",
    "chat.feature.blockingImmunity": "Иммунитет к блокировке в чате",
    "chat.feature.changeChatSettings": "Изменение настроек чата",
    "chat.feature.deleteChat": "Удаление чата",
    "chat.feature.deleteOtherUsersMessages": "Удаление сообщений других пользователей",
    "chat.feature.deleteOwnMessages": "Удаление собственных сообщений",
    "chat.feature.kickImmunity": "Иммунитет к выгонению из чата",
    "chat.feature.kickUsers": "Выгонять пользователей из чата",
    "chat.feature.messageDeletionImmunity": "Иммунитет к удалению сообщений другими пользователями",
    "chat.feature.modifyChatRole": "Изменение ролей",
    "chat.feature.pinMessages": "Закрепление сообщений",
    "chat.feature.scheduleMessages": "Отправка отложенных сообщений",
    "chat.feature.sendMessages": "Оптравка сообщений",
    "chat.feature.sendMessages.allowedToSendAudios": "Отправка аудио",
    "chat.feature.sendMessages.allowedToSendFiles": "Отправка файлов",
    "chat.feature.sendMessages.allowedToSendImages": "Оптравка картинок",
    "chat.feature.sendMessages.allowedToSendStickers": "Отправка стикеров",
    "chat.feature.sendMessages.allowedToSendVideos": "Отправка видео",
    "chat.feature.sendMessages.allowedToSendVoiceMessages": "Отправка голосовых сообщений",
    "chat.feature.showRoleNameInChat": "Отображение назавния роли в сообщениях",
    "chat.info": "Информация о чате",
    "chat.join": "Стать участником чата",
    "chat.join.error": "Во время попытки стать участником чата произошла ошибка",
    "chat.leave": "Покинуть чат",
    "chat.login-to-see-list": "Войдите в аккаунт, чтобы увидеть список ваших чатов",
    "chat.my-chats": "Мои чаты",
    "chat.name": "Название",
    "chat.name.empty": "Название не должно быть пустым",
    "chat.name.too-long": "Название слишком длинное",
    "chat.name.too-short": "Название слишком короткое",
    "chat.no-description": "Описание не указано",
    "chat.not-found": "Чат не найден",
    "chat.number-of-participants": "{numberOfParticipants} участников, {onlineParticipantsCount} онлайн",
    "chat.online-participants-count": "{onlineParticipantsCount} участников онлайн",
    "chat.participant.kick": "Выгнать из чата",
    "chat.participant.kick.error": "Во время попытки выгнать участника чата произошла ошибка",
    "chat.participant.kick.success": "Участник чата был выгнан",
    "chat.participant.role": "Роль пользователя в чате",
    "chat.participant.role.ADMIN": "Администратор",
    "chat.participant.role.MODERATOR": "Модератор",
    "chat.participant.role.OWNER": "Владелец",
    "chat.participant.role.SUPER_ADMIN": "Суперадмин",
    "chat.participant.role.USER": "Пользователь",
    "chat.participant.update": "Обновить участника чата",
    "chat.participant.update.error.server-unreachable": "Error occurred when tried to update chat participant. Server is unreachable",
    "chat.participant.update.error.unknown-error": "Error occurred when tried to update chat participant. Server responded with {errorStatus} status",
    "chat.participant.update.success": "Участник чата был обновлён",
    "chat.participant.update.with-username": "Обновить участнкиа чата {username}",
    "chat.role": "Роль {roleName}",
    "chat.role.create": "Создать новую роль",
    "chat.role.create.error.unknown": "При попытке создать роль произошла ошибка, сервер ответил со статусом {errorStatus}",
    "chat.role.create.success": "Роль создана",
    "chat.role.create.with-chat-name": "Создать новую роль в чате {chatName}",
    "chat.role.default-for-new-participants": "Назначается по умолчанию",
    "chat.role.default-role.replacement": "Новая роль по умолчанию",
    "chat.role.default-role.required": "Необходимо выбрать новую роль",
    "chat.role.level": "Уровень",
    "chat.role.level.cannot-be-empty": "Уровень роли не может быть пустым",
    "chat.role.level.is-too-big": "Уровень роли не может быть больше 1000",
    "chat.role.level.is-too-low": "Уровень роли не может быть меньше -1000",
    "chat.role.name": "Название",
    "chat.role.name.cannot-be-empty": "Название роли не может быть пустым",
    "chat.role.name.is-too-long": "Название роли слишком длинное",
    "chat.role.update": "Обновить роль {roleName}",
    "chat.role.update.error.unknown": "При попытке обновить роль произошла ошибка, сервер ответил со статусом {errorStatus}",
    "chat.role.update.success": "Роль обновлена",
    "chat.role.with-level": "Роль {roleName} (уровень {level})",
    "chat.select-chat": "Выберите чат",
    "chat.slug": "URL чата",
    "chat.slug.contains-invalid-characters": "URL содержит недопустимые символы",
    "chat.slug.has-already-been-taken": "Данный URL уже занят",
    "chat.slug.too-long": "URL слишком длинный",
    "chat.slug.too-short": "URL слишком кототкий",
    "chat.tag.too-long": "Тег {tag} слишком длинный",
    "chat.tags": "Теги",
    "chat.tags.too-many": "Слишком много тегов",
    "chat.update": "Обновить чат {chatName}",
    "chat.update.api-unreachable": "Во время попытки обновить чат произошла ошибка: сервер недоступен",
    "chat.update.no-permission": "У вас нет прав на обновление чата",
    "chat.update.save-changes": "Сохранить",
    "chat.update.success": "Чат обновлён",
    "chat.update.unexpected-error": "Во время попытки обновить чат произошла непредвиденная ошибка. Сервер ответил со статусом {errorStatus}",
    "chats.popular": "Популярные чаты",
    "chats.popular.load-more": "Загрузить ещё",
    "close": "Закрыть",
    "common.authorization-required": "Вы должны войти в аккаунт, чтобы увидеть эту страницу",
    "common.create": "Создать",
    "common.delete": "Удалить",
    "common.enabled": "Включено",
    "common.error.server-unreachable": "Сервер недоступен",
    "common.load-more": "Загрузить ещё",
    "common.messages": "Сообщения",
    "common.retry": "Повторить",
    "common.search": "Поиск",
    "edit": "Редактировать",
    "email": "E-mail",
    "email-confirmation-code.creation.error": "Во время создания кода подтверждения произошла ошибка. Сервер ответил со статусом {errorStatus}",
    "email-confirmation-code.creation.error.server-unreachable": "Во время создания кода подтверждения произошла ошибка, сервер недоступен",
    "email-confirmation-code.creation.might-take-a-while": "Это может занять какое-то время",
    "email-confirmation-code.creation.pending": "Создание кода подтверждения",
    "email.empty": "E-mail не должен быть пустым",
    "email.has-already-been-taken": "Этот e-mail уже используется",
    "email.invalid": "Некорректный e-mail",
    "email.verification.code": "Код подтверждения",
    "email.verification.code.empty": "Код подтверждения не может быть пустым",
    "email.verification.code.enter": "Введите код потверждения",
    "email.verification.code.expired": "Данный код подтверждения истёк",
    "email.verification.code.invalid": "Неправильный код подтверждения",
    "email.verification.code.sent": "Мы отправили код подтверждения на указанный e-mail",
    "email.verification.server-unreachable": "Во время попытки проверить код подтверждения произошла ошибка: сервер недоступен",
    "email.verification.unknown-error": "Во время попытки проверить код подтверждения произошла непредвиденная ошибка. Сервер ответил со статусом {errorStatus}",
    "emoji.pick-emoji-set": "Набор эмоджи",
    "emoji.picker.tab.emoji": "Эмоджи",
    "emoji.picker.tab.stickers": "Стикеры",
    "emoji.set.apple": "Apple",
    "emoji.set.emojione": "Emoji One",
    "emoji.set.facebook": "Facebook",
    "emoji.set.google": "Google",
    "emoji.set.messenger": "Messenger",
    "emoji.set.native": "Системные",
    "emoji.set.twitter": "Twitter",
    "emoji.use-codes": "Использовать коды эмоджи при вводе текста",
    "error-boundary.stacktrace.hide": "Скрыть стек ошибки",
    "error-boundary.stacktrace.show": "Показать стек ошибки",
    "error.generic.server-unreachable": "Сервер недоступен",
    "error.unknown": "Произошла неизвестная ошибка",
    "feature.not-available": "Данный функционал пока недоступен",
    "file.audio": "Аудио",
    "file.file": "Файл",
    "file.image": "Изображение",
    "file.show-files": "Показать файлы",
    "file.too-large": "Файл слишком большой",
    "file.too-large.with-file-name": "Файл {fileName} слишком большой",
    "file.video": "Видео",
    "files.attached-files": "Прикреплённые файлы",
    "firstName": "Имя",
    "firstName.empty": "Имя не должно быть пустым",
    "firstName.too-long": "Имя слишком длинное",
    "firstName.too-short": "Имя слишком короткое",
    "global.ban.banned-user": "Заблокированный пользователь",
    "global.ban.banned-users": "Заблокированные пользователи",
    "global.ban.canceled": "Отменено",
    "global.ban.canceled-at": "Дата отмены",
    "global.ban.canceled-by": "Кем отменено",
    "global.ban.comment": "Комментарий",
    "global.ban.comment.must-be-specified-if-reason-is-other": "Комментарий должен быть указан, если была выбрана причина \"Другое\"",
    "global.ban.comment.too-long": "Комментарий слишком длинный",
    "global.ban.create": "Заблокировать пользователя глобально",
    "global.ban.create.with-user": "Заблокировать пользователя {username} глобально",
    "global.ban.created-at": "Дата создания",
    "global.ban.created-by": "Создано",
    "global.ban.details": "Информация о блокировке пользователя {username}",
    "global.ban.error.no-permission": "У вас нет разрешения на выполнение данной операции",
    "global.ban.error.server-unreachable": "Во время попытки заблокировать пользователя произошла ошибка. Сервер недоступен",
    "global.ban.error.unknown": "Во время попытки заблокировать пользователя произошла ошибка. Сервер ответил со статусом {errorStatus}",
    "global.ban.expires-at": "Дата окончания",
    "global.ban.expires-at.must-be-in-future": "Дата окончания глобальной блокировки должа быть в будущем",
    "global.ban.expires-at.must-be-specified-if-ban-is-not-permanent": "Дата окончания глобальной блокировки должна быть указана, если блокировка не постоянная",
    "global.ban.filters.exclude-canceled": "Исключить отменённые",
    "global.ban.filters.exclude-expired": "Исключить истекшие",
    "global.ban.no-bans": "По данным условиям не было найдено ни одной глобальной блокировки",
    "global.ban.permanent": "Заблокировать навсегда",
    "global.ban.reason": "Причина",
    "global.ban.reason.FLOOD": "Флуд",
    "global.ban.reason.ILLEGAL_CONTENT": "Незаконный контент",
    "global.ban.reason.OTHER": "Другое",
    "global.ban.reason.PORNOGRAPHY": "Порнография",
    "global.ban.reason.SPAM": "Спам",
    "global.ban.reason.must-be-specified": "Причина блокировки должна быть указана",
    "global.ban.success": "Пользователь был заблокирован",
    "global.ban.update": "Обновить глобальную блокировку",
    "global.ban.update.error.no-permission": "У вас нет доступа к обновлению этой блокировки. Эта ошибка может возникнуть, если блокировка истекла или была отменена",
    "global.ban.update.error.server-unreachable": "Во время попытки обновить блокировку произошла ошибка. Сервер недоступен",
    "global.ban.update.error.unknown": "Во время попытки обновить блокировку произошла ошибка. Сервер ответил со статусом {errorStatus}",
    "global.ban.update.success": "Изменения сохранены",
    "global.ban.update.with-user": "Обновить глобальную блокировку пользователя {username}",
    "global.ban.updated-at": "Дата обновления",
    "global.ban.updated-by": "Обновлено",
    "global.ban.you-were-banned": "Вы были заблокированы глобально",
    "global.ban.you-were-banned.permanently.with-reason": "Вы были заблокированы навсегда администратором {createdByUsername} по следующей причине: {reason}",
    "global.ban.you-were-banned.permanently.with-reason-and-comment": "Вы были заблокированы навсегда администратором {createdByUsername} по следующей причине: {reason}. Администратор оставил следующий комментарий: \"{comment}\"",
    "global.ban.you-were-banned.with-reason": "Вы были заблокированы глобально администратором {createdByUsername} по следующей причине: {reason}. Данная блокировка закончится {expirationDate}",
    "global.ban.you-were-banned.with-reason-and-comment": "Вы были заблокированы глобально администратором {createdByUsername} по следующей причине: {reason}. Администратор оставил следующий комментарий \"{comment}\". Данная блокировка закончится {expirationDate}",
    "global.bans": "Баны",
    "home": "На главную",
    "language.english": "Английский",
    "language.english.native": "English",
    "language.russian": "Русский",
    "language.russian.native": "Русский",
    "language.select-language": "Выбрать язык",
    "lastName": "Фамилия",
    "lastName.too-long": "Фамилия слишком длинная",
    "lastName.too-short": "Фамилия слишком короткая",
    "login": "Войти",
    "login.as-anonymous": "Войти под анонимным аккаунтом",
    "login.error.incorrect-username-or-password": "Имя пользователя или пароль были указаны неверно",
    "login.google": "Войти с помощью Google",
    "login.google.error": "Во время попытки войти через Google произошла ошибка. Сервер ответил со статусом {errorStatus}",
    "login.google.pending": "Осуществляется вход с помощью Google, это может занять какое-то время",
    "logout": "Выйти",
    "markdown.preview": "Превью",
    "markdown.preview.show": "Показать превью",
    "message.attachments.audio": "аудио",
    "message.attachments.audio.plural": "аудио",
    "message.attachments.file": "файл",
    "message.attachments.file.plural": "файлов",
    "message.attachments.image": "фото",
    "message.attachments.image.plural": "фото",
    "message.attachments.video": "видео",
    "message.attachments.video.plural": "видео",
    "message.delayed-message.create": "Создать отложенное сообщение",
    "message.delayed-message.is-too-close-to-other-delayed-message": "Дата отправки данного отложенного сообщения слишком близка к другому отложенному сообщению. Между отложенными сообщениями должно быть не менее 10 минут",
    "message.delayed-message.limit-reached": "Limit of delayed messages for this chat has been reached",
    "message.delayed-message.list": "Отложенные сообщения",
    "message.delayed-message.list.with-chat-specified": "Отложенные сообщения в чате \"{chatName}\"",
    "message.delayed-message.publish": "Опубликовать",
    "message.delayed-message.publish.error": "Во время попытки опубликовать отложенное сообщения произошла ошибка",
    "message.delayed-message.publish.success": "Отложенное сообщение было опубликовано",
    "message.delayed-message.update": "Редактировать отложенное сообщение",
    "message.delayed-message.update.error.deleted-or-published": "Отложенное сообщение было либо удалено, либо опубликовано",
    "message.delayed-message.update.error.unknown": "Во время попытки обновить отложенное сообщение произошла ошибка. Сервер ответил со статусом {errorStatus}",
    "message.delayed-message.update.server-unreachable": "Во время попытки обновить отложенное сообщение произошла ошибка: сервер недоступен",
    "message.delayed-message.update.success": "Отложенное сообщение было обновлено",
    "message.deleted": "Сообщение удалено",
    "message.edit": "Редактировать сообщение",
    "message.edit.error.server-unreachable": "Во время попытки обновить сообщение произошла ошибка: сервер недоступен",
    "message.edit.error.unknown": "Во время попытки обновить сообщение произошла непредвиденная ошибка, сервер ответил со статусом {errorStatus}",
    "message.edit.short": "Редактировать",
    "message.edited": "Изменено",
    "message.list": "Сообщения",
    "message.pin": "Закрепить сообщение",
    "message.pin.success": "Сообщение закреплено",
    "message.pinned": "Закреплённое сообщение",
    "message.pinned.show": "Показать закреплённое сообщение",
    "message.reply": "Ответить",
    "message.schedule-date.must-be-five-minutes-from-now": "Дата отправки отложенного сообщения должна быть не менее 5 минут с настоящего времени",
    "message.schedule-date.must-be-no-more-than-month-from-now": "Дата отправки отложенного сообщения должна быть не более месяца с настоящего времени",
    "message.scheduled-at": "Запланировано на {scheduleDate}",
    "message.text-is-too-long": "Текст сообщения слишком длинный",
    "message.text-must-be-present": "Напечатайте что-нибудь",
    "message.type-something": "Напишите сообщение...",
    "message.unpin": "Открепить сообщение",
    "message.unpin.success": "Сообщение откреплено",
    "message.updated-at": "Обновлено {updatedAt}",
    "ok": "OK",
    "page.not-found": "Запрашиваемая страница не найдена",
    "password": "Пароль",
    "password-recovery.email-confirmation-code.send": "Получить код",
    "password-recovery.email-confirmation-code.sent": "Мы выслали код подтверждения на ваш e-mail. Введите его в форму ниже",
    "password-recovery.enter-your-email": "Введите ваш e-mail, чтобы восстановить пароль",
    "password-recovery.error.account-not-found": "Аккаунта, привязанному к данному e-mail, не найдено e-mail",
    "password-recovery.error.email-confirmation-code-expired": "Данный код подтверждения истёк",
    "password-recovery.error.email-confirmation-code-has-been-used": "Данный код подтверждения уже был использован",
    "password-recovery.error.unknown": "Во время попытки отослать код подтверждения произошла ошибка, сервер ответил со статусом {errorStatus}",
    "password-recovery.forgot-your-password": "Забыли пароль?",
    "password-recovery.log-in": "Теперь вы можете войти в аккаунт",
    "password-recovery.password-updated": "Ваш пароль был обновлён",
    "password.do-not-match": "Пароли не совпадают",
    "password.empty": "Пароль не должен быть пустым",
    "password.too-long": "Пароль слишком длинный",
    "password.too-short": "Пароль слишком колоткий",
    "register": "Зарегистрироваться",
    "registration.continue": "Продолжить",
    "registration.continue-anyway": "Всё равно продолжить",
    "registration.error.unknown": "Во время регистрации произошла ошибка. Сервер ответил со статусом {errorStatus}",
    "registration.provide-your-email": "Укажите свой e-mail",
    "registration.send-verification-email": "Отправить e-mail с кодом подтверждения",
    "registration.send-verification-email.server-unreachable": "Во время попытки отправить e-mail с кодом подтверждения произошла ошибка: сервер недоступен",
    "registration.send-verification-email.unknown-error": "Во время попытки отправить e-mail с кодом подтверждения произошла непредвиденная ошибка. Сервер ответил со статусом {errorStatus}",
    "registration.skip-email": "Пропустить",
    "registration.skip-email.are-you-sure": "Вы уверены?",
    "registration.skip-email.go-back": "Вернуться",
    "registration.skip-email.limitations": "Мы не сможем восстановить ваш пароль в случае утери, если вы не предоставите свой e-mail. Также, некоторые чаты могут запретить пользователям без подтверждённого e-mail становиться участниками.",
    "registration.success": "Вы успешно зарегистрировались",
    "repeatedPassword": "Повторите пароль",
    "report": "Пожаловаться",
    "report.chat": "Пожаловаться на чат",
    "report.chat.action.ban-chats-creators": "Заблокировать создателей чатов",
    "report.chat.action.ban-chats-creators.error.server-unreachable": "Во время попытки заблокирвоать создателей чатов произошла ошибка: сервер недоступен",
    "report.chat.action.ban-chats-creators.error.unknown": "Во время попытки заблокирвоать создателей чатов произошла ошибка. Сервер ответил со статусом {errorStatus}",
    "report.chat.action.ban-chats-creators.success": "Создатели чатов были заблокированы",
    "report.chat.action.delete-chats": "Удалить чаты",
    "report.chat.action.delete-chats.error.server-unreachable": "Во время попытки удалить чаты произошла ошибка: сервер недоступен",
    "report.chat.action.delete-chats.error.unknown": "Во время попытки удалить чаты произошла ошибка. Сервер ответил со статусом {errorStatus}",
    "report.chat.action.delete-chats.success": "Чаты были удалены",
    "report.chat.list": "Жалобы на чаты",
    "report.chat.reported-chat": "Чат",
    "report.created-at": "Создана",
    "report.description": "Описание",
    "report.description.is-too-long": "Описание слишком длинное",
    "report.drawer.chats": "На чаты",
    "report.drawer.messages": "На сообщения",
    "report.drawer.users": "На пользователей",
    "report.list.clear-selection": "Очистить",
    "report.list.messages": "Жалобы на сообщения",
    "report.list.messages.show-message": "Показать сообщение",
    "report.list.selected-reports.count": "Выбрано жалоб: {selectedReportsCount}",
    "report.list.show-not-viewed-only": "Показать только не просмотренные",
    "report.message": "Пожаловаться на сообщение",
    "report.messages.ban-users": "Заблокировать пользователей",
    "report.messages.ban-users.error.server-unreachable": "Во время попытки заблокировать авторов сообщений произошла ошибка: сервер недоступен",
    "report.messages.ban-users.error.unknown": "Во время попытки заблокировать авторов сообщений произошла ошибка: сервер ответил со статусом {errorStatus}",
    "report.messages.ban-users.success": "Авторы сообщений были заблокированы",
    "report.messages.delete-messages": "Удалить сообщения",
    "report.messages.delete-messages.error": "Во время попытки удалить сообщения произошла ошибка",
    "report.messages.delete-messages.success": "Сообщения были удалены",
    "report.reason": "Причина жалобы",
    "report.reason.ADULT_CONTENT": "Контент для взрослых",
    "report.reason.CHILD_ABUSE": "Насилие над детьми",
    "report.reason.FRAUD": "Мошенничество",
    "report.reason.HATE_SPEECH": "Разжигание ненависти",
    "report.reason.MISLEADING_INFORMATION": "Информация, вводящая в заблуждение",
    "report.reason.OTHER": "Другое",
    "report.reason.SPAM": "Спам",
    "report.reason.VIOLENCE": "Насилие",
    "report.reject": "Отклонить",
    "report.reject.success": "Жалобы были отклонены",
    "report.status": "Статус",
    "report.status.ACCEPTED": "Удовлетворена",
    "report.status.DECLINED": "Отклонена",
    "report.status.NOT_VIEWED": "Не просмотрена",
    "report.submit": "Отправить жалобу",
    "report.submit.error": "Во время попытки отправить жалобу произошла ошибка. Сервер ответил со статусом {errorStatus}.",
    "report.submit.success": "Спасибо за отправку жалобы. Она будет просмотрена модераторами.",
    "report.submitted-by": "Кем отправлена",
    "report.submitted-by-ip-address": "С какого IP-адреса отправлена",
    "report.taken-action.CHAT_DELETED": "Чат был удалён",
    "report.taken-action.MESSAGE_DELETED": "Сообщение было удалено",
    "report.taken-action.USER_BANNED": "Пользователь был заблокирован",
    "report.taken-actions": "Действия",
    "report.user": "Пожаловаться на пользователя",
    "report.user.action.ban-users": "Заблокировать пользователей",
    "report.user.action.ban-users.error.server-unreachable": "При попытке заблокировать пользователей произошла ошибка: сервер недоступен",
    "report.user.action.ban-users.error.unknown": "При попытке заблокировать пользователей произошла ошибка. Сервер ответил со статусом {errorStatus}",
    "report.user.action.ban-users.success": "Пользователи были заблокированы",
    "report.user.list": "Жалобы на пользователей",
    "report.user.reported-user": "Пользователь",
    "reports": "Жалобы",
    "save-changes": "Сохранить изменения",
    "search.result.chats": "Чаты",
    "search.result.messages": "Сообщения",
    "server.unreachable": "Сервер недоступен",
    "setting.chat.virtual-scroll.reversed-scroll-speed-coefficient": "Скорость скролла",
    "settings": "Настройки",
    "settings.appearance": "Внешний вид",
    "settings.chat.messages.send-message-button.CTRL_ENTER": "Отправлять сообщение по нажатию CTRL + Enter",
    "settings.chat.messages.send-message-button.ENTER": "Отправлять сообщение по нажатию Enter",
    "settings.chat.virtual-scroll": "Виртуальный скролл",
    "settings.chat.virtual-scroll.enable-images-caching": "Кэшировать изображения",
    "settings.chat.virtual-scroll.overscan-value": "Дополнительное пространство для виртуального скролла",
    "settings.chat.virtual-scroll.scroll-direction-behavior": "Действия с направлением скролла",
    "settings.chat.virtual-scroll.scroll-direction-behavior.do-not-reverse": "Не инвертировать",
    "settings.chat.virtual-scroll.scroll-direction-behavior.reverse": "Инвертировать",
    "settings.chat.virtual-scroll.scroll-direction-behavior.reverse-and-try-to-restore": "Инвертировать и попытаться восстановить",
    "settings.chat.virtual-scroll.scrollable-element": "Прокручиваемый элемент",
    "settings.chat.virtual-scroll.scrollable-element.MESSAGES_LIST": "Список сообщений",
    "settings.chat.virtual-scroll.scrollable-element.WINDOW": "Объект window",
    "settings.chat.virtual-scroll.use-simplified-gallery": "Использовать упрощённую галерею при включённом виртуальном скролле",
    "settings.chats": "Чаты",
    "settings.chats.virtual-scroll.enable-virtual-scroll": "Включить виртуальный скролл (экспериментальный функционал)",
    "settings.language": "Язык",
    "settings.profile": "Профиль",
    "settings.security": "Безопасность",
    "settings.security.authorization-required": "Вы должны войти в аккаунт, чтобы редактировать настройки безопасности",
    "signIn": "Войти",
    "singUp": "Зарегистрироваться",
    "slug": "URL пользователя",
    "slug.contains-invalid-characters": "URL содержит недопустимые символы",
    "slug.has-already-been-taken": "URL уже используется",
    "slug.too-long": "URL слишком длинный",
    "slug.too-short": "URL слишком линный",
    "sticker": "Стикер",
    "sticker.add": "Добавить стикер",
    "sticker.emojis": "Эмоджи",
    "sticker.emojis.too-many": "Слишком много эмоджи",
    "sticker.image": "Изображение",
    "sticker.image.required": "Стикер должен иметь изображение",
    "sticker.image.too-large": "Изображение имеет слишком большой размер",
    "sticker.keywords": "Ключевые слова",
    "sticker.keywords.too-long": "Слово {keyword} слишком длинное",
    "sticker.keywords.too-many": "Слишком много ключевых слов",
    "sticker.pack.author": "Автор",
    "sticker.pack.author.too-long": "Имя автора слишком длинное",
    "sticker.pack.create": "Создать набор стикеров",
    "sticker.pack.create.error.server-unreachable": "Во время попытки создать набор ситкеров произошла ошибка, сервер недоступен",
    "sticker.pack.create.error.unknown": "Во время попытки создать набор стикеров произошла ошибка, сервер ответил со статусом {errorStatus}",
    "sticker.pack.create.success": "Набор стикеров был создан",
    "sticker.pack.created-by-me": "Созданные мной",
    "sticker.pack.description": "Описание",
    "sticker.pack.description.required": "Описание не должно быть пустым",
    "sticker.pack.description.too-long": "Описание слишком длинное",
    "sticker.pack.explore-more": "Найти ещё",
    "sticker.pack.install": "Установить",
    "sticker.pack.install.success": "Набор стикеров установлен",
    "sticker.pack.installed": "Установленные наборы стикеров",
    "sticker.pack.list": "Стикеры",
    "sticker.pack.list.installed": "Установленные наборы стикеров",
    "sticker.pack.name": "Название",
    "sticker.pack.name.required": "Название не должно быть пустым",
    "sticker.pack.name.too-long": "Название слишком длинное",
    "sticker.pack.uninstall": "Удалить",
    "sticker.pack.uninstall.success": "Набор стикеров удалён",
    "sticker.pack.with-name": "Набор стикеров {name}",
    "update": "Обновить",
    "upload.file.too-large": "Выбранный файл слишком большой",
    "user.bio.too-long": "Слишком длинный текст",
    "user.edit-profile": "Редактировать профиль",
    "user.edit-profile.authorization-required": "Для редактрования профиля необходимо войти в аккаунт",
    "user.edit-profile.cannot-edit-profile": "Вы не можете редактировать свой профиль",
    "user.edit-profile.save-changes": "Сохранить изменения",
    "user.edit-profile.success": "Профиль обновлён",
    "user.error.not-found": "Пользователь не найден",
    "user.error.server-unreachable": "Не удалось загрузить пользователя, сервер недоступен",
    "user.error.with-status": "Не удалось загрузить пользователя, сервер ответил со статусом {errorStatus}",
    "user.profile": "Профиль",
    "user.profile.bio": "О себе",
    "user.profile.birth-date": "Дата рождения",
    "user.profile.id": "ID пользователя",
    "user.profile.last-seen": "Последний раз был(-а): {lastSeenLabel}",
    "user.profile.online": "Онлайн",
    "user.profile.registration-date": "Дата регистрации",
    "user.profile.username": "Имя пользователя",
    "user.profile.years": "лет",
    "username": "Имя пользователя",
    "username.contains-invalid-characters": "Имя пользователя содержит недопустимые символы",
    "username.empty": "Имя пользователя не должно быть пустым",
    "username.has-already-been-taken": "Имя пользователя уже используется",
    "username.too-long": "Имя пользователя слишком длинное",
    "username.too-short": "Имя пользователя слишком короткое"
};
