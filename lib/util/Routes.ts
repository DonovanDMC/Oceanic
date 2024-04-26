/** @module Routes */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const CDN_URL = "https://cdn.discordapp.com";

// Webhooks
export const CHANNEL_WEBHOOKS = (channelID: string) => `/channels/${channelID}/webhooks` as const;
export const GUILD_WEBHOOKS   = (guildID: string) => `/guilds/${guildID}/webhooks` as const;
export const WEBHOOK          = (webhookID: string, webhookToken?: string) => (webhookToken ? `/webhooks/${webhookID}/${webhookToken}` : `/webhooks/${webhookID}`) as `/webhooks/${string}` | `/webhooks/${string}/${string}`;
export const WEBHOOK_MESSAGE  = (webhookID: string, webhookToken: string, messageID: string) => `/webhooks/${webhookID}/${webhookToken}/messages/${messageID}` as const;
export const WEBHOOK_PLATFORM = (webhookID: string, webhookToken: string, platform: "github" | "slack") => `/webhooks/${webhookID}/${webhookToken}/${platform}` as const;

// Guilds
export const GUILD                       = (userID: string) => `/guilds/${userID}` as const;
export const GUILDS                      = "/guilds" as const;
export const GUILD_BANS                  = (guildID: string) => `/guilds/${guildID}/bans` as const;
export const GUILD_BAN                   = (guildID: string, userID: string) => `/guilds/${guildID}/bans/${userID}` as const;
export const GUILD_AUTOMOD_RULE          = (guildID: string, autoModerationRuleID: string) => `/guilds/${guildID}/auto-moderation/rules/${autoModerationRuleID}` as const;
export const GUILD_AUTOMOD_RULES         = (guildID: string) => `/guilds/${guildID}/auto-moderation/rules` as const;
export const GUILD_EMOJI                 = (guildID: string, emojiID: string) => `/guilds/${guildID}/emojis/${emojiID}` as const;
export const GUILD_EMOJIS                = (guildID: string) => `/guilds/${guildID}/emojis` as const;
export const GUILD_AUDIT_LOG             = (guildID: string) => `/guilds/${guildID}/audit-logs` as const;
export const GUILD_SCHEDULED_EVENT       = (guildID: string, eventID: string) => `/guilds/${guildID}/scheduled-events/${eventID}` as const;
export const GUILD_SCHEDULED_EVENTS      = (guildID: string) => `/guilds/${guildID}/scheduled-events` as const;
export const GUILD_SCHEDULED_EVENT_USERS = (guildID: string, eventID: string) => `/guilds/${guildID}/scheduled-events/${eventID}/users` as const;
export const GUILD_TEMPLATE_CODE         = (code: string) => `/guilds/templates/${code}` as const;
export const GUILD_TEMPLATE              = (guildID: string, templateID: string) => `/guilds/${guildID}/templates/${templateID}` as const;
export const GUILD_TEMPLATES             = (guildID: string) => `/guilds/${guildID}/templates` as const;
export const GUILD_PREVIEW               = (guildID: string) => `/guilds/${guildID}/preview` as const;
export const GUILD_CHANNELS              = (guildID: string) => `/guilds/${guildID}/channels` as const;
export const GUILD_ACTIVE_THREADS        = (guildID: string) => `/guilds/${guildID}/threads/active` as const;
export const GUILD_MEMBERS               = (guildID: string) => `/guilds/${guildID}/members` as const;
export const GUILD_MEMBER                = (guildID: string, userID: string) => `/guilds/${guildID}/members/${userID}` as const;
export const GUILD_SEARCH_MEMBERS        = (guildID: string) => `/guilds/${guildID}/members/search` as const;
export const GUILD_MEMBER_ROLE           = (guildID: string, userID: string, roleID: string) => `/guilds/${guildID}/members/${userID}/roles/${roleID}` as const;
export const GUILD_ROLES                 = (guildID: string) => `/guilds/${guildID}/roles` as const;
export const GUILD_ROLE                  = (guildID: string, roleID: string) => `/guilds/${guildID}/roles/${roleID}` as const;
export const GUILD_MFA                   = (guildID: string) => `/guilds/${guildID}/mfa` as const;
export const GUILD_PRUNE                 = (guildID: string) => `/guilds/${guildID}/prune` as const;
export const GUILD_INVITES               = (guildID: string) => `/guilds/${guildID}/invites` as const;
export const GUILD_INTEGRATION           = (guildID: string, integrationID: string) => `/guilds/${guildID}/integrations/${integrationID}` as const;
export const GUILD_INTEGRATIONS          = (guildID: string) => `/guilds/${guildID}/integrations` as const;
export const GUILD_WIDGET                = (guildID: string) => `/guilds/${guildID}/widget` as const;
export const GUILD_VANITY_URL            = (guildID: string) => `/guilds/${guildID}/vanity-url` as const;
export const GUILD_WIDGET_IMAGE          = (guildID: string) => `/guilds/${guildID}/widget.png` as const;
export const GUILD_WIDGET_JSON           = (guildID: string) => `/guilds/${guildID}/widget.json` as const;
export const GUILD_WELCOME_SCREEN        = (guildID: string) => `/guilds/${guildID}/welcome-screen` as const;
export const GUILD_VOICE_STATE           = (guildID: string, userID: string) => `/guilds/${guildID}/voice-states/${userID}` as const;
export const GUILD_STICKER			     = (guildID: string, stickerID: string) => `/guilds/${guildID}/stickers/${stickerID}` as const;
export const GUILD_STICKERS			     = (guildID: string) => `/guilds/${guildID}/stickers` as const;
export const GUILD_ONBOARDING            = (guildID: string) => `/guilds/${guildID}/onboarding` as const;
export const GUILD_INCIDENT_ACTIONS      = (guildID: string) => `/guilds/${guildID}/incident-actions` as const;
export const GUILD_BULK_BAN              = (guildID: string) => `/guilds/${guildID}/bulk-ban` as const;

