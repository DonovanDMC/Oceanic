/** @module Routes */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const CDN_URL = "https://cdn.discordapp.com";

const SAFE_CHARACTERS = new Set([":", "?", "@"]);
function encode(strings: TemplateStringsArray, ...args: Array<string | number>): string {
    return strings.reduce((acc, str, i) => {
        acc += str;

        if (args[i] !== undefined && args[i] !== null) {
            acc += Array.from(
                String(args[i]),
                char => SAFE_CHARACTERS.has(char) ? char : (decodeURIComponent(char) === char ? encodeURIComponent(char) : char)
            ).join("");
        }

        return acc;
    }, "");
}

// Webhooks
export const CHANNEL_WEBHOOKS = (channelID: string) => encode`/channels/${channelID}/webhooks`;
export const GUILD_WEBHOOKS   = (guildID: string) => encode`/guilds/${guildID}/webhooks`;
export const WEBHOOK          = (webhookID: string, webhookToken?: string) => (webhookToken ? encode`/webhooks/${webhookID}/${webhookToken}` : `/webhooks/${webhookID}`) as `/webhooks/${string}` | `/webhooks/${string}/${string}`;
export const WEBHOOK_MESSAGE  = (webhookID: string, webhookToken: string, messageID: string) => encode`/webhooks/${webhookID}/${webhookToken}/messages/${messageID}`;
export const WEBHOOK_PLATFORM = (webhookID: string, webhookToken: string, platform: "github" | "slack") => encode`/webhooks/${webhookID}/${webhookToken}/${platform}`;

// Guilds
export const GUILD                       = (userID: string) => encode`/guilds/${userID}`;
export const GUILDS                      = "/guilds";
export const GUILD_BANS                  = (guildID: string) => encode`/guilds/${guildID}/bans`;
export const GUILD_BAN                   = (guildID: string, userID: string) => encode`/guilds/${guildID}/bans/${userID}`;
export const GUILD_AUTOMOD_RULE          = (guildID: string, autoModerationRuleID: string) => encode`/guilds/${guildID}/auto-moderation/rules/${autoModerationRuleID}`;
export const GUILD_AUTOMOD_RULES         = (guildID: string) => encode`/guilds/${guildID}/auto-moderation/rules`;
export const GUILD_EMOJI                 = (guildID: string, emojiID: string) => encode`/guilds/${guildID}/emojis/${emojiID}`;
export const GUILD_EMOJIS                = (guildID: string) => encode`/guilds/${guildID}/emojis`;
export const GUILD_AUDIT_LOG             = (guildID: string) => encode`/guilds/${guildID}/audit-logs`;
export const GUILD_SCHEDULED_EVENT       = (guildID: string, eventID: string) => encode`/guilds/${guildID}/scheduled-events/${eventID}`;
export const GUILD_SCHEDULED_EVENTS      = (guildID: string) => encode`/guilds/${guildID}/scheduled-events`;
export const GUILD_SCHEDULED_EVENT_USERS = (guildID: string, eventID: string) => encode`/guilds/${guildID}/scheduled-events/${eventID}/users`;
export const GUILD_TEMPLATE_CODE         = (code: string) => encode`/guilds/templates/${code}`;
export const GUILD_TEMPLATE              = (guildID: string, templateID: string) => encode`/guilds/${guildID}/templates/${templateID}`;
export const GUILD_TEMPLATES             = (guildID: string) => encode`/guilds/${guildID}/templates`;
export const GUILD_PREVIEW               = (guildID: string) => encode`/guilds/${guildID}/preview`;
export const GUILD_CHANNELS              = (guildID: string) => encode`/guilds/${guildID}/channels`;
export const GUILD_ACTIVE_THREADS        = (guildID: string) => encode`/guilds/${guildID}/threads/active`;
export const GUILD_MEMBERS               = (guildID: string) => encode`/guilds/${guildID}/members`;
export const GUILD_MEMBER                = (guildID: string, userID: string) => encode`/guilds/${guildID}/members/${userID}`;
export const GUILD_SEARCH_MEMBERS        = (guildID: string) => encode`/guilds/${guildID}/members/search`;
export const GUILD_MEMBER_ROLE           = (guildID: string, userID: string, roleID: string) => encode`/guilds/${guildID}/members/${userID}/roles/${roleID}`;
export const GUILD_ROLES                 = (guildID: string) => encode`/guilds/${guildID}/roles`;
export const GUILD_ROLE                  = (guildID: string, roleID: string) => encode`/guilds/${guildID}/roles/${roleID}`;
export const GUILD_MFA                   = (guildID: string) => encode`/guilds/${guildID}/mfa`;
export const GUILD_PRUNE                 = (guildID: string) => encode`/guilds/${guildID}/prune`;
export const GUILD_INVITES               = (guildID: string) => encode`/guilds/${guildID}/invites`;
export const GUILD_INTEGRATION           = (guildID: string, integrationID: string) => encode`/guilds/${guildID}/integrations/${integrationID}`;
export const GUILD_INTEGRATIONS          = (guildID: string) => encode`/guilds/${guildID}/integrations`;
export const GUILD_WIDGET                = (guildID: string) => encode`/guilds/${guildID}/widget`;
export const GUILD_VANITY_URL            = (guildID: string) => encode`/guilds/${guildID}/vanity-url`;
export const GUILD_WIDGET_IMAGE          = (guildID: string) => encode`/guilds/${guildID}/widget.png`;
export const GUILD_WIDGET_JSON           = (guildID: string) => encode`/guilds/${guildID}/widget.json`;
export const GUILD_WELCOME_SCREEN        = (guildID: string) => encode`/guilds/${guildID}/welcome-screen`;
export const GUILD_VOICE_STATE           = (guildID: string, userID: string) => encode`/guilds/${guildID}/voice-states/${userID}`;
export const GUILD_STICKER			     = (guildID: string, stickerID: string) => encode`/guilds/${guildID}/stickers/${stickerID}`;
export const GUILD_STICKERS			     = (guildID: string) => encode`/guilds/${guildID}/stickers`;
export const GUILD_ONBOARDING            = (guildID: string) => encode`/guilds/${guildID}/onboarding`;
export const GUILD_INCIDENT_ACTIONS      = (guildID: string) => encode`/guilds/${guildID}/incident-actions`;
export const GUILD_BULK_BAN              = (guildID: string) => encode`/guilds/${guildID}/bulk-ban`;

