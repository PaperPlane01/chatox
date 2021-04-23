import {Labels} from "../types";

export const en: Labels = {
    "cancel": "Cancel",
    "change-password": "Change password",
    "change-password.confirm-password": "Confirm password",
    "change-password.current-password": "Current password",
    "change-password.error.email-confirmation-code-expired": "Email confirmation code expired",
    "change-password.error.email-confirmation-code-invalid": "Email confirmation code is invalid",
    "change-password.error.email-mismatch": "This email confirmation code is intended to be used by other user",
    "change-password.error.server-unreachable": "Error occurred when tried to update password: server is unreachable",
    "change-password.error.unknown-error": "Error occurred when tried to update password, server responded with {errorStatus} status",
    "change-password.error.wrong-password": "Wrong password has been provided",
    "change-password.new-password": "New password",
    "change-password.success": "Password has been changed",
    "chat.avatar.upload": "Upload avatar",
    "chat.blocking.actions": "Actions",
    "chat.blocking.block-until": "Block until",
    "chat.blocking.block-until.must-be-in-future": "Blocking expiration date must be in future",
    "chat.blocking.block-until.required": "Blocking expiration date is required",
    "chat.blocking.block-user": "Block user",
    "chat.blocking.blocked-by": "Blocked by",
    "chat.blocking.blocked-until": "Blocked until",
    "chat.blocking.blocked-user": "Blocked user",
    "chat.blocking.blocked-users": "Blocked users",
    "chat.blocking.cancel": "Cancel",
    "chat.blocking.canceled-at": "Canceled at",
    "chat.blocking.canceled-by": "Canceled by",
    "chat.blocking.create": "Block user {username} in chat {chatName}",
    "chat.blocking.create.without-username": "Block user in chat {chatName}",
    "chat.blocking.created-at": "Created at",
    "chat.blocking.current-user-blocked.no-reason": "You have been blocked in this chat by {blockedByUsername}. The blocking will expire at {blockedUntil}",
    "chat.blocking.current-user-blocked.with-reason": "You have been blocked in this chat by {blockedByUsername} with the following reason: \"{reason}\". The blocking will expire at {blockedUntil}",
    "chat.blocking.delete-recent-messages": "Delete recent messages",
    "chat.blocking.description": "Description",
    "chat.blocking.description.too-long": "Blocking description is too long",
    "chat.blocking.edit": "Edit",
    "chat.blocking.error.forbidden": "You don't have access to perform this operation",
    "chat.blocking.error.server-unreachable": "Error occurred when tried to block user: server is unreachable",
    "chat.blocking.error.unknown": "Unknown error occurred when tried to block user. Server responded with {responseStatus} status. Please try again later",
    "chat.blocking.info": "Info about blocking of {username} in {chatName}",
    "chat.blocking.list": "Users blocked in chat {chatName}",
    "chat.blocking.messages-deletion-period": "Messages deletion period",
    "chat.blocking.messages-deletion-period.ALL_TIME": "All time",
    "chat.blocking.messages-deletion-period.FIVE_MINUTES": "5 minutes",
    "chat.blocking.messages-deletion-period.ONE_DAY": "1 day",
    "chat.blocking.messages-deletion-period.ONE_HOUR": "1 hour",
    "chat.blocking.messages-deletion-period.ONE_YEAR": "1 year",
    "chat.blocking.no-active-blockings": "No active blockings",
    "chat.blocking.no-blockings": "No blockings",
    "chat.blocking.show-active-only": "Show active only",
    "chat.blocking.success": "User has been blocked",
    "chat.blocking.update": "Update blocking of {username} in chat {chatName}",
    "chat.blocking.update.blocking": "Update blocking",
    "chat.blocking.update.error.forbidden": "You don't have access to perform this operation",
    "chat.blocking.update.error.server-unreachable": "Error occurred when tried to update blocking: server is unreachable",
    "chat.blocking.update.error.unknown": "Unknown error occurred when tried to update blocking, server responded with {errorStatus} status",
    "chat.blocking.updated-at": "Canceled by",
    "chat.blocking.updated-by": "Updated by",
    "chat.blocking.user-id-or-slug": "User ID or slug",
    "chat.blocking.user-id-or-slug.not-exist": "Could not find user with such ID or URL",
    "chat.blocking.user-id-or-slug.unknown-error": "Error occurred when tried to check user ID, server responded with {errorStatus} status",
    "chat.create-chat": "Create chat",
    "chat.delete": "Delete chat",
    "chat.delete.comment": "Comment",
    "chat.delete.comment-is-too-long": "Comment is too long",
    "chat.delete.comment-required-if-reason-is-other": "Comment must be provided is chat deletion reason is set to \"Other\"",
    "chat.delete.error.already-deleted": "Chat has already been deleted",
    "chat.delete.error.server-unreachable": "Could not delete chat, server is unreachable",
    "chat.delete.error.unknown": "Error occurred when tried to delete chat, server responded with {errorStatus} status",
    "chat.delete.reason": "Reason",
    "chat.delete.reason.CHILD_ABUSE": "Child abuse",
    "chat.delete.reason.ILLEGAL_CONTENT": "Illegal content",
    "chat.delete.reason.OTHER": "Other",
    "chat.delete.reason.PORNOGRAPHY": "Pornography",
    "chat.delete.reason.SPAM": "Spam",
    "chat.delete.specify-reason": "Specify chat deletion reason",
    "chat.delete.success": "Chat has been deleted",
    "chat.delete.with-name": "Delete chat {chatName}",
    "chat.deleted": "This chat has been deleted",
    "chat.deleted.by-creator": "This chat has been deleted by its creator",
    "chat.deleted.with-reason": "This chat has been deleted by our moderators because of the following reason: {reason}",
    "chat.deleted.with-reason-and-comment": "This chat has been deleted by our moderators because of the following reason: {reason}. Moderator left the following comment: {comment}",
    "chat.description": "Description",
    "chat.description.too-long": "Description is too long",
    "chat.edit": "Edit chat",
    "chat.info": "Chat info",
    "chat.join": "Join chat",
    "chat.join.error": "Error occurred when tried to join chat",
    "chat.leave": "Leave chat",
    "chat.login-to-see-list": "You need too log in to see list of your chats",
    "chat.my-chats": "My chats",
    "chat.name": "Name",
    "chat.name.empty": "Chat name can't be empty",
    "chat.name.too-long": "Name is too long",
    "chat.name.too-short": "Name is too short",
    "chat.no-description": "No description provided",
    "chat.not-found": "Chat not found",
    "chat.number-of-participants": "{numberOfParticipants} participants, {onlineParticipantsCount} online",
    "chat.online-participants-count": "{onlineParticipantsCount} participants online",
    "chat.participant.kick": "Kick user",
    "chat.participant.kick.error": "Error occurred when tried to kick chat participant",
    "chat.participant.kick.success": "Chat participant has been kicked",
    "chat.select-chat": "Select chat to start messaging",
    "chat.slug": "Slug",
    "chat.slug.contains-invalid-characters": "Slug contains invalid characters",
    "chat.slug.has-already-been-taken": "This slug has already been taken by another chat",
    "chat.slug.too-long": "Slug is too long",
    "chat.slug.too-short": "Slug is too short",
    "chat.tag.too-long": "Tag {tag} is too long",
    "chat.tags": "Tags",
    "chat.tags.too-many": "Too many tags",
    "chat.update": "Update chat {chatName}",
    "chat.update.api-unreachable": "Error occurred when tried to update chat: server is unreachable",
    "chat.update.no-permission": "You don't have permission to update chat",
    "chat.update.save-changes": "Save changes",
    "chat.update.success": "Chat has been updated",
    "chat.update.unexpected-error": "Unexpected error occurred when tried to update chat. Server responded with {errorStatus} status",
    "chats.popular": "Popular chats",
    "chats.popular.load-more": "Load more",
    "close": "Close",
    "common.delete": "Delete",
    "email": "E-mail",
    "email-confirmation-code.creation.error": "Unexpected error occurred when tried to create email confirmation code. Server responded with {errorStatus}",
    "email-confirmation-code.creation.error.server-unreachable": "Error occurred when tried to create email confirmation code, server is unreachable",
    "email-confirmation-code.creation.might-take-a-while": "This might take a while",
    "email-confirmation-code.creation.pending": "Creating email confirmation code",
    "email.empty": "Email can't be empty",
    "email.has-already-been-taken": "This e-mail has already been taken",
    "email.invalid": "E-mail is invalid",
    "email.verification.code": "Verification code",
    "email.verification.code.empty": "E-mail verification code can't be empty",
    "email.verification.code.enter": "Enter verification code",
    "email.verification.code.expired": "This verification code is expired",
    "email.verification.code.invalid": "This verification code is invalid",
    "email.verification.code.sent": "We have sent verification code to your e-mail",
    "email.verification.server-unreachable": "Error occurred when tried to check verification code: server is unreachable",
    "email.verification.unknown-error": "Unexpected error occurred when tried to check verification code. Server responded with {errorStatus} status",
    "emoji.pick-emoji-set": "Emoji set",
    "emoji.set.apple": "Apple",
    "emoji.set.emojione": "Emoji One",
    "emoji.set.facebook": "Facebook",
    "emoji.set.google": "Google",
    "emoji.set.messenger": "Messenger",
    "emoji.set.native": "Native",
    "emoji.set.twitter": "Twitter",
    "emoji.use-codes": "Use emoji codes for input",
    "error-boundary.stacktrace.hide": "Hide stacktrace",
    "error-boundary.stacktrace.show": "Show stacktrace",
    "error.generic.server-unreachable": "Server is unreachable",
    "error.unknown": "Unknown error occurred",
    "feature.not-available": "This feature is not yet available",
    "file.audio": "Audio",
    "file.file": "File",
    "file.image": "Image",
    "file.show-files": "Show files",
    "file.too-large": "File is too large",
    "file.too-large.with-file-name": "File {fileName} is too large",
    "file.video": "Video",
    "files.attached-files": "Attached files",
    "firstName": "First name",
    "firstName.empty": "First name can't be empty",
    "firstName.too-long": "First name is too long",
    "firstName.too-short": "First name is too short",
    "home": "Home",
    "language.english": "English",
    "language.english.native": "English",
    "language.russian": "Russian",
    "language.russian.native": "Русский",
    "language.select-language": "Select language",
    "lastName": "Last name",
    "lastName.too-long": "Last name is too long",
    "lastName.too-short": "Last name is too short",
    "login": "Log in",
    "login.as-anonymous": "Log in as anonymous",
    "login.error.incorrect-username-or-password": "Incorrect username or password",
    "logout": "Log out",
    "markdown.preview": "Preview",
    "markdown.preview.show": "Show preview",
    "message.attachments.audio": "audio",
    "message.attachments.audio.plural": "audios",
    "message.attachments.file": "file",
    "message.attachments.file.plural": "files",
    "message.attachments.image": "image",
    "message.attachments.image.plural": "images",
    "message.attachments.video": "video",
    "message.attachments.video.plural": "videos",
    "message.deleted": "Message has been deleted",
    "message.edit": "Edit message",
    "message.edit.error.server-unreachable": "Error occurred when tried to update message: server is unreachable",
    "message.edit.error.unknown": "Unexpected error occurred when tried to update message, server responded with {errorStatus} status",
    "message.edit.short": "Edit",
    "message.edited": "edited",
    "message.reply": "Reply",
    "message.text-is-too-long": "Message text is too long",
    "message.text-must-be-present": "Please type some text",
    "message.type-something": "Type something...",
    "message.updated-at": "Updated at {updatedAt}",
    "page.not-found": "Seems like the page you requested doesn't exist",
    "password": "Password",
    "password-recovery.email-confirmation-code.send": "Send email",
    "password-recovery.email-confirmation-code.sent": "We have sent a confirmation code to recover your password. Enter it below",
    "password-recovery.enter-your-email": "Enter your email to recover password",
    "password-recovery.error.account-not-found": "We could not find account associated with this e-mail",
    "password-recovery.error.email-confirmation-code-expired": "This email confirmation code has expired",
    "password-recovery.error.email-confirmation-code-has-been-used": "This email confirmation code has already been used",
    "password-recovery.error.unknown": "Error occurred when tried to send email confirmation code, server responded with {errorStatus} status",
    "password-recovery.forgot-your-password": "Forgot your password?",
    "password-recovery.log-in": "You can now log in",
    "password-recovery.password-updated": "Your password has been updated",
    "password.do-not-match": "Passwords do not match",
    "password.empty": "Password can't be empty",
    "password.too-long": "Password is too long",
    "password.too-short": "Password is too short",
    "register": "Register",
    "registration.continue": "Continue",
    "registration.continue-anyway": "Continue away",
    "registration.error.unknown": "Error occurred when tried to register. Server responded with {errorStatus} status",
    "registration.provide-your-email": "Provide your e-mail",
    "registration.send-verification-email": "Send verification e-mail",
    "registration.send-verification-email.server-unreachable": "Error occurred when tried to send e-maul with verification code: server is unreachable",
    "registration.send-verification-email.unknown-error": "Unexpected error occurred when tried to send e-mail with verification code. Server responded with {errorStatus} status",
    "registration.skip-email": "Skip this step",
    "registration.skip-email.are-you-sure": "Are you sure?",
    "registration.skip-email.go-back": "Go back",
    "registration.skip-email.limitations": "We won't be able to recover your password if you don't provide us your e-mail. Also, some chats may restrict users without verified e-mails to join.",
    "registration.success": "You have registered successfully",
    "repeatedPassword": "Repeat password",
    "server.unreachable": "Server is unreachable",
    "setting.chat.virtual-scroll.reversed-scroll-speed-coefficient": "Reversed scroll speed coefficient",
    "settings": "Settings",
    "settings.appearance": "Appearance",
    "settings.chat.virtual-scroll.overscan-value": "Virtual scroll overscan value",
    "settings.chat.virtual-scroll.scroll-direction-behavior": "Scroll direction behavior",
    "settings.chat.virtual-scroll.scroll-direction-behavior.do-not-reverse": "Do not reverse",
    "settings.chat.virtual-scroll.scroll-direction-behavior.reverse": "Reverse",
    "settings.chat.virtual-scroll.scroll-direction-behavior.reverse-and-try-to-restore": "Reverse and try to restore",
    "settings.chat.virtual-scroll.use-simplified-gallery": "Use simplified gallery when virtual scroll is enabled",
    "settings.chats": "Chats",
    "settings.chats.virtual-scroll.enable-virtual-scroll": "Enable virtual scroll (experimental)",
    "settings.language": "Language",
    "settings.profile": "Profile",
    "settings.security": "Security",
    "settings.security.authorization-required": "You have to be logged in to edit your security settings",
    "signIn": "Sign in",
    "singUp": "Sign up",
    "slug": "Slug",
    "slug.contains-invalid-characters": "Slug contains invalid characters",
    "slug.has-already-been-taken": "This slug is already taken",
    "slug.too-long": "Slug is too long",
    "slug.too-short": "Slug is too short",
    "update": "Update",
    "upload.file.too-large": "Selected file is too large",
    "user.bio.too-long": "Bio is too long",
    "user.edit-profile": "Edit profile",
    "user.edit-profile.cannot-edit-profile": "You cannot edit your profile",
    "user.edit-profile.authorization-required": "You have to be logged in to edit your profile",
    "user.edit-profile.save-changes": "Save changes",
    "user.edit-profile.success": "Profile has been updated",
    "user.error.not-found": "Could not find such user",
    "user.error.server-unreachable": "Could not load user, server is unreachable",
    "user.error.with-status": "Could not load user, server responded with {errorStatus} status",
    "user.profile": "Profile",
    "user.profile.bio": "Bio",
    "user.profile.birth-date": "Birth date",
    "user.profile.id": "User ID",
    "user.profile.last-seen": "Last seen: {lastSeenLabel}",
    "user.profile.online": "Online",
    "user.profile.registration-date": "Registration date",
    "user.profile.username": "Username",
    "user.profile.years": "years",
    "username": "Username",
    "username.contains-invalid-characters": "Username contains invalid characters",
    "username.empty": "Username can't be empty",
    "username.has-already-been-taken": "This username is already taken",
    "username.too-long": "Username is too long",
    "username.too-short": "Username is too short",
    "global.ban.create": "Ban user globally",
    "global.ban.create.with-user": "Ban user {username} globally",
    "global.ban.expires-at": "Expires at",
    "global.ban.expires-at.must-be-in-future": "Global ban expiration date must be in future",
    "global.ban.expires-at.must-be-specified-if-ban-is-not-permanent": "Global ban expiration date must be specified if ban is not permanent",
    "global.ban.permanent": "Permanent",
    "global.ban.reason": "Reason",
    "global.ban.reason.must-be-specified": "Reason must be specified",
    "global.ban.reason.SPAM": "Spam",
    "global.ban.reason.FLOOD": "Flood",
    "global.ban.reason.PORNOGRAPHY": "Pornography",
    "global.ban.reason.ILLEGAL_CONTENT": "Illegal content",
    "global.ban.reason.OTHER": "Other",
    "global.ban.comment": "Comment",
    "global.ban.comment.must-be-specified-if-reason-is-other": "Comment must be specified if reason is \"Other\"",
    "global.ban.comment.too-long": "Comment is too long",
    "global.ban.created-by": "Created by",
    "global.ban.created-at": "Created at",
    "global.ban.updated-by": "Updated by",
    "global.ban.updated-at": "Updated at",
    "global.ban.canceled": "Canceled",
    "global.ban.canceled-by": "Canceled by",
    "global.ban.canceled-at": "Canceled by",
    "global.ban.you-were-banned": "You were banned globally",
    "global.ban.you-were-banned.with-reason": "You were banned globally by {createdByUsername} with the following reason: {reason}. Your ban expires at {expirationDate}",
    "global.ban.you-were-banned.with-reason-and-comment": "You were banned globally by {createdByUsername} with the following reason: {reason}. The admin left the following comment: \"{comment}\". Your ban expires at {expirationDate}",
    "global.ban.you-were-banned.permanently.with-reason": "You were banned permanently by {createdByUsername} with the following reason: {reason}",
    "global.ban.you-were-banned.permanently.with-reason-and-comment": "You were banned permanently by {createdByUsername} with the following reason: {reason}. The admin left the following comment: \"{comment}\"",
    "global.ban.error.no-permission": "You don't have permission to perform this operation",
    "global.ban.error.unknown": "Unknown error occurred when tried to ban user, server responded with {errorStatus} status",
    "global.ban.error.server-unreachable": "Error occurred when tried to ban user, server is unreachable",
    "global.ban.success": "User has been banned",
    "global.ban.filters.exclude-expired": "Exclude expired",
    "global.ban.filters.exclude-canceled": "Exclude canceled",
    "global.ban.banned-users": "Banned users",
    "global.ban.banned-user": "Banned user",
    "global.ban.details": "User {username} ban info",
    "global.ban.no-bans": "The are no global bans satisfying specified conditions",
    "global.bans": "Global bans",
    "global.ban.update.with-user": "Update global ban on user {username}",
    "global.ban.update": "Update global ban",
    "global.ban.update.success": "Global ban has been updated",
    "global.ban.update.error.no-permission": "You don't have permission to update this ban. This error may occur if ban has expired or canceled by someone else",
    "global.ban.update.error.unknown": "Unknown error occurred when tried to update global ban. Server responded with {errorStatus} status",
    "global.ban.update.error.server-unreachable": "Error occurred when tried to update global ban. Server is unreachable",
    "save-changes": "Save changes",
    "edit": "Edit",
    "chat.participant.role": "User role in chat",
    "chat.participant.role.ADMIN": "Admin",
    "chat.participant.role.MODERATOR": "Moderator",
    "chat.participant.role.USER": "User",
    "chat.participant.update": "Update chat participant",
    "chat.participant.update.with-username": "Update chat participant {username}",
    "chat.participant.update.success": "Chat participant has been updated",
    "chat.participant.update.error.unknown-error": "Error occurred when tried to update chat participant. Server responded with {errorStatus} status",
    "chat.participant.update.error.server-unreachable": "Error occurred when tried to update chat participant. Server is unreachable",
    "message.pin": "Pin message",
    "message.pin.success": "Message has been pinned",
    "message.unpin": "Unpin message",
    "message.unpin.success": "Message has been unpinned",
    "message.pinned": "Pinned message",
    "message.pinned.show": "Show pinned message",
    "message.schedule-date.must-be-five-minutes-from-now": "Schedule date must be at least 5 minutes from now",
    "message.delayed-message.create": "Schedule a message",
    "message.delayed-message.list": "Scheduled messages",
    "message.delayed-message.is-too-close-to-other-delayed-message": "This scheduled message is too close to another scheduled message. Scheduled message must be at least 10 minutes from each other",
    "message.schedule-date.must-be-no-more-than-month-from-now": "Schedule date must be no more than 1 month from now",
    "message.delayed-message.limit-reached": "Limit of delayed messages for this chat has been reached",
    "ok": "OK",
    "message.scheduled-at": "Scheduled at {scheduleDate}",
    "message.delayed-message.list.with-chat-specified": "Scheduled messages in \"{chatName}\" chat",
    "message.delayed-message.publish": "Publish now",
    "message.delayed-message.publish.success": "Scheduled message has been published",
    "message.delayed-message.publish.error": "Error occurred when tried to publish scheduled message",
    "message.delayed-message.update.success": "Scheduled message has been updated",
    "message.delayed-message.update.error.unknown": "Unknown error occurred when tried to update scheduled message. Server responded with {errorStatus} status",
    "message.delayed-message.update.error.deleted-or-published": "Scheduled message has been either deleted or published",
    "message.delayed-message.update.server-unreachable": "Error occurred when tried to update scheduled message: server is unreachable",
    "message.delayed-message.update": "Edit scheduled message",
    "report.description": "Description",
    "report.description.is-too-long": "Description is too long",
    "report": "Report",
    "reports": "Reports",
    "report.reason": "Report reason",
    "report.reason.SPAM": "Spam",
    "report.reason.ADULT_CONTENT": "Adult content",
    "report.reason.CHILD_ABUSE": "Child abuse",
    "report.reason.FRAUD": "Fraud",
    "report.reason.MISLEADING_INFORMATION": "Misleading information",
    "report.reason.VIOLENCE": "Violence",
    "report.reason.HATE_SPEECH": "Hate speech",
    "report.reason.OTHER": "Other",
    "report.message": "Report message",
    "report.submit": "Submit report",
    "report.submit.success": "Thank you for submitting your report. It will be reviewed by our moderators.",
    "report.submit.error": "Error occurred when tries to submit a report. Server responded with {errorStatus} status.",
    "report.list.messages": "Messages reports",
    "report.created-at": "Created at",
    "report.status.NOT_VIEWED": "Not viewed",
    "report.status.ACCEPTED": "Accepted",
    "report.status.DECLINED": "Declined",
    "report.taken-action.CHAT_DELETED": "Chat deleted",
    "report.taken-action.USER_BANNED": "User banned",
    "report.taken-action.MESSAGE_DELETED": "Message deleted",
    "report.submitted-by": "Submitted by",
    "report.submitted-by-ip-address": "Submitted from IP address",
    "report.list.messages.show-message": "Show message",
    "report.status": "Status",
    "report.taken-actions": "Taken actions",
    "report.drawer.messages": "Messages",
    "report.drawer.chats": "Chats",
    "report.drawer.users": "Users",
    "common.load-more": "Load more",
    "report.messages.block-users": "Block senders",
    "report.messages.delete-messages": "Delete messages",
    "report.reject": "Reject",
    "report.list.selected-reports.count": "Reports selected: {selectedReportsCount}",
    "report.list.clear-selection": "Clear selection",
    "report.reject.success": "Reports have been rejected",
    "report.list.show-not-viewed-only": "Show not viewed only"
};