// Channels
export const CHANNEL                                 = (channelID: string) => `/channels/${channelID}` as const;
export const CHANNEL_BULK_DELETE_MESSAGES            = (channelID: string) => `/channels/${channelID}/messages/bulk-delete` as const;
export const CHANNEL_FOLLOWERS                       = (channelID: string) => `/channels/${channelID}/followers` as const;
export const CHANNEL_INVITES                         = (channelID: string) => `/channels/${channelID}/invites` as const;
export const CHANNEL_JOINED_PRIVATE_ARCHIVED_THREADS = (channelID: string) => `/channels/${channelID}/users/@me/threads/archived/private` as const;
export const CHANNEL_MESSAGE                         = (channelID: string, messageID: string) => `/channels/${channelID}/messages/${messageID}` as const;
export const CHANNEL_MESSAGES                        = (channelID: string) => `/channels/${channelID}/messages` as const;
export const CHANNEL_MESSAGES_CROSSPOST              = (channelID: string, messageID: string) => `/channels/${channelID}/messages/${messageID}/crosspost` as const;
export const CHANNEL_MESSAGE_THREADS                 = (channelID: string, messageID: string) => `/channels/${channelID}/messages/${messageID}/threads` as const;
export const CHANNEL_PERMISSION                      = (channelID: string, overwriteID: string) => `/channels/${channelID}/permissions/${overwriteID}` as const;
export const CHANNEL_PERMISSIONS                     = (channelID: string) => `/channels/${channelID}/permissions` as const;
export const CHANNEL_PINNED_MESSAGE                  = (channelID: string, messageID: string) => `/channels/${channelID}/pins/${messageID}` as const;
export const CHANNEL_PINS                            = (channelID: string) => `/channels/${channelID}/pins` as const;
export const CHANNEL_PRIVATE_ARCHIVED_THREADS        = (channelID: string) => `/channels/${channelID}/threads/archived/private` as const;
export const CHANNEL_PUBLIC_ARCHIVED_THREADS         = (channelID: string) => `/channels/${channelID}/threads/archived/public` as const;
export const CHANNEL_REACTION                        = (channelID: string, messageID: string, reaction: string) => `/channels/${channelID}/messages/${messageID}/reactions/${reaction}` as const;
export const CHANNEL_REACTIONS                       = (channelID: string, messageID: string) => `/channels/${channelID}/messages/${messageID}/reactions` as const;
export const CHANNEL_REACTION_USER                   = (channelID: string, messageID: string, reaction: string, user: string) => `/channels/${channelID}/messages/${messageID}/reactions/${reaction}/${user}` as const;
export const CHANNEL_THREADS                         = (channelID: string) => `/channels/${channelID}/threads` as const;
export const CHANNEL_THREAD_MEMBER                   = (channelID: string, userID: string) => `/channels/${channelID}/thread-members/${userID}` as const;
export const CHANNEL_THREAD_MEMBERS                  = (channelID: string) => `/channels/${channelID}/thread-members` as const;
export const CHANNEL_TYPING                          = (channelID: string) => `/channels/${channelID}/typing` as const;
export const GROUP_RECIPIENT                         = (channelID: string, userID: string) => `/channels/${channelID}/recipients/${userID}` as const;
export const VOICE_REGIONS                           = "/voice/regions" as const;
export const GUILD_VOICE_REGIONS                     = (guildID: string) => `/guilds/${guildID}/regions` as const;
export const VOICE_STATUS                            = (channelID: string) => `/channels/${channelID}/voice-status` as const;
export const POLL_ANSWER_USERS                       = (channelID: string, pollID: string, answerID: number) => `/channels/${channelID}/polls/${pollID}/answers/${answerID}` as const;
export const POLL_EXPIRE                             = (channelID: string, pollID: string) => `/channels/${channelID}/polls/${pollID}/expire` as const;