// Channels
export const CHANNEL                                 = (channelID: string) => encode`/channels/${channelID}`;
export const CHANNEL_BULK_DELETE_MESSAGES            = (channelID: string) => encode`/channels/${channelID}/messages/bulk-delete`;
export const CHANNEL_FOLLOWERS                       = (channelID: string) => encode`/channels/${channelID}/followers`;
export const CHANNEL_INVITES                         = (channelID: string) => encode`/channels/${channelID}/invites`;
export const CHANNEL_JOINED_PRIVATE_ARCHIVED_THREADS = (channelID: string) => encode`/channels/${channelID}/users/@me/threads/archived/private`;
export const CHANNEL_MESSAGE                         = (channelID: string, messageID: string) => encode`/channels/${channelID}/messages/${messageID}`;
export const CHANNEL_MESSAGES                        = (channelID: string) => encode`/channels/${channelID}/messages`;
export const CHANNEL_MESSAGES_CROSSPOST              = (channelID: string, messageID: string) => encode`/channels/${channelID}/messages/${messageID}/crosspost`;
export const CHANNEL_MESSAGE_THREADS                 = (channelID: string, messageID: string) => encode`/channels/${channelID}/messages/${messageID}/threads`;
export const CHANNEL_PERMISSION                      = (channelID: string, overwriteID: string) => encode`/channels/${channelID}/permissions/${overwriteID}`;
export const CHANNEL_PERMISSIONS                     = (channelID: string) => encode`/channels/${channelID}/permissions`;
export const CHANNEL_PINNED_MESSAGE                  = (channelID: string, messageID: string) => encode`/channels/${channelID}/pins/${messageID}`;
export const CHANNEL_PINS                            = (channelID: string) => encode`/channels/${channelID}/pins`;
export const CHANNEL_PRIVATE_ARCHIVED_THREADS        = (channelID: string) => encode`/channels/${channelID}/threads/archived/private`;
export const CHANNEL_PUBLIC_ARCHIVED_THREADS         = (channelID: string) => encode`/channels/${channelID}/threads/archived/public`;
export const CHANNEL_REACTION                        = (channelID: string, messageID: string, reaction: string) => encode`/channels/${channelID}/messages/${messageID}/reactions/${reaction}`;
export const CHANNEL_REACTIONS                       = (channelID: string, messageID: string) => encode`/channels/${channelID}/messages/${messageID}/reactions`;
export const CHANNEL_REACTION_USER                   = (channelID: string, messageID: string, reaction: string, user: string) => encode`/channels/${channelID}/messages/${messageID}/reactions/${reaction}/${user}`;
export const CHANNEL_THREADS                         = (channelID: string) => encode`/channels/${channelID}/threads`;
export const CHANNEL_THREAD_MEMBER                   = (channelID: string, userID: string) => encode`/channels/${channelID}/thread-members/${userID}`;
export const CHANNEL_THREAD_MEMBERS                  = (channelID: string) => encode`/channels/${channelID}/thread-members`;
export const CHANNEL_TYPING                          = (channelID: string) => encode`/channels/${channelID}/typing`;
export const GROUP_RECIPIENT                         = (channelID: string, userID: string) => encode`/channels/${channelID}/recipients/${userID}`;
export const VOICE_REGIONS                           = "/voice/regions";
export const GUILD_VOICE_REGIONS                     = (guildID: string) => encode`/guilds/${guildID}/regions`;
export const VOICE_STATUS                            = (channelID: string) => encode`/channels/${channelID}/voice-status`;
export const POLL_ANSWER_USERS                       = (channelID: string, pollID: string, answerID: number) => encode`/channels/${channelID}/polls/${pollID}/answers/${answerID}`;
export const POLL_EXPIRE                             = (channelID: string, pollID: string) => encode`/channels/${channelID}/polls/${pollID}/expire`;