// OAuth
export const OAUTH_APPLICATION         = "/oauth2/applications/@me" as const;
export const OAUTH_AUTHORIZE           = "/oauth2/authorize" as const;
export const OAUTH_INFO                = "/oauth2/@me" as const;
export const OAUTH_CURRENT_USER        = "/users/@me" as const;
export const OAUTH_CHANNELS            = "/users/@me/channels" as const;
export const OAUTH_CONNECTIONS         = "/users/@me/connections" as const;
export const OAUTH_GUILD               = (guildID: string) => `/users/@me/guilds/${guildID}` as const;
export const OAUTH_GUILD_MEMBER        = (guildID: string) => `${OAUTH_GUILD(guildID)}/member` as const;
export const OAUTH_GUILDS              = "/users/@me/guilds" as const;
export const OAUTH_TOKEN               = "/oauth2/token" as const;
export const OAUTH_TOKEN_REVOKE        = "/oauth2/token/revoke" as const;
export const OAUTH_ROLE_CONNECTION     = (applicationID: string) => `/users/@me/applications/${applicationID}/role-connection` as const;
export const ROLE_CONNECTIONS_METADATA = (applicationID: string) => `/applications/${applicationID}/role-connections/metadata` as const;

// Images
export const ACHIEVEMENT_ICON            = (applicationID: string, achievementID: string, hash: string) => `/app-assets/${applicationID}/achievements/${achievementID}/icons/${hash}` as const;
export const APPLICATION_ASSET           = (applicationID: string, assetID: string) => `/applications/${applicationID}/assets/${assetID}` as const;
export const APPLICATION_COVER           = (applicationID: string, hash: string) => `/app-icons/${applicationID}/${hash}` as const;
export const APPLICATION_ICON            = APPLICATION_COVER;
export const BANNER                      = (guildOrUserID: string, hash: string) => `/banners/${guildOrUserID}/${hash}` as const;
export const CUSTOM_EMOJI                = (emojiID: string) => `/emojis/${emojiID}` as const;
export const EMBED_AVATAR                = (mod: number) => `/embed/avatars/${mod}` as const;
export const GUILD_AVATAR                = (guildID: string, userID: string, hash: string) => `/guilds/${guildID}/users/${userID}/avatars/${hash}` as const;
export const GUILD_DISCOVERY_SPLASH      = (guildID: string, hash: string) => `/guilds/${guildID}/splashes/${hash}` as const;
export const GUILD_ICON                  = (guildID: string, hash: string) => `/icons/${guildID}/${hash}` as const;
export const GUILD_SCHEDULED_EVENT_COVER = (eventID: string, hash: string) => `/guild-events/${eventID}/${hash}` as const;
export const GUILD_SPLASH                = (guildID: string, hash: string) => `/splashes/${guildID}/${hash}` as const;
export const MEMBER_BANNER               = (guildID: string, userID: string, hash: string) => `/guilds/${guildID}/users/${userID}/banners/${hash}` as const;
export const ROLE_ICON                   = (roleID: string, hash: string) => `/role-icons/${roleID}/${hash}` as const;
export const STICKER                     = (stickerID: string) => `/stickers/${stickerID}` as const;
export const STICKER_PACK_BANNER         = (assetID: string) => APPLICATION_ASSET("710982414301790216", assetID);
export const TEAM_ICON                   = (teamID: string, hash: string) => `/team-icons/${teamID}/${hash}` as const;
export const USER_AVATAR                 = (userID: string, hash: string) => `/avatars/${userID}/${hash}` as const;
export const USER_AVATAR_DECORATION      = (userID: string, hash: string) => `/avatar-decorations/${userID}/${hash}` as const;