// OAuth
export const OAUTH_APPLICATION         = "/oauth2/applications/@me";
export const OAUTH_AUTHORIZE           = "/oauth2/authorize";
export const OAUTH_INFO                = "/oauth2/@me";
export const OAUTH_CURRENT_USER        = "/users/@me";
export const OAUTH_CHANNELS            = "/users/@me/channels";
export const OAUTH_CONNECTIONS         = "/users/@me/connections";
export const OAUTH_GUILD               = (guildID: string) => encode`/users/@me/guilds/${guildID}`;
export const OAUTH_GUILD_MEMBER        = (guildID: string) => encode`${OAUTH_GUILD(guildID)}/member`;
export const OAUTH_GUILDS              = "/users/@me/guilds";
export const OAUTH_TOKEN               = "/oauth2/token";
export const OAUTH_TOKEN_REVOKE        = "/oauth2/token/revoke";
export const OAUTH_ROLE_CONNECTION     = (applicationID: string) => encode`/users/@me/applications/${applicationID}/role-connection`;
export const ROLE_CONNECTIONS_METADATA = (applicationID: string) => encode`/applications/${applicationID}/role-connections/metadata`;

// Images
export const ACHIEVEMENT_ICON            = (applicationID: string, achievementID: string, hash: string) => encode`/app-assets/${applicationID}/achievements/${achievementID}/icons/${hash}`;
export const APPLICATION_ASSET           = (applicationID: string, assetID: string) => encode`/applications/${applicationID}/assets/${assetID}`;
export const APPLICATION_COVER           = (applicationID: string, hash: string) => encode`/app-icons/${applicationID}/${hash}`;
export const APPLICATION_ICON            = APPLICATION_COVER;
export const BANNER                      = (guildOrUserID: string, hash: string) => encode`/banners/${guildOrUserID}/${hash}`;
export const CUSTOM_EMOJI                = (emojiID: string) => encode`/emojis/${emojiID}`;
export const EMBED_AVATAR                = (mod: number) => encode`/embed/avatars/${mod}`;
export const GUILD_AVATAR                = (guildID: string, userID: string, hash: string) => encode`/guilds/${guildID}/users/${userID}/avatars/${hash}`;
export const GUILD_DISCOVERY_SPLASH      = (guildID: string, hash: string) => encode`/guilds/${guildID}/splashes/${hash}`;
export const GUILD_ICON                  = (guildID: string, hash: string) => encode`/icons/${guildID}/${hash}`;
export const CLAN_ICON                   = (guildID: string, hash: string) => encode`/clan-badges/${guildID}/${hash}`;
export const GUILD_SCHEDULED_EVENT_COVER = (eventID: string, hash: string) => encode`/guild-events/${eventID}/${hash}`;
export const GUILD_SPLASH                = (guildID: string, hash: string) => encode`/splashes/${guildID}/${hash}`;
export const MEMBER_BANNER               = (guildID: string, userID: string, hash: string) => encode`/guilds/${guildID}/users/${userID}/banners/${hash}`;
export const ROLE_ICON                   = (roleID: string, hash: string) => encode`/role-icons/${roleID}/${hash}`;
export const STICKER                     = (stickerID: string) => encode`/stickers/${stickerID}`;
export const STICKER_PACK_BANNER         = (assetID: string) => APPLICATION_ASSET("710982414301790216", assetID);
export const TEAM_ICON                   = (teamID: string, hash: string) => encode`/team-icons/${teamID}/${hash}`;
export const USER_AVATAR                 = (userID: string, hash: string) => encode`/avatars/${userID}/${hash}`;
export const AVATAR_DECORATION           = (hash: string) => encode`/avatar-decoration-presets/${hash}`;
/** @deprecated Use {@link Routes~AVATAR_DECORATION | AVATAR_DECORATION} instead. This will be removed in 1.12.0. */
export const USER_AVATAR_DECORATION      = (_userID: string, hash: string) => AVATAR_DECORATION(hash);

// Applications
export const APPLICATION_COMMAND                   = (applicationID: string, commandID: string) => encode`/applications/${applicationID}/commands/${commandID}`;
export const APPLICATION_COMMANDS                  = (applicationID: string) => encode`/applications/${applicationID}/commands`;
export const GUILD_APPLICATION_COMMAND             = (applicationID: string, guildID: string, commandID: string) => encode`/applications/${applicationID}/guilds/${guildID}/commands/${commandID}`;
export const GUILD_APPLICATION_COMMANDS            = (applicationID: string, guildID: string) => encode`/applications/${applicationID}/guilds/${guildID}/commands`;
export const GUILD_APPLICATION_COMMAND_PERMISSION  = (applicationID: string, guildID: string, commandID: string) => encode`/applications/${applicationID}/guilds/${guildID}/commands/${commandID}/permissions`;
export const GUILD_APPLICATION_COMMAND_PERMISSIONS = (applicationID: string, guildID: string) => encode`/applications/${applicationID}/guilds/${guildID}commands/permissions`;
export const INTERACTION_CALLBACK                  = (interactionID: string, interactionToken: string) => encode`/interactions/${interactionID}/${interactionToken}/callback`;
export const APPLICATION                           = "/applications/@me";
export const ENTITLEMENTS                          = (applicationID: string) => encode`/applications/${applicationID}/entitlements`;
export const ENTITLEMENT                           = (applicationID: string, entitlementID: string) => encode`/applications/${applicationID}/entitlements/${entitlementID}`;
export const CONSUME_ENTITLEMENT                   = (applicationID: string, entitlementID: string) => encode`/applications/${applicationID}/entitlements/${entitlementID}/consume`;
export const SKUS                                  = (applicationID: string) => encode`/applications/${applicationID}/skus`;
export const APPLICATION_EMOJIS                    = (applicationID: string) => encode`/applications/${applicationID}/emojis`;
export const APPLICATION_EMOJI                     = (applicationID: string, emojiID: string) => encode`/applications/${applicationID}/emojis/${emojiID}`;

// Misc
export const GATEWAY                   = "/gateway";
export const GATEWAY_BOT               = "/gateway/bot";
export const USER                      = (userID: string) => encode`/users/${userID}`;
export const MESSAGE_LINK              = (guildID: string, channelID: string, messageID: string) => encode`/channels/${guildID}/${channelID}/${messageID}`;
export const STICKER_PACKS             = "/sticker-packs";
export const INVITE                    = (code: string) => encode`/invites/${code}`;
export const STAGE_INSTANCES           = "/stage-instances";
export const STAGE_INSTANCE            = (channelID: string) => encode`/stage-instances/${channelID}`;
export const REFRESH_ATTACHMENT_URLS   = "/attachments/refresh-urls";