// Applications
export const APPLICATION_COMMAND                   = (applicationID: string, commandID: string) => `/applications/${applicationID}/commands/${commandID}` as const;
export const APPLICATION_COMMANDS                  = (applicationID: string) => `/applications/${applicationID}/commands` as const;
export const GUILD_APPLICATION_COMMAND             = (applicationID: string, guildID: string, commandID: string) => `/applications/${applicationID}/guilds/${guildID}/commands/${commandID}` as const;
export const GUILD_APPLICATION_COMMANDS            = (applicationID: string, guildID: string) => `/applications/${applicationID}/guilds/${guildID}/commands` as const;
export const GUILD_APPLICATION_COMMAND_PERMISSION  = (applicationID: string, guildID: string, commandID: string) => `/applications/${applicationID}/guilds/${guildID}/commands/${commandID}/permissions` as const;
export const GUILD_APPLICATION_COMMAND_PERMISSIONS = (applicationID: string, guildID: string) => `/applications/${applicationID}/guilds/${guildID}commands/permissions` as const;
export const INTERACTION_CALLBACK                  = (interactionID: string, interactionToken: string) => `/interactions/${interactionID}/${interactionToken}/callback` as const;
export const APPLICATION                           = "/applications/@me" as const;
export const ENTITLEMENTS                          = (applicationID: string) => `/applications/${applicationID}/entitlements` as const;
export const ENTITLEMENT                           = (applicationID: string, entitlementID: string) => `/applications/${applicationID}/entitlements/${entitlementID}` as const;
export const SKUS                                  = (applicationID: string) => `/applications/${applicationID}/skus` as const;

// Activities
export const ACTIVITY_INSTANCES = (activityID: string, channelID: string) => `/activities/${activityID}/instances/${channelID}` as const;

// Misc
export const GATEWAY                   = "/gateway" as const;
export const GATEWAY_BOT               = "/gateway/bot" as const;
export const USER                      = (userID: string) => `/users/${userID}` as const;
export const MESSAGE_LINK              = (guildID: string, channelID: string, messageID: string) => `/channels/${guildID}/${channelID}/${messageID}` as const;
export const STICKER_PACKS             = "/sticker-packs" as const;
export const INVITE                    = (code: string) => `/invites/${code}` as const;
export const STAGE_INSTANCES           = "/stage-instances" as const;
export const STAGE_INSTANCE            = (channelID: string) => `/stage-instances/${channelID}` as const;
export const REFRESH_ATTACHMENT_URLS   = "/attachments/refresh-urls" as const;
